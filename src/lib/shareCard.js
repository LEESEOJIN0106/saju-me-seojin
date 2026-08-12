const QUOTE_RE = /[''""]([^''""]+)[''""]/g

function extractQuoted(text) {
  const keywords = []
  for (const match of text.matchAll(QUOTE_RE)) {
    if (match[1]?.trim()) keywords.push(match[1].trim())
  }
  return keywords
}

function lineValue(text, label) {
  const match = text.match(new RegExp(`【${label}】\\s*(.+)`))
  return match?.[1]?.trim() || ''
}

/** 해석 본문에서 공유 카드용 메타를 뽑는다. */
export function parseShareMeta(text, name = '') {
  const type = lineValue(text, '유형')
  const oneliner = lineValue(text, '한줄')
  const keywordsRaw = lineValue(text, '키워드')
  let keywords = keywordsRaw
    ? keywordsRaw
        .split(/[,，、]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5)
    : []

  if (keywords.length < 2) {
    keywords = extractQuoted(text).slice(0, 3)
  }

  return {
    name: name?.trim() || '나',
    type: type || '나만의 사주형',
    oneliner: oneliner || '사주 명식에서 읽은 오늘의 한 줄.',
    keywords,
  }
}

/** 【유형】【한줄】【키워드】 헤더를 본문에서 제거 */
export function stripShareHeader(text) {
  return text
    .replace(/【유형】.+/g, '')
    .replace(/【한줄】.+/g, '')
    .replace(/【키워드】.+/g, '')
    .replace(/^\s*\n+/g, '')
    .trim()
}

export function buildShareText(meta) {
  const tags = meta.keywords.length
    ? `\n${meta.keywords.map((k) => `#${k.replace(/\s+/g, '')}`).join(' ')}`
    : ''
  return `${meta.name}의 사주 유형은 「${meta.type}」
${meta.oneliner}${tags}

✦ 사주 미에서 읽어보세요`
}

/** Web Share → 클립보드 순으로 공유 */
export async function shareReading(meta) {
  const text = buildShareText(meta)
  if (typeof navigator !== 'undefined' && navigator.share) {
    await navigator.share({ title: '사주 미', text })
    return 'shared'
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return 'copied'
  }
  throw new Error('이 환경에서는 공유를 지원하지 않습니다.')
}
