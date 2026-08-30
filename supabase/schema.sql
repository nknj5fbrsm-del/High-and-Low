-- High & Low: Team-Stapel
-- Komplett im SQL-Editor einfügen und ausführen (idempotent, überschreibt den Kartenstapel).

DROP FUNCTION IF EXISTS vote_mode(text, text, text);
DROP FUNCTION IF EXISTS set_density(text, text, text);
DROP FUNCTION IF EXISTS submit_guess(text, text, text, integer);
DROP FUNCTION IF EXISTS restart_game(text, text);
DROP FUNCTION IF EXISTS start_solo(text, text, text);
DROP FUNCTION IF EXISTS start_solo(text, text, text, text);
DROP FUNCTION IF EXISTS start_game(text, text);
DROP FUNCTION IF EXISTS start_game(text, text, text);
DROP FUNCTION IF EXISTS join_room(text, text, text);
DROP FUNCTION IF EXISTS create_room(text, text);
DROP FUNCTION IF EXISTS create_room(text, text, integer);
DROP FUNCTION IF EXISTS winning_mode(jsonb, text);
DROP FUNCTION IF EXISTS deal_after_reference(jsonb, jsonb, jsonb);
DROP FUNCTION IF EXISTS deal_fresh_pair(jsonb, jsonb, text, text);
DROP FUNCTION IF EXISTS deal_opening_pair(jsonb);
DROP FUNCTION IF EXISTS deal_opening_pair(jsonb, text);
DROP FUNCTION IF EXISTS pair_fits_density(jsonb, jsonb, text);
DROP FUNCTION IF EXISTS is_subset_pair(jsonb, jsonb);
DROP FUNCTION IF EXISTS can_form_opening_pair(jsonb);
DROP FUNCTION IF EXISTS used_card_ids(jsonb, jsonb);
DROP FUNCTION IF EXISTS remove_card_id(jsonb, text);
DROP FUNCTION IF EXISTS pick_from_unit(jsonb, text);
DROP FUNCTION IF EXISTS pick_from_axis(jsonb, text);
DROP FUNCTION IF EXISTS load_catalog();
DROP FUNCTION IF EXISTS load_catalog(text);
DROP TRIGGER IF EXISTS rooms_updated_at ON rooms;
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
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS selected_density text NOT NULL DEFAULT 'knackig';

ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_max_players_range;
ALTER TABLE rooms ADD CONSTRAINT rooms_max_players_range CHECK (max_players BETWEEN 1 AND 6);
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_selected_mode_ok;
ALTER TABLE rooms ADD CONSTRAINT rooms_selected_mode_ok CHECK (selected_mode IN ('adult', 'kids'));
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_selected_density_ok;
ALTER TABLE rooms ADD CONSTRAINT rooms_selected_density_ok CHECK (selected_density IN ('locker', 'knackig', 'haarscharf'));
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_votes_object;
ALTER TABLE rooms ADD CONSTRAINT rooms_votes_object CHECK (jsonb_typeof(votes) = 'object');

TRUNCATE fact_cards;

INSERT INTO fact_cards (id, title, value, unit, axis, deck) VALUES
  ('berlin', 'Berlin (Stadt)', 3.88, 'Mio.', 'population', 'adult'),
  ('madrid-stadt', 'Madrid (Stadt)', 3.33, 'Mio.', 'population', 'adult'),
  ('rom-stadt', 'Rom (Stadt)', 2.76, 'Mio.', 'population', 'adult'),
  ('wien', 'Wien (Stadt)', 2.04, 'Mio.', 'population', 'adult'),
  ('hamburg', 'Hamburg (Stadt)', 1.86, 'Mio.', 'population', 'adult'),
  ('warschau', 'Warschau (Stadt)', 1.86, 'Mio.', 'population', 'adult'),
  ('budapest', 'Budapest (Stadt)', 1.69, 'Mio.', 'population', 'adult'),
  ('barcelona', 'Barcelona (Stadt)', 1.66, 'Mio.', 'population', 'adult'),
  ('muenchen', 'München (Stadt)', 1.51, 'Mio.', 'population', 'adult'),
  ('prag', 'Prag (Stadt)', 1.38, 'Mio.', 'population', 'adult'),
  ('mailand', 'Mailand (Stadt)', 1.37, 'Mio.', 'population', 'adult'),
  ('koeln-stadt', 'Köln (Stadt)', 1.09, 'Mio.', 'population', 'adult'),
  ('stockholm-stadt', 'Stockholm (Stadt)', 0.99, 'Mio.', 'population', 'adult'),
  ('griechenland', 'Griechenland', 131957, 'km²', 'area', 'adult'),
  ('nicaragua', 'Nicaragua', 130373, 'km²', 'area', 'adult'),
  ('portugal', 'Portugal', 92212, 'km²', 'area', 'adult'),
  ('jordanien', 'Jordanien', 89342, 'km²', 'area', 'adult'),
  ('aserbaidschan', 'Aserbaidschan', 86600, 'km²', 'area', 'adult'),
  ('oesterreich', 'Österreich', 83879, 'km²', 'area', 'adult'),
  ('vae', 'Vereinigte Arabische Emirate', 83600, 'km²', 'area', 'adult'),
  ('tschechien', 'Tschechien', 78871, 'km²', 'area', 'adult'),
  ('panama', 'Panama', 75417, 'km²', 'area', 'adult'),
  ('irland', 'Irland (Staat)', 70273, 'km²', 'area', 'adult'),
  ('daenemark', 'Dänemark', 42933, 'km²', 'area', 'adult'),
  ('niederlande', 'Niederlande', 41543, 'km²', 'area', 'adult'),
  ('schweiz', 'Schweiz', 41285, 'km²', 'area', 'adult'),
  ('belgien', 'Belgien', 30689, 'km²', 'area', 'adult'),
  ('empire-state', 'Empire State Building (mit Antenne)', 443, 'm', 'height', 'adult'),
  ('jin-mao', 'Jin-Mao-Turm, Shanghai', 421, 'm', 'height', 'adult'),
  ('two-ifc', 'Two IFC, Hongkong', 415, 'm', 'height', 'adult'),
  ('fernsehturm', 'Berliner Fernsehturm', 368, 'm', 'height', 'adult'),
  ('bank-of-china', 'Bank of China Tower, Hongkong', 367, 'm', 'height', 'adult'),
  ('eiffelturm-hoehe', 'Eiffelturm', 330, 'm', 'height', 'adult'),
  ('chrysler', 'Chrysler Building', 319, 'm', 'height', 'adult'),
  ('shard', 'The Shard, London', 310, 'm', 'height', 'adult'),
  ('commerzbank', 'Commerzbank-Tower', 259, 'm', 'height', 'adult'),
  ('washington-monument', 'Washington Monument', 169, 'm', 'height', 'adult'),
  ('koelner-dom', 'Kölner Dom', 157, 'm', 'height', 'adult'),
  ('tiger-m', 'Tiger, Männchen', 220, 'kg', 'weight', 'adult'),
  ('loewe-m', 'Löwe, Männchen', 190, 'kg', 'weight', 'adult'),
  ('schwarzbaer', 'Amerikanischer Schwarzbär', 135, 'kg', 'weight', 'adult'),
  ('rentier', 'Rentier', 120, 'kg', 'weight', 'adult'),
  ('panda', 'Großer Panda', 100, 'kg', 'weight', 'adult'),
  ('wildschwein', 'Mitteleuropäisches Wildschwein', 90, 'kg', 'weight', 'adult'),
  ('orang-utan', 'Orang-Utan, Männchen', 85, 'kg', 'weight', 'adult'),
  ('kaenguru', 'Rotes Riesenkänguru', 85, 'kg', 'weight', 'adult'),
  ('jaguar', 'Jaguar', 80, 'kg', 'weight', 'adult'),
  ('warzenschwein', 'Warzenschwein', 80, 'kg', 'weight', 'adult'),
  ('mensch', 'Durchschnittsmensch (DE)', 77, 'kg', 'weight', 'adult'),
  ('hyaene', 'Tüpfelhyäne', 70, 'kg', 'weight', 'adult'),
  ('schimpanse', 'Schimpanse, Männchen', 45, 'kg', 'weight', 'adult'),
  ('wolf', 'Europäischer Wolf', 40, 'kg', 'weight', 'adult'),
  ('leonardo', 'Leonardo da Vinci', 1452, 'Jahr', 'year', 'adult'),
  ('duerer', 'Albrecht Dürer', 1471, 'Jahr', 'year', 'adult'),
  ('michelangelo', 'Michelangelo', 1475, 'Jahr', 'year', 'adult'),
  ('rembrandt', 'Rembrandt', 1606, 'Jahr', 'year', 'adult'),
  ('vivaldi', 'Antonio Vivaldi', 1678, 'Jahr', 'year', 'adult'),
  ('bach', 'Johann Sebastian Bach', 1685, 'Jahr', 'year', 'adult'),
  ('haydn', 'Joseph Haydn', 1732, 'Jahr', 'year', 'adult'),
  ('mozart', 'Wolfgang Amadeus Mozart', 1756, 'Jahr', 'year', 'adult'),
  ('beethoven', 'Ludwig van Beethoven', 1770, 'Jahr', 'year', 'adult'),
  ('chopin', 'Frédéric Chopin', 1810, 'Jahr', 'year', 'adult'),
  ('brahms', 'Johannes Brahms', 1833, 'Jahr', 'year', 'adult'),
  ('vangogh', 'Vincent van Gogh', 1853, 'Jahr', 'year', 'adult'),
  ('debussy', 'Claude Debussy', 1862, 'Jahr', 'year', 'adult'),
  ('picasso', 'Pablo Picasso', 1881, 'Jahr', 'year', 'adult'),
  ('hamburg-muenchen', 'Hamburg–München (Straße)', 790, 'km', 'distance', 'adult'),
  ('a1', 'Autobahn A1', 732, 'km', 'distance', 'adult'),
  ('berlin-wien', 'Berlin–Wien (Straße)', 680, 'km', 'distance', 'adult'),
  ('berlin-muenchen', 'Berlin–München (Straße)', 585, 'km', 'distance', 'adult'),
  ('a9', 'Autobahn A9', 529, 'km', 'distance', 'adult'),
  ('a8', 'Autobahn A8', 505, 'km', 'distance', 'adult'),
  ('a2', 'Autobahn A2', 486, 'km', 'distance', 'adult'),
  ('hamburg-koeln', 'Hamburg–Köln (Straße)', 430, 'km', 'distance', 'adult'),
  ('berlin-hamburg', 'Berlin–Hamburg (Straße)', 289, 'km', 'distance', 'adult'),
  ('koeln-amsterdam', 'Köln–Amsterdam (Straße)', 280, 'km', 'distance', 'adult'),
  ('muenchen-stuttgart', 'München–Stuttgart (Straße)', 220, 'km', 'distance', 'adult'),
  ('flug-cruise', 'Verkehrsflugzeug, Reisegeschwindigkeit', 900, 'km/h', 'speed', 'adult'),
  ('chiron', 'Bugatti Chiron, Spitze', 420, 'km/h', 'speed', 'adult'),
  ('f1', 'Formel-1-Auto, Spitze', 370, 'km/h', 'speed', 'adult'),
  ('velaro', 'Velaro, Höchstgeschwindigkeit', 350, 'km/h', 'speed', 'adult'),
  ('ice', 'ICE 3, Höchstgeschwindigkeit', 330, 'km/h', 'speed', 'adult'),
  ('wanderfalke', 'Sturzflug Wanderfalke', 320, 'km/h', 'speed', 'adult'),
  ('tgv', 'TGV, Höchstgeschwindigkeit', 320, 'km/h', 'speed', 'adult'),
  ('ave', 'AVE, Höchstgeschwindigkeit', 310, 'km/h', 'speed', 'adult'),
  ('eurostar', 'Eurostar, Höchstgeschwindigkeit', 300, 'km/h', 'speed', 'adult'),
  ('regionalzug', 'Regionalzug, Spitze', 160, 'km/h', 'speed', 'adult'),
  ('autobahn-tempo', 'Pkw auf Autobahn, typische Spitze', 130, 'km/h', 'speed', 'adult'),
  ('athen', 'Athen, Juli-Mittel', 34, '°C', 'temp', 'adult'),
  ('madrid', 'Madrid, Juli-Mittel', 32, '°C', 'temp', 'adult'),
  ('rom', 'Rom, Juli-Mittel', 30, '°C', 'temp', 'adult'),
  ('mailand-temp', 'Mailand, Juli-Mittel', 29, '°C', 'temp', 'adult'),
  ('paris', 'Paris, Juli-Mittel', 25, '°C', 'temp', 'adult'),
  ('berlin-temp', 'Berlin, Juli-Mittel', 24, '°C', 'temp', 'adult'),
  ('london', 'London, Juli-Mittel', 23, '°C', 'temp', 'adult'),
  ('stockholm', 'Stockholm, Juli-Mittel', 22, '°C', 'temp', 'adult'),
  ('helsinki', 'Helsinki, Juli-Mittel', 21, '°C', 'temp', 'adult'),
  ('oslo', 'Oslo, Juli-Mittel', 17, '°C', 'temp', 'adult'),
  ('reykjavik', 'Reykjavík, Juli-Mittel', 13, '°C', 'temp', 'adult'),
  ('periodensystem', 'Elemente im Periodensystem', 118, 'Stück', 'count', 'adult'),
  ('klavier', 'Tasten eines Klaviers', 88, 'Stück', 'count', 'adult'),
  ('schach', 'Felder auf dem Schachbrett', 64, 'Stück', 'count', 'adult'),
  ('afrika', 'Staaten in Afrika', 54, 'Stück', 'count', 'adult'),
  ('spielkarten', 'Karten im französischen Blatt', 52, 'Stück', 'count', 'adult'),
  ('us-staaten', 'US-Bundesstaaten', 50, 'Stück', 'count', 'adult'),
  ('chromosomen', 'Chromosomen des Menschen', 46, 'Stück', 'count', 'adult'),
  ('shakespeare', 'Shakespeare-Dramen', 39, 'Stück', 'count', 'adult'),
  ('nato', 'NATO-Mitglieder', 32, 'Stück', 'count', 'adult'),
  ('zaehne', 'Zähne eines Erwachsenen', 32, 'Stück', 'count', 'adult'),
  ('eu', 'EU-Mitgliedstaaten', 27, 'Stück', 'count', 'adult'),
  ('k-de', 'Deutschland', 84, 'Mio.', 'population', 'kids'),
  ('k-fr', 'Frankreich', 68, 'Mio.', 'population', 'kids'),
  ('k-uk', 'Vereinigtes Königreich', 67, 'Mio.', 'population', 'kids'),
  ('k-it', 'Italien', 59, 'Mio.', 'population', 'kids'),
  ('k-es', 'Spanien', 48, 'Mio.', 'population', 'kids'),
  ('k-pl', 'Polen', 38, 'Mio.', 'population', 'kids'),
  ('k-nl', 'Niederlande', 18, 'Mio.', 'population', 'kids'),
  ('k-cz', 'Tschechien', 10.9, 'Mio.', 'population', 'kids'),
  ('k-fr-km2', 'Frankreich', 543940, 'km²', 'area', 'kids'),
  ('k-es-km2', 'Spanien', 505990, 'km²', 'area', 'kids'),
  ('k-jp-km2', 'Japan', 377975, 'km²', 'area', 'kids'),
  ('k-de-km2', 'Deutschland', 357588, 'km²', 'area', 'kids'),
  ('k-pl-km2', 'Polen', 312679, 'km²', 'area', 'kids'),
  ('k-it-km2', 'Italien', 301340, 'km²', 'area', 'kids'),
  ('k-uk-km2', 'Vereinigtes Königreich', 243610, 'km²', 'area', 'kids'),
  ('k-liberty', 'Freiheitsstatue', 93, 'm', 'height', 'kids'),
  ('k-dom', 'Kölner Dom', 157, 'm', 'height', 'kids'),
  ('k-eiffel', 'Eiffelturm', 330, 'm', 'height', 'kids'),
  ('k-berlin-h', 'Berliner Fernsehturm', 368, 'm', 'height', 'kids'),
  ('k-mensch', 'Mensch', 77, 'kg', 'weight', 'kids'),
  ('k-panda', 'Panda', 100, 'kg', 'weight', 'kids'),
  ('k-gorilla', 'Gorilla', 160, 'kg', 'weight', 'kids'),
  ('k-loewe', 'Löwe, Männchen', 190, 'kg', 'weight', 'kids'),
  ('k-tiger', 'Tiger, Männchen', 220, 'kg', 'weight', 'kids'),
  ('k-bach', 'Johann Sebastian Bach', 1685, 'Jahr', 'year', 'kids'),
  ('k-vivaldi', 'Antonio Vivaldi', 1678, 'Jahr', 'year', 'kids'),
  ('k-haydn', 'Joseph Haydn', 1732, 'Jahr', 'year', 'kids'),
  ('k-mozart', 'Wolfgang Amadeus Mozart', 1756, 'Jahr', 'year', 'kids'),
  ('k-beethoven', 'Ludwig van Beethoven', 1770, 'Jahr', 'year', 'kids'),
  ('k-chopin', 'Frédéric Chopin', 1810, 'Jahr', 'year', 'kids'),
  ('k-vangogh', 'Vincent van Gogh', 1853, 'Jahr', 'year', 'kids'),
  ('k-picasso', 'Pablo Picasso', 1881, 'Jahr', 'year', 'kids'),
  ('k-bolt', 'Usain Bolt', 38, 'km/h', 'speed', 'kids'),
  ('k-pferd-kmh', 'Pferd im Galopp', 45, 'km/h', 'speed', 'kids'),
  ('k-delphin', 'Delfin', 55, 'km/h', 'speed', 'kids'),
  ('k-windhund', 'Windhund', 70, 'km/h', 'speed', 'kids'),
  ('k-gepard', 'Gepard', 110, 'km/h', 'speed', 'kids'),
  ('k-hh', 'Berlin–Hamburg', 289, 'km', 'distance', 'kids'),
  ('k-prag', 'Berlin–Prag', 350, 'km', 'distance', 'kids'),
  ('k-koeln', 'Hamburg–Köln', 430, 'km', 'distance', 'kids'),
  ('k-berlin-muc', 'Berlin–München', 585, 'km', 'distance', 'kids'),
  ('k-hh-muc', 'Hamburg–München', 790, 'km', 'distance', 'kids'),
  ('k-zimmer', 'Zimmertemperatur', 20, '°C', 'temp', 'kids'),
  ('k-fruehling', 'Milder Frühlingstag', 22, '°C', 'temp', 'kids'),
  ('k-sommer', 'Sommertag', 28, '°C', 'temp', 'kids'),
  ('k-koerper', 'Körpertemperatur', 37, '°C', 'temp', 'kids'),
  ('k-wueste', 'Wüste am Tag', 45, '°C', 'temp', 'kids'),
  ('k-insekt', 'Beine eines Insekts', 6, 'Stück', 'count', 'kids'),
  ('k-kontinente', 'Kontinente', 7, 'Stück', 'count', 'kids'),
  ('k-planeten', 'Planeten im Sonnensystem', 8, 'Stück', 'count', 'kids'),
  ('k-spinne', 'Beine einer Spinne', 8, 'Stück', 'count', 'kids'),
  ('k-milchzaehne', 'Milchzähne', 20, 'Stück', 'count', 'kids');

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

CREATE OR REPLACE FUNCTION is_subset_pair(p_a jsonb, p_b jsonb)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM (VALUES
      ('deutschland', 'berlin'),
      ('k-de', 'berlin'),
      ('k-de', 'hamburg'),
      ('k-de', 'muenchen'),
      ('k-de', 'koeln-stadt'),
      ('oesterreich', 'wien'),
      ('k-it', 'mailand'),
      ('k-fr', 'paris'),
      ('k-es', 'barcelona'),
      ('k-es', 'madrid'),
      ('k-uk', 'london'),
      ('k-pl', 'warschau')
    ) AS t(x, y)
    WHERE (p_a->>'id' = x AND p_b->>'id' = y)
       OR (p_a->>'id' = y AND p_b->>'id' = x)
  );
$$;

CREATE OR REPLACE FUNCTION pair_fits_density(p_a jsonb, p_b jsonb, p_density text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_axis text := coalesce(p_a->>'axis', p_a->>'unit');
  va numeric := (p_a->>'value')::numeric;
  vb numeric := (p_b->>'value')::numeric;
  hi numeric;
  lo numeric;
  ratio numeric;
  gap numeric;
BEGIN
  IF p_a->>'id' IS NULL OR p_b->>'id' IS NULL OR p_a->>'id' = p_b->>'id' THEN
    RETURN false;
  END IF;
  IF coalesce(p_b->>'axis', p_b->>'unit') IS DISTINCT FROM v_axis THEN
    RETURN false;
  END IF;
  IF is_subset_pair(p_a, p_b) THEN
    RETURN false;
  END IF;
  IF va IS NULL OR vb IS NULL THEN
    RETURN false;
  END IF;

  IF v_axis = 'year' THEN
    gap := abs(va - vb);
    IF gap = 0 THEN
      RETURN false;
    END IF;
    IF p_density = 'haarscharf' THEN
      RETURN gap >= 5 AND gap < 25;
    END IF;
    IF p_density = 'knackig' THEN
      RETURN gap >= 25 AND gap < 60;
    END IF;
    RETURN gap >= 60 AND gap <= 120;
  END IF;

  hi := greatest(abs(va), abs(vb));
  lo := least(abs(va), abs(vb));
  IF lo = 0 THEN
    RETURN false;
  END IF;
  ratio := hi / lo;
  IF ratio > 4 THEN
    RETURN false;
  END IF;
  IF p_density = 'haarscharf' THEN
    RETURN ratio >= 1.05 AND ratio <= 1.3;
  END IF;
  IF p_density = 'knackig' THEN
    RETURN ratio > 1.3 AND ratio <= 2;
  END IF;
  RETURN ratio > 2 AND ratio <= 4;
END;
$$;

CREATE OR REPLACE FUNCTION deal_fresh_pair(
  p_pool jsonb,
  p_catalog jsonb,
  p_density text,
  p_exclude_axis text
) RETURNS deal_result
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  v_a jsonb;
  v_b jsonb;
  v_source jsonb;
  v_density text := coalesce(p_density, 'knackig');
BEGIN
  IF v_density NOT IN ('locker', 'knackig', 'haarscharf') THEN
    v_density := 'knackig';
  END IF;

  v_source := coalesce(p_pool, '[]'::jsonb);
  SELECT a, b INTO v_a, v_b
  FROM jsonb_array_elements(v_source) a
  JOIN jsonb_array_elements(v_source) b ON a->>'id' < b->>'id'
  WHERE pair_fits_density(a, b, v_density)
    AND (p_exclude_axis IS NULL OR coalesce(a->>'axis', a->>'unit') IS DISTINCT FROM p_exclude_axis)
  ORDER BY random()
  LIMIT 1;

  IF v_a IS NULL THEN
    v_source := coalesce(p_catalog, '[]'::jsonb);
    SELECT a, b INTO v_a, v_b
    FROM jsonb_array_elements(v_source) a
    JOIN jsonb_array_elements(v_source) b ON a->>'id' < b->>'id'
    WHERE pair_fits_density(a, b, v_density)
      AND (p_exclude_axis IS NULL OR coalesce(a->>'axis', a->>'unit') IS DISTINCT FROM p_exclude_axis)
    ORDER BY random()
    LIMIT 1;
  END IF;

  IF v_a IS NULL OR v_b IS NULL THEN
    RETURN (NULL, NULL, coalesce(p_pool, '[]'::jsonb));
  END IF;

  IF random() < 0.5 THEN
    RETURN (
      v_a,
      v_b,
      remove_card_id(remove_card_id(v_source, v_a->>'id'), v_b->>'id')
    );
  END IF;

  RETURN (
    v_b,
    v_a,
    remove_card_id(remove_card_id(v_source, v_a->>'id'), v_b->>'id')
  );
END;
$$;

CREATE OR REPLACE FUNCTION deal_opening_pair(p_pool jsonb, p_density text)
RETURNS deal_result
LANGUAGE sql
VOLATILE
AS $$
  SELECT deal_fresh_pair(p_pool, p_pool, p_density, NULL);
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
      VALUES (
        v_code,
        v_players,
        p_player_id,
        'lobby',
        v_max,
        jsonb_build_object(p_player_id, 'adult'),
        'adult'
      )
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

CREATE OR REPLACE FUNCTION create_room(p_player_id text, p_name text)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT create_room(p_player_id, p_name, 3);
$$;

CREATE OR REPLACE FUNCTION start_solo(p_player_id text, p_name text, p_mode text, p_density text)
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
  v_catalog jsonb;
  d deal_result;
  v_lives integer;
  v_density text := coalesce(p_density, 'knackig');
BEGIN
  IF p_player_id IS NULL OR length(p_player_id) < 8 OR length(p_player_id) > 80 THEN
    RAISE EXCEPTION 'Ungültige Spieler-ID.';
  END IF;
  IF v_name IS NULL OR length(v_name) < 1 OR length(v_name) > 20 THEN
    RAISE EXCEPTION 'Bitte gib einen Namen (1–20 Zeichen) ein.';
  END IF;
  IF p_mode IS DISTINCT FROM 'adult' AND p_mode IS DISTINCT FROM 'kids' THEN
    RAISE EXCEPTION 'Bitte wähle Erwachsene oder Kinder.';
  END IF;
  IF v_density NOT IN ('locker', 'knackig', 'haarscharf') THEN
    RAISE EXCEPTION 'Bitte wähle Locker, Knackig oder Haarscharf.';
  END IF;

  v_players := jsonb_build_array(jsonb_build_object('id', p_player_id, 'name', v_name));
  v_lives := CASE WHEN p_mode = 'kids' THEN 5 ELSE 3 END;
  v_catalog := load_catalog(p_mode);
  d := deal_opening_pair(v_catalog, v_density);
  IF d.current_card IS NULL OR d.next_card IS NULL THEN
    RAISE EXCEPTION 'Kartenstapel ist unvollständig.';
  END IF;

  FOR i IN 1..24 LOOP
    v_code :=
      chr(65 + floor(random() * 26)::int) ||
      chr(65 + floor(random() * 26)::int) ||
      chr(65 + floor(random() * 26)::int) ||
      chr(65 + floor(random() * 26)::int);
    BEGIN
      INSERT INTO rooms (
        room_code, players, host_id, game_status, max_players, votes, selected_mode,
        selected_density, current_player_index, lives, streak, current_card, next_card,
        remaining_cards, used_card_ids, last_result, turn_nonce
      ) VALUES (
        v_code, v_players, p_player_id, 'playing', 1,
        jsonb_build_object(p_player_id, p_mode), p_mode, v_density,
        0, v_lives, 0, d.current_card, d.next_card, d.remaining,
        used_card_ids(v_catalog, d.remaining), NULL, 1
      )
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

CREATE OR REPLACE FUNCTION start_solo(p_player_id text, p_name text, p_mode text)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT start_solo(p_player_id, p_name, p_mode, 'knackig');
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

CREATE OR REPLACE FUNCTION set_density(p_room_code text, p_player_id text, p_density text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text := upper(trim(p_room_code));
  r rooms%ROWTYPE;
BEGIN
  IF p_density NOT IN ('locker', 'knackig', 'haarscharf') THEN
    RAISE EXCEPTION 'Bitte wähle Locker, Knackig oder Haarscharf.';
  END IF;

  SELECT * INTO r FROM rooms WHERE room_code = v_code FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Raum nicht gefunden.';
  END IF;
  IF r.game_status IS DISTINCT FROM 'lobby' THEN
    RAISE EXCEPTION 'Dichte nur in der Lobby.';
  END IF;
  IF r.host_id IS DISTINCT FROM p_player_id THEN
    RAISE EXCEPTION 'Nur der Host legt die Dichte fest.';
  END IF;

  UPDATE rooms
  SET selected_density = p_density
  WHERE room_code = v_code
  RETURNING * INTO r;

  RETURN to_jsonb(r);
END;
$$;

CREATE OR REPLACE FUNCTION start_game(p_room_code text, p_player_id text, p_mode text DEFAULT NULL)
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

  IF v_max = 1 THEN
    IF p_mode IS DISTINCT FROM 'adult' AND p_mode IS DISTINCT FROM 'kids' THEN
      RAISE EXCEPTION 'Bitte wähle Erwachsene oder Kinder.';
    END IF;
    v_mode := p_mode;
  ELSE
    v_mode := winning_mode(r.votes, r.host_id);
  END IF;
  v_lives := CASE WHEN v_mode = 'kids' THEN 5 ELSE 3 END;
  v_catalog := load_catalog(v_mode);
  d := deal_opening_pair(v_catalog, coalesce(r.selected_density, 'knackig'));
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

CREATE OR REPLACE FUNCTION start_game(p_room_code text, p_player_id text)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT start_game(p_room_code, p_player_id, NULL);
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
    END IF;
  END IF;

  IF v_status = 'playing' THEN
    d := deal_fresh_pair(
      r.remaining_cards,
      v_catalog,
      coalesce(r.selected_density, 'knackig'),
      coalesce(r.current_card->>'axis', r.current_card->>'unit')
    );
    v_current := d.current_card;
    v_next := d.next_card;
    v_remaining := d.remaining;
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
  d := deal_opening_pair(v_catalog, coalesce(r.selected_density, 'knackig'));
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

GRANT EXECUTE ON FUNCTION create_room(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_room(text, text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION join_room(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION vote_mode(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION set_density(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION start_solo(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION start_solo(text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION start_game(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION start_game(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_guess(text, text, text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION restart_game(text, text) TO anon, authenticated;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;
