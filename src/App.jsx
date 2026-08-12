import { memo, useEffect, useRef, useState } from 'react'
import { interpretBasicChart } from './lib/gemini'
import { SAMPLE_BASIC_CHART } from './lib/sajuPrompt'
import { supabase } from './lib/supabase'
import './App.css'

const READING_COLUMNS =
  'id, name, gender, calendar_type, birth_year, birth_month, birth_day, birth_time, time_unknown, interpretation, created_at'

const PILLAR_ORDER = [
  { key: 'year', label: '년주' },
  { key: 'month', label: '월주' },
  { key: 'day', label: '일주' },
  { key: 'hour', label: '시주' },
]

const STEM_ELEMENT = {
  갑: 'wood',
  을: 'wood',
  병: 'fire',
  정: 'fire',
  무: 'earth',
  기: 'earth',
  경: 'metal',
  신: 'metal',
  임: 'water',
  계: 'water',
}

const BRANCH_ELEMENT = {
  자: 'water',
  축: 'earth',
  인: 'wood',
  묘: 'wood',
  진: 'earth',
  사: 'fire',
  오: 'fire',
  미: 'earth',
  신: 'metal',
  유: 'metal',
  술: 'earth',
  해: 'water',
}

const ELEMENT_LABEL = {
  wood: '목',
  fire: '화',
  earth: '토',
  metal: '금',
  water: '수',
}

function getCharElement(char, kind) {
  const map = kind === 'stem' ? STEM_ELEMENT : BRANCH_ELEMENT
  return map[char] ?? null
}

function PillarChar({ char, kind }) {
  const element = getCharElement(char, kind)
  return (
    <div className="pillar-char">
      {char}
      {element ? (
        <span className={`badge badge--${element}`}>{ELEMENT_LABEL[element]}</span>
      ) : null}
    </div>
  )
}

const PillarGrid = memo(function PillarGrid({ chart = SAMPLE_BASIC_CHART }) {
  return (
    <div className="pillar-grid" aria-label="사주 네 기둥">
      {PILLAR_ORDER.map(({ key, label }, index) => {
        const pillar = chart.pillars[key] ?? ''
        const stem = pillar[0] ?? ''
        const branch = pillar[1] ?? ''
        return (
          <div
            key={key}
            className={`pillar-card pillar-card--${index + 1}`}
          >
            <span className="pillar-label">{label}</span>
            <div className="pillar-chars">
              <PillarChar char={stem} kind="stem" />
              <PillarChar char={branch} kind="branch" />
            </div>
          </div>
        )
      })}
    </div>
  )
})

// 올해 기준 유효 연도 범위
const CURRENT_YEAR = new Date().getFullYear()
const MIN_BIRTH_YEAR = 1920

function pad2(n) {
  return String(n).padStart(2, '0')
}

function readingSubtitle(reading) {
  const gender =
    reading.gender === 'female' ? '여' : reading.gender === 'male' ? '남' : ''
  const calendar = reading.calendar_type === 'lunar' ? '음력' : '양력'
  const birth = `${reading.birth_year}.${pad2(reading.birth_month)}.${pad2(reading.birth_day)}`
  const time = reading.time_unknown ? '시간 모름' : reading.birth_time || ''
  return [calendar, birth, time, gender].filter(Boolean).join(' · ')
}

function clampDay(year, month, day) {
  if (!day) return day
  const maxDay = getDaysInMonth(year, month)
  return Number(day) > maxDay ? String(maxDay) : day
}

function digitsOnly(value, maxLen) {
  return value.replace(/\D/g, '').slice(0, maxLen)
}

function isValidBirthDate(year, month, day) {
  const y = Number(year)
  const m = Number(month)
  const d = Number(day)
  if (!year || year.length !== 4 || y < MIN_BIRTH_YEAR || y > CURRENT_YEAR) {
    return false
  }
  if (!month || m < 1 || m > 12) return false
  if (!day || d < 1 || d > getDaysInMonth(y, m)) return false
  return true
}

function isValidBirthTime(time) {
  const match = time.match(/^(\d{2}):(\d{2})$/)
  if (!match) return false
  const h = Number(match[1])
  const min = Number(match[2])
  return h >= 0 && h <= 23 && min >= 0 && min <= 59
}

// 해당 년·월에 며칠까지 있는지 계산 (윤년 포함)
function getDaysInMonth(year, month) {
  if (!year || !month) return 31
  return new Date(Number(year), Number(month), 0).getDate()
}

// 화면 표시용: API 응답의 마크다운 기호만 정리 (로직/상태와 무관)
function cleanInterpretationLines(text) {
  return text
    .replace(/\\n/g, '\n')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line && !/^(-{3,}|\*{3,}|_{3,}|={3,})$/.test(line))
    .map((line) =>
      line
        .replace(/^#{1,6}\s*/, '')
        .replace(/^>\s*/, '')
        .replace(/^([*•·-])\s+/, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/__(.+?)__/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .trim(),
    )
    .filter(Boolean)
}

const SECTION_RE =
  /^(\d+)\.\s*(.+?)(?:\s*:\s*(?:[''""](.+?)[''""]|(.+)))?$/
const SPECIAL_RE = /^([①-⑳⓿])\s*(.+)$/
const SUBITEM_RE = /^([\uAC00-\uD7A3A-Za-z\s·]+?):\s*(.+)$/
const QUOTE_RE = /[''""]([^''""]+)[''""]/g

function extractKeywords(text) {
  const keywords = []
  for (const match of text.matchAll(QUOTE_RE)) {
    if (match[1]?.trim()) keywords.push(match[1].trim())
  }
  return keywords
}

function isClosingBlock(line) {
  return (
    /[?？]$/.test(line) ||
    line.includes('무엇입니까') ||
    /사주\s*판이\s*펼쳐/.test(line) ||
    /가장\s*궁금하고\s*해결하고\s*싶은/.test(line) ||
    (/궁금/.test(line) && /진로|재물|인간관계/.test(line))
  )
}

function parseInterpretation(text) {
  const lines = cleanInterpretationLines(text)
  const blocks = []
  let currentSection = null
  let afterSummary = false

  const flushSection = () => {
    if (currentSection) {
      blocks.push(currentSection)
      currentSection = null
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (/^종합\s*의견/.test(line)) {
      flushSection()
      afterSummary = true
      blocks.push({ type: 'summary-header' })
      continue
    }

    if (isClosingBlock(line)) {
      flushSection()
      continue
    }

    const sectionMatch = line.match(SECTION_RE)
    if (sectionMatch && sectionMatch[2].length > 3 && !afterSummary) {
      flushSection()
      currentSection = {
        type: 'section',
        number: sectionMatch[1],
        title: sectionMatch[2].trim(),
        tagline: (sectionMatch[3] || sectionMatch[4] || '').trim(),
        items: [],
      }
      continue
    }

    const specialMatch = line.match(SPECIAL_RE)
    if (specialMatch) {
      const item = {
        type: 'special',
        marker: specialMatch[1],
        title: specialMatch[2],
        body: [],
      }
      if (currentSection) currentSection.items.push(item)
      else blocks.push(item)
      continue
    }

    const subMatch = line.match(SUBITEM_RE)
    if (subMatch && subMatch[1].length <= 14 && !/^\d/.test(subMatch[1])) {
      const item = {
        type: 'subitem',
        label: subMatch[1].trim(),
        content: subMatch[2].trim(),
      }
      if (currentSection) {
        const last = currentSection.items.at(-1)
        if (last?.type === 'special') last.body.push(item)
        else currentSection.items.push(item)
      } else blocks.push(item)
      continue
    }

    const para = { type: 'paragraph', content: line }

    if (currentSection) {
      const last = currentSection.items.at(-1)
      if (last?.type === 'special') last.body.push(para)
      else currentSection.items.push(para)
    } else if (blocks.length === 0) {
      blocks.push({ type: 'intro', content: line })
    } else if (blocks.length === 1 && blocks[0].type === 'intro') {
      const keywords = extractKeywords(line)
      if (keywords.length >= 2) {
        blocks.push({
          type: 'keywords',
          content: line,
          keywords,
        })
        continue
      }
      blocks.push(para)
    } else {
      blocks.push(para)
    }
  }

  flushSection()
  return blocks
}

function HighlightText({ text }) {
  const parts = text.split(/([''""][^''""]+[''""]|[（(][^）)]+[）)])/g)

  return parts.map((part, i) => {
    if (/^[''""].+[''""]$/.test(part)) {
      return (
        <em key={i} className="interp-em">
          {part.slice(1, -1)}
        </em>
      )
    }
    if (/^[（(].+[）)]$/.test(part)) {
      return (
        <span key={i} className="interp-paren">
          {part}
        </span>
      )
    }
    return part
  })
}

const InterpretationBody = memo(function InterpretationBody({ text }) {
  const blocks = useMemo(() => parseInterpretation(text), [text])

  return (
    <div className="interp-body">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`

        if (block.type === 'intro') {
          return (
            <div key={key} className="interp-intro">
              <span className="interp-intro-badge" aria-hidden="true">
                ✦
              </span>
              <p>
                <HighlightText text={block.content} />
              </p>
            </div>
          )
        }

        if (block.type === 'keywords') {
          return (
            <div key={key} className="interp-keywords">
              <p className="interp-keywords-text">
                <HighlightText text={block.content} />
              </p>
              {block.keywords.length > 0 ? (
                <ul className="interp-keyword-pills" aria-label="핵심 키워드">
                  {block.keywords.map((kw) => (
                    <li key={kw}>{kw}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          )
        }

        if (block.type === 'section') {
          return (
            <section
              key={key}
              className="interp-section"
              style={{ '--section-i': block.number }}
            >
              <header className="interp-section-head">
                <span className="interp-section-num" aria-hidden="true">
                  {block.number}
                </span>
                <div className="interp-section-titles">
                  <h3>{block.title}</h3>
                  {block.tagline ? (
                    <p className="interp-section-tagline">
                      「{block.tagline}」
                    </p>
                  ) : null}
                </div>
              </header>
              <div className="interp-section-body">
                {block.items.map((item, itemIndex) => (
                  <InterpretationItem
                    key={`${key}-item-${itemIndex}`}
                    item={item}
                  />
                ))}
              </div>
            </section>
          )
        }

        if (block.type === 'special') {
          return (
            <InterpretationItem key={key} item={block} standalone />
          )
        }

        if (block.type === 'subitem') {
          return (
            <InterpretationItem key={key} item={block} standalone />
          )
        }

        if (block.type === 'summary-header') {
          return (
            <div key={key} className="interp-summary-head">
              <span className="interp-summary-seal" aria-hidden="true">
                總
              </span>
              <h3>종합 의견</h3>
            </div>
          )
        }

        return (
          <p key={key} className="interp-para">
            <HighlightText text={block.content} />
          </p>
        )
      })}
    </div>
  )
})

const ResultPanel = memo(function ResultPanel({ interpretation }) {
  return (
    <article className="result" aria-live="polite">
      <div className="result-summary">
        <h2>기본 차트 해석</h2>
        <p>사주 명식을 바탕으로 성격·기질·재능의 흐름을 읽습니다.</p>
      </div>

      <PillarGrid chart={SAMPLE_BASIC_CHART} />

      <div className="result-text-card">
        <header className="result-text-head">
          <h2>해석</h2>
          <span className="result-text-badge" aria-hidden="true">
            解
          </span>
        </header>
        <InterpretationBody text={interpretation} />
      </div>
    </article>
  )
})

function InterpretationItem({ item, standalone = false }) {
  if (item.type === 'special') {
    return (
      <article
        className={`interp-special${standalone ? ' interp-special--solo' : ''}`}
      >
        <header className="interp-special-head">
          <span className="interp-special-marker" aria-hidden="true">
            {item.marker}
          </span>
          <h4>
            <HighlightText text={item.title} />
          </h4>
        </header>
        {item.body.length > 0 ? (
          <div className="interp-special-body">
            {item.body.map((sub, i) => (
              <InterpretationItem key={i} item={sub} />
            ))}
          </div>
        ) : null}
      </article>
    )
  }

  if (item.type === 'subitem') {
    const tone =
      item.label.includes('긍정') || item.label.includes('강점')
        ? 'positive'
        : item.label.includes('부정') || item.label.includes('약점')
          ? 'negative'
          : 'neutral'

    return (
      <div className={`interp-subitem interp-subitem--${tone}`}>
        <span className="interp-subitem-label">{item.label}</span>
        <p>
          <HighlightText text={item.content} />
        </p>
      </div>
    )
  }

  return (
    <p className="interp-para">
      <HighlightText text={item.content} />
    </p>
  )
}

function App() {
  // --- 입력 상태들 (각 칸에 적힌 값을 기억) ---
  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [birthTime, setBirthTime] = useState('') // 예: '14:30'
  const [timeUnknown, setTimeUnknown] = useState(false)
  const [gender, setGender] = useState('')
  const [calendarType, setCalendarType] = useState('solar')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [interpretation, setInterpretation] = useState('')
  const [readings, setReadings] = useState([])
  const [readingsLoading, setReadingsLoading] = useState(true)
  const [activeReadingId, setActiveReadingId] = useState(null)

  const birthMonthRef = useRef(null)
  const birthDayRef = useRef(null)
  const birthTimeRef = useRef(null)
  const resultRef = useRef(null)
  const formCardRef = useRef(null)
  const statusTimerRef = useRef(null)

  const birthDateValid = isValidBirthDate(birthYear, birthMonth, birthDay)
  const birthTimeValid = timeUnknown || isValidBirthTime(birthTime)
  const isRecalling = Boolean(activeReadingId)

  const canSubmit =
    birthDateValid && birthTimeValid && Boolean(gender) && !isLoading

  let missingHint = ''
  if (!canSubmit && !isLoading) {
    if (!birthDateValid) missingHint = '생년월일을 확인해 주세요'
    else if (!birthTimeValid)
      missingHint =
        '태어난 시간을 입력하거나 ‘시간 모름’을 체크해 주세요'
    else if (!gender) missingHint = '성별을 선택해 주세요'
  }

  const showStatus = (message) => {
    setStatusMessage(message)
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
    statusTimerRef.current = setTimeout(() => setStatusMessage(''), 2400)
  }

  const loadReadings = async () => {
    const { data, error } = await supabase
      .from('saju_readings')
      .select(READING_COLUMNS)
      .order('created_at', { ascending: false })

    if (error) console.error(error)
    else setReadings(data ?? [])
    setReadingsLoading(false)
  }

  useEffect(() => {
    loadReadings()
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!interpretation || isLoading) return
    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [interpretation, isLoading])

  const resetForm = () => {
    setName('')
    setBirthYear('')
    setBirthMonth('')
    setBirthDay('')
    setBirthTime('')
    setTimeUnknown(false)
    setGender('')
    setCalendarType('solar')
    setActiveReadingId(null)
    setInterpretation('')
    setErrorMessage('')
  }

  const handleNewInput = () => {
    resetForm()
    formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    showStatus('새 입력을 시작해 보세요')
  }

  const handleNameChange = (e) => setName(e.target.value)

  const handleBirthYearChange = (e) => {
    const nextYear = digitsOnly(e.target.value, 4)
    setBirthYear(nextYear)
    setBirthDay((day) => clampDay(nextYear, birthMonth, day))
    if (nextYear.length === 4) birthMonthRef.current?.focus()
  }

  const handleBirthMonthChange = (e) => {
    const nextMonth = digitsOnly(e.target.value, 2)
    setBirthMonth(nextMonth)
    setBirthDay((day) => clampDay(birthYear, nextMonth, day))
    if (nextMonth.length === 2) birthDayRef.current?.focus()
  }

  const handleBirthDayChange = (e) => {
    const nextDay = digitsOnly(e.target.value, 2)
    setBirthDay(nextDay)
    if (nextDay.length === 2 && !timeUnknown) birthTimeRef.current?.focus()
  }

  const handleBirthMonthBlur = () => {
    if (!birthMonth) return
    setBirthMonth(pad2(birthMonth))
  }

  const handleBirthDayBlur = () => {
    if (!birthDay) return
    setBirthDay(pad2(birthDay))
  }

  const handleBirthTimeChange = (e) => {
    const raw = digitsOnly(e.target.value, 4)
    if (raw.length <= 2) {
      setBirthTime(raw)
      return
    }
    setBirthTime(`${raw.slice(0, 2)}:${raw.slice(2)}`)
  }

  const handleBirthTimeBlur = () => {
    if (!birthTime || birthTime.includes(':')) return
    if (birthTime.length <= 2) {
      setBirthTime(`${pad2(birthTime)}:00`)
    }
  }

  // 시간 모름을 체크하면, 시간 값을 비우고 입력칸을 막음
  const handleTimeUnknownChange = (e) => {
    const checked = e.target.checked
    setTimeUnknown(checked)
    if (checked) {
      setBirthTime('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return

    setIsLoading(true)
    setErrorMessage('')
    setStatusMessage('')
    setInterpretation('')

    try {
      const month = pad2(birthMonth)
      const day = pad2(birthDay)
      const text = await interpretBasicChart({
        name,
        gender,
        birthYear,
        birthMonth: month,
        birthDay: day,
        birthTime,
        timeUnknown,
        calendarType,
      })
      setInterpretation(text)

      const displayName = name.trim() || '이름 없음'
      const { data, error } = await supabase
        .from('saju_readings')
        .insert({
          name: displayName,
          gender,
          calendar_type: calendarType,
          birth_year: birthYear,
          birth_month: month,
          birth_day: day,
          birth_time: timeUnknown ? null : birthTime,
          time_unknown: timeUnknown,
          interpretation: text,
        })
        .select(READING_COLUMNS)
        .single()

      if (error) throw error
      setActiveReadingId(data.id)
      setBirthMonth(month)
      setBirthDay(day)
      setReadings((prev) => [data, ...prev.filter((r) => r.id !== data.id)])
      showStatus('기록에 저장했습니다')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '해석 중 오류가 발생했습니다.'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectReading = (reading) => {
    if (activeReadingId === reading.id) {
      setActiveReadingId(null)
      setInterpretation('')
      showStatus('결과를 닫았습니다')
      return
    }
    setActiveReadingId(reading.id)
    setName(reading.name === '이름 없음' ? '' : reading.name || '')
    setGender(reading.gender || '')
    setCalendarType(reading.calendar_type || 'solar')
    setBirthYear(reading.birth_year || '')
    setBirthMonth(reading.birth_month || '')
    setBirthDay(reading.birth_day || '')
    setTimeUnknown(Boolean(reading.time_unknown))
    setBirthTime(reading.time_unknown ? '' : reading.birth_time || '')
    setInterpretation(reading.interpretation)
    setErrorMessage('')
    showStatus(`${reading.name || '이름 없음'} 기록을 불러왔어요`)
  }

  return (
    <div className="layout">
      <div className="ambient" aria-hidden="true">
        <span className="float-char float-char--1">木</span>
        <span className="float-char float-char--2">火</span>
        <span className="float-char float-char--3">土</span>
        <span className="float-char float-char--4">金</span>
        <span className="float-char float-char--5">水</span>
        <span className="spark spark--1" />
        <span className="spark spark--2" />
        <span className="spark spark--3" />
        <span className="spark spark--4" />
        <span className="spark spark--5" />
        <span className="spark spark--6" />
      </div>

      <aside className="readings-side" aria-label="저장된 사주">
        <div className="readings-side-head">
          <h2 className="readings-side-title">기록</h2>
          <button
            type="button"
            className="readings-new-btn"
            onClick={handleNewInput}
          >
            새 입력
          </button>
        </div>
        {readingsLoading ? (
          <p className="readings-side-empty">불러오는 중…</p>
        ) : readings.length === 0 ? (
          <p className="readings-side-empty">
            해석하면 여기에 이름이 쌓입니다
          </p>
        ) : (
          <ul className="readings-side-list">
            {readings.map((reading) => (
              <li key={reading.id}>
                <button
                  type="button"
                  className={`readings-side-item${activeReadingId === reading.id ? ' is-active' : ''}`}
                  aria-pressed={activeReadingId === reading.id}
                  onClick={() => handleSelectReading(reading)}
                >
                  <span className="readings-side-name">
                    {reading.name || '이름 없음'}
                  </span>
                  <span className="readings-side-meta">
                    {readingSubtitle(reading)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <div className="page">
      <header className="hero">
        <div className="hero-seal" aria-hidden="true">
          <span className="hero-seal-ring" />
          <span className="hero-seal-inner">命</span>
        </div>
        <p className="hero-tag">四柱推命 · 四柱八字</p>
        <h1>
          <span className="hero-title-accent">사주</span> 입력
        </h1>
        <p className="hero-sub">생년월일을 담아, 당신만의 흐름을 읽어 드립니다 ✦</p>
      </header>

      <div
        className={`form-card${isRecalling ? ' is-recalling' : ''}`}
        ref={formCardRef}
      >
        <div className="form-card-corner form-card-corner--tl" aria-hidden="true" />
        <div className="form-card-corner form-card-corner--tr" aria-hidden="true" />
        <div className="form-card-corner form-card-corner--bl" aria-hidden="true" />
        <div className="form-card-corner form-card-corner--br" aria-hidden="true" />

        {isRecalling ? (
          <div className="form-recall" role="status">
            <span>기록에서 불러온 내용입니다 · 다시 누르면 결과가 닫혀요</span>
            <button type="button" onClick={handleNewInput}>
              비우기
            </button>
          </div>
        ) : null}

        <form className="form" onSubmit={handleSubmit}>
          {/* 1) 이름 — 가장 먼저, 한 줄 */}
          <section className="field-group" aria-labelledby="section-basic">
            <h2 id="section-basic">
              <span className="section-num">壹</span> 기본
            </h2>

            <label className="field" htmlFor="name">
              <span className="field-label">이름</span>
              <input
                id="name"
                type="text"
                placeholder="홍길동"
                autoComplete="name"
                value={name}
                onChange={handleNameChange}
              />
            </label>
          </section>

          {/* 2) 출생 — 양음력 → 날짜 → 시간 순으로 읽히게 */}
          <section className="field-group" aria-labelledby="section-birth">
            <h2 id="section-birth">
              <span className="section-num">貳</span> 출생
            </h2>

            {/* 양력/음력: 날짜보다 먼저 고르는 편이 자연스러움 */}
            <fieldset className="field">
              <legend className="field-label">달력</legend>
              <div className="segmented" role="group" aria-label="양력 또는 음력">
                <label className={calendarType === 'solar' ? 'is-active' : ''}>
                  <input
                    type="radio"
                    name="calendarType"
                    value="solar"
                    checked={calendarType === 'solar'}
                    onChange={() => setCalendarType('solar')}
                  />
                  <span className="segment-icon" aria-hidden="true">☀</span>
                  양력
                </label>
                <label className={calendarType === 'lunar' ? 'is-active' : ''}>
                  <input
                    type="radio"
                    name="calendarType"
                    value="lunar"
                    checked={calendarType === 'lunar'}
                    onChange={() => setCalendarType('lunar')}
                  />
                  <span className="segment-icon" aria-hidden="true">☽</span>
                  음력
                </label>
              </div>
            </fieldset>

            <fieldset className="field">
              <legend className="field-label">생년월일</legend>
              <div className="date-inputs" role="group" aria-label="생년월일">
                <label className="date-input" htmlFor="birthYear">
                  <input
                    id="birthYear"
                    type="text"
                    inputMode="numeric"
                    autoComplete="bday-year"
                    placeholder="1990"
                    maxLength={4}
                    value={birthYear}
                    onChange={handleBirthYearChange}
                  />
                  <span className="date-input-unit">년</span>
                </label>

                <label className="date-input" htmlFor="birthMonth">
                  <input
                    id="birthMonth"
                    ref={birthMonthRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="bday-month"
                    placeholder="01"
                    maxLength={2}
                    value={birthMonth}
                    onChange={handleBirthMonthChange}
                    onBlur={handleBirthMonthBlur}
                  />
                  <span className="date-input-unit">월</span>
                </label>

                <label className="date-input" htmlFor="birthDay">
                  <input
                    id="birthDay"
                    ref={birthDayRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="bday-day"
                    placeholder="15"
                    maxLength={2}
                    value={birthDay}
                    onChange={handleBirthDayChange}
                    onBlur={handleBirthDayBlur}
                  />
                  <span className="date-input-unit">일</span>
                </label>
              </div>
            </fieldset>

            <div className="field-row">
              <label className="field" htmlFor="birthTime">
                <span className="field-label">태어난 시간</span>
                <input
                  id="birthTime"
                  ref={birthTimeRef}
                  type="text"
                  inputMode="numeric"
                  placeholder="14:30"
                  maxLength={5}
                  value={birthTime}
                  disabled={timeUnknown}
                  onChange={handleBirthTimeChange}
                  onBlur={handleBirthTimeBlur}
                />
                <span className="field-hint">24시간 · 예) 0930 → 09:30</span>
              </label>

              <label className="check-field" htmlFor="timeUnknown">
                <input
                  id="timeUnknown"
                  type="checkbox"
                  checked={timeUnknown}
                  onChange={handleTimeUnknownChange}
                />
                <span>시간 모름</span>
              </label>
            </div>
          </section>

          {/* 3) 성별 — 선택지가 적어 세그먼트로 */}
          <section className="field-group" aria-labelledby="section-gender">
            <h2 id="section-gender">
              <span className="section-num">參</span> 성별
            </h2>

            <fieldset className="field">
              <legend className="field-label visually-hidden">성별 선택</legend>
              <div className="segmented" role="group" aria-label="성별">
                <label className={gender === 'male' ? 'is-active' : ''}>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={gender === 'male'}
                    onChange={() => setGender('male')}
                  />
                  남성
                </label>
                <label className={gender === 'female' ? 'is-active' : ''}>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={gender === 'female'}
                    onChange={() => setGender('female')}
                  />
                  여성
                </label>
              </div>
            </fieldset>
          </section>

          {missingHint ? (
            <p className="submit-hint" aria-live="polite">
              {missingHint}
            </p>
          ) : null}

          <button
            className={`submit-btn${isLoading ? ' is-loading' : ''}`}
            type="submit"
            disabled={!canSubmit}
          >
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                <span className="submit-shimmer" aria-hidden="true" />
                별자리를 읽는 중…
              </>
            ) : (
              <>
                <span className="submit-icon" aria-hidden="true">✦</span>
                {isRecalling ? '다시 해석하기' : '기본 차트 해석하기'}
              </>
            )}
          </button>
        </form>
      </div>

      {errorMessage ? (
        <p className="status status--error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {statusMessage ? (
        <p className="status status--ok" role="status">
          {statusMessage}
        </p>
      ) : null}

      {interpretation ? (
        <div ref={resultRef}>
          <ResultPanel interpretation={interpretation} />
        </div>
      ) : null}
      </div>
    </div>
  )
}

export default App
