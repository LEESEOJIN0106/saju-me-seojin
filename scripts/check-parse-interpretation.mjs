import assert from 'node:assert/strict'
import { parseInterpretation } from '../src/lib/parseInterpretation.js'

const blocks = parseInterpretation(`도입 문장입니다.
'키워드일'과 '키워드이'가 보입니다.
1. 성격과 기질 : '단단한 흐름'
긍정: 집중력이 있습니다.
부정: 고집이 셀 수 있습니다.
종합 의견
마무리 한 줄입니다.`)

assert.equal(blocks[0]?.type, 'intro')
assert.equal(blocks[1]?.type, 'keywords')
assert.equal(blocks[1]?.keywords.length, 2)
assert.equal(blocks[2]?.type, 'section')
assert.equal(blocks[2]?.title, '성격과 기질')
assert.ok(blocks.some((b) => b.type === 'summary-header'))

console.log('ok: parseInterpretation')
