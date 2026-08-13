/** 관심 분야 점프용 — 섹션 제목과 매칭 */
export const RESULT_TOPICS = [
  { id: 'trait', label: '성격', match: /성격|기질|성향/ },
  { id: 'relation', label: '관계', match: /관계|소통|인간/ },
  { id: 'work', label: '일·재능', match: /일|재능|직업|일터/ },
  { id: 'money', label: '재물', match: /재물|금전|돈/ },
]

export function matchTopic(sectionTitle, topic) {
  return topic.match.test(sectionTitle)
}

export function softenSubLabel(label) {
  if (/긍정|강점/.test(label)) return '물개가 보면 이런 점이 좋아요'
  if (/부정|약점|조심/.test(label)) return '여기만 조심하면 좋아요'
  return label
}

export function friendlyError(err) {
  const raw = err instanceof Error ? err.message : String(err ?? '')
  if (/로그인|auth|JWT|session/i.test(raw)) {
    return '로그인이 필요해요. Google로 로그인하고 다시 와 주세요.'
  }
  if (/Gemini|API|key|키/i.test(raw)) {
    return '앗, 해석을 못 가져왔어요. 잠시 뒤 다시 눌러 주세요.'
  }
  if (/network|fetch|Failed to fetch|NetworkError/i.test(raw)) {
    return '연결이 출렁거려요. 네트워크 보고 다시 시도해 주세요.'
  }
  if (raw.length > 0 && raw.length < 80 && !/stack|undefined|null/i.test(raw)) {
    return raw
  }
  return '해석을 못 불러왔어요. 잠시 뒤 다시 시도해 주세요.'
}
