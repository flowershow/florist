import { describe, expect, it } from 'vitest'
import { createAssetRegistry } from './assets'

describe('asset registry', () => {
  it('registers and returns assets by filename', () => {
    const registry = createAssetRegistry()
    registry.register({
      filename: 'image.png',
      originalName: 'image.png',
      mime: 'image/png',
      url: 'blob://image'
    })

    expect(registry.get('image.png')?.mime).toBe('image/png')
    expect(registry.list()).toHaveLength(1)
  })
})
