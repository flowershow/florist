import { Node, mergeAttributes } from '@tiptap/core'

export const CsvEmbed = Node.create({
  name: 'csvEmbed',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      filename: { default: '' }
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-csv-embed]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-csv-embed': '' }), 0]
  }
})
