-- High & Low: Team-Stapel
-- Komplett im SQL-Editor einfügen und ausführen (idempotent, überschreibt den Kartenstapel).

DROP FUNCTION IF EXISTS vote_mode(text, text, text);
DROP FUNCTION IF EXISTS set_play_style(text, text, text);
DROP FUNCTION IF EXISTS init_player_lives(jsonb, integer);
DROP FUNCTION IF EXISTS alive_count(jsonb);
DROP FUNCTION IF EXISTS sole_survivor_id(jsonb);
DROP FUNCTION IF EXISTS next_alive_index(jsonb, jsonb, integer);
DROP FUNCTION IF EXISTS set_density(text, text, text);
DROP FUNCTION IF EXISTS submit_guess(text, text, text, integer);
DROP FUNCTION IF EXISTS restart_game(text, text);
DROP FUNCTION IF EXISTS start_solo(text, text, text);
DROP FUNCTION IF EXISTS start_solo(text, text, text, text);
DROP FUNCTION IF EXISTS start_solo(text, text, text);
DROP FUNCTION IF EXISTS start_solo(text, text);
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
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS play_style text NOT NULL DEFAULT 'team';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS player_lives jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS winner_id text;

ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_max_players_range;
ALTER TABLE rooms ADD CONSTRAINT rooms_max_players_range CHECK (max_players BETWEEN 1 AND 6);
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_max_players_ok;
ALTER TABLE rooms ADD CONSTRAINT rooms_max_players_ok CHECK (max_players BETWEEN 1 AND 6);
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_selected_mode_ok;
UPDATE rooms SET selected_mode = 'adult' WHERE selected_mode IS DISTINCT FROM 'adult';
ALTER TABLE rooms ADD CONSTRAINT rooms_selected_mode_ok CHECK (selected_mode IN ('adult'));
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_selected_density_ok;
UPDATE rooms SET selected_density = 'knackig'
  WHERE selected_density IS NULL OR selected_density NOT IN ('locker', 'knackig', 'haarscharf');
ALTER TABLE rooms ADD CONSTRAINT rooms_selected_density_ok CHECK (selected_density IN ('locker', 'knackig', 'haarscharf'));
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_play_style_ok;
UPDATE rooms SET play_style = 'team' WHERE play_style IS NULL OR play_style NOT IN ('team', 'versus');
ALTER TABLE rooms ADD CONSTRAINT rooms_play_style_ok CHECK (play_style IN ('team', 'versus'));
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_votes_object;
UPDATE rooms SET votes = '{}'::jsonb WHERE votes IS NULL OR jsonb_typeof(votes) IS DISTINCT FROM 'object';
ALTER TABLE rooms ADD CONSTRAINT rooms_votes_object CHECK (jsonb_typeof(votes) = 'object');
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_player_lives_object;
UPDATE rooms SET player_lives = '{}'::jsonb
  WHERE player_lives IS NULL OR jsonb_typeof(player_lives) IS DISTINCT FROM 'object';
ALTER TABLE rooms ADD CONSTRAINT rooms_player_lives_object CHECK (jsonb_typeof(player_lives) = 'object');

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
  ('bukarest', 'Bukarest (Stadt)', 1.7, 'Mio.', 'population', 'adult'),
  ('muenchen', 'München (Stadt)', 1.51, 'Mio.', 'population', 'adult'),
  ('prag', 'Prag (Stadt)', 1.38, 'Mio.', 'population', 'adult'),
  ('mailand', 'Mailand (Stadt)', 1.37, 'Mio.', 'population', 'adult'),
  ('sofia', 'Sofia (Stadt)', 1.23, 'Mio.', 'population', 'adult'),
  ('belgrad', 'Belgrad (Stadt)', 1.2, 'Mio.', 'population', 'adult'),
  ('koeln-stadt', 'Köln (Stadt)', 1.09, 'Mio.', 'population', 'adult'),
  ('stockholm-stadt', 'Stockholm (Stadt)', 0.99, 'Mio.', 'population', 'adult'),
  ('amsterdam', 'Amsterdam (Stadt)', 0.92, 'Mio.', 'population', 'adult'),
  ('marseille', 'Marseille (Stadt)', 0.87, 'Mio.', 'population', 'adult'),
  ('turin', 'Turin (Stadt)', 0.85, 'Mio.', 'population', 'adult'),
  ('valencia', 'Valencia (Stadt)', 0.8, 'Mio.', 'population', 'adult'),
  ('frankfurt', 'Frankfurt am Main (Stadt)', 0.76, 'Mio.', 'population', 'adult'),
  ('stuttgart', 'Stuttgart (Stadt)', 0.63, 'Mio.', 'population', 'adult'),
  ('dublin', 'Dublin (Stadt)', 0.59, 'Mio.', 'population', 'adult'),
  ('lissabon', 'Lissabon (Stadt)', 0.55, 'Mio.', 'population', 'adult'),
  ('griechenland', 'Griechenland', 131957, 'km²', 'area', 'adult'),
  ('nicaragua', 'Nicaragua', 130373, 'km²', 'area', 'adult'),
  ('nordkorea', 'Nordkorea', 120538, 'km²', 'area', 'adult'),
  ('honduras', 'Honduras', 112492, 'km²', 'area', 'adult'),
  ('portugal', 'Portugal', 92212, 'km²', 'area', 'adult'),
  ('jordanien', 'Jordanien', 89342, 'km²', 'area', 'adult'),
  ('aserbaidschan', 'Aserbaidschan', 86600, 'km²', 'area', 'adult'),
  ('oesterreich', 'Österreich', 83879, 'km²', 'area', 'adult'),
  ('vae', 'Vereinigte Arabische Emirate', 83600, 'km²', 'area', 'adult'),
  ('tschechien', 'Tschechien', 78871, 'km²', 'area', 'adult'),
  ('panama', 'Panama', 75417, 'km²', 'area', 'adult'),
  ('irland', 'Irland (Staat)', 70273, 'km²', 'area', 'adult'),
  ('litauen', 'Litauen', 65300, 'km²', 'area', 'adult'),
  ('lettland', 'Lettland', 64589, 'km²', 'area', 'adult'),
  ('kroatien', 'Kroatien', 56594, 'km²', 'area', 'adult'),
  ('bosnien', 'Bosnien und Herzegowina', 51197, 'km²', 'area', 'adult'),
  ('costa-rica', 'Costa Rica', 51100, 'km²', 'area', 'adult'),
  ('slowakei', 'Slowakei', 49035, 'km²', 'area', 'adult'),
  ('dominikanische', 'Dominikanische Republik', 48671, 'km²', 'area', 'adult'),
  ('estland', 'Estland', 45227, 'km²', 'area', 'adult'),
  ('daenemark', 'Dänemark', 42933, 'km²', 'area', 'adult'),
  ('niederlande', 'Niederlande', 41543, 'km²', 'area', 'adult'),
  ('schweiz', 'Schweiz', 41285, 'km²', 'area', 'adult'),
  ('bhutan', 'Bhutan', 38394, 'km²', 'area', 'adult'),
  ('taiwan', 'Taiwan', 36197, 'km²', 'area', 'adult'),
  ('belgien', 'Belgien', 30689, 'km²', 'area', 'adult'),
  ('one-world', 'One World Trade Center', 541, 'm', 'height', 'adult'),
  ('taipei-101', 'Taipei 101', 508, 'm', 'height', 'adult'),
  ('landmark-72', 'Landmark 72, Hanoi', 461, 'm', 'height', 'adult'),
  ('petronas', 'Petronas Towers', 452, 'm', 'height', 'adult'),
  ('empire-state', 'Empire State Building (mit Antenne)', 443, 'm', 'height', 'adult'),
  ('willis', 'Willis Tower, Chicago', 442, 'm', 'height', 'adult'),
  ('jin-mao', 'Jin-Mao-Turm, Shanghai', 421, 'm', 'height', 'adult'),
  ('two-ifc', 'Two IFC, Hongkong', 415, 'm', 'height', 'adult'),
  ('fernsehturm', 'Berliner Fernsehturm', 368, 'm', 'height', 'adult'),
  ('bank-of-china', 'Bank of China Tower, Hongkong', 367, 'm', 'height', 'adult'),
  ('eiffelturm-hoehe', 'Eiffelturm', 330, 'm', 'height', 'adult'),
  ('chrysler', 'Chrysler Building', 319, 'm', 'height', 'adult'),
  ('shard', 'The Shard, London', 310, 'm', 'height', 'adult'),
  ('eureka', 'Eureka Tower, Melbourne', 297, 'm', 'height', 'adult'),
  ('commerzbank', 'Commerzbank-Tower', 259, 'm', 'height', 'adult'),
  ('messeturm', 'Messeturm, Frankfurt', 257, 'm', 'height', 'adult'),
  ('montparnasse', 'Tour Montparnasse', 210, 'm', 'height', 'adult'),
  ('washington-monument', 'Washington Monument', 169, 'm', 'height', 'adult'),
  ('koelner-dom', 'Kölner Dom', 157, 'm', 'height', 'adult'),
  ('ulmer-muenster', 'Ulmer Münster', 161, 'm', 'height', 'adult'),
  ('pferd', 'Warmblutpferd', 500, 'kg', 'weight', 'adult'),
  ('zebra', 'Steppenzebra', 350, 'kg', 'weight', 'adult'),
  ('braunbaer', 'Europäischer Braunbär', 250, 'kg', 'weight', 'adult'),
  ('tiger-m', 'Tiger, Männchen', 220, 'kg', 'weight', 'adult'),
  ('loewe-m', 'Löwe, Männchen', 190, 'kg', 'weight', 'adult'),
  ('gorilla', 'Westlicher Flachlandgorilla, Männchen', 160, 'kg', 'weight', 'adult'),
  ('delfin', 'Großer Tümmler', 150, 'kg', 'weight', 'adult'),
  ('schwarzbaer', 'Amerikanischer Schwarzbär', 135, 'kg', 'weight', 'adult'),
  ('rentier', 'Rentier', 120, 'kg', 'weight', 'adult'),
  ('panda', 'Großer Panda', 100, 'kg', 'weight', 'adult'),
  ('wildschwein', 'Mitteleuropäisches Wildschwein', 90, 'kg', 'weight', 'adult'),
  ('orang-utan', 'Orang-Utan, Männchen', 85, 'kg', 'weight', 'adult'),
  ('kaenguru', 'Rotes Riesenkänguru', 85, 'kg', 'weight', 'adult'),
  ('seehund', 'Seehund', 85, 'kg', 'weight', 'adult'),
  ('jaguar', 'Jaguar', 80, 'kg', 'weight', 'adult'),
  ('warzenschwein', 'Warzenschwein', 80, 'kg', 'weight', 'adult'),
  ('mensch', 'Durchschnittsmensch (DE)', 77, 'kg', 'weight', 'adult'),
  ('hyaene', 'Tüpfelhyäne', 70, 'kg', 'weight', 'adult'),
  ('puma', 'Puma', 62, 'kg', 'weight', 'adult'),
  ('schimpanse', 'Schimpanse, Männchen', 45, 'kg', 'weight', 'adult'),
  ('wolf', 'Europäischer Wolf', 40, 'kg', 'weight', 'adult'),
  ('kaiman', 'Brillenkaiman', 40, 'kg', 'weight', 'adult'),
  ('leonardo', 'Leonardo da Vinci', 1452, 'Jahr', 'year', 'adult'),
  ('duerer', 'Albrecht Dürer', 1471, 'Jahr', 'year', 'adult'),
  ('michelangelo', 'Michelangelo', 1475, 'Jahr', 'year', 'adult'),
  ('raphael', 'Raffael', 1483, 'Jahr', 'year', 'adult'),
  ('galilei', 'Galileo Galilei', 1564, 'Jahr', 'year', 'adult'),
  ('rembrandt', 'Rembrandt', 1606, 'Jahr', 'year', 'adult'),
  ('newton', 'Isaac Newton', 1643, 'Jahr', 'year', 'adult'),
  ('vivaldi', 'Antonio Vivaldi', 1678, 'Jahr', 'year', 'adult'),
  ('bach', 'Johann Sebastian Bach', 1685, 'Jahr', 'year', 'adult'),
  ('kant', 'Immanuel Kant', 1724, 'Jahr', 'year', 'adult'),
  ('haydn', 'Joseph Haydn', 1732, 'Jahr', 'year', 'adult'),
  ('goethe', 'Johann Wolfgang von Goethe', 1749, 'Jahr', 'year', 'adult'),
  ('mozart', 'Wolfgang Amadeus Mozart', 1756, 'Jahr', 'year', 'adult'),
  ('schiller', 'Friedrich Schiller', 1759, 'Jahr', 'year', 'adult'),
  ('beethoven', 'Ludwig van Beethoven', 1770, 'Jahr', 'year', 'adult'),
  ('chopin', 'Frédéric Chopin', 1810, 'Jahr', 'year', 'adult'),
  ('dickens', 'Charles Dickens', 1812, 'Jahr', 'year', 'adult'),
  ('brahms', 'Johannes Brahms', 1833, 'Jahr', 'year', 'adult'),
  ('twain', 'Mark Twain', 1835, 'Jahr', 'year', 'adult'),
  ('vangogh', 'Vincent van Gogh', 1853, 'Jahr', 'year', 'adult'),
  ('freud', 'Sigmund Freud', 1856, 'Jahr', 'year', 'adult'),
  ('debussy', 'Claude Debussy', 1862, 'Jahr', 'year', 'adult'),
  ('curie', 'Marie Curie', 1867, 'Jahr', 'year', 'adult'),
  ('einstein', 'Albert Einstein', 1879, 'Jahr', 'year', 'adult'),
  ('picasso', 'Pablo Picasso', 1881, 'Jahr', 'year', 'adult'),
  ('kafka', 'Franz Kafka', 1883, 'Jahr', 'year', 'adult'),
  ('orwell', 'George Orwell', 1903, 'Jahr', 'year', 'adult'),
  ('a7', 'Autobahn A7', 963, 'km', 'distance', 'adult'),
  ('hamburg-muenchen', 'Hamburg–München (Straße)', 790, 'km', 'distance', 'adult'),
  ('a3', 'Autobahn A3', 778, 'km', 'distance', 'adult'),
  ('a1', 'Autobahn A1', 732, 'km', 'distance', 'adult'),
  ('berlin-wien', 'Berlin–Wien (Straße)', 680, 'km', 'distance', 'adult'),
  ('berlin-amsterdam', 'Berlin–Amsterdam (Straße)', 650, 'km', 'distance', 'adult'),
  ('a4', 'Autobahn A4', 616, 'km', 'distance', 'adult'),
  ('berlin-muenchen', 'Berlin–München (Straße)', 585, 'km', 'distance', 'adult'),
  ('frankfurt-paris', 'Frankfurt–Paris (Straße)', 570, 'km', 'distance', 'adult'),
  ('a9', 'Autobahn A9', 529, 'km', 'distance', 'adult'),
  ('a8', 'Autobahn A8', 505, 'km', 'distance', 'adult'),
  ('hamburg-frankfurt', 'Hamburg–Frankfurt (Straße)', 490, 'km', 'distance', 'adult'),
  ('a2', 'Autobahn A2', 486, 'km', 'distance', 'adult'),
  ('a6', 'Autobahn A6', 477, 'km', 'distance', 'adult'),
  ('a5', 'Autobahn A5', 445, 'km', 'distance', 'adult'),
  ('hamburg-koeln', 'Hamburg–Köln (Straße)', 430, 'km', 'distance', 'adult'),
  ('frankfurt-muenchen', 'Frankfurt–München (Straße)', 390, 'km', 'distance', 'adult'),
  ('berlin-prag', 'Berlin–Prag (Straße)', 350, 'km', 'distance', 'adult'),
  ('berlin-hamburg', 'Berlin–Hamburg (Straße)', 289, 'km', 'distance', 'adult'),
  ('koeln-amsterdam', 'Köln–Amsterdam (Straße)', 280, 'km', 'distance', 'adult'),
  ('muenchen-stuttgart', 'München–Stuttgart (Straße)', 220, 'km', 'distance', 'adult'),
  ('flug-cruise', 'Verkehrsflugzeug, Reisegeschwindigkeit', 900, 'km/h', 'speed', 'adult'),
  ('maglev', 'Shanghai Maglev, Spitze', 431, 'km/h', 'speed', 'adult'),
  ('chiron', 'Bugatti Chiron, Spitze', 420, 'km/h', 'speed', 'adult'),
  ('f1', 'Formel-1-Auto, Spitze', 370, 'km/h', 'speed', 'adult'),
  ('velaro', 'Velaro, Höchstgeschwindigkeit', 350, 'km/h', 'speed', 'adult'),
  ('ice', 'ICE 3, Höchstgeschwindigkeit', 330, 'km/h', 'speed', 'adult'),
  ('shinkansen', 'Shinkansen, Höchstgeschwindigkeit', 320, 'km/h', 'speed', 'adult'),
  ('wanderfalke', 'Sturzflug Wanderfalke', 320, 'km/h', 'speed', 'adult'),
  ('tgv', 'TGV, Höchstgeschwindigkeit', 320, 'km/h', 'speed', 'adult'),
  ('ave', 'AVE, Höchstgeschwindigkeit', 310, 'km/h', 'speed', 'adult'),
  ('eurostar', 'Eurostar, Höchstgeschwindigkeit', 300, 'km/h', 'speed', 'adult'),
  ('frecciarossa', 'Frecciarossa, Höchstgeschwindigkeit', 300, 'km/h', 'speed', 'adult'),
  ('ice4', 'ICE 4, Höchstgeschwindigkeit', 250, 'km/h', 'speed', 'adult'),
  ('regionalzug', 'Regionalzug, Spitze', 160, 'km/h', 'speed', 'adult'),
  ('autobahn-tempo', 'Pkw auf Autobahn, typische Spitze', 130, 'km/h', 'speed', 'adult'),
  ('gepard', 'Gepard, Spitze', 110, 'km/h', 'speed', 'adult'),
  ('windhund', 'Windhund, Spitze', 70, 'km/h', 'speed', 'adult'),
  ('dubai-temp', 'Dubai, Juli-Mittel', 41, '°C', 'temp', 'adult'),
  ('kairo', 'Kairo, Juli-Mittel', 35, '°C', 'temp', 'adult'),
  ('sevilla', 'Sevilla, Juli-Mittel', 36, '°C', 'temp', 'adult'),
  ('athen', 'Athen, Juli-Mittel', 34, '°C', 'temp', 'adult'),
  ('madrid', 'Madrid, Juli-Mittel', 32, '°C', 'temp', 'adult'),
  ('ankara', 'Ankara, Juli-Mittel', 30, '°C', 'temp', 'adult'),
  ('rom', 'Rom, Juli-Mittel', 30, '°C', 'temp', 'adult'),
  ('mailand-temp', 'Mailand, Juli-Mittel', 29, '°C', 'temp', 'adult'),
  ('istanbul', 'Istanbul, Juli-Mittel', 28, '°C', 'temp', 'adult'),
  ('budapest-temp', 'Budapest, Juli-Mittel', 27, '°C', 'temp', 'adult'),
  ('paris', 'Paris, Juli-Mittel', 25, '°C', 'temp', 'adult'),
  ('wien-temp', 'Wien, Juli-Mittel', 25, '°C', 'temp', 'adult'),
  ('berlin-temp', 'Berlin, Juli-Mittel', 24, '°C', 'temp', 'adult'),
  ('london', 'London, Juli-Mittel', 23, '°C', 'temp', 'adult'),
  ('warschau-temp', 'Warschau, Juli-Mittel', 23, '°C', 'temp', 'adult'),
  ('stockholm', 'Stockholm, Juli-Mittel', 22, '°C', 'temp', 'adult'),
  ('helsinki', 'Helsinki, Juli-Mittel', 21, '°C', 'temp', 'adult'),
  ('oslo', 'Oslo, Juli-Mittel', 17, '°C', 'temp', 'adult'),
  ('reykjavik', 'Reykjavík, Juli-Mittel', 13, '°C', 'temp', 'adult'),
  ('fifa', 'FIFA-Mitgliedsverbände', 211, 'Stück', 'count', 'adult'),
  ('knochen', 'Knochen im Erwachsenenskelett', 206, 'Stück', 'count', 'adult'),
  ('laender', 'UN-Mitgliedstaaten', 193, 'Stück', 'count', 'adult'),
  ('mahjong', 'Steine im Mahjong-Set', 144, 'Stück', 'count', 'adult'),
  ('periodensystem', 'Elemente im Periodensystem', 118, 'Stück', 'count', 'adult'),
  ('tastatur', 'Tasten einer Standard-Tastatur', 104, 'Stück', 'count', 'adult'),
  ('klavier', 'Tasten eines Klaviers', 88, 'Stück', 'count', 'adult'),
  ('schach', 'Felder auf dem Schachbrett', 64, 'Stück', 'count', 'adult'),
  ('orgel-manual', 'Tasten eines Orgel-Manuals', 61, 'Stück', 'count', 'adult'),
  ('afrika', 'Staaten in Afrika', 54, 'Stück', 'count', 'adult'),
  ('spielkarten', 'Karten im französischen Blatt', 52, 'Stück', 'count', 'adult'),
  ('us-staaten', 'US-Bundesstaaten', 50, 'Stück', 'count', 'adult'),
  ('chromosomen', 'Chromosomen des Menschen', 46, 'Stück', 'count', 'adult'),
  ('akkordeon', 'Tasten eines Piano-Akkordeons (Diskant)', 41, 'Stück', 'count', 'adult'),
  ('shakespeare', 'Shakespeare-Dramen', 39, 'Stück', 'count', 'adult'),
  ('nato', 'NATO-Mitglieder', 32, 'Stück', 'count', 'adult'),
  ('zaehne', 'Zähne eines Erwachsenen', 32, 'Stück', 'count', 'adult'),
  ('domino', 'Steine im Doppel-Sechs-Domino', 28, 'Stück', 'count', 'adult'),
  ('eu', 'EU-Mitgliedstaaten', 27, 'Stück', 'count', 'adult'),
  ('flug-nrt', 'Flug Frankfurt–Tokio', 700, 'Min.', 'duration', 'adult'),
  ('flug-sfo', 'Flug Frankfurt–San Francisco', 660, 'Min.', 'duration', 'adult'),
  ('titanic-film', 'Titanic (Film)', 194, 'Min.', 'duration', 'adult'),
  ('lotr-fellowship', 'Der Herr der Ringe: Die Gefährten', 178, 'Min.', 'duration', 'adult'),
  ('hobbit', 'Der Hobbit: Eine unerwartete Reise', 169, 'Min.', 'duration', 'adult'),
  ('interstellar', 'Interstellar', 169, 'Min.', 'duration', 'adult'),
  ('flug-mad', 'Flug Frankfurt–Madrid', 165, 'Min.', 'duration', 'adult'),
  ('avatar', 'Avatar', 162, 'Min.', 'duration', 'adult'),
  ('amadeus', 'Amadeus', 160, 'Min.', 'duration', 'adult'),
  ('pulp', 'Pulp Fiction', 154, 'Min.', 'duration', 'adult'),
  ('inception', 'Inception', 148, 'Min.', 'duration', 'adult'),
  ('forrest', 'Forrest Gump', 142, 'Min.', 'duration', 'adult'),
  ('matrix', 'Matrix', 136, 'Min.', 'duration', 'adult'),
  ('parasite', 'Parasite', 132, 'Min.', 'duration', 'adult'),
  ('flug-bcn', 'Flug Frankfurt–Barcelona', 125, 'Min.', 'duration', 'adult'),
  ('flug-lhr', 'Flug Frankfurt–London', 90, 'Min.', 'duration', 'adult'),
  ('flug-ams', 'Flug Frankfurt–Amsterdam', 70, 'Min.', 'duration', 'adult'),
  ('tv-folge', 'Typische TV-Drama-Folge', 45, 'Min.', 'duration', 'adult'),
  ('sitcom', 'Typische Sitcom-Folge', 22, 'Min.', 'duration', 'adult'),
  ('baikal', 'Baikalsee, max. Tiefe', 1642, 'm', 'depth', 'adult'),
  ('tanganjika', 'Tanganjikasee, max. Tiefe', 1470, 'm', 'depth', 'adult'),
  ('kaspisch', 'Kaspisches Meer, max. Tiefe', 1025, 'm', 'depth', 'adult'),
  ('malawi', 'Malawisee, max. Tiefe', 706, 'm', 'depth', 'adult'),
  ('issyk', 'Issyk-Kul, max. Tiefe', 668, 'm', 'depth', 'adult'),
  ('superior', 'Oberer See, max. Tiefe', 406, 'm', 'depth', 'adult'),
  ('como', 'Comer See, max. Tiefe', 425, 'm', 'depth', 'adult'),
  ('maggiore', 'Lago Maggiore, max. Tiefe', 370, 'm', 'depth', 'adult'),
  ('garda', 'Gardasee, max. Tiefe', 346, 'm', 'depth', 'adult'),
  ('genf', 'Genfersee, max. Tiefe', 310, 'm', 'depth', 'adult'),
  ('totes-meer', 'Totes Meer, max. Tiefe', 306, 'm', 'depth', 'adult'),
  ('michigan', 'Michigansee, max. Tiefe', 281, 'm', 'depth', 'adult'),
  ('bodensee', 'Bodensee, max. Tiefe', 254, 'm', 'depth', 'adult'),
  ('huron', 'Huronsee, max. Tiefe', 229, 'm', 'depth', 'adult'),
  ('vierwald', 'Vierwaldstättersee, max. Tiefe', 214, 'm', 'depth', 'adult'),
  ('zuerich', 'Zürichsee, max. Tiefe', 136, 'm', 'depth', 'adult'),
  ('chiemsee', 'Chiemsee, max. Tiefe', 73, 'm', 'depth', 'adult'),
  ('mueritz', 'Müritz, max. Tiefe', 31, 'm', 'depth', 'adult'),
  ('bugatti-ps', 'Bugatti Chiron', 1500, 'PS', 'power', 'adult'),
  ('ferrari-sf90', 'Ferrari SF90 Stradale', 1000, 'PS', 'power', 'adult'),
  ('lambo-revuelto', 'Lamborghini Revuelto', 1015, 'PS', 'power', 'adult'),
  ('porsche-turbo-s', 'Porsche 911 Turbo S', 650, 'PS', 'power', 'adult'),
  ('amg-gt', 'Mercedes-AMG GT 63 S', 630, 'PS', 'power', 'adult'),
  ('m5', 'BMW M5 Competition', 625, 'PS', 'power', 'adult'),
  ('rs6', 'Audi RS 6 Avant', 600, 'PS', 'power', 'adult'),
  ('cayenne-turbo', 'Porsche Cayenne Turbo GT', 650, 'PS', 'power', 'adult'),
  ('tesla-plaid', 'Tesla Model S Plaid', 1020, 'PS', 'power', 'adult'),
  ('golf-r', 'VW Golf R', 333, 'PS', 'power', 'adult'),
  ('m3', 'BMW M3 Competition', 510, 'PS', 'power', 'adult'),
  ('cayman', 'Cupra Formentor VZ5', 390, 'PS', 'power', 'adult'),
  ('a45', 'Mercedes-AMG A 45 S', 421, 'PS', 'power', 'adult'),
  ('octavia-rs', 'Škoda Octavia RS', 245, 'PS', 'power', 'adult'),
  ('gti', 'VW Golf GTI', 245, 'PS', 'power', 'adult'),
  ('passat', 'VW Passat 2.0 TSI', 190, 'PS', 'power', 'adult'),
  ('golf-tdi', 'VW Golf 2.0 TDI', 150, 'PS', 'power', 'adult'),
  ('polo-gti', 'VW Polo GTI', 207, 'PS', 'power', 'adult'),
  ('fiat-500', 'Fiat 500 Hybrid', 70, 'PS', 'power', 'adult'),
  ('up-gti', 'VW up! GTI', 115, 'PS', 'power', 'adult'),
  ('oel', 'Pflanzenöl', 884, 'kcal/100g', 'calories', 'adult'),
  ('butter', 'Butter', 717, 'kcal/100g', 'calories', 'adult'),
  ('schokolade', 'Vollmilchschokolade', 535, 'kcal/100g', 'calories', 'adult'),
  ('erdnuss', 'Erdnüsse', 567, 'kcal/100g', 'calories', 'adult'),
  ('kaese', 'Gouda', 356, 'kcal/100g', 'calories', 'adult'),
  ('schinken', 'Rohschinken', 250, 'kcal/100g', 'calories', 'adult'),
  ('brot', 'Vollkornbrot', 250, 'kcal/100g', 'calories', 'adult'),
  ('reis', 'Reis, gekocht', 130, 'kcal/100g', 'calories', 'adult'),
  ('nudel', 'Nudeln, gekocht', 131, 'kcal/100g', 'calories', 'adult'),
  ('kartoffel', 'Kartoffel, gekocht', 70, 'kcal/100g', 'calories', 'adult'),
  ('banane', 'Banane', 89, 'kcal/100g', 'calories', 'adult'),
  ('apfel', 'Apfel', 52, 'kcal/100g', 'calories', 'adult'),
  ('joghurt', 'Naturjoghurt, 1,5 %', 47, 'kcal/100g', 'calories', 'adult'),
  ('milch', 'Vollmilch', 64, 'kcal/100g', 'calories', 'adult'),
  ('orange', 'Orange', 47, 'kcal/100g', 'calories', 'adult'),
  ('tomate', 'Tomate', 18, 'kcal/100g', 'calories', 'adult'),
  ('gurke', 'Gurke', 12, 'kcal/100g', 'calories', 'adult'),
  ('salat', 'Kopfsalat', 15, 'kcal/100g', 'calories', 'adult');

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

CREATE OR REPLACE FUNCTION init_player_lives(p_players jsonb, p_lives integer DEFAULT 3)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(jsonb_object_agg(elem->>'id', p_lives), '{}'::jsonb)
  FROM jsonb_array_elements(coalesce(p_players, '[]'::jsonb)) elem
  WHERE elem->>'id' IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION alive_count(p_lives jsonb)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(count(*) FILTER (WHERE (value)::int > 0), 0)::integer
  FROM jsonb_each_text(coalesce(p_lives, '{}'::jsonb));
$$;

CREATE OR REPLACE FUNCTION sole_survivor_id(p_lives jsonb)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT CASE WHEN count(*) = 1 THEN min(key) ELSE NULL END
  FROM jsonb_each_text(coalesce(p_lives, '{}'::jsonb))
  WHERE (value)::int > 0;
$$;

CREATE OR REPLACE FUNCTION next_alive_index(p_players jsonb, p_lives jsonb, p_from integer)
RETURNS integer
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_count integer := jsonb_array_length(coalesce(p_players, '[]'::jsonb));
  v_index integer;
  v_id text;
  i integer;
BEGIN
  IF v_count = 0 THEN
    RETURN 0;
  END IF;
  FOR i IN 1..v_count LOOP
    v_index := (p_from + i) % v_count;
    v_id := p_players -> v_index ->> 'id';
    IF coalesce((p_lives ->> v_id)::int, 0) > 0 THEN
      RETURN v_index;
    END IF;
  END LOOP;
  RETURN p_from % v_count;
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
      INSERT INTO rooms (room_code, players, host_id, game_status, max_players, votes, selected_mode, play_style, player_lives, winner_id)
      VALUES (
        v_code,
        v_players,
        p_player_id,
        'lobby',
        v_max,
        '{}'::jsonb,
        'adult',
        'team',
        '{}'::jsonb,
        NULL
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

CREATE OR REPLACE FUNCTION start_solo(p_player_id text, p_name text, p_density text)
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
  v_density text := coalesce(p_density, 'knackig');
BEGIN
  IF p_player_id IS NULL OR length(p_player_id) < 8 OR length(p_player_id) > 80 THEN
    RAISE EXCEPTION 'Ungültige Spieler-ID.';
  END IF;
  IF v_name IS NULL OR length(v_name) < 1 OR length(v_name) > 20 THEN
    RAISE EXCEPTION 'Bitte gib einen Namen (1–20 Zeichen) ein.';
  END IF;
  IF v_density NOT IN ('locker', 'knackig', 'haarscharf') THEN
    RAISE EXCEPTION 'Bitte wähle Locker, Knackig oder Haarscharf.';
  END IF;

  v_players := jsonb_build_array(jsonb_build_object('id', p_player_id, 'name', v_name));
  v_catalog := load_catalog('adult');
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
        selected_density, play_style, player_lives, winner_id,
        current_player_index, lives, streak, current_card, next_card,
        remaining_cards, used_card_ids, last_result, turn_nonce
      ) VALUES (
        v_code, v_players, p_player_id, 'playing', 1,
        '{}'::jsonb, 'adult', v_density, 'team', '{}'::jsonb, NULL,
        0, 3, 0, d.current_card, d.next_card, d.remaining,
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

CREATE OR REPLACE FUNCTION start_solo(p_player_id text, p_name text)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT start_solo(p_player_id, p_name, 'knackig');
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

CREATE OR REPLACE FUNCTION set_play_style(p_room_code text, p_player_id text, p_play_style text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text := upper(trim(p_room_code));
  r rooms%ROWTYPE;
BEGIN
  IF p_play_style IS DISTINCT FROM 'team' AND p_play_style IS DISTINCT FROM 'versus' THEN
    RAISE EXCEPTION 'Ungültiger Spielmodus.';
  END IF;

  SELECT * INTO r FROM rooms WHERE room_code = v_code FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Raum nicht gefunden.';
  END IF;
  IF r.game_status IS DISTINCT FROM 'lobby' THEN
    RAISE EXCEPTION 'Spielmodus nur in der Lobby.';
  END IF;
  IF r.host_id IS DISTINCT FROM p_player_id THEN
    RAISE EXCEPTION 'Nur der Host legt den Spielmodus fest.';
  END IF;

  UPDATE rooms
  SET play_style = p_play_style
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
  v_lives integer := 3;
  v_max integer;
  v_style text;
  v_player_lives jsonb;
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

  v_style := coalesce(r.play_style, 'team');
  v_catalog := load_catalog('adult');
  d := deal_opening_pair(v_catalog, coalesce(r.selected_density, 'knackig'));
  IF d.current_card IS NULL OR d.next_card IS NULL THEN
    RAISE EXCEPTION 'Kartenstapel ist unvollständig.';
  END IF;

  IF v_style = 'versus' THEN
    v_player_lives := init_player_lives(r.players, 3);
  ELSE
    v_player_lives := '{}'::jsonb;
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
    selected_mode = 'adult',
    player_lives = v_player_lives,
    winner_id = NULL,
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
  v_style text;
  v_player_lives jsonb;
  v_tipper text;
  v_next_index integer;
  v_winner text;
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

  v_catalog := load_catalog('adult');
  v_style := coalesce(r.play_style, 'team');
  v_player_lives := coalesce(r.player_lives, '{}'::jsonb);
  v_winner := NULL;
  v_next_index := (r.current_player_index + 1) % jsonb_array_length(r.players);

  IF v_style = 'versus' THEN
    v_tipper := r.players -> r.current_player_index ->> 'id';
    v_streak := 0;
    IF NOT v_correct THEN
      v_player_lives := jsonb_set(
        v_player_lives,
        ARRAY[v_tipper],
        to_jsonb(greatest(coalesce((v_player_lives ->> v_tipper)::int, 0) - 1, 0)),
        true
      );
    END IF;
    v_lives := coalesce((v_player_lives ->> v_tipper)::int, 0);
    v_winner := sole_survivor_id(v_player_lives);
    IF v_winner IS NOT NULL THEN
      v_status := 'game_over';
      v_current := r.current_card;
      v_next := r.next_card;
      v_remaining := r.remaining_cards;
      v_next_index := next_alive_index(r.players, v_player_lives, r.current_player_index);
    ELSE
      v_status := 'playing';
      v_next_index := next_alive_index(r.players, v_player_lives, r.current_player_index);
    END IF;
  ELSE
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
    current_player_index = v_next_index,
    current_card = v_current,
    next_card = v_next,
    remaining_cards = coalesce(v_remaining, r.remaining_cards),
    used_card_ids = used_card_ids(v_catalog, coalesce(v_remaining, r.remaining_cards)),
    game_status = v_status,
    player_lives = v_player_lives,
    winner_id = v_winner,
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
  v_style text;
  v_player_lives jsonb;
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

  v_style := coalesce(r.play_style, 'team');
  v_catalog := load_catalog('adult');
  d := deal_opening_pair(v_catalog, coalesce(r.selected_density, 'knackig'));
  IF d.current_card IS NULL OR d.next_card IS NULL THEN
    RAISE EXCEPTION 'Kartenstapel ist unvollständig.';
  END IF;

  IF v_style = 'versus' THEN
    v_player_lives := init_player_lives(r.players, 3);
  ELSE
    v_player_lives := '{}'::jsonb;
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
    player_lives = v_player_lives,
    winner_id = NULL,
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
GRANT EXECUTE ON FUNCTION set_play_style(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION set_density(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION start_solo(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION start_solo(text, text, text) TO anon, authenticated;
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
