import assert from 'node:assert/strict'
import { SITE_FALLBACK } from './site.js'

const slug = 'abc123def456'
const url = `${SITE_FALLBACK}/result?s=${encodeURIComponent(slug)}`
assert.equal(url, 'https://saju-me-seojin.vercel.app/result?s=abc123def456')
assert.match(url, /\/result\?s=[a-f0-9]+$/i)

console.log('sharedResult.check ok')
