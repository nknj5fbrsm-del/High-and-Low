import type { FactCard } from './types.ts'

/** Reale, prüfbare Zahlen. Vergleiche nur innerhalb derselben `unit`. */
export const DECK: FactCard[] = [
  { id: 'vw-golf', title: 'Gewicht VW Golf', value: 1300, unit: 'kg' },
  { id: 'nilpferd', title: 'Gewicht Nilpferd', value: 1500, unit: 'kg' },
  { id: 'elefant', title: 'Gewicht Afrikanischer Elefant', value: 6000, unit: 'kg' },
  { id: 'smart-fortwo', title: 'Gewicht Smart Fortwo', value: 890, unit: 'kg' },
  { id: 'blauwal', title: 'Gewicht Blauwal', value: 140000, unit: 'kg' },
  { id: 'a380', title: 'Gewicht Airbus A380 (leer)', value: 277000, unit: 'kg' },
  { id: 'mensch', title: 'Gewicht Durchschnittsmensch (DE)', value: 77, unit: 'kg' },

  { id: 'koelner-dom-jahr', title: 'Fertigstellung Kölner Dom', value: 1880, unit: 'Jahr' },
  { id: 'eiffelturm-jahr', title: 'Baujahr Eiffelturm', value: 1889, unit: 'Jahr' },
  { id: 'brandenburger-tor', title: 'Baujahr Brandenburger Tor', value: 1791, unit: 'Jahr' },
  { id: 'mauerfall', title: 'Fall der Berliner Mauer', value: 1989, unit: 'Jahr' },
  { id: 'mondlandung', title: 'Erste Mondlandung', value: 1969, unit: 'Jahr' },
  { id: 'grundgesetz', title: 'Grundgesetz der Bundesrepublik', value: 1949, unit: 'Jahr' },
  { id: 'wm-2006', title: 'FIFA-WM in Deutschland', value: 2006, unit: 'Jahr' },

  { id: 'berlin-muenchen', title: 'Entfernung Berlin–München (Straße)', value: 585, unit: 'km' },
  { id: 'rhein', title: 'Länge des Rheins', value: 1233, unit: 'km' },
  { id: 'hamburg-koeln', title: 'Entfernung Hamburg–Köln (Straße)', value: 430, unit: 'km' },
  { id: 'aequator', title: 'Umfang des Äquators', value: 40075, unit: 'km' },
  { id: 'erde-mond', title: 'Abstand Erde–Mond (mittel)', value: 384400, unit: 'km' },
  { id: 'a7', title: 'Länge der Autobahn A7', value: 962, unit: 'km' },

  { id: 'einwohner-de', title: 'Einwohner Deutschland (ca. 2024)', value: 84700000, unit: 'Stück' },
  { id: 'einwohner-berlin', title: 'Einwohner Berlin', value: 3750000, unit: 'Stück' },
  { id: 'zaehne', title: 'Zähne eines Erwachsenen', value: 32, unit: 'Stück' },
  { id: 'bundeslaender', title: 'Bundesländer in Deutschland', value: 16, unit: 'Stück' },
  { id: 'planeten', title: 'Planeten im Sonnensystem', value: 8, unit: 'Stück' },
  { id: 'un-staaten', title: 'UN-Mitgliedstaaten', value: 193, unit: 'Stück' },
  { id: 'klavier', title: 'Tasten eines Klaviers', value: 88, unit: 'Stück' },

  { id: 'eiffelturm-hoehe', title: 'Höhe des Eiffelturms', value: 330, unit: 'm' },
  { id: 'koelner-dom-hoehe', title: 'Höhe des Kölner Doms', value: 157, unit: 'm' },
  { id: 'zugspitze', title: 'Höhe der Zugspitze', value: 2962, unit: 'm' },
  { id: 'fernsehturm', title: 'Höhe Berliner Fernsehturm', value: 368, unit: 'm' },
  { id: 'everest', title: 'Höhe des Mount Everest', value: 8849, unit: 'm' },
  { id: 'freiheitsstatue', title: 'Höhe der Freiheitsstatue', value: 93, unit: 'm' },
]

export function unitsInDeck(cards: FactCard[] = DECK): string[] {
  return [...new Set(cards.map((card) => card.unit))]
}
