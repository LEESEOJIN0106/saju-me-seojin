import { pad2 } from './birth.js'

export const READING_COLUMNS =
  'id, name, gender, calendar_type, birth_year, birth_month, birth_day, birth_time, time_unknown, interpretation, created_at'

export function formToReadingRow(userId, form, interpretation) {
  return {
    user_id: userId,
    name: form.name.trim() || '이름 없음',
    gender: form.gender,
    calendar_type: form.calendarType,
    birth_year: form.birthYear,
    birth_month: pad2(form.birthMonth),
    birth_day: pad2(form.birthDay),
    birth_time: form.timeUnknown ? null : form.birthTime,
    time_unknown: Boolean(form.timeUnknown),
    interpretation,
  }
}
