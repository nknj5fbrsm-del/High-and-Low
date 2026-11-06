#!/usr/bin/env node
/**
 * Lokaler / manueller Supabase-Keepalive-Ping.
 * Nutzt VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY aus der Umgebung oder .env.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvFile() {
  const path = resolve(process.cwd(), '.env')
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const i = trimmed.indexOf('=')
    if (i < 0) continue
    const key = trimmed.slice(0, i)
    const value = trimmed.slice(i + 1)
    if (!(key in process.env)) process.env[key] = value
  }
}

loadEnvFile()

const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!rawUrl || !key) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const base = rawUrl.replace(/\/$/, '').replace(/\/rest\/v1$/, '')
const target = `${base}/rest/v1/rooms?select=room_code&limit=1`

const maxAttempts = 5
let lastStatus = 0
let lastBody = ''

for (let i = 1; i <= maxAttempts; i++) {
  const res = await fetch(target, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      Prefer: 'count=exact',
    },
  })
  lastStatus = res.status
  lastBody = await res.text()
  console.log(`Versuch ${i}: HTTP ${lastStatus}`)
  console.log(lastBody.slice(0, 400))
  if (res.ok) {
    console.log('Keepalive ok')
    process.exit(0)
  }
  if (i < maxAttempts) {
    await new Promise((r) => setTimeout(r, i * 20_000))
  }
}

if (lastStatus === 521 || lastStatus === 546) {
  console.error('Projekt pausiert oder Origin down — im Supabase-Dashboard Resume tippen.')
} else {
  console.error(`Keepalive failed — HTTP ${lastStatus}`)
}
process.exit(1)
