import { isValidBirthDate, isValidBirthTime, pad2 } from './birth.js'

export const USER_COLUMNS =
  'id, name, gender, calendar_type, birth_year, birth_month, birth_day, birth_time, time_unknown, created_at, updated_at'

export const emptyProfileForm = {
  name: '',
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  birthTime: '',
  timeUnknown: false,
  gender: '',
  calendarType: 'solar',
}

export function rowToForm(row) {
  if (!row) return { ...emptyProfileForm }
  return {
    name: row.name === '이름 없음' ? '' : row.name || '',
    gender: row.gender || '',
    calendarType: row.calendar_type || 'solar',
    birthYear: row.birth_year || '',
    birthMonth: row.birth_month || '',
    birthDay: row.birth_day || '',
    timeUnknown: Boolean(row.time_unknown),
    birthTime: row.time_unknown ? '' : row.birth_time || '',
  }
}

export function formToRow(userId, form) {
  const month = form.birthMonth ? pad2(form.birthMonth) : ''
  const day = form.birthDay ? pad2(form.birthDay) : ''
  return {
    id: userId,
    name: form.name.trim() || '',
    gender: form.gender || null,
    calendar_type: form.calendarType || 'solar',
    birth_year: form.birthYear || null,
    birth_month: month || null,
    birth_day: day || null,
    birth_time: form.timeUnknown ? null : form.birthTime || null,
    time_unknown: Boolean(form.timeUnknown),
    updated_at: new Date().toISOString(),
  }
}

export function isProfileComplete(rowOrForm) {
  if (!rowOrForm) return false
  const form =
    'birthYear' in rowOrForm || 'calendarType' in rowOrForm
      ? rowOrForm
      : rowToForm(rowOrForm)

  const dateOk = isValidBirthDate(
    form.birthYear,
    form.birthMonth,
    form.birthDay,
  )
  const timeOk = form.timeUnknown || isValidBirthTime(form.birthTime)
  return Boolean(form.gender) && dateOk && timeOk
}

export function profileMissingHint(form) {
  if (!isValidBirthDate(form.birthYear, form.birthMonth, form.birthDay)) {
    return '출생일을 확인해 주세요'
  }
  if (!(form.timeUnknown || isValidBirthTime(form.birthTime))) {
    return '태어난 시간을 넣거나 ‘출생시간을 모르겠어요’를 눌러 주세요'
  }
  if (!form.gender) return '성별을 골라 주세요'
  return ''
}
