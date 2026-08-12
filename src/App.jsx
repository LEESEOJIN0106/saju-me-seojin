import { useEffect, useRef, useState } from 'react'
import { ReadingsSidebar } from './components/ReadingsSidebar'
import { ResultPanel } from './components/ResultPanel'
import {
  clampDay,
  digitsOnly,
  isValidBirthDate,
  isValidBirthTime,
  pad2,
} from './lib/birth'
import { interpretBasicChart } from './lib/gemini'
import { supabase } from './lib/supabase'
import './App.css'

const READING_COLUMNS =
  'id, name, gender, calendar_type, birth_year, birth_month, birth_day, birth_time, time_unknown, interpretation, created_at'

const emptyForm = {
  name: '',
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  birthTime: '',
  timeUnknown: false,
  gender: '',
  calendarType: 'solar',
}

function App() {
  const [form, setForm] = useState(emptyForm)
  const {
    name,
    birthYear,
    birthMonth,
    birthDay,
    birthTime,
    timeUnknown,
    gender,
    calendarType,
  } = form

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [interpretation, setInterpretation] = useState('')
  const [readings, setReadings] = useState([])
  const [readingsLoading, setReadingsLoading] = useState(true)
  const [activeReadingId, setActiveReadingId] = useState(null)
  const [user, setUser] = useState(null)
  const [authBusy, setAuthBusy] = useState(false)

  const birthMonthRef = useRef(null)
  const birthDayRef = useRef(null)
  const birthTimeRef = useRef(null)
  const formCardRef = useRef(null)
  const resultRef = useRef(null)
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

  const patchForm = (patch) => setForm((prev) => ({ ...prev, ...patch }))

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

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!interpretation || isLoading) return
    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [interpretation, isLoading])

  const handleGoogleSignIn = async () => {
    setAuthBusy(true)
    setErrorMessage('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) {
      setErrorMessage(error.message)
      setAuthBusy(false)
    }
  }

  const handleSignOut = async () => {
    setAuthBusy(true)
    const { error } = await supabase.auth.signOut()
    if (error) setErrorMessage(error.message)
    else showStatus('로그아웃했습니다')
    setAuthBusy(false)
  }

  const resetForm = () => {
    setForm(emptyForm)
    setActiveReadingId(null)
    setInterpretation('')
    setErrorMessage('')
  }

  const handleNewInput = () => {
    resetForm()
    formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    showStatus('새 입력을 시작해 보세요')
  }

  const handleBirthYearChange = (e) => {
    const nextYear = digitsOnly(e.target.value, 4)
    setForm((prev) => ({
      ...prev,
      birthYear: nextYear,
      birthDay: clampDay(nextYear, prev.birthMonth, prev.birthDay),
    }))
    if (nextYear.length === 4) birthMonthRef.current?.focus()
  }

  const handleBirthMonthChange = (e) => {
    const nextMonth = digitsOnly(e.target.value, 2)
    setForm((prev) => ({
      ...prev,
      birthMonth: nextMonth,
      birthDay: clampDay(prev.birthYear, nextMonth, prev.birthDay),
    }))
    if (nextMonth.length === 2) birthDayRef.current?.focus()
  }

  const handleBirthDayChange = (e) => {
    const nextDay = digitsOnly(e.target.value, 2)
    patchForm({ birthDay: nextDay })
    if (nextDay.length === 2 && !timeUnknown) birthTimeRef.current?.focus()
  }

  const handleBirthTimeChange = (e) => {
    const raw = digitsOnly(e.target.value, 4)
    patchForm({
      birthTime: raw.length <= 2 ? raw : `${raw.slice(0, 2)}:${raw.slice(2)}`,
    })
  }

  const handleTimeUnknownChange = (e) => {
    const checked = e.target.checked
    patchForm({ timeUnknown: checked, birthTime: checked ? '' : birthTime })
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
      const wasUpdate = Boolean(activeReadingId)
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
      const payload = {
        name: displayName,
        gender,
        calendar_type: calendarType,
        birth_year: birthYear,
        birth_month: month,
        birth_day: day,
        birth_time: timeUnknown ? null : birthTime,
        time_unknown: timeUnknown,
        interpretation: text,
      }

      const query = activeReadingId
        ? supabase
            .from('saju_readings')
            .update(payload)
            .eq('id', activeReadingId)
        : supabase.from('saju_readings').insert(payload)

      const { data, error } = await query.select(READING_COLUMNS).single()
      if (error) throw error

      setActiveReadingId(data.id)
      patchForm({ birthMonth: month, birthDay: day })
      setReadings((prev) => [data, ...prev.filter((r) => r.id !== data.id)])
      showStatus(wasUpdate ? '기록을 수정했습니다' : '기록에 저장했습니다')
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : '해석 중 오류가 발생했습니다.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteReading = async (reading) => {
    if (!confirm(`${reading.name || '이름 없음'} 기록을 삭제할까요?`)) return

    const { error } = await supabase
      .from('saju_readings')
      .delete()
      .eq('id', reading.id)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setReadings((prev) => prev.filter((r) => r.id !== reading.id))
    if (activeReadingId === reading.id) resetForm()
    showStatus('기록을 삭제했습니다')
  }

  const handleSelectReading = (reading) => {
    if (activeReadingId === reading.id) {
      setActiveReadingId(null)
      setInterpretation('')
      showStatus('결과를 닫았습니다')
      return
    }

    setActiveReadingId(reading.id)
    setForm({
      name: reading.name === '이름 없음' ? '' : reading.name || '',
      gender: reading.gender || '',
      calendarType: reading.calendar_type || 'solar',
      birthYear: reading.birth_year || '',
      birthMonth: reading.birth_month || '',
      birthDay: reading.birth_day || '',
      timeUnknown: Boolean(reading.time_unknown),
      birthTime: reading.time_unknown ? '' : reading.birth_time || '',
    })
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

      <ReadingsSidebar
        user={user}
        authBusy={authBusy}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onNewInput={handleNewInput}
        readings={readings}
        readingsLoading={readingsLoading}
        activeReadingId={activeReadingId}
        onSelectReading={handleSelectReading}
        onDeleteReading={handleDeleteReading}
      />

      <div className="page">
        <header className="hero">
          <div className="hero-seal" aria-hidden="true">
            <span className="hero-seal-ring" />
            <span className="hero-seal-inner">命</span>
          </div>
          <p className="hero-tag">四柱 · TYPE CARD</p>
          <h1>
            <span className="hero-title-accent">나의</span> 사주 유형
          </h1>
          <p className="hero-sub">
            생년월일을 넣고, 공유할 수 있는 한 장을 받아보세요 ✦
          </p>
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
                  onChange={(e) => patchForm({ name: e.target.value })}
                />
              </label>
            </section>

            <section className="field-group" aria-labelledby="section-birth">
              <h2 id="section-birth">
                <span className="section-num">貳</span> 출생
              </h2>

              <fieldset className="field">
                <legend className="field-label">달력</legend>
                <div
                  className="segmented"
                  role="group"
                  aria-label="양력 또는 음력"
                >
                  <label className={calendarType === 'solar' ? 'is-active' : ''}>
                    <input
                      type="radio"
                      name="calendarType"
                      value="solar"
                      checked={calendarType === 'solar'}
                      onChange={() => patchForm({ calendarType: 'solar' })}
                    />
                    <span className="segment-icon" aria-hidden="true">
                      ☀
                    </span>
                    양력
                  </label>
                  <label className={calendarType === 'lunar' ? 'is-active' : ''}>
                    <input
                      type="radio"
                      name="calendarType"
                      value="lunar"
                      checked={calendarType === 'lunar'}
                      onChange={() => patchForm({ calendarType: 'lunar' })}
                    />
                    <span className="segment-icon" aria-hidden="true">
                      ☽
                    </span>
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
                      onBlur={() => {
                        if (birthMonth) patchForm({ birthMonth: pad2(birthMonth) })
                      }}
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
                      onBlur={() => {
                        if (birthDay) patchForm({ birthDay: pad2(birthDay) })
                      }}
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
                    onBlur={() => {
                      if (!birthTime || birthTime.includes(':')) return
                      if (birthTime.length <= 2) {
                        patchForm({ birthTime: `${pad2(birthTime)}:00` })
                      }
                    }}
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
                      onChange={() => patchForm({ gender: 'male' })}
                    />
                    남성
                  </label>
                  <label className={gender === 'female' ? 'is-active' : ''}>
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={gender === 'female'}
                      onChange={() => patchForm({ gender: 'female' })}
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
                  유형 카드 만드는 중…
                </>
              ) : (
                <>
                  <span className="submit-icon" aria-hidden="true">
                    ✦
                  </span>
                  {isRecalling ? '다시 유형 읽기' : '내 유형 카드 받기'}
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
            <ResultPanel
              interpretation={interpretation}
              name={name}
              onStatus={showStatus}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default App
