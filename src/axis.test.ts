import { categoryLabel, dealerLine, densityLabel, guessLabels, livesForMode, streakTitle, voteCounts, winningMode } from './axis.ts'

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
  })
})

describe('categoryLabel', () => {
  it('setzt die Kategorie in Kapitälchen-Sinn', () => {
    expect(categoryLabel('population')).toBe('EINWOHNER')
    expect(categoryLabel('area')).toBe('FLÄCHE')
    expect(categoryLabel('weight')).toBe('GEWICHT')
    expect(categoryLabel('year')).toBe('GEBURTSJAHR')
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

describe('voteCounts', () => {
  it('zählt Stimmen je Modus', () => {
    expect(voteCounts({ a: 'kids', b: 'kids', c: 'adult' })).toEqual({ adult: 1, kids: 2 })
    expect(voteCounts({})).toEqual({ adult: 0, kids: 0 })
  })
})

describe('winningMode', () => {
  it('nimmt die Mehrheit', () => {
    expect(winningMode({ a: 'kids', b: 'kids', c: 'adult' }, 'c')).toBe('kids')
    expect(winningMode({ a: 'adult', b: 'kids' }, 'a')).toBe('adult')
  })

  it('bei Gleichstand die Stimme des Hosts', () => {
    expect(winningMode({ host: 'kids', p2: 'adult' }, 'host')).toBe('kids')
    expect(winningMode({ host: 'adult', p2: 'kids' }, 'host')).toBe('adult')
  })

  it('ohne Host-Stimme im Gleichstand Erwachsene', () => {
    expect(winningMode({}, 'host')).toBe('adult')
  })
})

describe('livesForMode', () => {
  it('gibt Kindern mehr Leben', () => {
    expect(livesForMode('adult')).toBe(3)
    expect(livesForMode('kids')).toBe(5)
  })
})

describe('streakTitle', () => {
  it('vergibt Titel nach Streak', () => {
    expect(streakTitle(0)).toBe('Noch kalt')
    expect(streakTitle(3)).toBe('Fuß in der Tür')
    expect(streakTitle(12)).toBe('Im Fluss')
    expect(streakTitle(40)).toBe('Unaufhaltsam')
  })
})
