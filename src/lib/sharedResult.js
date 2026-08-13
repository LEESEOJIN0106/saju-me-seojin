import { siteOrigin } from './site.js'
import { supabase } from './supabase.js'

function makeSlug() {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** 전체 해석을 공개 링크로 저장하고 slug를 반환 */
export async function createSharedResult({ name = '', interpretation }) {
  const text = String(interpretation || '').trim()
  if (!text) throw new Error('공유할 해석이 없어요')

  const slug = makeSlug()
  const { data, error } = await supabase
    .from('shared_results')
    .insert({
      slug,
      name: String(name || '').trim().slice(0, 40),
      interpretation: text.slice(0, 20000),
    })
    .select('slug')
    .single()

  if (error) throw error
  return data.slug
}

export async function fetchSharedResult(slug) {
  const clean = String(slug || '').trim()
  if (!/^[a-f0-9]{6,32}$/i.test(clean)) return null

  const { data, error } = await supabase
    .from('shared_results')
    .select('slug, name, interpretation, created_at')
    .eq('slug', clean)
    .maybeSingle()

  if (error) throw error
  return data
}

export function buildResultUrl(slug) {
  return `${siteOrigin()}/result?s=${encodeURIComponent(slug)}`
}
