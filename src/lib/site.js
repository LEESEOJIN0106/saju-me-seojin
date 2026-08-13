export const SITE_FALLBACK = 'https://saju-me-seojin.vercel.app'

export function siteOrigin() {
  if (typeof window === 'undefined' || !window.location?.origin) {
    return SITE_FALLBACK
  }
  return window.location.origin
}
