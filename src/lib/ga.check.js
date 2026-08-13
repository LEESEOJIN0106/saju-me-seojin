import assert from 'node:assert/strict'
import { trackEvent } from './ga.js'

trackEvent('login')

const calls = []
globalThis.window = {
  gtag(...args) {
    calls.push(args)
  },
}

trackEvent('login', { method: 'google', source: 'guest_bar' })
assert.deepEqual(calls, [
  ['event', 'login', { method: 'google', source: 'guest_bar' }],
])

globalThis.window = {}
trackEvent('interpret')

console.log('ga.check ok')
