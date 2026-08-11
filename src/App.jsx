import { useState } from 'react'
import './App.css'

// 올해 기준으로 선택할 수 있는 연도 목록 (1920 ~ 올해)
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1920 + 1 }, (_, i) => CURRENT_YEAR - i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

// 해당 년·월에 며칠까지 있는지 계산 (윤년 포함)
function getDaysInMonth(year, month) {
  if (!year || !month) return 31
  return new Date(Number(year), Number(month), 0).getDate()
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

  const daysInMonth = getDaysInMonth(birthYear, birthMonth)
  const DAYS = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // input/select 공통: e.target.value로 방금 입력한 값을 받음
  const handleNameChange = (e) => setName(e.target.value)
  const handleBirthTimeChange = (e) => setBirthTime(e.target.value)

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

  // 미리보기용 한글 날짜 문구
  const birthDateLabel =
    birthYear && birthMonth && birthDay
      ? `${birthYear}년 ${Number(birthMonth)}월 ${Number(birthDay)}일`
      : '—'

  return (
    <div className="page">
      <header className="hero">
        <p className="brand">사주 미</p>
        <h1>사주 입력</h1>
        <p className="lede">이름과 출생 정보만 천천히 채워 주세요.</p>
      </header>

      <form className="form" onSubmit={(e) => e.preventDefault()}>
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

          {/* 날짜와 시간을 나란히: 넓은 화면에서는 2열, 좁으면 1열 */}
          <div className="field-row">
            <label className="field" htmlFor="birthTime">
              <span className="field-label">태어난 시간</span>
              <input
                id="birthTime"
                type="time"
                value={birthTime}
                onChange={handleBirthTimeChange}
                disabled={timeUnknown}
              />
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
      </form>

      {/* 상태가 잘 연결됐는지 확인용 (학습용, 나중에 지워도 됨) */}
      <aside className="preview" aria-live="polite">
        <h2>입력 미리보기</h2>
        <dl>
          <div>
            <dt>이름</dt>
            <dd>{name || '—'}</dd>
          </div>
          <div>
            <dt>달력</dt>
            <dd>{calendarType === 'solar' ? '양력' : '음력'}</dd>
          </div>
          <div>
            <dt>생년월일</dt>
            <dd>{birthDateLabel}</dd>
          </div>
          <div>
            <dt>시간</dt>
            <dd>{timeUnknown ? '모름' : birthTime || '—'}</dd>
          </div>
          <div>
            <dt>성별</dt>
            <dd>
              {gender === 'male' ? '남성' : gender === 'female' ? '여성' : '—'}
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  )
}

export default App
