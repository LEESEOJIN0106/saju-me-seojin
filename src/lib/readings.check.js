import assert from 'node:assert/strict'
import { formToReadingRow } from './readings.js'

const form = {
  name: '서진',
  gender: 'female',
  calendarType: 'lunar',
  birthYear: '1999',
  birthMonth: '1',
  birthDay: '6',
  birthTime: '14:30',
  timeUnknown: false,
}

const row = formToReadingRow('user-1', form, '【유형】유연한실속파')
assert.equal(row.user_id, 'user-1')
assert.equal(row.name, '서진')
assert.equal(row.calendar_type, 'lunar')
assert.equal(row.birth_month, '01')
assert.equal(row.birth_day, '06')
assert.equal(row.birth_time, '14:30')
assert.equal(row.time_unknown, false)
assert.equal(row.interpretation, '【유형】유연한실속파')

const unnamed = formToReadingRow('user-1', { ...form, name: '  ', timeUnknown: true }, '본문')
assert.equal(unnamed.name, '이름 없음')
assert.equal(unnamed.birth_time, null)
assert.equal(unnamed.time_unknown, true)

console.log('readings.check ok')
