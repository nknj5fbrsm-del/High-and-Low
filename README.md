# High & Low: Team-Stapel

Kooperatives Higher/Lower für **2–6 Smartphones**. Ein Team, gemeinsame Leben, eine Streak. Screens laufen über Supabase Realtime synchron.

Zwei Modi: **Erwachsene** (härtere Fakten, 3 Leben) und **Kinder** (leichterer Stapel, 5 Leben). In der Lobby stimmt jede Person ab; der Host startet, sobald die gewählte Spielerzahl da ist.

## Nach einem Update (für Nils)

Keine neuen Environment-Variablen. Die alten `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` bleiben.

1. Diesen Pull Request mergen. Vercel deployt automatisch.
2. Im Supabase-Dashboard: **SQL Editor → New query**. Den kompletten Inhalt von `supabase/schema.sql` einfügen und ausführen (ja, die ganze Datei nochmal — das Skript ist dafür gebaut).
3. Offene Räume danach neu starten bzw. neu erstellen. Alte Partien kennen die neuen Karten/Modi nicht zuverlässig.

Das SQL legt bzw. aktualisiert:

- Tabelle `rooms` (u. a. `max_players`, `votes`, `selected_mode`)
- Tabelle `fact_cards` (Erwachsene- und Kinder-Stapel, überschreibt die Karten)
- RPCs: `create_room`, `join_room`, `vote_mode`, `start_game`, `submit_guess`, `restart_game`
- Row Level Security und Realtime für `rooms`

## Setup (einmalig, neues Projekt)

### 1. Supabase-Projekt

1. Account auf [supabase.com](https://supabase.com) anlegen (kostenloser Plan reicht).
2. Neues Projekt erstellen, Region z. B. `Frankfurt`.
3. Unter **Project Settings → API** die **Project URL** und den **anon public** Key kopieren.

### 2. Datenbank

Im Supabase-Dashboard: **SQL Editor → New query**. Den kompletten Inhalt von `supabase/schema.sql` einfügen und ausführen.

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

Die Dev-URL (meist `http://localhost:5173`) im Browser öffnen. Für mehrere Handys: denselben Rechner im Netz erreichbar machen (`npm run dev -- --host`) oder die App deployen (z. B. Vercel) und die **gleiche URL** auf allen Geräten öffnen.

## Spielen

1. Alle öffnen die App (gleiches WLAN oder öffentliche URL).
2. Namen eingeben. Der Host wählt **2–6 Spieler** und tippt **Raum erstellen**.
3. Die anderen tippen den 4-stelligen Code und **Raum beitreten**. Ein voller Raum wird abgelehnt.
4. Jede Person tippt **Erwachsene** oder **Kinder**. Die Stimmen stehen in der Lobby.
5. Bei n/n startet der Host. Bei Gleichstand gilt die Stimme des Hosts.
6. Nur wer dran ist, sieht die Vergleichs-Buttons — je nach Karte z. B. SCHWERER/LEICHTER oder TEURER/BILLIGER. Alle sehen Referenz- und Folgekarte.
7. Richtig: Streak +1, kurzer Punkte-Pop, bei längerer Streak Combo. Die Karte wird Referenz, nächste Person.
8. Falsch: 1 Leben weg, kein Reward, Karte wird ersetzt, Zug geht trotzdem weiter.
9. Bei 0 Leben: Game Over inkl. Streak-Titel. **Neues Spiel starten** behält denselben Modus und die Spieler im Raum.

Refresh ist unkritisch: die Spieler-ID liegt in `localStorage`.

## Vergleichsregeln

Karten werden immer **auf derselben Achse** verglichen (Gewicht, Preis, Höhe, Distanz, Jahr, Tempo, Temperatur, Anzahl). Ist eine Achse leer, kommt automatisch eine neue Referenz aus einer anderen — ohne Extra-Tipp in dem Schritt. Gleichstand zählt als richtig.

## Skripte

```bash
npm run dev      # Entwicklung
npm run build    # Produktions-Build
npm test         # Unit- und UI-Tests
```

## Hinweise

- Der Raumcode ist das „Passwort“. Wer ihn kennt, kann den Raum lesen; Mutationen laufen serverseitig (RPC + Zug-Nonce), damit ein Doppel-Tipp denselben Zug nicht zweimal auflöst. Realtime braucht ein `SELECT` auf `rooms` — es gibt keine Listen-UI, aber die REST-API kann bei bekanntem Anon-Key grundsätzlich Zeilen lesen. Für einen Abend unter Freunden reicht das.
- Keine Accounts, kein Chat, kein Timer, kein Shop — absichtlich nicht.
