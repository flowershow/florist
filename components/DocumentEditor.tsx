'use client'

import { useState, useCallback, useEffect } from 'react'
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Markdown } from 'tiptap-markdown'
import { CsvEmbed } from '../lib/tiptap/extensions/csvEmbed'
import { parseCsvText } from '../lib/csv'
import Toolbar from './Toolbar'
import { useAssetRegistry } from './AssetContext'

const CustomImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            filename: {
                default: null,
            },
        }
    },
})

export type DocumentContent = {
    title: string
    subtitle: string
    doc?: JSONContent | string // Support both JSON and Markdown string
}

interface DocumentEditorProps {
    initialContent?: DocumentContent | null
    onSave?: (content: DocumentContent) => void
    onFileUpload?: (file: File) => Promise<string>
    className?: string
}

export default function DocumentEditor({
    initialContent,
    onSave,
    onFileUpload,
    className = ''
}: DocumentEditorProps) {
    const [title, setTitle] = useState(initialContent?.title || '')
    const [subtitle, setSubtitle] = useState(initialContent?.subtitle || '')
    const [isUploading, setIsUploading] = useState(false)
    const registry = useAssetRegistry()

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            Markdown.configure({
                html: true,
                tightLists: true,
                tightListClass: 'tight',
                bulletListMarker: '-',
                linkify: true,
                breaks: true,
            }),
            CustomImage,
            CsvEmbed
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-lg focus:outline-none max-w-none',
            },
        },
        content: initialContent?.doc || '',
        immediatelyRender: false,
    })

    // Update local state if initialContent changes
    useEffect(() => {
        if (initialContent) {
            setTitle(initialContent.title || '')
            setSubtitle(initialContent.subtitle || '')
            if (editor && initialContent.doc) {
                editor.commands.setContent(initialContent.doc)
            }
        }
    }, [initialContent, editor])


    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault()
        if (!editor) return

        const files = Array.from(e.dataTransfer.files)
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                handleImageSelect(file)
            } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                handleCsvSelect(file)
            }
        }
    }, [editor])

    const handleImageSelect = async (file: File) => {
        if (!editor) return

        let url = URL.createObjectURL(file)

        if (onFileUpload) {
            setIsUploading(true)
            try {
                url = await onFileUpload(file)
            } catch (err) {
                console.error("Upload failed", err)
                return
            } finally {
                setIsUploading(false)
            }
        } else {
            // Local fallback
            registry.register({
                filename: file.name,
                originalName: file.name,
                mime: file.type,
                url,
                parsed: undefined
            })
        }

        editor.chain().focus().setImage({ src: url, alt: file.name }).updateAttributes('image', { filename: file.name }).run()
    }

    const handleCsvSelect = async (file: File) => {
        if (!editor) return

        try {
            const text = await file.text()
            // Validate CSV
            const parsed = parseCsvText(text)
            let url = URL.createObjectURL(file)

            if (onFileUpload) {
                setIsUploading(true)
                try {
                    url = await onFileUpload(file)
                } finally {
                    setIsUploading(false)
                }
            } else {
                registry.register({
                    filename: file.name,
                    originalName: file.name,
                    mime: file.type,
                    url,
                    parsed
                })
            }

            editor.chain().focus().insertContent({ type: 'csvEmbed', attrs: { filename: file.name } }).run()
        } catch (err) {
            console.error('Failed to parse CSV', err)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleSaveClick = () => {
        if (!editor || !onSave) return
        onSave({
            title,
            subtitle,
            doc: (editor as any).getMarkdown()
        })
    }

    return (
        <div
            className={`min-h-screen p-8 max-w-3xl mx-auto relative ${className}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            {isUploading && (
                <div className="fixed top-20 right-8 bg-white shadow-xl border border-gray-100 rounded-lg p-4 flex items-center gap-3 z-50 transition-all animate-in fade-in slide-in-from-top-4">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-semibold text-gray-800">Uploading to GitHub...</span>
                </div>
            )}

            <header className="mb-8 flex justify-between items-center">
                <div className="text-sm text-gray-500 font-medium">Draft</div>
                {onSave && (
                    <button
                        onClick={handleSaveClick}
                        className="bg-black text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 active:scale-95 transition-all shadow-sm"
                    >
                        Save
                    </button>
                )}
            </header>

            <div className="mb-12 space-y-4">
                <input
                    type="text"
                    placeholder="Title"
                    className="w-full text-5xl font-extrabold border-none outline-none placeholder-gray-200 tracking-tight"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Subtitle"
                    className="w-full text-2xl text-gray-500 font-medium border-none outline-none placeholder-gray-200"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                />
            </div>

            <div className="min-h-[500px]">
                <Toolbar editor={editor} onImageSelect={handleImageSelect} />
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}
