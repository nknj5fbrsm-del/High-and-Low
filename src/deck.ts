import type { Axis, FactCard } from './types.ts'

function c(id: string, title: string, value: number, unit: string, axis: Axis): FactCard {
  return { id, title, value, unit, axis }
}

/** Erwachsenen-Stapel: prüfbare Zahlen, keine Teilmengen-Vergleiche. */
export const ADULT_DECK: FactCard[] = [
  c('mensch', 'Gewicht Durchschnittsmensch (DE)', 77, 'kg', 'weight'),
  c('wolf', 'Gewicht Wolf', 40, 'kg', 'weight'),
  c('pferd', 'Gewicht Warmblutpferd', 550, 'kg', 'weight'),
  c('smart-fortwo', 'Gewicht Smart Fortwo', 890, 'kg', 'weight'),
  c('vw-golf', 'Gewicht VW Golf', 1300, 'kg', 'weight'),
  c('nilpferd', 'Gewicht Nilpferd', 1500, 'kg', 'weight'),
  c('elefant', 'Gewicht Afrikanischer Elefant', 6000, 'kg', 'weight'),
  c('t-rex', 'Gewicht Tyrannosaurus rex (Schätzung)', 8000, 'kg', 'weight'),
  c('leopard-2', 'Gewicht Kampfpanzer Leopard 2', 62000, 'kg', 'weight'),
  c('blauwal', 'Gewicht Blauwal', 140000, 'kg', 'weight'),
  c('a380', 'Gewicht Airbus A380 (leer)', 277000, 'kg', 'weight'),
  c('saturn-v', 'Gewicht Saturn V (betankt)', 2970000, 'kg', 'weight'),

  c('doener', 'Preis eines Döners', 7, '€', 'price'),
  c('deutschlandticket', 'Deutschlandticket (Monat, 2026)', 63, '€', 'price'),
  c('ps5', 'PlayStation 5 mit Laufwerk (UVP)', 650, '€', 'price'),
  c('iphone-16', 'iPhone 16', 999, '€', 'price'),
  c('bahncard-100', 'BahnCard 100, 2. Klasse', 4899, '€', 'price'),
  c('golf-neupreis', 'Neupreis VW Golf 8', 28000, '€', 'price'),
  c('median-gehalt', 'Median-Jahresgehalt brutto (DE)', 45000, '€', 'price'),
  c('gold-kg', 'Kilogramm Feingold', 78000, '€', 'price'),
  c('efh', 'Einfamilienhaus in DE (Schnitt)', 420000, '€', 'price'),
  c('eurofighter', 'Stückpreis Eurofighter Typhoon', 120000000, '€', 'price'),
  c('elbphilharmonie', 'Baukosten Elbphilharmonie', 866000000, '€', 'price'),

  c('konstantinopel', 'Fall Konstantinopels', 1453, 'Jahr', 'year'),
  c('kolumbus', 'Kolumbus erreicht Amerika', 1492, 'Jahr', 'year'),
  c('brandenburger-tor', 'Baujahr Brandenburger Tor', 1791, 'Jahr', 'year'),
  c('beethoven-9', 'Uraufführung 9. Sinfonie', 1824, 'Jahr', 'year'),
  c('koelner-dom-jahr', 'Fertigstellung Kölner Dom', 1880, 'Jahr', 'year'),
  c('eiffelturm-jahr', 'Baujahr Eiffelturm', 1889, 'Jahr', 'year'),
  c('titanic', 'Untergang der Titanic', 1912, 'Jahr', 'year'),
  c('grundgesetz', 'Grundgesetz der Bundesrepublik', 1949, 'Jahr', 'year'),
  c('mauer-bau', 'Bau der Berliner Mauer', 1961, 'Jahr', 'year'),
  c('mondlandung', 'Erste Mondlandung', 1969, 'Jahr', 'year'),
  c('mauerfall', 'Fall der Berliner Mauer', 1989, 'Jahr', 'year'),
  c('wikipedia', 'Start von Wikipedia', 2001, 'Jahr', 'year'),
  c('iphone-jahr', 'Erstes iPhone', 2007, 'Jahr', 'year'),
  c('chatgpt', 'Start von ChatGPT', 2022, 'Jahr', 'year'),

  c('marathon', 'Marathondistanz', 42, 'km', 'distance'),
  c('hamburg-koeln', 'Entfernung Hamburg–Köln (Straße)', 430, 'km', 'distance'),
  c('berlin-muenchen', 'Entfernung Berlin–München (Straße)', 585, 'km', 'distance'),
  c('a7', 'Länge der Autobahn A7', 962, 'km', 'distance'),
  c('rhein', 'Länge des Rheins', 1233, 'km', 'distance'),
  c('amazonas', 'Länge des Amazonas', 6400, 'km', 'distance'),
  c('nil', 'Länge des Nils', 6650, 'km', 'distance'),
  c('transsib', 'Transsibirische Eisenbahn', 9289, 'km', 'distance'),
  c('berlin-sydney', 'Luftlinie Berlin–Sydney', 16100, 'km', 'distance'),
  c('aequator', 'Umfang des Äquators', 40075, 'km', 'distance'),
  c('licht-sekunde', 'Lichtstrecke in einer Sekunde', 299792, 'km', 'distance'),
  c('erde-mond', 'Abstand Erde–Mond (mittel)', 384400, 'km', 'distance'),

  c('freiheitsstatue', 'Höhe der Freiheitsstatue', 93, 'm', 'height'),
  c('koelner-dom-hoehe', 'Höhe des Kölner Doms', 157, 'm', 'height'),
  c('eiffelturm-hoehe', 'Höhe des Eiffelturms', 330, 'm', 'height'),
  c('fernsehturm', 'Höhe Berliner Fernsehturm', 368, 'm', 'height'),
  c('empire-state', 'Höhe Empire State Building', 443, 'm', 'height'),
  c('burj', 'Höhe Burj Khalifa', 828, 'm', 'height'),
  c('zugspitze', 'Höhe der Zugspitze', 2962, 'm', 'height'),
  c('matterhorn', 'Höhe des Matterhorns', 4478, 'm', 'height'),
  c('mont-blanc', 'Höhe des Mont Blanc', 4809, 'm', 'height'),
  c('k2', 'Höhe des K2', 8611, 'm', 'height'),
  c('everest', 'Höhe des Mount Everest', 8849, 'm', 'height'),
  c('olympus-mons', 'Höhe des Olympus Mons', 21229, 'm', 'height'),

  c('fussgaenger', 'Schrittgeschwindigkeit Mensch', 5, 'km/h', 'speed'),
  c('usain', 'Spitze Usain Bolt', 38, 'km/h', 'speed'),
  c('gepard', 'Spitze Gepard', 110, 'km/h', 'speed'),
  c('wanderfalke', 'Sturzflug Wanderfalke', 320, 'km/h', 'speed'),
  c('ice', 'Höchstgeschwindigkeit ICE 3', 330, 'km/h', 'speed'),
  c('f1', 'Spitze Formel-1-Auto', 370, 'km/h', 'speed'),
  c('maglev', 'Transrapid Shanghai', 431, 'km/h', 'speed'),
  c('boeing747', 'Reisegeschwindigkeit Boeing 747', 900, 'km/h', 'speed'),
  c('schall', 'Schall in Luft (20 °C)', 1235, 'km/h', 'speed'),
  c('iss', 'Orbitalgeschwindigkeit der ISS', 27600, 'km/h', 'speed'),

  c('fluessigstickstoff', 'Siedepunkt Flüssigstickstoff', -196, '°C', 'temp'),
  c('antarktis', 'Kälterekord Antarktis', -89, '°C', 'temp'),
  c('mars', 'Durchschnittstemperatur Mars', -63, '°C', 'temp'),
  c('gefrierpunkt', 'Gefrierpunkt von Wasser', 0, '°C', 'temp'),
  c('kuehlschrank', 'Kühlschrank-Temperatur', 4, '°C', 'temp'),
  c('koerper', 'Körpertemperatur Mensch', 37, '°C', 'temp'),
  c('death-valley', 'Hitzerekord Death Valley', 57, '°C', 'temp'),
  c('siedepunkt', 'Siedepunkt von Wasser', 100, '°C', 'temp'),
  c('venus', 'Oberfläche der Venus', 464, '°C', 'temp'),
  c('sonne', 'Sonnenoberfläche', 5505, '°C', 'temp'),

  c('planeten', 'Planeten im Sonnensystem', 8, 'Stück', 'count'),
  c('bundeslaender', 'Bundesländer in Deutschland', 16, 'Stück', 'count'),
  c('eu', 'EU-Mitgliedstaaten', 27, 'Stück', 'count'),
  c('zaehne', 'Zähne eines Erwachsenen', 32, 'Stück', 'count'),
  c('chromosomen', 'Chromosomen des Menschen', 46, 'Stück', 'count'),
  c('spielkarten', 'Karten im französischen Blatt', 52, 'Stück', 'count'),
  c('schach', 'Felder auf dem Schachbrett', 64, 'Stück', 'count'),
  c('klavier', 'Tasten eines Klaviers', 88, 'Stück', 'count'),
  c('elemente', 'Elemente im Periodensystem', 118, 'Stück', 'count'),
  c('un-staaten', 'UN-Mitgliedstaaten', 193, 'Stück', 'count'),
  c('knochen', 'Knochen eines Erwachsenen', 206, 'Stück', 'count'),
  c('sprachen', 'Sprachen der Welt (ca.)', 7000, 'Stück', 'count'),
]

/** Kinder-Stapel: leichter, aber keine dummen Selbstverständlichkeiten als einziges Paar. */
export const KIDS_DECK: FactCard[] = [
  c('k-maus', 'Gewicht einer Hausmaus', 0.02, 'kg', 'weight'),
  c('k-katze', 'Gewicht einer Hauskatze', 4, 'kg', 'weight'),
  c('k-hund', 'Gewicht eines Labradors', 30, 'kg', 'weight'),
  c('k-wolf', 'Gewicht eines Wolfs', 40, 'kg', 'weight'),
  c('k-panda', 'Gewicht eines Großen Panda', 100, 'kg', 'weight'),
  c('k-pferd', 'Gewicht eines Pferds', 500, 'kg', 'weight'),
  c('k-giraffe-kg', 'Gewicht einer Giraffe', 800, 'kg', 'weight'),
  c('k-nilpferd', 'Gewicht eines Nilpferds', 1500, 'kg', 'weight'),
  c('k-elefant', 'Gewicht eines Elefanten', 6000, 'kg', 'weight'),
  c('k-blauwal', 'Gewicht eines Blauwals', 140000, 'kg', 'weight'),

  c('k-maus-h', 'Körperlänge einer Hausmaus', 0.08, 'm', 'height'),
  c('k-katze-h', 'Schulterhöhe einer Hauskatze', 0.25, 'm', 'height'),
  c('k-kind', 'Größe eines Kindes (8 Jahre)', 1.3, 'm', 'height'),
  c('k-korb', 'Höhe eines Basketballkorbs', 3.05, 'm', 'height'),
  c('k-trex-h', 'Hüfthöhe eines T-Rex', 4, 'm', 'height'),
  c('k-giraffe-h', 'Höhe einer Giraffe', 5.5, 'm', 'height'),
  c('k-eiffel', 'Höhe des Eiffelturms', 330, 'm', 'height'),
  c('k-everest', 'Höhe des Mount Everest', 8849, 'm', 'height'),

  c('k-wuerfel', 'Höchste Zahl auf einem Würfel', 6, 'Stück', 'count'),
  c('k-insekt', 'Beine eines Insekts', 6, 'Stück', 'count'),
  c('k-kontinente', 'Kontinente', 7, 'Stück', 'count'),
  c('k-spinne', 'Beine einer Spinne', 8, 'Stück', 'count'),
  c('k-planeten', 'Planeten im Sonnensystem', 8, 'Stück', 'count'),
  c('k-milchzaehne', 'Milchzähne', 20, 'Stück', 'count'),
  c('k-karten', 'Karten in einem Blatt', 52, 'Stück', 'count'),
  c('k-schach', 'Felder auf dem Schachbrett', 64, 'Stück', 'count'),

  c('k-schnecke', 'Weinbergschnecke', 0.05, 'km/h', 'speed'),
  c('k-gehen', 'Mensch zu Fuß', 5, 'km/h', 'speed'),
  c('k-fahrrad', 'Fahrrad im Alltag', 15, 'km/h', 'speed'),
  c('k-bolt', 'Usain Bolt', 38, 'km/h', 'speed'),
  c('k-gepard', 'Gepard', 110, 'km/h', 'speed'),
  c('k-ice', 'ICE', 330, 'km/h', 'speed'),

  c('k-fussball', 'Länge eines Fußballfelds', 0.105, 'km', 'distance'),
  c('k-marathon', 'Marathon', 42, 'km', 'distance'),
  c('k-berlin-muc', 'Berlin–München', 585, 'km', 'distance'),
  c('k-rhein', 'Länge des Rheins', 1233, 'km', 'distance'),
  c('k-aequator', 'Umfang des Äquators', 40075, 'km', 'distance'),
  c('k-mond', 'Abstand Erde–Mond', 384400, 'km', 'distance'),

  c('k-micky', 'Mickey Mouse', 1928, 'Jahr', 'year'),
  c('k-lego', 'Lego-Noppenstein', 1958, 'Jahr', 'year'),
  c('k-mond-k', 'Mondlandung', 1969, 'Jahr', 'year'),
  c('k-pokemon', 'Pokémon (Game Boy)', 1996, 'Jahr', 'year'),
  c('k-hp', 'Harry Potter, Band 1', 1997, 'Jahr', 'year'),
  c('k-youtube', 'Start von YouTube', 2005, 'Jahr', 'year'),

  c('k-eis', 'Schmelzpunkt von Eis', 0, '°C', 'temp'),
  c('k-kuehl', 'Kühlschrank', 4, '°C', 'temp'),
  c('k-koerper', 'Körpertemperatur', 37, '°C', 'temp'),
  c('k-wueste', 'Wüste am Tag', 45, '°C', 'temp'),
  c('k-backofen', 'Backofen für Pizza', 250, '°C', 'temp'),

  c('k-haribo', 'Tüte Gummibärchen', 2, '€', 'price'),
  c('k-kino', 'Kinokarte Kind', 8, '€', 'price'),
  c('k-ball', 'Standard-Fußball', 25, '€', 'price'),
  c('k-fahrrad-preis', 'Kinderfahrrad', 200, '€', 'price'),
  c('k-switch', 'Nintendo Switch', 300, '€', 'price'),
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
