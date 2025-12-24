'use client'

import { AssetProvider, useAssetRegistry } from './AssetContext'
import DocumentEditor, { type DocumentContent } from './DocumentEditor'
import { serializeToMarkdown } from '../lib/serialization'

export default function EditorShell() {
    return (
        <AssetProvider>
            <EditorShellInner />
        </AssetProvider>
    )
}

function EditorShellInner() {
    const registry = useAssetRegistry()

    const handleSave = (content: DocumentContent) => {
        const markdown = serializeToMarkdown({
            title: content.title,
            subtitle: content.subtitle,
            doc: content.doc,
        })
        console.log('--- SAVED MARKDOWN ---')
        console.log(markdown)
        console.log('--- ASSET REGISTRY ---')
        console.log(registry.list())
    }

    return (
        <DocumentEditor onSave={handleSave} />
    )
}
