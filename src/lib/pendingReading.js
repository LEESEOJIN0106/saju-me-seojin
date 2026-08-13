/** OAuth 리다이렉트 동안 게스트 결과를 붙잡아 둔다. */

const KEY = 'saju:pending-reading'
export const PENDING_MAX_AGE_MS = 2 * 60 * 60 * 1000

export function encodePending({ form, interpretation }, now = Date.now()) {
  return JSON.stringify({ form, interpretation, at: now })
}

export function decodePending(raw, now = Date.now(), maxAgeMs = PENDING_MAX_AGE_MS) {
  if (!raw || typeof raw !== 'string') return null
  try {
    const data = JSON.parse(raw)
    if (!data || typeof data.interpretation !== 'string' || !data.interpretation.trim()) {
      return null
    }
    if (!data.form || typeof data.form !== 'object') return null
    if (typeof data.at !== 'number' || now - data.at > maxAgeMs || now < data.at) {
      return null
    }
    return { form: data.form, interpretation: data.interpretation }
  } catch {
    return null
  }
}

export function writePending(payload) {
  try {
    sessionStorage.setItem(KEY, encodePending(payload))
  } catch {
    /* private mode / quota — 로그인 후 결과는 다시 읽으면 됨 */
  }
}

export function readPending() {
  try {
    return decodePending(sessionStorage.getItem(KEY))
  } catch {
    return null
  }
}

export function clearPending() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
