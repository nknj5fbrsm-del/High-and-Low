import type { Axis, FactCard } from './types.ts'

function c(id: string, title: string, value: number, unit: string, axis: Axis): FactCard {
  return { id, title, value, unit, axis }
}

/** Erwachsenen-Stapel: prüfbare Mengen + Geburtsjahre, Paare je Dichteband. */
export const ADULT_DECK: FactCard[] = [
  c('berlin', 'Berlin (Stadt)', 3.88, 'Mio.', 'population'),
  c('madrid-stadt', 'Madrid (Stadt)', 3.33, 'Mio.', 'population'),
  c('rom-stadt', 'Rom (Stadt)', 2.76, 'Mio.', 'population'),
  c('wien', 'Wien (Stadt)', 2.04, 'Mio.', 'population'),
  c('hamburg', 'Hamburg (Stadt)', 1.86, 'Mio.', 'population'),
  c('warschau', 'Warschau (Stadt)', 1.86, 'Mio.', 'population'),
  c('budapest', 'Budapest (Stadt)', 1.69, 'Mio.', 'population'),
  c('barcelona', 'Barcelona (Stadt)', 1.66, 'Mio.', 'population'),
  c('muenchen', 'München (Stadt)', 1.51, 'Mio.', 'population'),
  c('prag', 'Prag (Stadt)', 1.38, 'Mio.', 'population'),
  c('mailand', 'Mailand (Stadt)', 1.37, 'Mio.', 'population'),
  c('koeln-stadt', 'Köln (Stadt)', 1.09, 'Mio.', 'population'),
  c('stockholm-stadt', 'Stockholm (Stadt)', 0.99, 'Mio.', 'population'),

  c('griechenland', 'Griechenland', 131957, 'km²', 'area'),
  c('nicaragua', 'Nicaragua', 130373, 'km²', 'area'),
  c('portugal', 'Portugal', 92212, 'km²', 'area'),
  c('jordanien', 'Jordanien', 89342, 'km²', 'area'),
  c('aserbaidschan', 'Aserbaidschan', 86600, 'km²', 'area'),
  c('oesterreich', 'Österreich', 83879, 'km²', 'area'),
  c('vae', 'Vereinigte Arabische Emirate', 83600, 'km²', 'area'),
  c('tschechien', 'Tschechien', 78871, 'km²', 'area'),
  c('panama', 'Panama', 75417, 'km²', 'area'),
  c('irland', 'Irland (Staat)', 70273, 'km²', 'area'),
  c('daenemark', 'Dänemark', 42933, 'km²', 'area'),
  c('niederlande', 'Niederlande', 41543, 'km²', 'area'),
  c('schweiz', 'Schweiz', 41285, 'km²', 'area'),
  c('belgien', 'Belgien', 30689, 'km²', 'area'),

  c('empire-state', 'Empire State Building (mit Antenne)', 443, 'm', 'height'),
  c('jin-mao', 'Jin-Mao-Turm, Shanghai', 421, 'm', 'height'),
  c('two-ifc', 'Two IFC, Hongkong', 415, 'm', 'height'),
  c('fernsehturm', 'Berliner Fernsehturm', 368, 'm', 'height'),
  c('bank-of-china', 'Bank of China Tower, Hongkong', 367, 'm', 'height'),
  c('eiffelturm-hoehe', 'Eiffelturm', 330, 'm', 'height'),
  c('chrysler', 'Chrysler Building', 319, 'm', 'height'),
  c('shard', 'The Shard, London', 310, 'm', 'height'),
  c('commerzbank', 'Commerzbank-Tower', 259, 'm', 'height'),
  c('washington-monument', 'Washington Monument', 169, 'm', 'height'),
  c('koelner-dom', 'Kölner Dom', 157, 'm', 'height'),

  c('tiger-m', 'Tiger, Männchen', 220, 'kg', 'weight'),
  c('loewe-m', 'Löwe, Männchen', 190, 'kg', 'weight'),
  c('schwarzbaer', 'Amerikanischer Schwarzbär', 135, 'kg', 'weight'),
  c('rentier', 'Rentier', 120, 'kg', 'weight'),
  c('panda', 'Großer Panda', 100, 'kg', 'weight'),
  c('wildschwein', 'Mitteleuropäisches Wildschwein', 90, 'kg', 'weight'),
  c('orang-utan', 'Orang-Utan, Männchen', 85, 'kg', 'weight'),
  c('kaenguru', 'Rotes Riesenkänguru', 85, 'kg', 'weight'),
  c('jaguar', 'Jaguar', 80, 'kg', 'weight'),
  c('warzenschwein', 'Warzenschwein', 80, 'kg', 'weight'),
  c('mensch', 'Durchschnittsmensch (DE)', 77, 'kg', 'weight'),
  c('hyaene', 'Tüpfelhyäne', 70, 'kg', 'weight'),
  c('schimpanse', 'Schimpanse, Männchen', 45, 'kg', 'weight'),
  c('wolf', 'Europäischer Wolf', 40, 'kg', 'weight'),

  c('leonardo', 'Leonardo da Vinci', 1452, 'Jahr', 'year'),
  c('duerer', 'Albrecht Dürer', 1471, 'Jahr', 'year'),
  c('michelangelo', 'Michelangelo', 1475, 'Jahr', 'year'),
  c('rembrandt', 'Rembrandt', 1606, 'Jahr', 'year'),
  c('vivaldi', 'Antonio Vivaldi', 1678, 'Jahr', 'year'),
  c('bach', 'Johann Sebastian Bach', 1685, 'Jahr', 'year'),
  c('haydn', 'Joseph Haydn', 1732, 'Jahr', 'year'),
  c('mozart', 'Wolfgang Amadeus Mozart', 1756, 'Jahr', 'year'),
  c('beethoven', 'Ludwig van Beethoven', 1770, 'Jahr', 'year'),
  c('chopin', 'Frédéric Chopin', 1810, 'Jahr', 'year'),
  c('brahms', 'Johannes Brahms', 1833, 'Jahr', 'year'),
  c('vangogh', 'Vincent van Gogh', 1853, 'Jahr', 'year'),
  c('debussy', 'Claude Debussy', 1862, 'Jahr', 'year'),
  c('picasso', 'Pablo Picasso', 1881, 'Jahr', 'year'),

  c('hamburg-muenchen', 'Hamburg–München (Straße)', 790, 'km', 'distance'),
  c('a1', 'Autobahn A1', 732, 'km', 'distance'),
  c('berlin-wien', 'Berlin–Wien (Straße)', 680, 'km', 'distance'),
  c('berlin-muenchen', 'Berlin–München (Straße)', 585, 'km', 'distance'),
  c('a9', 'Autobahn A9', 529, 'km', 'distance'),
  c('a8', 'Autobahn A8', 505, 'km', 'distance'),
  c('a2', 'Autobahn A2', 486, 'km', 'distance'),
  c('hamburg-koeln', 'Hamburg–Köln (Straße)', 430, 'km', 'distance'),
  c('berlin-hamburg', 'Berlin–Hamburg (Straße)', 289, 'km', 'distance'),
  c('koeln-amsterdam', 'Köln–Amsterdam (Straße)', 280, 'km', 'distance'),
  c('muenchen-stuttgart', 'München–Stuttgart (Straße)', 220, 'km', 'distance'),

  c('flug-cruise', 'Verkehrsflugzeug, Reisegeschwindigkeit', 900, 'km/h', 'speed'),
  c('chiron', 'Bugatti Chiron, Spitze', 420, 'km/h', 'speed'),
  c('f1', 'Formel-1-Auto, Spitze', 370, 'km/h', 'speed'),
  c('velaro', 'Velaro, Höchstgeschwindigkeit', 350, 'km/h', 'speed'),
  c('ice', 'ICE 3, Höchstgeschwindigkeit', 330, 'km/h', 'speed'),
  c('wanderfalke', 'Sturzflug Wanderfalke', 320, 'km/h', 'speed'),
  c('tgv', 'TGV, Höchstgeschwindigkeit', 320, 'km/h', 'speed'),
  c('ave', 'AVE, Höchstgeschwindigkeit', 310, 'km/h', 'speed'),
  c('eurostar', 'Eurostar, Höchstgeschwindigkeit', 300, 'km/h', 'speed'),
  c('regionalzug', 'Regionalzug, Spitze', 160, 'km/h', 'speed'),
  c('autobahn-tempo', 'Pkw auf Autobahn, typische Spitze', 130, 'km/h', 'speed'),

  c('athen', 'Athen, Juli-Mittel', 34, '°C', 'temp'),
  c('madrid', 'Madrid, Juli-Mittel', 32, '°C', 'temp'),
  c('rom', 'Rom, Juli-Mittel', 30, '°C', 'temp'),
  c('mailand-temp', 'Mailand, Juli-Mittel', 29, '°C', 'temp'),
  c('paris', 'Paris, Juli-Mittel', 25, '°C', 'temp'),
  c('berlin-temp', 'Berlin, Juli-Mittel', 24, '°C', 'temp'),
  c('london', 'London, Juli-Mittel', 23, '°C', 'temp'),
  c('stockholm', 'Stockholm, Juli-Mittel', 22, '°C', 'temp'),
  c('helsinki', 'Helsinki, Juli-Mittel', 21, '°C', 'temp'),
  c('oslo', 'Oslo, Juli-Mittel', 17, '°C', 'temp'),
  c('reykjavik', 'Reykjavík, Juli-Mittel', 13, '°C', 'temp'),

  c('periodensystem', 'Elemente im Periodensystem', 118, 'Stück', 'count'),
  c('klavier', 'Tasten eines Klaviers', 88, 'Stück', 'count'),
  c('schach', 'Felder auf dem Schachbrett', 64, 'Stück', 'count'),
  c('afrika', 'Staaten in Afrika', 54, 'Stück', 'count'),
  c('spielkarten', 'Karten im französischen Blatt', 52, 'Stück', 'count'),
  c('us-staaten', 'US-Bundesstaaten', 50, 'Stück', 'count'),
  c('chromosomen', 'Chromosomen des Menschen', 46, 'Stück', 'count'),
  c('shakespeare', 'Shakespeare-Dramen', 39, 'Stück', 'count'),
  c('nato', 'NATO-Mitglieder', 32, 'Stück', 'count'),
  c('zaehne', 'Zähne eines Erwachsenen', 32, 'Stück', 'count'),
  c('eu', 'EU-Mitgliedstaaten', 27, 'Stück', 'count'),
]

/** Kinder-Stapel: bekannte Namen, eher Locker/Knackig, keine Comic-Figuren. */
export const KIDS_DECK: FactCard[] = [
  c('k-de', 'Deutschland', 84, 'Mio.', 'population'),
  c('k-fr', 'Frankreich', 68, 'Mio.', 'population'),
  c('k-uk', 'Vereinigtes Königreich', 67, 'Mio.', 'population'),
  c('k-it', 'Italien', 59, 'Mio.', 'population'),
  c('k-es', 'Spanien', 48, 'Mio.', 'population'),
  c('k-pl', 'Polen', 38, 'Mio.', 'population'),
  c('k-nl', 'Niederlande', 18, 'Mio.', 'population'),
  c('k-cz', 'Tschechien', 10.9, 'Mio.', 'population'),

  c('k-fr-km2', 'Frankreich', 543940, 'km²', 'area'),
  c('k-es-km2', 'Spanien', 505990, 'km²', 'area'),
  c('k-jp-km2', 'Japan', 377975, 'km²', 'area'),
  c('k-de-km2', 'Deutschland', 357588, 'km²', 'area'),
  c('k-pl-km2', 'Polen', 312679, 'km²', 'area'),
  c('k-it-km2', 'Italien', 301340, 'km²', 'area'),
  c('k-uk-km2', 'Vereinigtes Königreich', 243610, 'km²', 'area'),

  c('k-liberty', 'Freiheitsstatue', 93, 'm', 'height'),
  c('k-dom', 'Kölner Dom', 157, 'm', 'height'),
  c('k-eiffel', 'Eiffelturm', 330, 'm', 'height'),
  c('k-berlin-h', 'Berliner Fernsehturm', 368, 'm', 'height'),

  c('k-mensch', 'Mensch', 77, 'kg', 'weight'),
  c('k-panda', 'Panda', 100, 'kg', 'weight'),
  c('k-gorilla', 'Gorilla', 160, 'kg', 'weight'),
  c('k-loewe', 'Löwe, Männchen', 190, 'kg', 'weight'),
  c('k-tiger', 'Tiger, Männchen', 220, 'kg', 'weight'),

  c('k-bach', 'Johann Sebastian Bach', 1685, 'Jahr', 'year'),
  c('k-vivaldi', 'Antonio Vivaldi', 1678, 'Jahr', 'year'),
  c('k-haydn', 'Joseph Haydn', 1732, 'Jahr', 'year'),
  c('k-mozart', 'Wolfgang Amadeus Mozart', 1756, 'Jahr', 'year'),
  c('k-beethoven', 'Ludwig van Beethoven', 1770, 'Jahr', 'year'),
  c('k-chopin', 'Frédéric Chopin', 1810, 'Jahr', 'year'),
  c('k-vangogh', 'Vincent van Gogh', 1853, 'Jahr', 'year'),
  c('k-picasso', 'Pablo Picasso', 1881, 'Jahr', 'year'),

  c('k-bolt', 'Usain Bolt', 38, 'km/h', 'speed'),
  c('k-pferd-kmh', 'Pferd im Galopp', 45, 'km/h', 'speed'),
  c('k-delphin', 'Delfin', 55, 'km/h', 'speed'),
  c('k-windhund', 'Windhund', 70, 'km/h', 'speed'),
  c('k-gepard', 'Gepard', 110, 'km/h', 'speed'),

  c('k-hh', 'Berlin–Hamburg', 289, 'km', 'distance'),
  c('k-prag', 'Berlin–Prag', 350, 'km', 'distance'),
  c('k-koeln', 'Hamburg–Köln', 430, 'km', 'distance'),
  c('k-berlin-muc', 'Berlin–München', 585, 'km', 'distance'),
  c('k-hh-muc', 'Hamburg–München', 790, 'km', 'distance'),

  c('k-zimmer', 'Zimmertemperatur', 20, '°C', 'temp'),
  c('k-fruehling', 'Milder Frühlingstag', 22, '°C', 'temp'),
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
