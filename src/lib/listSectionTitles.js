import { parseInterpretation } from './parseInterpretation'
import { stripShareHeader } from './shareCard'

export function listSectionTitles(text) {
  return parseInterpretation(stripShareHeader(text))
    .filter((b) => b.type === 'section')
    .map((b) => b.title)
}
