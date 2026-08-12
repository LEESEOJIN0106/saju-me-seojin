// ponytail: smoke-check only — full browser OAuth still needs a human click
const url =
  process.env.VITE_SUPABASE_URL ??
  'https://buplarljcsewnuuonqjd.supabase.co'

const res = await fetch(`${url}/auth/v1/authorize?provider=google`, {
  redirect: 'manual',
})

const location = res.headers.get('location') ?? ''
const ok =
  res.status === 302 &&
  location.includes('accounts.google.com') &&
  location.includes('client_id=')

if (!ok) {
  console.error('Google OAuth not wired:', res.status, location)
  process.exit(1)
}

console.log('ok: Google OAuth authorize redirects to Google')
