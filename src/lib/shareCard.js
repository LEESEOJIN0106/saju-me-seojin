import { siteOrigin } from './site.js'

const QUOTE_RE = /[''""]([^''""]+)[''""]/g

const CARD_PALETTES = [
  { id: 'sky', from: '#7eb6e8', to: '#5b9fd4', gold: '#fff8f4', han: '水' },
  { id: 'blush', from: '#f08aa3', to: '#e06b88', gold: '#ffc2d1', han: '心' },
  { id: 'ice', from: '#a8d4f5', to: '#6ea8d8', gold: '#eaf5fc', han: '運' },
  { id: 'cream', from: '#d4a574', to: '#b88758', gold: '#fff8f4', han: '土' },
  { id: 'fog', from: '#9bb0c7', to: '#7a8fa8', gold: '#f3f6fa', han: '命' },
]

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

export function cardPalette(type = '') {
  let h = 0
  for (const ch of type) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return CARD_PALETTES[h % CARD_PALETTES.length]
}

/** 해석 본문에서 공유 카드용 메타를 뽑는다. */
export function parseShareMeta(text, name = '') {
  const type = lineValue(text, '유형')
  const oneliner = lineValue(text, '한줄')
  const chemistry = lineValue(text, '케미')
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
    chemistry,
    keywords,
  }
}

/** 【유형】【한줄】【키워드】【케미】 헤더를 본문에서 제거 */
export function stripShareHeader(text) {
  return text
    .replace(/【유형】.+/g, '')
    .replace(/【한줄】.+/g, '')
    .replace(/【키워드】.+/g, '')
    .replace(/【케미】.+/g, '')
    .replace(/^\s*\n+/g, '')
    .trim()
}

export function toCardSearch(meta) {
  const p = new URLSearchParams()
  p.set('t', meta.type)
  p.set('l', meta.oneliner)
  if (meta.name && meta.name !== '나') p.set('n', meta.name)
  if (meta.chemistry) p.set('c', meta.chemistry)
  if (meta.keywords?.length) p.set('k', meta.keywords.join(','))
  return p.toString()
}

export function parseCardSearch(search) {
  const raw = String(search || '')
  const p = new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : raw)
  const type = (p.get('t') || '').trim().slice(0, 20)
  if (!type) return null
  return {
    name: (p.get('n') || '친구').trim().slice(0, 20),
    type,
    oneliner: (p.get('l') || '').trim().slice(0, 80),
    chemistry: (p.get('c') || '').trim().slice(0, 48),
    keywords: (p.get('k') || '')
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 5),
  }
}

export function buildShareUrl(meta, { resultSlug } = {}) {
  if (resultSlug) {
    return `${siteOrigin()}/result?s=${encodeURIComponent(resultSlug)}`
  }
  return `${siteOrigin()}/?${toCardSearch(meta)}`
}

export function buildShareText(meta, url = buildShareUrl(meta)) {
  const tags = meta.keywords.length
    ? `\n${meta.keywords.map((k) => `#${k.replace(/\s+/g, '')}`).join(' ')}`
    : ''
  const chem = meta.chemistry ? `\n케미 · ${meta.chemistry}` : ''
  return `물개가 읽어 본 ${meta.name}의 유형은 「${meta.type}」
${meta.oneliner}${chem}${tags}

✦ 전체 결과 보기 ${url}`
}

export function syncCardUrl(meta) {
  if (typeof window === 'undefined' || !meta?.type) return
  // Don't overwrite a public /result share URL
  if (window.location.pathname.replace(/\/+$/, '') === '/result') return
  const next = `${window.location.pathname}?${toCardSearch(meta)}`
  if (`${window.location.pathname}${window.location.search}` === next) return
  history.replaceState(null, '', next)
}

function wrapByWidth(ctx, text, maxWidth) {
  const chars = [...text]
  const lines = []
  let line = ''
  for (const ch of chars) {
    const next = line + ch
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line)
      line = ch
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

async function waitFonts() {
  if (typeof document === 'undefined' || !document.fonts?.ready) return
  await Promise.race([
    document.fonts.ready,
    new Promise((resolve) => setTimeout(resolve, 1500)),
  ])
}

/** 스토리용 4:5 PNG. 의존성 없이 canvas로 그림. */
export async function renderSharePng(meta) {
  await waitFonts()
  const pal = cardPalette(meta.type)
  const w = 1080
  const h = 1350
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('이미지를 만들지 못했어요')

  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, pal.from)
  grad.addColorStop(1, pal.to)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  const glow = ctx.createRadialGradient(320, 280, 20, 320, 280, 520)
  glow.addColorStop(0, 'rgba(200, 169, 107, 0.28)')
  glow.addColorStop(1, 'rgba(200, 169, 107, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.font = '700 520px Cafe24Surround, Paperlogy, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(pal.han, w - 40, 620)

  ctx.textAlign = 'left'
  ctx.fillStyle = pal.gold
  ctx.font = '700 28px Paperlogy, Paperlogy, sans-serif'
  ctx.fillText('나의 사주 유형', 88, 140)

  ctx.fillStyle = '#fff'
  ctx.font = '400 92px Cafe24Surround, Paperlogy, sans-serif'
  const typeLines = wrapByWidth(ctx, `「${meta.type}」`, w - 176)
  let y = 250
  for (const line of typeLines.slice(0, 2)) {
    ctx.fillText(line, 88, y)
    y += 108
  }

  ctx.fillStyle = 'rgba(248, 244, 234, 0.9)'
  ctx.font = '500 40px Paperlogy, Paperlogy, sans-serif'
  const oneLines = wrapByWidth(ctx, meta.oneliner, w - 176)
  y += 24
  for (const line of oneLines.slice(0, 3)) {
    ctx.fillText(line, 88, y)
    y += 56
  }

  if (meta.chemistry) {
    y += 28
    ctx.fillStyle = pal.gold
    ctx.font = '600 32px Paperlogy, sans-serif'
    ctx.fillText(`케미 · ${meta.chemistry}`, 88, y)
    y += 20
  }

  y += 48
    ctx.font = '600 28px Paperlogy, Paperlogy, sans-serif'
  let tagX = 88
  for (const kw of meta.keywords.slice(0, 4)) {
    const label = `#${kw.replace(/\s+/g, '')}`
    const tw = ctx.measureText(label).width
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.beginPath()
    if (typeof ctx.roundRect === 'function') ctx.roundRect(tagX, y - 34, tw + 36, 52, 10)
    else ctx.rect(tagX, y - 34, tw + 36, 52)
    ctx.fill()
    ctx.fillStyle = '#f4f1f7'
    ctx.fillText(label, tagX + 18, y)
    tagX += tw + 52
    if (tagX > w - 200) break
  }

  ctx.fillStyle = 'rgba(255,255,255,0.14)'
  ctx.fillRect(88, h - 168, w - 176, 1)

  ctx.fillStyle = 'rgba(244, 241, 247, 0.78)'
  ctx.font = '600 32px Paperlogy, sans-serif'
  ctx.fillText(meta.name, 88, h - 108)

  ctx.fillStyle = pal.gold
  ctx.font = '700 30px Paperlogy, sans-serif'
  ctx.fillText('사주 미  ·  너는 무슨 형이야?', 88, h - 64)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('이미지를 만들지 못했어요'))),
      'image/png',
    )
  })
}

export async function downloadShareImage(meta) {
  const blob = await renderSharePng(meta)
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = `사주미-${meta.type}.png`
  a.click()
  URL.revokeObjectURL(href)
}

/** Web Share(이미지+링크) → 클립보드 순. resultSlug면 /result 공개 페이지로 공유 */
export async function shareReading(meta, { resultSlug } = {}) {
  const url = buildShareUrl(meta, { resultSlug })
  const text = buildShareText(meta, url)
  const title = `${meta.type} · 사주 미`

  let file
  try {
    const blob = await renderSharePng(meta)
    file = new File([blob], `사주미-${meta.type}.png`, { type: 'image/png' })
  } catch {
    file = null
  }

  if (typeof navigator !== 'undefined' && navigator.share) {
    const payload = { title, text, url }
    if (file && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ ...payload, files: [file] })
      return 'shared'
    }
    await navigator.share(payload)
    return 'shared'
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return 'copied'
  }
  throw new Error('이 환경에서는 공유를 지원하지 않습니다.')
}

