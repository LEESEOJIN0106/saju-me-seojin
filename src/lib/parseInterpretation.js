const SECTION_RE =
  /^(\d+)\.\s*(.+?)(?:\s*:\s*(?:[''""](.+?)[''""]|(.+)))?$/
const SPECIAL_RE = /^([①-⑳⓿])\s*(.+)$/
const SUBITEM_RE = /^([\uAC00-\uD7A3A-Za-z\s·]+?):\s*(.+)$/
const QUOTE_RE = /[''""]([^''""]+)[''""]/g

function cleanInterpretationLines(text) {
  return text
    .replace(/\\n/g, '\n')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line && !/^(-{3,}|\*{3,}|_{3,}|={3,})$/.test(line))
    .map((line) =>
      line
        .replace(/^#{1,6}\s*/, '')
        .replace(/^>\s*/, '')
        .replace(/^([*•·-])\s+/, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/__(.+?)__/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .trim(),
    )
    .filter(Boolean)
}

function extractKeywords(text) {
  const keywords = []
  for (const match of text.matchAll(QUOTE_RE)) {
    if (match[1]?.trim()) keywords.push(match[1].trim())
  }
  return keywords
}

function isClosingBlock(line) {
  return (
    /[?？]$/.test(line) ||
    line.includes('무엇입니까') ||
    /사주\s*판이\s*펼쳐/.test(line) ||
    /가장\s*궁금하고\s*해결하고\s*싶은/.test(line) ||
    (/궁금/.test(line) && /진로|재물|인간관계/.test(line))
  )
}

/** Gemini 해석 텍스트를 UI 블록 트리로 변환 */
export function parseInterpretation(text) {
  const lines = cleanInterpretationLines(text)
  const blocks = []
  let currentSection = null
  let afterSummary = false

  const flushSection = () => {
    if (currentSection) {
      blocks.push(currentSection)
      currentSection = null
    }
  }

  for (const line of lines) {
    if (/^종합\s*의견/.test(line)) {
      flushSection()
      afterSummary = true
      blocks.push({ type: 'summary-header' })
      continue
    }

    if (isClosingBlock(line)) {
      flushSection()
      continue
    }

    const sectionMatch = line.match(SECTION_RE)
    if (sectionMatch && sectionMatch[2].length > 3 && !afterSummary) {
      flushSection()
      currentSection = {
        type: 'section',
        number: sectionMatch[1],
        title: sectionMatch[2].trim(),
        tagline: (sectionMatch[3] || sectionMatch[4] || '').trim(),
        items: [],
      }
      continue
    }

    const specialMatch = line.match(SPECIAL_RE)
    if (specialMatch) {
      const item = {
        type: 'special',
        marker: specialMatch[1],
        title: specialMatch[2],
        body: [],
      }
      if (currentSection) currentSection.items.push(item)
      else blocks.push(item)
      continue
    }

    const subMatch = line.match(SUBITEM_RE)
    if (subMatch && subMatch[1].length <= 14 && !/^\d/.test(subMatch[1])) {
      const item = {
        type: 'subitem',
        label: subMatch[1].trim(),
        content: subMatch[2].trim(),
      }
      if (currentSection) {
        const last = currentSection.items.at(-1)
        if (last?.type === 'special') last.body.push(item)
        else currentSection.items.push(item)
      } else blocks.push(item)
      continue
    }

    const para = { type: 'paragraph', content: line }

    if (currentSection) {
      const last = currentSection.items.at(-1)
      if (last?.type === 'special') last.body.push(para)
      else currentSection.items.push(para)
    } else if (blocks.length === 0) {
      blocks.push({ type: 'intro', content: line })
    } else if (blocks.length === 1 && blocks[0].type === 'intro') {
      const keywords = extractKeywords(line)
      if (keywords.length >= 2) {
        blocks.push({ type: 'keywords', content: line, keywords })
        continue
      }
      blocks.push(para)
    } else {
      blocks.push(para)
    }
  }

  flushSection()
  return blocks
}
