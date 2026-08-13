import assert from 'node:assert/strict'
import {
  formatBirthDateLabel,
  formatBirthTimeLabel,
  formatGenderLabel,
} from './birth.js'
import {
  formToRow,
  isProfileComplete,
  rowToForm,
} from './profile.js'

const incomplete = {
  name: '서진',
  gender: '',
  calendarType: 'solar',
  birthYear: '1999',
  birthMonth: '01',
  birthDay: '06',
  birthTime: '',
  timeUnknown: false,
}
assert.equal(isProfileComplete(incomplete), false)

const complete = {
  ...incomplete,
  gender: 'female',
  timeUnknown: true,
}
assert.equal(isProfileComplete(complete), true)

const row = formToRow('user-1', {
  ...complete,
  timeUnknown: false,
  birthTime: '14:30',
})
assert.equal(row.id, 'user-1')
assert.equal(row.gender, 'female')
assert.equal(row.birth_time, '14:30')
assert.equal(formatBirthDateLabel(row), '1999년 01월 06일')
assert.equal(formatBirthTimeLabel(row), '오후 2:30')
assert.equal(formatGenderLabel(row.gender), '여성')

const back = rowToForm(row)
assert.equal(back.gender, 'female')
assert.equal(isProfileComplete(back), true)

console.log('profile.check ok')
