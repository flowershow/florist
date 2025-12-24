'use client'

import { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'
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

export interface DocumentEditorRef {
    getData: () => DocumentContent
}

interface DocumentEditorProps {
    initialContent?: DocumentContent | null
    onFileUpload?: (file: File) => Promise<string>
    className?: string
}

const DocumentEditor = forwardRef<DocumentEditorRef, DocumentEditorProps>(({
    initialContent,
    onFileUpload,
    className = ''
}, ref) => {
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

    // Expose data via ref
    useImperativeHandle(ref, () => ({
        getData: () => ({
            title,
            subtitle,
            doc: (editor as any)?.storage?.markdown?.getMarkdown?.() || ''
        })
    }), [title, subtitle, editor])

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
            // Register locally first so UI updates immediately
            registry.register({
                filename: file.name,
                originalName: file.name,
                mime: file.type,
                url,
                parsed: undefined
            })
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
                // Register locally first so UI updates immediately
                registry.register({
                    filename: file.name,
                    originalName: file.name,
                    mime: file.type,
                    url,
                    parsed
                })
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

    return (
        <div
            className={`min-h-screen p-8 max-w-3xl mx-auto relative ${className}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            {isUploading && (
                <div className="fixed top-20 right-8 bg-white shadow-xl border border-gray-100 rounded-lg p-4 flex items-center gap-3 z-50 transition-all animate-in fade-in slide-in-from-top-4">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-semibold text-gray-800">Uploading...</span>
                </div>
            )}

            <div className="mb-12 space-y-4 pt-12">
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
})

DocumentEditor.displayName = 'DocumentEditor'

export default DocumentEditor
