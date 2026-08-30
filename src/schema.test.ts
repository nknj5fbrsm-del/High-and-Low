import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ADULT_DECK, KIDS_DECK, toSqlInserts } from './deck.ts'

const schema = readFileSync(resolve(process.cwd(), 'supabase/schema.sql'), 'utf8')

describe('schema.sql', () => {
  it('enthält den aktuellen Stapel und keine Elektronik-Preise', () => {
    expect(schema).toContain(toSqlInserts())
    expect(schema).not.toContain('steam-deck')
    expect(schema).not.toContain('iphone-16')
    expect(schema).not.toContain("'price'")
    expect(schema).toContain("'mozart'")
    expect(schema).toContain("'k-beethoven'")
    for (const card of [...ADULT_DECK, ...KIDS_DECK]) {
      expect(schema).toContain(`('${card.id}'`)
    }
  })

  it('legt frische Paare mit Dichte und ohne Kette', () => {
    expect(schema).toContain('deal_fresh_pair')
    expect(schema).toContain('selected_density')
    expect(schema).toContain('set_density')
    expect(schema).toContain('pair_fits_density')
    expect(schema).not.toContain('CREATE OR REPLACE FUNCTION deal_after_reference')
    expect(schema).toContain("CHECK (selected_density IN ('locker', 'knackig', 'haarscharf'))")
  })
})
