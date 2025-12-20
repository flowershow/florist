import { Node, mergeAttributes } from '@tiptap/core'

export const CsvEmbed = Node.create({
  name: 'csvEmbed',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      filename: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-filename'),
        renderHTML: (attributes) => ({
          'data-filename': attributes.filename
        })
      }
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-csv-embed]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-csv-embed': '' }), 0]
  }
})
