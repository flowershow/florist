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
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle')

    const handleSave = () => {
        if (!editorRef.current) return
        setSaveStatus('saving')

        const content = editorRef.current.getData()
        const markdown = serializeToMarkdown({
            title: content.title,
            subtitle: content.subtitle,
            doc: content.doc,
        })

        setSavedMarkdown(markdown)
        setSaveStatus('success')

        setTimeout(() => setSaveStatus('idle'), 2000)
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
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-sm active:scale-95 ${saveStatus === 'success'
                            ? 'bg-green-500 text-white scale-105'
                            : 'bg-black text-white hover:bg-gray-800'
                        }`}
                >
                    {saveStatus === 'success' ? '✓ Saved!' : 'Save'}
                </button>
            </header>

            <div className="max-w-3xl mx-auto w-full">
                {/* Markdown Output Area - Moved Above Editor */}
                {savedMarkdown && (
                    <div className="px-8 mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative group">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Generated Markdown</h3>
                                <button
                                    onClick={handleCopy}
                                    className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    {isCopied ? 'Copied!' : 'Copy to Clipboard'}
                                </button>
                            </div>
                            <div className="max-h-48 overflow-y-auto scrollbar-hide">
                                <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {savedMarkdown}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                <DocumentEditor ref={editorRef} />
            </div>
        </div>
    )
}
