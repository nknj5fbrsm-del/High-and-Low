# High & Low

Karten auf dem Tisch. Eine Richtung. Eine Serie. **Allein** oder **2–6** am selben Tisch. Erwachsene (3 Leben) oder Kinder (5 Leben). Dichte: **Locker**, **Knackig**, **Haarscharf**.

Jede Runde ist ein neues Paar. Die rechte Karte wird nicht die nächste linke. Die Kategorie wechselt jedes Mal.

## Nach diesem Update (für Nils)

Keine neuen Environment-Variablen.

1. Im Supabase-Dashboard: **SQL Editor → New query**. Den kompletten Inhalt von `supabase/schema.sql` einfügen und ausführen (die ganze Datei, ja). **Zuerst die Datenbank.**
2. Diesen Pull Request mergen. Vercel deployt automatisch.
3. Offene Räume neu erstellen.

Das SQL braucht einen neuen Lauf: Dichte (`selected_density`), Deal ohne Wertkette, Geburtsjahre statt Elektronik-Preisen.

## Setup (einmalig, neues Projekt)

1. Projekt auf [supabase.com](https://supabase.com) anlegen.
2. `supabase/schema.sql` im SQL-Editor ausführen.
3. `.env` aus `.env.example`: `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY`.
4. `npm install` und `npm run dev`.

Realtime: Tabelle `rooms` muss in der Publication sein (das SQL versucht das selbst).

## Spielen

**Allein:** Name, Dichte (Locker / Knackig / Haarscharf), dann **Erwachsene** oder **Kinder**. Sofort liegt die erste Karte, die zweite bleibt zu. Ziel ist die Serie / der Rekord. Leben sind nur Puffer. Am Ende: *Rekord: 14. Nochmal.*

**Zu mehreren:** Host wählt 2–6, erstellt den Raum, legt die Dichte fest. Die anderen treten bei und stimmen über den Stapel ab. Host startet, wenn der Tisch voll ist.

Nur wer dran ist, sieht die Tabs (SCHWERER/LEICHTER, SPÄTER/FRÜHER, …).

## Skripte

```bash
npm run dev
npm run build
npm test
```

## Hinweise

- Raumcode ist das Passwort zum Tisch. Keine Accounts, kein Chat, kein Timer.
- Ein vierter (bzw. überzähliger) Join wird abgelehnt.
