const CURRENT_YEAR = new Date().getFullYear()
const MIN_BIRTH_YEAR = 1920

export function pad2(n) {
  return String(n).padStart(2, '0')
}

export function digitsOnly(value, maxLen) {
  return value.replace(/\D/g, '').slice(0, maxLen)
}

export function getDaysInMonth(year, month) {
  if (!year || !month) return 31
  return new Date(Number(year), Number(month), 0).getDate()
}

export function clampDay(year, month, day) {
  if (!day) return day
  const maxDay = getDaysInMonth(year, month)
  return Number(day) > maxDay ? String(maxDay) : day
}

export function isValidBirthDate(year, month, day) {
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

export function isValidBirthTime(time) {
  const match = time.match(/^(\d{2}):(\d{2})$/)
  if (!match) return false
  const h = Number(match[1])
  const min = Number(match[2])
  return h >= 0 && h <= 23 && min >= 0 && min <= 59
}

export function normalizeBirthForm(form) {
  return {
    ...form,
    birthMonth: form.birthMonth ? pad2(form.birthMonth) : '',
    birthDay: form.birthDay ? pad2(form.birthDay) : '',
  }
}

/** 숫자만 들어온 시각을 입력 중 표시용 HH:MM 형태로 맞춘다. */
export function formatBirthTimeInput(rawDigits) {
  return rawDigits.length <= 2
    ? rawDigits
    : `${rawDigits.slice(0, 2)}:${rawDigits.slice(2)}`
}

/** blur 때 시만 있으면 분은 00으로 채운다. */
export function completePartialBirthTime(birthTime) {
  if (!birthTime || birthTime.includes(':')) return birthTime
  if (birthTime.length <= 2) return `${pad2(birthTime)}:00`
  return birthTime
}

export function readingMetaParts(row) {
  if (!row) return []
  const calendar = formatCalendarLabel(row.calendar_type)
  const birth =
    row.birth_year && row.birth_month && row.birth_day
      ? `${row.birth_year}.${pad2(row.birth_month)}.${pad2(row.birth_day)}`
      : ''
  const time = row.time_unknown ? '시간 모름' : row.birth_time || ''
  const gender = formatGenderLabel(row.gender)
  return [calendar, birth, time, gender].filter(Boolean)
}

export function readingSubtitle(reading) {
  return readingMetaParts(reading).join(' · ')
}

export function formatBirthDateLabel(row) {
  if (!row?.birth_year || !row?.birth_month || !row?.birth_day) return ''
  return `${row.birth_year}년 ${pad2(row.birth_month)}월 ${pad2(row.birth_day)}일`
}

/** 14:30 → 오후 2:30 */
export function formatBirthTimeLabel(row) {
  if (!row) return ''
  if (row.time_unknown) return '모름'
  const time = row.birth_time || ''
  const match = time.match(/^(\d{2}):(\d{2})$/)
  if (!match) return time || '모름'
  const h = Number(match[1])
  const m = match[2]
  const period = h < 12 ? '오전' : '오후'
  const hour12 = h % 12 || 12
  return `${period} ${hour12}:${m}`
}

export function formatGenderLabel(gender) {
  if (gender === 'female') return '여성'
  if (gender === 'male') return '남성'
  return ''
}

export function formatCalendarLabel(calendarType) {
  return calendarType === 'lunar' ? '음력' : '양력'
}
