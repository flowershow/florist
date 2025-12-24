'use client'

import { useState, useMemo, useRef } from 'react'
import DocumentEditor, { type DocumentEditorRef } from './DocumentEditor'
import { AssetProvider } from './AssetContext'
import { saveReadme, uploadAsset } from '../app/actions'
import { serializeToMarkdown } from '../lib/serialization'
import { parseMarkdown } from '../lib/markdown'
import Link from 'next/link'

export default function GithubEditorShell({
    owner,
    repo,
    initialMarkdown
}: {
    owner: string,
    repo: string,
    initialMarkdown: string | null
}) {
    const editorRef = useRef<DocumentEditorRef>(null)
    const [isSaving, setIsSaving] = useState(false)

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

    const handleSave = async () => {
        if (!editorRef.current) return
        const content = editorRef.current.getData()

        const markdown = serializeToMarkdown({
            title: content.title,
            subtitle: content.subtitle,
            doc: content.doc
        })

        setIsSaving(true)
        try {
            await saveReadme(owner, repo, markdown)
            alert('Saved to GitHub!')
        } catch (err) {
            console.error(err)
            alert('Failed to save to GitHub.')
        } finally {
            setIsSaving(false)
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
            <div className="flex flex-col min-h-screen bg-white">
                {/* External Header with Breadcrumbs and Save */}
                <header className="max-w-3xl mx-auto w-full px-8 pt-8 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-20 pb-4 border-b border-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Link href="/" className="hover:text-black transition-colors">Florist</Link>
                        <span>/</span>
                        <Link href="/github" className="hover:text-black transition-colors">{owner}</Link>
                        <span>/</span>
                        <span className="font-semibold text-black">{repo}</span>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-black text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 active:scale-95 transition-all shadow-sm disabled:bg-gray-400 disabled:scale-100"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </header>

                <DocumentEditor
                    ref={editorRef}
                    initialContent={initialContent}
                    onFileUpload={handleUpload}
                />
            </div>
        </AssetProvider>
    )
}
