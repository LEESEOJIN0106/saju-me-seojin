import { formToRow, USER_COLUMNS } from './profile.js'
import { formToReadingRow, READING_COLUMNS } from './readings.js'
import { supabase } from './supabase.js'

export async function fetchProfile(userId) {
  const { data: profile, error } = await supabase
    .from('users')
    .select(USER_COLUMNS)
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return profile
}

export async function upsertProfile(userId, form) {
  const { data: profile, error } = await supabase
    .from('users')
    .upsert(formToRow(userId, form))
    .select(USER_COLUMNS)
    .single()
  if (error) throw error
  return profile
}

export async function fetchReadings(userId) {
  const { data: readings, error } = await supabase
    .from('saju_readings')
    .select(READING_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return readings ?? []
}

export async function saveReading(
  userId,
  form,
  interpretation,
  readingId = null,
) {
  const row = formToReadingRow(userId, form, interpretation)
  const query = readingId
    ? supabase.from('saju_readings').update(row).eq('id', readingId)
    : supabase.from('saju_readings').insert(row)
  const { data: savedReading, error } = await query
    .select(READING_COLUMNS)
    .single()
  if (error) throw error
  return savedReading
}

export async function deleteReading(readingId) {
  const { error } = await supabase
    .from('saju_readings')
    .delete()
    .eq('id', readingId)
  if (error) throw error
}
