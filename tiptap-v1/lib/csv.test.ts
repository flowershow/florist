import { describe, expect, it } from 'vitest'
import { parseCsvText } from './csv'

describe('parseCsvText', () => {
  it('parses rows and handles quoted commas', () => {
    const input = 'name,desc\n"foo","bar, baz"'
    const rows = parseCsvText(input)
    expect(rows).toEqual([
      ['name', 'desc'],
      ['foo', 'bar, baz']
    ])
  })
})
