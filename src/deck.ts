import type { Axis, FactCard } from './types.ts'

function c(id: string, title: string, value: number, unit: string, axis: Axis): FactCard {
  return { id, title, value, unit, axis }
}

export function axisValueRatio(cards: FactCard[]): number {
  const values = cards.map((card) => Math.abs(card.value)).filter((value) => value > 0)
  if (values.length < 2) return 1
  return Math.max(...values) / Math.min(...values)
}

/** Erwachsenen-Stapel: enge, prüfbare Paare, Ratio je Achse ≤ 2. */
export const ADULT_DECK: FactCard[] = [
  c('wien', 'Wien (Stadt)', 2.04, 'Mio.', 'population'),
  c('hamburg', 'Hamburg (Stadt)', 1.86, 'Mio.', 'population'),
  c('warschau', 'Warschau (Stadt)', 1.86, 'Mio.', 'population'),
  c('budapest', 'Budapest (Stadt)', 1.69, 'Mio.', 'population'),
  c('barcelona', 'Barcelona (Stadt)', 1.66, 'Mio.', 'population'),
  c('muenchen', 'München (Stadt)', 1.51, 'Mio.', 'population'),
  c('prag', 'Prag (Stadt)', 1.38, 'Mio.', 'population'),
  c('mailand', 'Mailand (Stadt)', 1.37, 'Mio.', 'population'),

  c('tschechien', 'Tschechien', 78871, 'km²', 'area'),
  c('panama', 'Panama', 75417, 'km²', 'area'),
  c('vae', 'Vereinigte Arabische Emirate', 83600, 'km²', 'area'),
  c('oesterreich', 'Österreich', 83879, 'km²', 'area'),
  c('irland', 'Irland (Staat)', 70273, 'km²', 'area'),
  c('aserbaidschan', 'Aserbaidschan', 86600, 'km²', 'area'),
  c('jordanien', 'Jordanien', 89342, 'km²', 'area'),
  c('portugal', 'Portugal', 92212, 'km²', 'area'),

  c('shard', 'The Shard, London', 310, 'm', 'height'),
  c('chrysler', 'Chrysler Building', 319, 'm', 'height'),
  c('eiffelturm-hoehe', 'Eiffelturm', 330, 'm', 'height'),
  c('bank-of-china', 'Bank of China Tower, Hongkong', 367, 'm', 'height'),
  c('fernsehturm', 'Berliner Fernsehturm', 368, 'm', 'height'),
  c('two-ifc', 'Two IFC, Hongkong', 415, 'm', 'height'),
  c('jin-mao', 'Jin-Mao-Turm, Shanghai', 421, 'm', 'height'),
  c('empire-state', 'Empire State Building (mit Antenne)', 443, 'm', 'height'),

  c('hyaene', 'Tüpfelhyäne', 70, 'kg', 'weight'),
  c('mensch', 'Durchschnittsmensch (DE)', 77, 'kg', 'weight'),
  c('jaguar', 'Jaguar', 80, 'kg', 'weight'),
  c('warzenschwein', 'Warzenschwein', 80, 'kg', 'weight'),
  c('kaenguru', 'Rotes Riesenkänguru', 85, 'kg', 'weight'),
  c('orang-utan', 'Orang-Utan, Männchen', 85, 'kg', 'weight'),
  c('wildschwein', 'Mitteleuropäisches Wildschwein', 90, 'kg', 'weight'),
  c('panda', 'Großer Panda', 100, 'kg', 'weight'),
  c('rentier', 'Rentier', 120, 'kg', 'weight'),
  c('schwarzbaer', 'Amerikanischer Schwarzbär', 135, 'kg', 'weight'),

  c('steam-deck', 'Steam Deck OLED', 549, '€', 'price'),
  c('airpods-max', 'AirPods Max', 599, '€', 'price'),
  c('ps5', 'PlayStation 5 mit Laufwerk (UVP)', 650, '€', 'price'),
  c('ipad-air', 'iPad Air 11″', 699, '€', 'price'),
  c('dji-mini', 'DJI Mini 4 Pro', 759, '€', 'price'),
  c('pixel-9', 'Google Pixel 9', 799, '€', 'price'),
  c('watch-ultra', 'Apple Watch Ultra 2', 899, '€', 'price'),
  c('iphone-16', 'iPhone 16', 999, '€', 'price'),

  c('google', 'Gründung von Google', 1998, 'Jahr', 'year'),
  c('euro-buchgeld', 'Euro als Buchgeld', 1999, 'Jahr', 'year'),
  c('wikipedia', 'Start von Wikipedia', 2001, 'Jahr', 'year'),
  c('euro-bargeld', 'Euro-Bargeld', 2002, 'Jahr', 'year'),
  c('facebook', 'Start von Facebook', 2004, 'Jahr', 'year'),
  c('youtube', 'Start von YouTube', 2005, 'Jahr', 'year'),
  c('twitter', 'Start von Twitter', 2006, 'Jahr', 'year'),
  c('iphone-jahr', 'Erstes iPhone', 2007, 'Jahr', 'year'),

  c('hamburg-koeln', 'Hamburg–Köln (Straße)', 430, 'km', 'distance'),
  c('a2', 'Autobahn A2', 486, 'km', 'distance'),
  c('a8', 'Autobahn A8', 505, 'km', 'distance'),
  c('a9', 'Autobahn A9', 529, 'km', 'distance'),
  c('berlin-muenchen', 'Berlin–München (Straße)', 585, 'km', 'distance'),
  c('berlin-wien', 'Berlin–Wien (Straße)', 680, 'km', 'distance'),
  c('a1', 'Autobahn A1', 732, 'km', 'distance'),
  c('hamburg-muenchen', 'Hamburg–München (Straße)', 790, 'km', 'distance'),

  c('eurostar', 'Eurostar, Höchstgeschwindigkeit', 300, 'km/h', 'speed'),
  c('ave', 'AVE, Höchstgeschwindigkeit', 310, 'km/h', 'speed'),
  c('tgv', 'TGV, Höchstgeschwindigkeit', 320, 'km/h', 'speed'),
  c('ice', 'ICE 3, Höchstgeschwindigkeit', 330, 'km/h', 'speed'),
  c('wanderfalke', 'Sturzflug Wanderfalke', 320, 'km/h', 'speed'),
  c('velaro', 'Velaro, Höchstgeschwindigkeit', 350, 'km/h', 'speed'),
  c('f1', 'Formel-1-Auto, Spitze', 370, 'km/h', 'speed'),
  c('chiron', 'Bugatti Chiron, Spitze', 420, 'km/h', 'speed'),

  c('helsinki', 'Helsinki, Juli-Mittel', 21, '°C', 'temp'),
  c('stockholm', 'Stockholm, Juli-Mittel', 22, '°C', 'temp'),
  c('london', 'London, Juli-Mittel', 23, '°C', 'temp'),
  c('berlin-temp', 'Berlin, Juli-Mittel', 24, '°C', 'temp'),
  c('paris', 'Paris, Juli-Mittel', 25, '°C', 'temp'),
  c('mailand-temp', 'Mailand, Juli-Mittel', 29, '°C', 'temp'),
  c('rom', 'Rom, Juli-Mittel', 30, '°C', 'temp'),
  c('madrid', 'Madrid, Juli-Mittel', 32, '°C', 'temp'),

  c('nato', 'NATO-Mitglieder', 32, 'Stück', 'count'),
  c('zaehne', 'Zähne eines Erwachsenen', 32, 'Stück', 'count'),
  c('shakespeare', 'Shakespeare-Dramen', 39, 'Stück', 'count'),
  c('chromosomen', 'Chromosomen des Menschen', 46, 'Stück', 'count'),
  c('us-staaten', 'US-Bundesstaaten', 50, 'Stück', 'count'),
  c('spielkarten', 'Karten im französischen Blatt', 52, 'Stück', 'count'),
  c('afrika', 'Staaten in Afrika', 54, 'Stück', 'count'),
  c('schach', 'Felder auf dem Schachbrett', 64, 'Stück', 'count'),
]

/** Kinder-Stapel: gleiche Familien, weitere Spreizung, nicht albern. */
export const KIDS_DECK: FactCard[] = [
  c('k-de', 'Deutschland', 84, 'Mio.', 'population'),
  c('k-it', 'Italien', 59, 'Mio.', 'population'),
  c('k-fr', 'Frankreich', 68, 'Mio.', 'population'),
  c('k-uk', 'Vereinigtes Königreich', 67, 'Mio.', 'population'),
  c('k-es', 'Spanien', 48, 'Mio.', 'population'),
  c('k-pl', 'Polen', 38, 'Mio.', 'population'),

  c('k-it-km2', 'Italien', 301340, 'km²', 'area'),
  c('k-pl-km2', 'Polen', 312679, 'km²', 'area'),
  c('k-de-km2', 'Deutschland', 357588, 'km²', 'area'),
  c('k-jp-km2', 'Japan', 377975, 'km²', 'area'),
  c('k-fr-km2', 'Frankreich', 543940, 'km²', 'area'),

  c('k-liberty', 'Freiheitsstatue', 93, 'm', 'height'),
  c('k-dom', 'Kölner Dom', 157, 'm', 'height'),
  c('k-eiffel', 'Eiffelturm', 330, 'm', 'height'),
  c('k-berlin-h', 'Berliner Fernsehturm', 368, 'm', 'height'),

  c('k-mensch', 'Mensch', 77, 'kg', 'weight'),
  c('k-panda', 'Panda', 100, 'kg', 'weight'),
  c('k-gorilla', 'Gorilla', 160, 'kg', 'weight'),
  c('k-loewe', 'Löwe, Männchen', 190, 'kg', 'weight'),
  c('k-tiger', 'Tiger, Männchen', 220, 'kg', 'weight'),

  c('k-helm', 'Fahrradhelm', 80, '€', 'price'),
  c('k-roller', 'Tretroller', 120, '€', 'price'),
  c('k-fahrrad-preis', 'Kinderfahrrad', 200, '€', 'price'),
  c('k-switch', 'Nintendo Switch', 300, '€', 'price'),

  c('k-lego', 'Lego-Noppenstein', 1958, 'Jahr', 'year'),
  c('k-mond', 'Mondlandung', 1969, 'Jahr', 'year'),
  c('k-pokemon', 'Pokémon (Game Boy)', 1996, 'Jahr', 'year'),
  c('k-hp', 'Harry Potter, Band 1', 1997, 'Jahr', 'year'),
  c('k-youtube', 'Start von YouTube', 2005, 'Jahr', 'year'),

  c('k-bolt', 'Usain Bolt', 38, 'km/h', 'speed'),
  c('k-pferd-kmh', 'Pferd im Galopp', 45, 'km/h', 'speed'),
  c('k-windhund', 'Windhund', 70, 'km/h', 'speed'),
  c('k-gepard', 'Gepard', 110, 'km/h', 'speed'),

  c('k-prag', 'Berlin–Prag', 350, 'km', 'distance'),
  c('k-koeln', 'Hamburg–Köln', 430, 'km', 'distance'),
  c('k-berlin-muc', 'Berlin–München', 585, 'km', 'distance'),
  c('k-hh-muc', 'Hamburg–München', 790, 'km', 'distance'),

  c('k-zimmer', 'Zimmertemperatur', 20, '°C', 'temp'),
  c('k-sommer', 'Sommertag', 28, '°C', 'temp'),
  c('k-koerper', 'Körpertemperatur', 37, '°C', 'temp'),
  c('k-wueste', 'Wüste am Tag', 45, '°C', 'temp'),

  c('k-insekt', 'Beine eines Insekts', 6, 'Stück', 'count'),
  c('k-kontinente', 'Kontinente', 7, 'Stück', 'count'),
  c('k-planeten', 'Planeten im Sonnensystem', 8, 'Stück', 'count'),
  c('k-spinne', 'Beine einer Spinne', 8, 'Stück', 'count'),
  c('k-milchzaehne', 'Milchzähne', 20, 'Stück', 'count'),
]

export const DECK = ADULT_DECK

export function unitsInDeck(cards: FactCard[] = DECK): string[] {
  return [...new Set(cards.map((card) => card.unit))]
}

export function axesInDeck(cards: FactCard[] = DECK): Axis[] {
  return [...new Set(cards.map((card) => card.axis))]
}

export function sqlEscape(value: string): string {
  return value.replaceAll("'", "''")
}

export function toSqlInserts(): string {
  const row = (card: FactCard, deck: string) =>
    `  ('${sqlEscape(card.id)}', '${sqlEscape(card.title)}', ${card.value}, '${sqlEscape(card.unit)}', '${card.axis}', '${deck}')`
  const adult = ADULT_DECK.map((card) => row(card, 'adult')).join(',\n')
  const kids = KIDS_DECK.map((card) => row(card, 'kids')).join(',\n')
  return `${adult},\n${kids}`
}
