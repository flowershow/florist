import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { CsvNodeView } from '../../../components/CsvNodeView'

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
    renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-csv-embed': '' })]
    },
    addNodeView() {
        return ReactNodeViewRenderer(CsvNodeView)
    }
})
