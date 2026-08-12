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

export function readingSubtitle(reading) {
  const gender =
    reading.gender === 'female' ? '여' : reading.gender === 'male' ? '남' : ''
  const calendar = reading.calendar_type === 'lunar' ? '음력' : '양력'
  const birth = `${reading.birth_year}.${pad2(reading.birth_month)}.${pad2(reading.birth_day)}`
  const time = reading.time_unknown ? '시간 모름' : reading.birth_time || ''
  return [calendar, birth, time, gender].filter(Boolean).join(' · ')
}
