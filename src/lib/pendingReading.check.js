import assert from 'node:assert/strict'
import {
  decodePending,
  encodePending,
  PENDING_MAX_AGE_MS,
} from './pendingReading.js'

const form = {
  name: '서진',
  gender: 'female',
  calendarType: 'solar',
  birthYear: '1999',
  birthMonth: '01',
  birthDay: '06',
  birthTime: '',
  timeUnknown: true,
}
const interpretation = '【유형】유연한실속파\n본문'

const now = 1_700_000_000_000
const raw = encodePending({ form, interpretation }, now)
const round = decodePending(raw, now)
assert.equal(round.interpretation, interpretation)
assert.equal(round.form.name, '서진')
assert.equal(round.form.timeUnknown, true)

assert.equal(decodePending(raw, now + PENDING_MAX_AGE_MS + 1), null)
assert.equal(decodePending(raw, now - 1), null)
assert.equal(decodePending(''), null)
assert.equal(decodePending('{'), null)
assert.equal(decodePending(JSON.stringify({ form, interpretation })), null)
assert.equal(
  decodePending(encodePending({ form, interpretation: '   ' }, now), now),
  null,
)

console.log('pendingReading.check ok')
