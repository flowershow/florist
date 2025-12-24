'use client'

import { useState, useRef } from 'react'
import { AssetProvider } from './AssetContext'
import DocumentEditor, { type DocumentEditorRef } from './DocumentEditor'
import { serializeToMarkdown } from '../lib/serialization'

export default function EditorShell() {
    return (
        <AssetProvider>
            <EditorShellInner />
        </AssetProvider>
    )
}

function EditorShellInner() {
    const editorRef = useRef<DocumentEditorRef>(null)
    const [savedMarkdown, setSavedMarkdown] = useState<string | null>(null)
    const [isCopied, setIsCopied] = useState(false)

    const handleSave = () => {
        if (!editorRef.current) return
        const content = editorRef.current.getData()
        const markdown = serializeToMarkdown({
            title: content.title,
            subtitle: content.subtitle,
            doc: content.doc,
        })
        setSavedMarkdown(markdown)
    }

    const handleCopy = () => {
        if (!savedMarkdown) return
        navigator.clipboard.writeText(savedMarkdown)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* External Header */}
            <header className="max-w-3xl mx-auto w-full px-8 pt-8 flex justify-between items-center bg-white sticky top-0 z-20 pb-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 font-medium">Drafting in Demo</span>
                </div>
                <button
                    onClick={handleSave}
                    className="bg-black text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 active:scale-95 transition-all shadow-sm"
                >
                    Save
                </button>
            </header>

            <DocumentEditor ref={editorRef} />

            {/* Markdown Output Area */}
            {savedMarkdown && (
                <div className="max-w-3xl mx-auto w-full px-8 pb-24 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 relative group">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Generated Markdown</h3>
                            <button
                                onClick={handleCopy}
                                className="text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                {isCopied ? 'Copied!' : 'Copy to Clipboard'}
                            </button>
                        </div>
                        <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {savedMarkdown}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    )
}
