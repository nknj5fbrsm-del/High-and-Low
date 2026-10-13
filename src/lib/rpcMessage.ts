/** Maps Supabase/PostgREST errors to short German UI copy. */
export function rpcMessage(error: { message: string }): string {
  const message = error.message.replace(/^.*ERROR:\s*/i, '').trim()
  const lower = message.toLowerCase()
  if (
    lower.includes('fetch') ||
    lower.includes('network') ||
    lower.includes('load failed') ||
    lower.includes('failed to load')
  ) {
    return 'Keine Verbindung zur Datenbank. Oft ist Supabase pausiert — im Dashboard auf „Resume project“ tippen.'
  }
  return message || 'Etwas ist schiefgelaufen.'
}
