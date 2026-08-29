-- High & Low: Team-Stapel
-- Komplett im SQL-Editor einfügen und ausführen (idempotent, überschreibt den Kartenstapel).

DROP FUNCTION IF EXISTS vote_mode(text, text, text);
DROP FUNCTION IF EXISTS submit_guess(text, text, text, integer);
DROP FUNCTION IF EXISTS restart_game(text, text);
DROP FUNCTION IF EXISTS start_game(text, text);
DROP FUNCTION IF EXISTS join_room(text, text, text);
DROP FUNCTION IF EXISTS create_room(text, text);
DROP FUNCTION IF EXISTS create_room(text, text, integer);
DROP FUNCTION IF EXISTS winning_mode(jsonb, text);
DROP FUNCTION IF EXISTS deal_after_reference(jsonb, jsonb, jsonb);
DROP FUNCTION IF EXISTS deal_opening_pair(jsonb);
DROP FUNCTION IF EXISTS can_form_opening_pair(jsonb);
DROP FUNCTION IF EXISTS used_card_ids(jsonb, jsonb);
DROP FUNCTION IF EXISTS remove_card_id(jsonb, text);
DROP FUNCTION IF EXISTS pick_from_unit(jsonb, text);
DROP FUNCTION IF EXISTS pick_from_axis(jsonb, text);
DROP FUNCTION IF EXISTS load_catalog();
DROP FUNCTION IF EXISTS load_catalog(text);
DROP FUNCTION IF EXISTS set_rooms_updated_at();
DROP TYPE IF EXISTS deal_result CASCADE;

CREATE TABLE IF NOT EXISTS fact_cards (
  id text PRIMARY KEY,
  title text NOT NULL,
  value double precision NOT NULL,
  unit text NOT NULL
);

ALTER TABLE fact_cards ADD COLUMN IF NOT EXISTS axis text NOT NULL DEFAULT 'count';
ALTER TABLE fact_cards ADD COLUMN IF NOT EXISTS deck text NOT NULL DEFAULT 'adult';

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
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS max_players integer NOT NULL DEFAULT 3;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS votes jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS selected_mode text NOT NULL DEFAULT 'adult';

TRUNCATE fact_cards;

INSERT INTO fact_cards (id, title, value, unit, axis, deck) VALUES
  ('mensch', 'Gewicht Durchschnittsmensch (DE)', 77, 'kg', 'weight', 'adult'),
  ('wolf', 'Gewicht Wolf', 40, 'kg', 'weight', 'adult'),
  ('pferd', 'Gewicht Warmblutpferd', 550, 'kg', 'weight', 'adult'),
  ('smart-fortwo', 'Gewicht Smart Fortwo', 890, 'kg', 'weight', 'adult'),
  ('vw-golf', 'Gewicht VW Golf', 1300, 'kg', 'weight', 'adult'),
  ('nilpferd', 'Gewicht Nilpferd', 1500, 'kg', 'weight', 'adult'),
  ('elefant', 'Gewicht Afrikanischer Elefant', 6000, 'kg', 'weight', 'adult'),
  ('t-rex', 'Gewicht Tyrannosaurus rex (Schätzung)', 8000, 'kg', 'weight', 'adult'),
  ('leopard-2', 'Gewicht Kampfpanzer Leopard 2', 62000, 'kg', 'weight', 'adult'),
  ('blauwal', 'Gewicht Blauwal', 140000, 'kg', 'weight', 'adult'),
  ('a380', 'Gewicht Airbus A380 (leer)', 277000, 'kg', 'weight', 'adult'),
  ('saturn-v', 'Gewicht Saturn V (betankt)', 2970000, 'kg', 'weight', 'adult'),
  ('doener', 'Preis eines Döners', 7, '€', 'price', 'adult'),
  ('deutschlandticket', 'Deutschlandticket (Monat)', 58, '€', 'price', 'adult'),
  ('ps5', 'PlayStation 5', 400, '€', 'price', 'adult'),
  ('iphone-16', 'iPhone 16', 999, '€', 'price', 'adult'),
  ('bahncard-100', 'BahnCard 100, 2. Klasse', 4500, '€', 'price', 'adult'),
  ('golf-neupreis', 'Neupreis VW Golf 8', 28000, '€', 'price', 'adult'),
  ('median-gehalt', 'Median-Jahresgehalt brutto (DE)', 45000, '€', 'price', 'adult'),
  ('gold-kg', 'Kilogramm Feingold', 78000, '€', 'price', 'adult'),
  ('efh', 'Einfamilienhaus in DE (Schnitt)', 420000, '€', 'price', 'adult'),
  ('eurofighter', 'Stückpreis Eurofighter Typhoon', 120000000, '€', 'price', 'adult'),
  ('elbphilharmonie', 'Baukosten Elbphilharmonie', 866000000, '€', 'price', 'adult'),
  ('konstantinopel', 'Fall Konstantinopels', 1453, 'Jahr', 'year', 'adult'),
  ('kolumbus', 'Kolumbus erreicht Amerika', 1492, 'Jahr', 'year', 'adult'),
  ('brandenburger-tor', 'Baujahr Brandenburger Tor', 1791, 'Jahr', 'year', 'adult'),
  ('beethoven-9', 'Uraufführung 9. Sinfonie', 1824, 'Jahr', 'year', 'adult'),
  ('koelner-dom-jahr', 'Fertigstellung Kölner Dom', 1880, 'Jahr', 'year', 'adult'),
  ('eiffelturm-jahr', 'Baujahr Eiffelturm', 1889, 'Jahr', 'year', 'adult'),
  ('titanic', 'Untergang der Titanic', 1912, 'Jahr', 'year', 'adult'),
  ('grundgesetz', 'Grundgesetz der Bundesrepublik', 1949, 'Jahr', 'year', 'adult'),
  ('mauer-bau', 'Bau der Berliner Mauer', 1961, 'Jahr', 'year', 'adult'),
  ('mondlandung', 'Erste Mondlandung', 1969, 'Jahr', 'year', 'adult'),
  ('mauerfall', 'Fall der Berliner Mauer', 1989, 'Jahr', 'year', 'adult'),
  ('wikipedia', 'Start von Wikipedia', 2001, 'Jahr', 'year', 'adult'),
  ('iphone-jahr', 'Erstes iPhone', 2007, 'Jahr', 'year', 'adult'),
  ('chatgpt', 'Start von ChatGPT', 2022, 'Jahr', 'year', 'adult'),
  ('marathon', 'Marathondistanz', 42, 'km', 'distance', 'adult'),
  ('hamburg-koeln', 'Entfernung Hamburg–Köln (Straße)', 430, 'km', 'distance', 'adult'),
  ('berlin-muenchen', 'Entfernung Berlin–München (Straße)', 585, 'km', 'distance', 'adult'),
  ('a7', 'Länge der Autobahn A7', 962, 'km', 'distance', 'adult'),
  ('rhein', 'Länge des Rheins', 1233, 'km', 'distance', 'adult'),
  ('amazonas', 'Länge des Amazonas', 6400, 'km', 'distance', 'adult'),
  ('nil', 'Länge des Nils', 6650, 'km', 'distance', 'adult'),
  ('transsib', 'Transsibirische Eisenbahn', 9289, 'km', 'distance', 'adult'),
  ('berlin-sydney', 'Luftlinie Berlin–Sydney', 16100, 'km', 'distance', 'adult'),
  ('aequator', 'Umfang des Äquators', 40075, 'km', 'distance', 'adult'),
  ('licht-sekunde', 'Lichtstrecke in einer Sekunde', 299792, 'km', 'distance', 'adult'),
  ('erde-mond', 'Abstand Erde–Mond (mittel)', 384400, 'km', 'distance', 'adult'),
  ('freiheitsstatue', 'Höhe der Freiheitsstatue', 93, 'm', 'height', 'adult'),
  ('koelner-dom-hoehe', 'Höhe des Kölner Doms', 157, 'm', 'height', 'adult'),
  ('eiffelturm-hoehe', 'Höhe des Eiffelturms', 330, 'm', 'height', 'adult'),
  ('fernsehturm', 'Höhe Berliner Fernsehturm', 368, 'm', 'height', 'adult'),
  ('empire-state', 'Höhe Empire State Building', 443, 'm', 'height', 'adult'),
  ('burj', 'Höhe Burj Khalifa', 828, 'm', 'height', 'adult'),
  ('zugspitze', 'Höhe der Zugspitze', 2962, 'm', 'height', 'adult'),
  ('matterhorn', 'Höhe des Matterhorns', 4478, 'm', 'height', 'adult'),
  ('mont-blanc', 'Höhe des Mont Blanc', 4809, 'm', 'height', 'adult'),
  ('k2', 'Höhe des K2', 8611, 'm', 'height', 'adult'),
  ('everest', 'Höhe des Mount Everest', 8849, 'm', 'height', 'adult'),
  ('olympus-mons', 'Höhe des Olympus Mons', 21229, 'm', 'height', 'adult'),
  ('fussgaenger', 'Schrittgeschwindigkeit Mensch', 5, 'km/h', 'speed', 'adult'),
  ('usain', 'Spitze Usain Bolt', 38, 'km/h', 'speed', 'adult'),
  ('gepard', 'Spitze Gepard', 110, 'km/h', 'speed', 'adult'),
  ('wanderfalke', 'Sturzflug Wanderfalke', 320, 'km/h', 'speed', 'adult'),
  ('ice', 'Höchstgeschwindigkeit ICE 3', 330, 'km/h', 'speed', 'adult'),
  ('f1', 'Spitze Formel-1-Auto', 370, 'km/h', 'speed', 'adult'),
  ('maglev', 'Transrapid Shanghai', 431, 'km/h', 'speed', 'adult'),
  ('boeing747', 'Reisegeschwindigkeit Boeing 747', 900, 'km/h', 'speed', 'adult'),
  ('schall', 'Schall in Luft (20 °C)', 1235, 'km/h', 'speed', 'adult'),
  ('iss', 'Orbitalgeschwindigkeit der ISS', 27600, 'km/h', 'speed', 'adult'),
  ('fluessigstickstoff', 'Siedepunkt Flüssigstickstoff', -196, '°C', 'temp', 'adult'),
  ('antarktis', 'Kälterekord Antarktis', -89, '°C', 'temp', 'adult'),
  ('mars', 'Durchschnittstemperatur Mars', -63, '°C', 'temp', 'adult'),
  ('gefrierpunkt', 'Gefrierpunkt von Wasser', 0, '°C', 'temp', 'adult'),
  ('kuehlschrank', 'Kühlschrank-Temperatur', 4, '°C', 'temp', 'adult'),
  ('koerper', 'Körpertemperatur Mensch', 37, '°C', 'temp', 'adult'),
  ('death-valley', 'Hitzerekord Death Valley', 57, '°C', 'temp', 'adult'),
  ('siedepunkt', 'Siedepunkt von Wasser', 100, '°C', 'temp', 'adult'),
  ('venus', 'Oberfläche der Venus', 464, '°C', 'temp', 'adult'),
  ('sonne', 'Sonnenoberfläche', 5505, '°C', 'temp', 'adult'),
  ('planeten', 'Planeten im Sonnensystem', 8, 'Stück', 'count', 'adult'),
  ('bundeslaender', 'Bundesländer in Deutschland', 16, 'Stück', 'count', 'adult'),
  ('eu', 'EU-Mitgliedstaaten', 27, 'Stück', 'count', 'adult'),
  ('zaehne', 'Zähne eines Erwachsenen', 32, 'Stück', 'count', 'adult'),
  ('chromosomen', 'Chromosomen des Menschen', 46, 'Stück', 'count', 'adult'),
  ('spielkarten', 'Karten im französischen Blatt', 52, 'Stück', 'count', 'adult'),
  ('schach', 'Felder auf dem Schachbrett', 64, 'Stück', 'count', 'adult'),
  ('klavier', 'Tasten eines Klaviers', 88, 'Stück', 'count', 'adult'),
  ('elemente', 'Elemente im Periodensystem', 118, 'Stück', 'count', 'adult'),
  ('un-staaten', 'UN-Mitgliedstaaten', 193, 'Stück', 'count', 'adult'),
  ('knochen', 'Knochen eines Erwachsenen', 206, 'Stück', 'count', 'adult'),
  ('sprachen', 'Sprachen der Welt (ca.)', 7000, 'Stück', 'count', 'adult'),
  ('k-maus', 'Gewicht einer Hausmaus', 0.02, 'kg', 'weight', 'kids'),
  ('k-katze', 'Gewicht einer Hauskatze', 4, 'kg', 'weight', 'kids'),
  ('k-hund', 'Gewicht eines Labradors', 30, 'kg', 'weight', 'kids'),
  ('k-wolf', 'Gewicht eines Wolfs', 40, 'kg', 'weight', 'kids'),
  ('k-panda', 'Gewicht eines Großen Panda', 100, 'kg', 'weight', 'kids'),
  ('k-pferd', 'Gewicht eines Pferds', 500, 'kg', 'weight', 'kids'),
  ('k-giraffe-kg', 'Gewicht einer Giraffe', 800, 'kg', 'weight', 'kids'),
  ('k-nilpferd', 'Gewicht eines Nilpferds', 1500, 'kg', 'weight', 'kids'),
  ('k-elefant', 'Gewicht eines Elefanten', 6000, 'kg', 'weight', 'kids'),
  ('k-blauwal', 'Gewicht eines Blauwals', 140000, 'kg', 'weight', 'kids'),
  ('k-maus-h', 'Körperlänge einer Hausmaus', 0.08, 'm', 'height', 'kids'),
  ('k-katze-h', 'Schulterhöhe einer Hauskatze', 0.25, 'm', 'height', 'kids'),
  ('k-kind', 'Größe eines Kindes (8 Jahre)', 1.3, 'm', 'height', 'kids'),
  ('k-korb', 'Höhe eines Basketballkorbs', 3.05, 'm', 'height', 'kids'),
  ('k-trex-h', 'Hüfthöhe eines T-Rex', 4, 'm', 'height', 'kids'),
  ('k-giraffe-h', 'Höhe einer Giraffe', 5.5, 'm', 'height', 'kids'),
  ('k-eiffel', 'Höhe des Eiffelturms', 330, 'm', 'height', 'kids'),
  ('k-everest', 'Höhe des Mount Everest', 8849, 'm', 'height', 'kids'),
  ('k-wuerfel', 'Höchste Zahl auf einem Würfel', 6, 'Stück', 'count', 'kids'),
  ('k-insekt', 'Beine eines Insekts', 6, 'Stück', 'count', 'kids'),
  ('k-kontinente', 'Kontinente', 7, 'Stück', 'count', 'kids'),
  ('k-spinne', 'Beine einer Spinne', 8, 'Stück', 'count', 'kids'),
  ('k-planeten', 'Planeten im Sonnensystem', 8, 'Stück', 'count', 'kids'),
  ('k-milchzaehne', 'Milchzähne', 20, 'Stück', 'count', 'kids'),
  ('k-karten', 'Karten in einem Blatt', 52, 'Stück', 'count', 'kids'),
  ('k-schach', 'Felder auf dem Schachbrett', 64, 'Stück', 'count', 'kids'),
  ('k-schnecke', 'Weinbergschnecke', 0.05, 'km/h', 'speed', 'kids'),
  ('k-gehen', 'Mensch zu Fuß', 5, 'km/h', 'speed', 'kids'),
  ('k-fahrrad', 'Fahrrad im Alltag', 15, 'km/h', 'speed', 'kids'),
  ('k-bolt', 'Usain Bolt', 38, 'km/h', 'speed', 'kids'),
  ('k-gepard', 'Gepard', 110, 'km/h', 'speed', 'kids'),
  ('k-ice', 'ICE', 330, 'km/h', 'speed', 'kids'),
  ('k-fussball', 'Länge eines Fußballfelds', 0.105, 'km', 'distance', 'kids'),
  ('k-marathon', 'Marathon', 42, 'km', 'distance', 'kids'),
  ('k-berlin-muc', 'Berlin–München', 585, 'km', 'distance', 'kids'),
  ('k-rhein', 'Länge des Rheins', 1233, 'km', 'distance', 'kids'),
  ('k-aequator', 'Umfang des Äquators', 40075, 'km', 'distance', 'kids'),
  ('k-mond', 'Abstand Erde–Mond', 384400, 'km', 'distance', 'kids'),
  ('k-micky', 'Mickey Mouse', 1928, 'Jahr', 'year', 'kids'),
  ('k-lego', 'Lego-Noppenstein', 1958, 'Jahr', 'year', 'kids'),
  ('k-mond-k', 'Mondlandung', 1969, 'Jahr', 'year', 'kids'),
  ('k-pokemon', 'Pokémon (Game Boy)', 1996, 'Jahr', 'year', 'kids'),
  ('k-hp', 'Harry Potter, Band 1', 1997, 'Jahr', 'year', 'kids'),
  ('k-youtube', 'Start von YouTube', 2005, 'Jahr', 'year', 'kids'),
  ('k-eis', 'Schmelzpunkt von Eis', 0, '°C', 'temp', 'kids'),
  ('k-kuehl', 'Kühlschrank', 4, '°C', 'temp', 'kids'),
  ('k-koerper', 'Körpertemperatur', 37, '°C', 'temp', 'kids'),
  ('k-wueste', 'Wüste am Tag', 45, '°C', 'temp', 'kids'),
  ('k-backofen', 'Backofen für Pizza', 250, '°C', 'temp', 'kids'),
  ('k-haribo', 'Tüte Gummibärchen', 2, '€', 'price', 'kids'),
  ('k-kino', 'Kinokarte Kind', 8, '€', 'price', 'kids'),
  ('k-ball', 'Standard-Fußball', 25, '€', 'price', 'kids'),
  ('k-fahrrad-preis', 'Kinderfahrrad', 200, '€', 'price', 'kids'),
  ('k-switch', 'Nintendo Switch', 300, '€', 'price', 'kids');

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

CREATE OR REPLACE FUNCTION load_catalog(p_deck text)
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
        'unit', unit,
        'axis', axis
      )
      ORDER BY random()
    ),
    '[]'::jsonb
  )
  FROM fact_cards
  WHERE deck = p_deck;
$$;

CREATE OR REPLACE FUNCTION pick_from_axis(p_cards jsonb, p_axis text)
RETURNS jsonb
LANGUAGE sql
VOLATILE
AS $$
  SELECT elem
  FROM jsonb_array_elements(coalesce(p_cards, '[]'::jsonb)) elem
  WHERE coalesce(elem->>'axis', elem->>'unit') = p_axis
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
    GROUP BY coalesce(elem->>'axis', elem->>'unit')
    HAVING count(*) >= 2
  );
$$;

CREATE OR REPLACE FUNCTION deal_opening_pair(p_pool jsonb)
RETURNS deal_result
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  v_axis text;
  v_current jsonb;
  v_next jsonb;
  v_rem jsonb;
BEGIN
  SELECT coalesce(elem->>'axis', elem->>'unit') INTO v_axis
  FROM jsonb_array_elements(coalesce(p_pool, '[]'::jsonb)) elem
  GROUP BY coalesce(elem->>'axis', elem->>'unit')
  HAVING count(*) >= 2
  ORDER BY random()
  LIMIT 1;

  IF v_axis IS NULL THEN
    RETURN (NULL, NULL, coalesce(p_pool, '[]'::jsonb));
  END IF;

  v_current := pick_from_axis(p_pool, v_axis);
  v_rem := remove_card_id(p_pool, v_current->>'id');
  v_next := pick_from_axis(v_rem, v_axis);
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
  v_axis text := coalesce(p_reference->>'axis', p_reference->>'unit');
BEGIN
  v_next := pick_from_axis(remove_card_id(p_remaining, v_ref_id), v_axis);
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

CREATE OR REPLACE FUNCTION winning_mode(p_votes jsonb, p_host_id text)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_adult integer := 0;
  v_kids integer := 0;
  rec record;
  v_host text;
BEGIN
  FOR rec IN SELECT value FROM jsonb_each_text(coalesce(p_votes, '{}'::jsonb))
  LOOP
    IF rec.value = 'kids' THEN
      v_kids := v_kids + 1;
    ELSIF rec.value = 'adult' THEN
      v_adult := v_adult + 1;
    END IF;
  END LOOP;

  IF v_kids > v_adult THEN
    RETURN 'kids';
  END IF;
  IF v_adult > v_kids THEN
    RETURN 'adult';
  END IF;

  v_host := coalesce(p_votes ->> p_host_id, 'adult');
  IF v_host IN ('adult', 'kids') THEN
    RETURN v_host;
  END IF;
  RETURN 'adult';
END;
$$;

CREATE OR REPLACE FUNCTION create_room(p_player_id text, p_name text, p_max_players integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text := trim(p_name);
  v_code text;
  v_players jsonb;
  v_max integer := coalesce(p_max_players, 3);
  r rooms%ROWTYPE;
  i integer;
BEGIN
  IF p_player_id IS NULL OR length(p_player_id) < 8 OR length(p_player_id) > 80 THEN
    RAISE EXCEPTION 'Ungültige Spieler-ID.';
  END IF;
  IF v_name IS NULL OR length(v_name) < 1 OR length(v_name) > 20 THEN
    RAISE EXCEPTION 'Bitte gib einen Namen (1–20 Zeichen) ein.';
  END IF;
  IF v_max < 2 OR v_max > 6 THEN
    RAISE EXCEPTION 'Spielerzahl muss zwischen 2 und 6 liegen.';
  END IF;

  v_players := jsonb_build_array(jsonb_build_object('id', p_player_id, 'name', v_name));

  FOR i IN 1..24 LOOP
    v_code :=
      chr(65 + floor(random() * 26)::int) ||
      chr(65 + floor(random() * 26)::int) ||
      chr(65 + floor(random() * 26)::int) ||
      chr(65 + floor(random() * 26)::int);
    BEGIN
      INSERT INTO rooms (room_code, players, host_id, game_status, max_players, votes, selected_mode)
      VALUES (v_code, v_players, p_player_id, 'lobby', v_max, '{}'::jsonb, 'adult')
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
  v_max integer;
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
  v_max := coalesce(r.max_players, 3);

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

  IF v_count >= v_max THEN
    RAISE EXCEPTION 'Dieser Raum ist voll (max. % Spieler).', v_max;
  END IF;

  v_players := v_players || jsonb_build_array(jsonb_build_object('id', p_player_id, 'name', v_name));
  UPDATE rooms SET players = v_players WHERE room_code = v_code RETURNING * INTO r;
  RETURN to_jsonb(r);
END;
$$;

CREATE OR REPLACE FUNCTION vote_mode(p_room_code text, p_player_id text, p_mode text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text := upper(trim(p_room_code));
  r rooms%ROWTYPE;
  v_in_room boolean := false;
  i integer;
BEGIN
  IF p_mode IS DISTINCT FROM 'adult' AND p_mode IS DISTINCT FROM 'kids' THEN
    RAISE EXCEPTION 'Ungültiger Modus.';
  END IF;

  SELECT * INTO r FROM rooms WHERE room_code = v_code FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Raum nicht gefunden.';
  END IF;
  IF r.game_status IS DISTINCT FROM 'lobby' THEN
    RAISE EXCEPTION 'Abstimmung nur in der Lobby.';
  END IF;

  FOR i IN 0..greatest(jsonb_array_length(r.players) - 1, 0) LOOP
    IF jsonb_array_length(r.players) = 0 THEN
      EXIT;
    END IF;
    IF r.players->i->>'id' = p_player_id THEN
      v_in_room := true;
    END IF;
  END LOOP;

  IF NOT v_in_room THEN
    RAISE EXCEPTION 'Du bist nicht in diesem Raum.';
  END IF;

  UPDATE rooms
  SET votes = jsonb_set(coalesce(r.votes, '{}'::jsonb), ARRAY[p_player_id], to_jsonb(p_mode), true)
  WHERE room_code = v_code
  RETURNING * INTO r;

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
  v_mode text;
  v_lives integer;
  v_max integer;
BEGIN
  SELECT * INTO r FROM rooms WHERE room_code = v_code FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Raum nicht gefunden.';
  END IF;
  IF r.game_status = 'playing' THEN
    RETURN to_jsonb(r);
  END IF;
  IF r.host_id IS DISTINCT FROM p_player_id THEN
    RAISE EXCEPTION 'Nur der Host kann das Spiel starten.';
  END IF;
  IF r.game_status IS DISTINCT FROM 'lobby' THEN
    RAISE EXCEPTION 'Das Spiel wurde bereits gestartet.';
  END IF;

  v_max := coalesce(r.max_players, 3);
  IF jsonb_array_length(r.players) <> v_max THEN
    RAISE EXCEPTION 'Es müssen genau % Spieler da sein.', v_max;
  END IF;

  v_mode := winning_mode(r.votes, r.host_id);
  v_lives := CASE WHEN v_mode = 'kids' THEN 5 ELSE 3 END;
  v_catalog := load_catalog(v_mode);
  d := deal_opening_pair(v_catalog);
  IF d.current_card IS NULL OR d.next_card IS NULL THEN
    RAISE EXCEPTION 'Kartenstapel ist unvollständig.';
  END IF;

  UPDATE rooms SET
    current_player_index = 0,
    lives = v_lives,
    streak = 0,
    current_card = d.current_card,
    next_card = d.next_card,
    remaining_cards = d.remaining,
    used_card_ids = used_card_ids(v_catalog, d.remaining),
    game_status = 'playing',
    last_result = NULL,
    selected_mode = v_mode,
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

  v_catalog := load_catalog(coalesce(r.selected_mode, 'adult'));

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
  v_mode text;
  v_lives integer;
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

  IF r.game_status = 'playing' THEN
    RETURN to_jsonb(r);
  END IF;

  IF r.game_status IS DISTINCT FROM 'game_over' THEN
    RAISE EXCEPTION 'Neues Spiel geht erst nach Game Over.';
  END IF;

  IF jsonb_array_length(r.players) <> coalesce(r.max_players, 3) THEN
    RAISE EXCEPTION 'Es müssen genau % Spieler da sein.', coalesce(r.max_players, 3);
  END IF;

  v_mode := coalesce(r.selected_mode, 'adult');
  v_lives := CASE WHEN v_mode = 'kids' THEN 5 ELSE 3 END;
  v_catalog := load_catalog(v_mode);
  d := deal_opening_pair(v_catalog);
  IF d.current_card IS NULL OR d.next_card IS NULL THEN
    RAISE EXCEPTION 'Kartenstapel ist unvollständig.';
  END IF;

  UPDATE rooms SET
    current_player_index = 0,
    lives = v_lives,
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

ALTER TABLE rooms REPLICA IDENTITY FULL;

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

GRANT EXECUTE ON FUNCTION create_room(text, text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION join_room(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION vote_mode(text, text, text) TO anon, authenticated;
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
