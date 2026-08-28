-- High & Low: Team-Stapel
-- Einmal im Supabase SQL-Editor ausführen (idempotent).

DROP FUNCTION IF EXISTS submit_guess(text, text, text, integer);
DROP FUNCTION IF EXISTS restart_game(text, text);
DROP FUNCTION IF EXISTS start_game(text, text);
DROP FUNCTION IF EXISTS join_room(text, text, text);
DROP FUNCTION IF EXISTS create_room(text, text);
DROP FUNCTION IF EXISTS deal_after_reference(jsonb, jsonb, jsonb);
DROP FUNCTION IF EXISTS deal_opening_pair(jsonb);
DROP FUNCTION IF EXISTS can_form_opening_pair(jsonb);
DROP FUNCTION IF EXISTS used_card_ids(jsonb, jsonb);
DROP FUNCTION IF EXISTS remove_card_id(jsonb, text);
DROP FUNCTION IF EXISTS pick_from_unit(jsonb, text);
DROP FUNCTION IF EXISTS load_catalog();
DROP FUNCTION IF EXISTS set_rooms_updated_at();
DROP TYPE IF EXISTS deal_result CASCADE;

CREATE TABLE IF NOT EXISTS fact_cards (
  id text PRIMARY KEY,
  title text NOT NULL,
  value double precision NOT NULL,
  unit text NOT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
  room_code text PRIMARY KEY CHECK (room_code ~ '^[A-Z]{4}$'),
  players jsonb NOT NULL DEFAULT '[]'::jsonb,
  host_id text,
  current_player_index integer NOT NULL DEFAULT 0,
  lives integer NOT NULL DEFAULT 3,
  streak integer NOT NULL DEFAULT 0,
  current_card jsonb,
  next_card jsonb,
  remaining_cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  used_card_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  game_status text NOT NULL DEFAULT 'lobby'
    CHECK (game_status IN ('lobby', 'playing', 'game_over')),
  last_result jsonb,
  turn_nonce integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS players jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS host_id text;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS current_player_index integer NOT NULL DEFAULT 0;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS lives integer NOT NULL DEFAULT 3;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS streak integer NOT NULL DEFAULT 0;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS current_card jsonb;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS next_card jsonb;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS remaining_cards jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS used_card_ids jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS game_status text NOT NULL DEFAULT 'lobby';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS last_result jsonb;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS turn_nonce integer NOT NULL DEFAULT 0;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

TRUNCATE fact_cards;

INSERT INTO fact_cards (id, title, value, unit) VALUES
  ('vw-golf', 'Gewicht VW Golf', 1300, 'kg'),
  ('nilpferd', 'Gewicht Nilpferd', 1500, 'kg'),
  ('elefant', 'Gewicht Afrikanischer Elefant', 6000, 'kg'),
  ('smart-fortwo', 'Gewicht Smart Fortwo', 890, 'kg'),
  ('blauwal', 'Gewicht Blauwal', 140000, 'kg'),
  ('a380', 'Gewicht Airbus A380 (leer)', 277000, 'kg'),
  ('mensch', 'Gewicht Durchschnittsmensch (DE)', 77, 'kg'),
  ('koelner-dom-jahr', 'Fertigstellung Kölner Dom', 1880, 'Jahr'),
  ('eiffelturm-jahr', 'Baujahr Eiffelturm', 1889, 'Jahr'),
  ('brandenburger-tor', 'Baujahr Brandenburger Tor', 1791, 'Jahr'),
  ('mauerfall', 'Fall der Berliner Mauer', 1989, 'Jahr'),
  ('mondlandung', 'Erste Mondlandung', 1969, 'Jahr'),
  ('grundgesetz', 'Grundgesetz der Bundesrepublik', 1949, 'Jahr'),
  ('wm-2006', 'FIFA-WM in Deutschland', 2006, 'Jahr'),
  ('berlin-muenchen', 'Entfernung Berlin–München (Straße)', 585, 'km'),
  ('rhein', 'Länge des Rheins', 1233, 'km'),
  ('hamburg-koeln', 'Entfernung Hamburg–Köln (Straße)', 430, 'km'),
  ('aequator', 'Umfang des Äquators', 40075, 'km'),
  ('erde-mond', 'Abstand Erde–Mond (mittel)', 384400, 'km'),
  ('a7', 'Länge der Autobahn A7', 962, 'km'),
  ('einwohner-de', 'Einwohner Deutschland (ca. 2024)', 84700000, 'Stück'),
  ('einwohner-berlin', 'Einwohner Berlin', 3750000, 'Stück'),
  ('zaehne', 'Zähne eines Erwachsenen', 32, 'Stück'),
  ('bundeslaender', 'Bundesländer in Deutschland', 16, 'Stück'),
  ('planeten', 'Planeten im Sonnensystem', 8, 'Stück'),
  ('un-staaten', 'UN-Mitgliedstaaten', 193, 'Stück'),
  ('klavier', 'Tasten eines Klaviers', 88, 'Stück'),
  ('eiffelturm-hoehe', 'Höhe des Eiffelturms', 330, 'm'),
  ('koelner-dom-hoehe', 'Höhe des Kölner Doms', 157, 'm'),
  ('zugspitze', 'Höhe der Zugspitze', 2962, 'm'),
  ('fernsehturm', 'Höhe Berliner Fernsehturm', 368, 'm'),
  ('everest', 'Höhe des Mount Everest', 8849, 'm'),
  ('freiheitsstatue', 'Höhe der Freiheitsstatue', 93, 'm');

CREATE TYPE deal_result AS (
  current_card jsonb,
  next_card jsonb,
  remaining jsonb
);

CREATE OR REPLACE FUNCTION set_rooms_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rooms_updated_at ON rooms;
CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE PROCEDURE set_rooms_updated_at();

CREATE OR REPLACE FUNCTION load_catalog()
RETURNS jsonb
LANGUAGE sql
VOLATILE
AS $$
  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'title', title,
        'value', value,
        'unit', unit
      )
      ORDER BY random()
    ),
    '[]'::jsonb
  )
  FROM fact_cards;
$$;

CREATE OR REPLACE FUNCTION pick_from_unit(p_cards jsonb, p_unit text)
RETURNS jsonb
LANGUAGE sql
VOLATILE
AS $$
  SELECT elem
  FROM jsonb_array_elements(coalesce(p_cards, '[]'::jsonb)) elem
  WHERE elem->>'unit' = p_unit
  ORDER BY random()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION remove_card_id(p_cards jsonb, p_id text)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(jsonb_agg(elem), '[]'::jsonb)
  FROM jsonb_array_elements(coalesce(p_cards, '[]'::jsonb)) elem
  WHERE elem->>'id' IS DISTINCT FROM p_id;
$$;

CREATE OR REPLACE FUNCTION used_card_ids(p_catalog jsonb, p_remaining jsonb)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(jsonb_agg(elem->>'id'), '[]'::jsonb)
  FROM jsonb_array_elements(coalesce(p_catalog, '[]'::jsonb)) elem
  WHERE NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(coalesce(p_remaining, '[]'::jsonb)) rem
    WHERE rem->>'id' = elem->>'id'
  );
$$;

CREATE OR REPLACE FUNCTION can_form_opening_pair(p_cards jsonb)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(coalesce(p_cards, '[]'::jsonb)) elem
    GROUP BY elem->>'unit'
    HAVING count(*) >= 2
  );
$$;

CREATE OR REPLACE FUNCTION deal_opening_pair(p_pool jsonb)
RETURNS deal_result
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  v_unit text;
  v_current jsonb;
  v_next jsonb;
  v_rem jsonb;
BEGIN
  SELECT elem->>'unit' INTO v_unit
  FROM jsonb_array_elements(coalesce(p_pool, '[]'::jsonb)) elem
  GROUP BY elem->>'unit'
  HAVING count(*) >= 2
  ORDER BY random()
  LIMIT 1;

  IF v_unit IS NULL THEN
    RETURN (NULL, NULL, coalesce(p_pool, '[]'::jsonb));
  END IF;

  v_current := pick_from_unit(p_pool, v_unit);
  v_rem := remove_card_id(p_pool, v_current->>'id');
  v_next := pick_from_unit(v_rem, v_unit);
  v_rem := remove_card_id(v_rem, v_next->>'id');

  RETURN (v_current, v_next, v_rem);
END;
$$;

CREATE OR REPLACE FUNCTION deal_after_reference(
  p_remaining jsonb,
  p_catalog jsonb,
  p_reference jsonb
) RETURNS deal_result
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  v_next jsonb;
  v_pool jsonb;
  d deal_result;
  v_ref_id text := p_reference->>'id';
BEGIN
  v_next := pick_from_unit(remove_card_id(p_remaining, v_ref_id), p_reference->>'unit');
  IF v_next IS NOT NULL THEN
    RETURN (p_reference, v_next, remove_card_id(p_remaining, v_next->>'id'));
  END IF;

  v_pool := remove_card_id(p_remaining, v_ref_id);
  IF NOT can_form_opening_pair(v_pool) THEN
    v_pool := remove_card_id(p_catalog, v_ref_id);
    IF NOT can_form_opening_pair(v_pool) THEN
      v_pool := p_catalog;
    END IF;
  END IF;

  d := deal_opening_pair(v_pool);
  RETURN d;
END;
$$;

CREATE OR REPLACE FUNCTION create_room(p_player_id text, p_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text := trim(p_name);
  v_code text;
  v_players jsonb;
  r rooms%ROWTYPE;
  i integer;
BEGIN
  IF p_player_id IS NULL OR length(p_player_id) < 8 OR length(p_player_id) > 80 THEN
    RAISE EXCEPTION 'Ungültige Spieler-ID.';
  END IF;
  IF v_name IS NULL OR length(v_name) < 1 OR length(v_name) > 20 THEN
    RAISE EXCEPTION 'Bitte gib einen Namen (1–20 Zeichen) ein.';
  END IF;

  v_players := jsonb_build_array(jsonb_build_object('id', p_player_id, 'name', v_name));

  FOR i IN 1..24 LOOP
    v_code :=
      chr(65 + floor(random() * 26)::int) ||
      chr(65 + floor(random() * 26)::int) ||
      chr(65 + floor(random() * 26)::int) ||
      chr(65 + floor(random() * 26)::int);
    BEGIN
      INSERT INTO rooms (room_code, players, host_id, game_status)
      VALUES (v_code, v_players, p_player_id, 'lobby')
      RETURNING * INTO r;
      RETURN to_jsonb(r);
    EXCEPTION
      WHEN unique_violation THEN
        NULL;
    END;
  END LOOP;

  RAISE EXCEPTION 'Raumcode konnte nicht erzeugt werden. Bitte nochmal versuchen.';
END;
$$;

CREATE OR REPLACE FUNCTION join_room(p_room_code text, p_player_id text, p_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text := upper(trim(p_room_code));
  v_name text := trim(p_name);
  r rooms%ROWTYPE;
  v_players jsonb;
  v_count integer;
  i integer;
BEGIN
  IF p_player_id IS NULL OR length(p_player_id) < 8 OR length(p_player_id) > 80 THEN
    RAISE EXCEPTION 'Ungültige Spieler-ID.';
  END IF;
  IF v_name IS NULL OR length(v_name) < 1 OR length(v_name) > 20 THEN
    RAISE EXCEPTION 'Bitte gib einen Namen (1–20 Zeichen) ein.';
  END IF;
  IF v_code IS NULL OR v_code !~ '^[A-Z]{4}$' THEN
    RAISE EXCEPTION 'Bitte gib einen 4-stelligen Raumcode ein.';
  END IF;

  SELECT * INTO r FROM rooms WHERE room_code = v_code FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Raum nicht gefunden.';
  END IF;

  v_players := r.players;
  v_count := jsonb_array_length(v_players);

  FOR i IN 0..greatest(v_count - 1, 0) LOOP
    IF v_count = 0 THEN
      EXIT;
    END IF;
    IF v_players->i->>'id' = p_player_id THEN
      v_players := jsonb_set(v_players, ARRAY[i::text, 'name'], to_jsonb(v_name));
      UPDATE rooms SET players = v_players WHERE room_code = v_code RETURNING * INTO r;
      RETURN to_jsonb(r);
    END IF;
  END LOOP;

  IF v_count >= 3 THEN
    RAISE EXCEPTION 'Dieser Raum ist voll (max. 3 Spieler).';
  END IF;

  v_players := v_players || jsonb_build_array(jsonb_build_object('id', p_player_id, 'name', v_name));
  UPDATE rooms SET players = v_players WHERE room_code = v_code RETURNING * INTO r;
  RETURN to_jsonb(r);
END;
$$;

CREATE OR REPLACE FUNCTION start_game(p_room_code text, p_player_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text := upper(trim(p_room_code));
  r rooms%ROWTYPE;
  v_catalog jsonb;
  d deal_result;
BEGIN
  SELECT * INTO r FROM rooms WHERE room_code = v_code FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Raum nicht gefunden.';
  END IF;
  IF r.host_id IS DISTINCT FROM p_player_id THEN
    RAISE EXCEPTION 'Nur der Host kann das Spiel starten.';
  END IF;
  IF r.game_status IS DISTINCT FROM 'lobby' THEN
    RAISE EXCEPTION 'Das Spiel wurde bereits gestartet.';
  END IF;
  IF jsonb_array_length(r.players) <> 3 THEN
    RAISE EXCEPTION 'Es müssen genau 3 Spieler da sein.';
  END IF;

  v_catalog := load_catalog();
  d := deal_opening_pair(v_catalog);
  IF d.current_card IS NULL OR d.next_card IS NULL THEN
    RAISE EXCEPTION 'Kartenstapel ist unvollständig.';
  END IF;

  UPDATE rooms SET
    current_player_index = 0,
    lives = 3,
    streak = 0,
    current_card = d.current_card,
    next_card = d.next_card,
    remaining_cards = d.remaining,
    used_card_ids = used_card_ids(v_catalog, d.remaining),
    game_status = 'playing',
    last_result = NULL,
    turn_nonce = r.turn_nonce + 1
  WHERE room_code = v_code
  RETURNING * INTO r;

  RETURN to_jsonb(r);
END;
$$;

CREATE OR REPLACE FUNCTION submit_guess(
  p_room_code text,
  p_player_id text,
  p_guess text,
  p_turn_nonce integer
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text := upper(trim(p_room_code));
  r rooms%ROWTYPE;
  v_correct boolean;
  v_cur numeric;
  v_nxt numeric;
  v_lives integer;
  v_streak integer;
  v_status text;
  v_catalog jsonb;
  d deal_result;
  v_current jsonb;
  v_next jsonb;
  v_remaining jsonb;
BEGIN
  IF p_guess IS DISTINCT FROM 'higher' AND p_guess IS DISTINCT FROM 'lower' THEN
    RAISE EXCEPTION 'Ungültige Schätzung.';
  END IF;

  SELECT * INTO r FROM rooms WHERE room_code = v_code FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Raum nicht gefunden.';
  END IF;

  IF r.turn_nonce IS DISTINCT FROM p_turn_nonce THEN
    RETURN to_jsonb(r);
  END IF;

  IF r.game_status IS DISTINCT FROM 'playing' THEN
    RAISE EXCEPTION 'Das Spiel läuft gerade nicht.';
  END IF;

  IF (r.players -> r.current_player_index ->> 'id') IS DISTINCT FROM p_player_id THEN
    RAISE EXCEPTION 'Du bist nicht dran.';
  END IF;

  IF r.current_card IS NULL OR r.next_card IS NULL THEN
    RAISE EXCEPTION 'Karten fehlen.';
  END IF;

  v_cur := (r.current_card ->> 'value')::numeric;
  v_nxt := (r.next_card ->> 'value')::numeric;
  v_correct := (v_nxt = v_cur)
    OR (p_guess = 'higher' AND v_nxt > v_cur)
    OR (p_guess = 'lower' AND v_nxt < v_cur);

  v_catalog := load_catalog();

  IF v_correct THEN
    v_lives := r.lives;
    v_streak := r.streak + 1;
    v_status := 'playing';
    d := deal_after_reference(r.remaining_cards, v_catalog, r.next_card);
    v_current := d.current_card;
    v_next := d.next_card;
    v_remaining := d.remaining;
  ELSE
    v_lives := r.lives - 1;
    v_streak := r.streak;
    IF v_lives <= 0 THEN
      v_lives := 0;
      v_status := 'game_over';
      v_current := r.current_card;
      v_next := r.next_card;
      v_remaining := r.remaining_cards;
    ELSE
      v_status := 'playing';
      d := deal_after_reference(r.remaining_cards, v_catalog, r.current_card);
      v_current := d.current_card;
      v_next := d.next_card;
      v_remaining := d.remaining;
    END IF;
  END IF;

  IF v_status = 'playing' AND (v_current IS NULL OR v_next IS NULL) THEN
    RAISE EXCEPTION 'Kartenstapel ist unvollständig.';
  END IF;

  UPDATE rooms SET
    lives = v_lives,
    streak = v_streak,
    current_player_index = (r.current_player_index + 1) % jsonb_array_length(r.players),
    current_card = v_current,
    next_card = v_next,
    remaining_cards = coalesce(v_remaining, r.remaining_cards),
    used_card_ids = used_card_ids(v_catalog, coalesce(v_remaining, r.remaining_cards)),
    game_status = v_status,
    last_result = jsonb_build_object(
      'correct', v_correct,
      'guess', p_guess,
      'card', r.next_card,
      'reference', r.current_card,
      'resolved_at', to_char(timezone('utc', now()), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    ),
    turn_nonce = r.turn_nonce + 1
  WHERE room_code = v_code
  RETURNING * INTO r;

  RETURN to_jsonb(r);
END;
$$;

CREATE OR REPLACE FUNCTION restart_game(p_room_code text, p_player_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text := upper(trim(p_room_code));
  r rooms%ROWTYPE;
  v_catalog jsonb;
  d deal_result;
  v_in_room boolean := false;
  i integer;
BEGIN
  SELECT * INTO r FROM rooms WHERE room_code = v_code FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Raum nicht gefunden.';
  END IF;

  FOR i IN 0..jsonb_array_length(r.players) - 1 LOOP
    IF r.players->i->>'id' = p_player_id THEN
      v_in_room := true;
    END IF;
  END LOOP;

  IF NOT v_in_room THEN
    RAISE EXCEPTION 'Du bist nicht in diesem Raum.';
  END IF;

  IF r.game_status IS DISTINCT FROM 'game_over' THEN
    RAISE EXCEPTION 'Neues Spiel geht erst nach Game Over.';
  END IF;

  IF jsonb_array_length(r.players) <> 3 THEN
    RAISE EXCEPTION 'Es müssen genau 3 Spieler da sein.';
  END IF;

  v_catalog := load_catalog();
  d := deal_opening_pair(v_catalog);
  IF d.current_card IS NULL OR d.next_card IS NULL THEN
    RAISE EXCEPTION 'Kartenstapel ist unvollständig.';
  END IF;

  UPDATE rooms SET
    current_player_index = 0,
    lives = 3,
    streak = 0,
    current_card = d.current_card,
    next_card = d.next_card,
    remaining_cards = d.remaining,
    used_card_ids = used_card_ids(v_catalog, d.remaining),
    game_status = 'playing',
    last_result = NULL,
    turn_nonce = r.turn_nonce + 1
  WHERE room_code = v_code
  RETURNING * INTO r;

  RETURN to_jsonb(r);
END;
$$;

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rooms_select ON rooms;
CREATE POLICY rooms_select ON rooms
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS fact_cards_no_direct ON fact_cards;
CREATE POLICY fact_cards_no_direct ON fact_cards
  FOR SELECT
  TO anon, authenticated
  USING (false);

REVOKE ALL ON TABLE fact_cards FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE rooms FROM anon, authenticated;
GRANT SELECT ON TABLE rooms TO anon, authenticated;

GRANT EXECUTE ON FUNCTION create_room(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION join_room(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION start_game(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_guess(text, text, text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION restart_game(text, text) TO anon, authenticated;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;
