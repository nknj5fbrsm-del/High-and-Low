import { formatValue, normalizeRoomCode, trimName } from './format.ts'

describe('formatValue', () => {
  it('formatiert kg deutsch mit Einheit', () => {
    expect(formatValue(1300, 'kg')).toBe('1.300 kg')
  })

  it('lässt Jahre unformatiert', () => {
    expect(formatValue(1989, 'Jahr')).toBe('1989')
  })

  it('formatiert Euro und Temperatur', () => {
    expect(formatValue(999, '€')).toBe('999 €')
    expect(formatValue(-63, '°C')).toBe('-63 °C')
    expect(formatValue(0.02, 'kg')).toBe('0,02 kg')
  })
})

describe('normalizeRoomCode', () => {
  it('macht 4 Großbuchstaben daraus', () => {
    expect(normalizeRoomCode('ab-12cd')).toBe('ABCD')
  })
})

describe('trimName', () => {
  it('kürzt auf 20 Zeichen', () => {
    expect(trimName('  ' + 'A'.repeat(25) + '  ')).toHaveLength(20)
  })
})
