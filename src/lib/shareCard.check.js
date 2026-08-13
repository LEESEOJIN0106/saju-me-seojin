import assert from 'node:assert/strict'
import {
  buildShareText,
  parseCardSearch,
  parseShareMeta,
  stripShareHeader,
  toCardSearch,
} from './shareCard.js'

const sample = `【유형】겉바속촉형
【한줄】차갑게 보여도 속은 오래 데운 차
【키워드】단단함, 온기, 고집
【케미】잔잔한 물형이랑 케미 터져요

본문 해석이 여기에 온다.`

const meta = parseShareMeta(sample, '서진')
assert.equal(meta.type, '겉바속촉형')
assert.equal(meta.chemistry, '잔잔한 물형이랑 케미 터져요')
assert.deepEqual(meta.keywords, ['단단함', '온기', '고집'])
assert.equal(stripShareHeader(sample).startsWith('본문'), true)
assert.equal(stripShareHeader(sample).includes('【케미】'), false)

const qs = toCardSearch(meta)
const round = parseCardSearch(`?${qs}`)
assert.equal(round.type, meta.type)
assert.equal(round.oneliner, meta.oneliner)
assert.equal(round.chemistry, meta.chemistry)
assert.equal(round.name, '서진')
assert.equal(parseCardSearch(''), null)

const text = buildShareText(meta, 'https://example.com/?t=겉바속촉형')
assert.match(text, /겉바속촉형/)
assert.match(text, /전체 결과 보기/)
assert.match(text, /https:\/\/example.com/)

console.log('shareCard.check ok')
