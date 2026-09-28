import { categoryLabel, dealerLine, densityLabel, guessLabels, livesForRoom, playStyleLabel, streakTitle } from './axis.ts'

describe('guessLabels', () => {
  it('nimmt die Bedeutung, nicht nur die Einheit', () => {
    expect(guessLabels('weight')).toEqual({ higher: 'SCHWERER', lower: 'LEICHTER' })
    expect(guessLabels('price')).toEqual({ higher: 'TEURER', lower: 'BILLIGER' })
    expect(guessLabels('year')).toEqual({ higher: 'SPÄTER', lower: 'FRÜHER' })
    expect(guessLabels('speed')).toEqual({ higher: 'SCHNELLER', lower: 'LANGSAMER' })
    expect(guessLabels('temp')).toEqual({ higher: 'WÄRMER', lower: 'KÄLTER' })
    expect(guessLabels('count')).toEqual({ higher: 'MEHR', lower: 'WENIGER' })
    expect(guessLabels('distance')).toEqual({ higher: 'WEITER', lower: 'KÜRZER' })
    expect(guessLabels('height')).toEqual({ higher: 'HÖHER', lower: 'NIEDRIGER' })
    expect(guessLabels('population')).toEqual({ higher: 'MEHR', lower: 'WENIGER' })
    expect(guessLabels('area')).toEqual({ higher: 'GRÖSSER', lower: 'KLEINER' })
    expect(guessLabels('duration')).toEqual({ higher: 'LÄNGER', lower: 'KÜRZER' })
    expect(guessLabels('depth')).toEqual({ higher: 'TIEFER', lower: 'FLACHER' })
    expect(guessLabels('power')).toEqual({ higher: 'STÄRKER', lower: 'SCHWÄCHER' })
    expect(guessLabels('calories')).toEqual({ higher: 'MEHR', lower: 'WENIGER' })
  })
})

describe('categoryLabel', () => {
  it('setzt die Kategorie in Kapitälchen-Sinn', () => {
    expect(categoryLabel('population')).toBe('EINWOHNER')
    expect(categoryLabel('area')).toBe('FLÄCHE')
    expect(categoryLabel('weight')).toBe('GEWICHT')
    expect(categoryLabel('year')).toBe('GEBURTSJAHR')
    expect(categoryLabel('duration')).toBe('DAUER')
    expect(categoryLabel('depth')).toBe('TIEFE')
    expect(categoryLabel('power')).toBe('LEISTUNG')
    expect(categoryLabel('calories')).toBe('KALORIEN')
  })
})

describe('densityLabel', () => {
  it('zeigt nur deutsche Dichte-Namen', () => {
    expect(densityLabel('locker')).toBe('Locker')
    expect(densityLabel('knackig')).toBe('Knackig')
    expect(densityLabel('haarscharf')).toBe('Haarscharf')
  })
})

describe('dealerLine', () => {
  it('kommentiert nur enge Paare, nie einen Mitspieler', () => {
    expect(dealerLine(2.04, 1.86)).toBe('knapp!')
    expect(dealerLine(83879, 78871)).toBe('knapp!')
    expect(dealerLine(100, 80)).toBe('mutig.')
    expect(dealerLine(443, 310)).toBeNull()
    expect(dealerLine(1756, 1770, 'year')).toBe('knapp!')
    expect(dealerLine(1853, 1881, 'year')).toBe('mutig.')
  })
})

describe('playStyleLabel', () => {
  it('benennt Team und Gegeneinander', () => {
    expect(playStyleLabel('team')).toBe('Team')
    expect(playStyleLabel('versus')).toBe('Gegeneinander')
  })
})

describe('livesForRoom', () => {
  it('gibt immer 3 Leben', () => {
    expect(livesForRoom()).toBe(3)
  })
})

describe('streakTitle', () => {
  it('stuft Serien ein', () => {
    expect(streakTitle(0)).toBe('Noch kalt')
    expect(streakTitle(3)).toBe('Fuß in der Tür')
    expect(streakTitle(12)).toBe('Im Fluss')
    expect(streakTitle(40)).toBe('Unaufhaltsam')
  })
})
