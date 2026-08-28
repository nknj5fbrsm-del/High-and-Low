# High & Low: Team-Stapel

Kooperatives Higher/Lower für genau **3 Smartphones**. Ein Team, 3 Leben, eine gemeinsame Streak. Die Screens bleiben über Supabase Realtime synchron.

## Stack

Vite · React · TypeScript · Tailwind CSS · Supabase Realtime

## Setup (einmalig)

### 1. Supabase-Projekt

1. Account auf [supabase.com](https://supabase.com) anlegen (kostenloser Plan reicht).
2. Neues Projekt erstellen, Region z. B. `Frankfurt`.
3. Unter **Project Settings → API** die **Project URL** und den **anon public** Key kopieren.

### 2. Datenbank

Im Supabase-Dashboard: **SQL Editor → New query**. Den kompletten Inhalt von `supabase/schema.sql` einfügen und ausführen.

Das Skript legt an:

- Tabelle `rooms` (Spielstand, Realtime)
- Tabelle `fact_cards` (33 echte Fakt-Karten)
- RPCs: `create_room`, `join_room`, `start_game`, `submit_guess`, `restart_game`
- Row Level Security (kein öffentliches Auflisten über die App; Mutationen nur über RPCs)
- Realtime-Publication für `rooms`

Unter **Database → Replication** (bzw. Realtime) prüfen, dass die Tabelle `rooms` aktiv ist. Das SQL versucht das automatisch.

### 3. App starten

```bash
cp .env.example .env
```

In `.env` eintragen:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Dann:

```bash
npm install
npm run dev
```

Die Dev-URL (meist `http://localhost:5173`) im Browser öffnen. Für drei Handys: denselben Rechner im Netz erreichbar machen (`npm run dev -- --host`) oder die App deployen (z. B. Vercel/Netlify) und die **gleiche URL** auf allen drei Geräten öffnen.

## Spielen

1. Alle drei Personen öffnen die App (gleiches WLAN oder öffentliche URL).
2. Namen eingeben.
3. Eine Person tippt **Raum erstellen** und sagt den 4-stelligen Code an.
4. Die anderen tippen **Raum beitreten**.
5. Bei 3/3 drückt der Host **Spiel starten**.
6. Nur wer dran ist, sieht **HÖHER** / **NIEDRIGER**. Alle sehen Referenz- und Folgekarte.
7. Richtig: Streak +1, Karte wird Referenz, nächste Person.
8. Falsch: 1 Leben weg, Karte wird ersetzt, Zug geht trotzdem weiter.
9. Bei 0 Leben: Game Over. **Neues Spiel starten** setzt Streak/Leben/Karten zurück, die drei Spieler bleiben im Raum.

Refresh ist unkritisch: die Spieler-ID liegt in `localStorage`.

Ein vierter Join wird mit einer klaren Meldung abgelehnt.

## Vergleichsregeln

Karten werden immer **in derselben Einheit** verglichen (kg, Jahr, km, Stück, m). Ist eine Kategorie leer, kommt automatisch eine neue Referenz aus einer anderen Kategorie – ohne Extra-Tipp in dem Schritt. Gleichstand zählt als richtig.

## Skripte

```bash
npm run dev      # Entwicklung
npm run build    # Produktions-Build
npm test         # Unit- und UI-Tests
```

## Hinweise

- Der Raumcode ist das „Passwort“. Wer ihn kennt, kann den Raum lesen; Mutationen laufen serverseitig (RPC + Zug-Nonce), damit ein Doppel-Tipp denselben Zug nicht zweimal auflöst. Realtime braucht ein `SELECT` auf `rooms` — es gibt keine Listen-UI, aber die REST-API kann bei bekanntem Anon-Key grundsätzlich Zeilen lesen. Für einen Abend unter Freunden reicht das.
- Keine Accounts, kein Chat, kein Timer – absichtlich nicht.
