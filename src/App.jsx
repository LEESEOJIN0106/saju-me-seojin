import { useState } from 'react'
import { interpretBasicChart } from './lib/gemini'
import './App.css'

// 올해 기준으로 선택할 수 있는 연도 목록 (1920 ~ 올해)
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1920 + 1 }, (_, i) => CURRENT_YEAR - i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)

function pad2(n) {
  return String(n).padStart(2, '0')
}

// 해당 년·월에 며칠까지 있는지 계산 (윤년 포함)
function getDaysInMonth(year, month) {
  if (!year || !month) return 31
  return new Date(Number(year), Number(month), 0).getDate()
}

// 화면 표시용: API 응답의 마크다운 기호만 정리 (로직/상태와 무관)
function cleanInterpretationLines(text) {
  return text
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

function App() {
  // --- 입력 상태들 (각 칸에 적힌 값을 기억) ---
  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [birthTime, setBirthTime] = useState('') // 예: '14:30'
  const [timeUnknown, setTimeUnknown] = useState(false) // 시간을 모를 때
  const [gender, setGender] = useState('') // 'male' | 'female'
  const [calendarType, setCalendarType] = useState('solar') // 'solar'(양력) | 'lunar'(음력)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [interpretation, setInterpretation] = useState('')

  const daysInMonth = getDaysInMonth(birthYear, birthMonth)
  const DAYS = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // birthTime은 'HH:MM' 형태. select 두 개로 시·분을 따로 고름
  const [birthHour, birthMinute] = birthTime
    ? birthTime.split(':')
    : ['', '']

  const canSubmit =
    Boolean(birthYear && birthMonth && birthDay && gender) &&
    (timeUnknown || Boolean(birthTime)) &&
    !isLoading

  // input/select 공통: e.target.value로 방금 입력한 값을 받음
  const handleNameChange = (e) => setName(e.target.value)

  const handleBirthHourChange = (e) => {
    const nextHour = e.target.value
    if (nextHour === '') {
      setBirthTime('')
      return
    }
    // 분만 비어 있으면 00분으로 맞춤
    setBirthTime(`${nextHour}:${birthMinute || '00'}`)
  }

  const handleBirthMinuteChange = (e) => {
    const nextMinute = e.target.value
    if (nextMinute === '') {
      if (!birthHour) {
        setBirthTime('')
        return
      }
      setBirthTime(`${birthHour}:00`)
      return
    }
    setBirthTime(`${birthHour || '00'}:${nextMinute}`)
  }

  const handleBirthYearChange = (e) => {
    const nextYear = e.target.value
    setBirthYear(nextYear)
    // 월·일이 이미 있으면, 새 연도 기준으로 일수가 줄어들 수 있음 (예: 윤년 2/29)
    const maxDay = getDaysInMonth(nextYear, birthMonth)
    if (birthDay && Number(birthDay) > maxDay) {
      setBirthDay(String(maxDay))
    }
  }

  const handleBirthMonthChange = (e) => {
    const nextMonth = e.target.value
    setBirthMonth(nextMonth)
    const maxDay = getDaysInMonth(birthYear, nextMonth)
    if (birthDay && Number(birthDay) > maxDay) {
      setBirthDay(String(maxDay))
    }
  }

  const handleBirthDayChange = (e) => setBirthDay(e.target.value)

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
    setInterpretation('')

    try {
      const text = await interpretBasicChart({
        name,
        gender,
        birthYear,
        birthMonth,
        birthDay,
        birthTime,
        timeUnknown,
        calendarType,
      })
      setInterpretation(text)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '해석 중 오류가 발생했습니다.'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-ornament" aria-hidden="true">
          命
        </div>
        <h1>사주 입력</h1>
        <p className="hero-sub">생년월일을 담아 흐름을 읽습니다</p>
      </header>

      <div className="form-card">
        <form className="form" onSubmit={handleSubmit}>
          {/* 1) 이름 — 가장 먼저, 한 줄 */}
          <section className="field-group" aria-labelledby="section-basic">
            <h2 id="section-basic">기본</h2>

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
            <h2 id="section-birth">출생</h2>

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
                  음력
                </label>
              </div>
            </fieldset>

            {/* 브라우저 기본 date 달력(영어) 대신, 한국어 년·월·일 선택 */}
            <fieldset className="field">
              <legend className="field-label">생년월일</legend>
              <div className="date-selects" role="group" aria-label="생년월일">
                <label className="date-select" htmlFor="birthYear">
                  <span className="visually-hidden">년</span>
                  <select
                    id="birthYear"
                    value={birthYear}
                    onChange={handleBirthYearChange}
                  >
                    <option value="">년도</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}년
                      </option>
                    ))}
                  </select>
                </label>

                <label className="date-select" htmlFor="birthMonth">
                  <span className="visually-hidden">월</span>
                  <select
                    id="birthMonth"
                    value={birthMonth}
                    onChange={handleBirthMonthChange}
                  >
                    <option value="">월</option>
                    {MONTHS.map((month) => (
                      <option key={month} value={month}>
                        {month}월
                      </option>
                    ))}
                  </select>
                </label>

                <label className="date-select" htmlFor="birthDay">
                  <span className="visually-hidden">일</span>
                  <select
                    id="birthDay"
                    value={birthDay}
                    onChange={handleBirthDayChange}
                  >
                    <option value="">일</option>
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}일
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </fieldset>

            {/* 시·분 select: 네이티브 time 휠의 무한 스크롤 대신 목록만 위아래로 */}
            <div className="field-row">
              <fieldset className="field" disabled={timeUnknown}>
                <legend className="field-label">태어난 시간</legend>
                <div className="time-selects" role="group" aria-label="태어난 시간">
                  <label className="time-select" htmlFor="birthHour">
                    <span className="visually-hidden">시</span>
                    <select
                      id="birthHour"
                      value={birthHour}
                      onChange={handleBirthHourChange}
                    >
                      <option value="">시</option>
                      {HOURS.map((hour) => (
                        <option key={hour} value={pad2(hour)}>
                          {pad2(hour)}시
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="time-select" htmlFor="birthMinute">
                    <span className="visually-hidden">분</span>
                    <select
                      id="birthMinute"
                      value={birthMinute}
                      onChange={handleBirthMinuteChange}
                    >
                      <option value="">분</option>
                      {MINUTES.map((minute) => (
                        <option key={minute} value={pad2(minute)}>
                          {pad2(minute)}분
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </fieldset>

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
            <h2 id="section-gender">성별</h2>

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

          <button
            className={`submit-btn${isLoading ? ' is-loading' : ''}`}
            type="submit"
            disabled={!canSubmit}
          >
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                해석 중…
              </>
            ) : (
              '기본 차트 해석하기'
            )}
          </button>
        </form>
      </div>
      image.png
      {errorMessage ? (
        <p className="status status--error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {interpretation ? (
        <article className="result" aria-live="polite">
          <div className="result-summary">
            <h2>기본 차트 해석</h2>
            <p>사주 명식을 바탕으로 성격·기질·재능의 흐름을 읽습니다.</p>
          </div>

          <div className="pillar-grid" aria-label="사주 네 기둥">
            <div className="pillar-card">
              <span className="pillar-label">년주</span>
              <div className="pillar-chars">
                <div className="pillar-char">
                  기
                  <span className="badge badge--earth">토</span>
                </div>
                <div className="pillar-char">
                  묘
                  <span className="badge badge--wood">목</span>
                </div>
              </div>
            </div>
            <div className="pillar-card">
              <span className="pillar-label">월주</span>
              <div className="pillar-chars">
                <div className="pillar-char">
                  기
                  <span className="badge badge--earth">토</span>
                </div>
                <div className="pillar-char">
                  사
                  <span className="badge badge--fire">화</span>
                </div>
              </div>
            </div>
            <div className="pillar-card">
              <span className="pillar-label">일주</span>
              <div className="pillar-chars">
                <div className="pillar-char">
                  을
                  <span className="badge badge--wood">목</span>
                </div>
                <div className="pillar-char">
                  축
                  <span className="badge badge--earth">토</span>
                </div>
              </div>
            </div>
            <div className="pillar-card">
              <span className="pillar-label">시주</span>
              <div className="pillar-chars">
                <div className="pillar-char">
                  을
                  <span className="badge badge--wood">목</span>
                </div>
                <div className="pillar-char">
                  유
                  <span className="badge badge--metal">금</span>
                </div>
              </div>
            </div>
          </div>

          <div className="result-text-card">
            <h2>해석</h2>
            <div className="result-body">
              {cleanInterpretationLines(interpretation).map(
                (paragraph, index, all) => {
                  const isLead = index === 0
                  const isQuestion =
                    index === all.length - 1 &&
                    (/[?？]$/.test(paragraph) ||
                      paragraph.includes('궁금') ||
                      paragraph.includes('어떠'))
                  const isPoint = /^(\d+[.)]|[①-⑳]|[⓿-❾])\s*/.test(paragraph)

                  let className = 'result-paragraph'
                  if (isLead) className += ' result-paragraph--lead'
                  if (isPoint) className += ' result-paragraph--point'
                  if (isQuestion) className += ' result-paragraph--question'

                  return (
                    <p
                      key={`${index}-${paragraph.slice(0, 12)}`}
                      className={className}
                    >
                      {paragraph}
                    </p>
                  )
                },
              )}
            </div>
          </div>
        </article>
      ) : null}
    </div>
  )
}

export default App
