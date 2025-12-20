import { describe, expect, it } from 'vitest'
import { serializeToMarkdown } from './serialization'

describe('serializeToMarkdown', () => {
    it('adds frontmatter and serializes image and csv nodes', () => {
        const doc = {
            type: 'doc',
            content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
                { type: 'image', attrs: { alt: 'Alt', filename: 'cat.png' } },
                { type: 'csvEmbed', attrs: { filename: 'data.csv' } }
            ]
        }

        const markdown = serializeToMarkdown({
            title: 'Title',
            subtitle: 'Subtitle',
            doc
        })

        expect(markdown).toContain('title: "Title"')
        expect(markdown).toContain('subtitle: "Subtitle"')
        expect(markdown).toContain('![Alt](./cat.png)')
        expect(markdown).toContain('{{table: data.csv}}')
    })
})
