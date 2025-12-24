'use client'

import { useState, useMemo } from 'react'
import DocumentEditor, { type DocumentContent } from './DocumentEditor'
import { AssetProvider } from './AssetContext'
import { saveReadme, uploadAsset } from '../app/actions'
import { serializeToMarkdown } from '../lib/serialization'
import { parseMarkdown } from '../lib/markdown'

export default function GithubEditorShell({
    owner,
    repo,
    initialMarkdown
}: {
    owner: string,
    repo: string,
    initialMarkdown: string | null
}) {
    const initialContent = useMemo(() => {
        if (!initialMarkdown) {
            return { title: '', subtitle: '', doc: '' }
        }
        const parsed = parseMarkdown(initialMarkdown)
        return {
            title: parsed.title,
            subtitle: parsed.subtitle,
            doc: parsed.content
        }
    }, [initialMarkdown])

    const handleSave = async (content: DocumentContent) => {
        // Serialize back to MD
        const markdown = serializeToMarkdown({
            title: content.title,
            subtitle: content.subtitle,
            doc: content.doc
        })

        try {
            await saveReadme(owner, repo, markdown)
            alert('Saved to GitHub!')
        } catch (err) {
            console.error(err)
            alert('Failed to save to GitHub.')
        }
    }

    const handleUpload = async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        const url = await uploadAsset(owner, repo, file.name, formData)
        return url
    }

    return (
        <AssetProvider>
            <DocumentEditor
                initialContent={initialContent}
                onSave={handleSave}
                onFileUpload={handleUpload}
            />
        </AssetProvider>
    )
}
