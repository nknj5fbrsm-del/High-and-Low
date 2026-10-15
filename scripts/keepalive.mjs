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

const res = await fetch(target, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
  },
})

const body = await res.text()
console.log(`HTTP ${res.status}`)
console.log(body.slice(0, 400))
if (!res.ok) process.exit(1)
console.log('Keepalive ok')
