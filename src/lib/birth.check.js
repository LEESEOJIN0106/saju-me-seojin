import assert from 'node:assert/strict'
import {
  completePartialBirthTime,
  formatBirthTimeInput,
  normalizeBirthForm,
  readingMetaParts,
  readingSubtitle,
} from './birth.js'

assert.equal(formatBirthTimeInput('09'), '09')
assert.equal(formatBirthTimeInput('0930'), '09:30')
assert.equal(completePartialBirthTime('9'), '09:00')
assert.equal(completePartialBirthTime('09:30'), '09:30')

const normalized = normalizeBirthForm({
  name: '서진',
  birthMonth: '1',
  birthDay: '6',
})
assert.equal(normalized.birthMonth, '01')
assert.equal(normalized.birthDay, '06')

const parts = readingMetaParts({
  gender: 'female',
  calendar_type: 'lunar',
  birth_year: '1999',
  birth_month: '1',
  birth_day: '6',
  time_unknown: true,
})
assert.deepEqual(parts, ['음력', '1999.01.06', '시간 모름', '여성'])
assert.equal(readingSubtitle({
  gender: 'female',
  calendar_type: 'lunar',
  birth_year: '1999',
  birth_month: '1',
  birth_day: '6',
  time_unknown: true,
}), '음력 · 1999.01.06 · 시간 모름 · 여성')

console.log('birth.check ok')
