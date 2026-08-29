export function SetupScreen() {
  return (
    <div className="page-table flex min-h-dvh flex-col px-5 pt-[max(2rem,env(safe-area-inset-top))]">
      <h1 className="font-serif text-3xl font-medium text-cream">High & Low</h1>
      <p className="mt-2 text-khaki">Supabase ist noch nicht konfiguriert.</p>
      <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-cream">
        <li>Kostenloses Projekt auf supabase.com anlegen.</li>
        <li>
          <code className="text-khaki">supabase/schema.sql</code> im SQL-Editor ausführen.
        </li>
        <li>
          <code className="text-khaki">.env</code> aus <code className="text-khaki">.env.example</code> anlegen und
          URL plus anon-Key eintragen.
        </li>
        <li>
          Danach <code className="text-khaki">npm run dev</code> neu starten.
        </li>
      </ol>
      <p className="mt-8 text-sm text-khaki">Details stehen in der README.</p>
    </div>
  )
}
