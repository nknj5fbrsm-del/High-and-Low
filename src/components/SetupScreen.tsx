export function SetupScreen() {
  return (
    <div className="flex min-h-dvh flex-col px-5 pt-[max(2rem,env(safe-area-inset-top))]">
      <h1 className="font-display text-3xl font-extrabold text-white">High & Low</h1>
      <p className="mt-2 text-zinc-400">Supabase ist noch nicht konfiguriert.</p>
      <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-zinc-300">
        <li>Kostenloses Projekt auf supabase.com anlegen.</li>
        <li>
          <code className="text-lime-300">supabase/schema.sql</code> im SQL-Editor ausführen.
        </li>
        <li>
          <code className="text-lime-300">.env</code> aus <code className="text-lime-300">.env.example</code>{' '}
          anlegen und URL plus anon-Key eintragen.
        </li>
        <li>
          Danach <code className="text-lime-300">npm run dev</code> neu starten.
        </li>
      </ol>
      <p className="mt-8 text-sm text-zinc-500">Details stehen in der README.</p>
    </div>
  )
}
