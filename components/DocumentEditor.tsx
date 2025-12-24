'use client'

import { useState, useCallback, useEffect } from 'react'
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
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
    doc: JSONContent
}

interface DocumentEditorProps {
    initialContent?: DocumentContent | null
    onSave?: (content: DocumentContent) => void
    className?: string
}

export default function DocumentEditor({
    initialContent,
    onSave,
    className = ''
}: DocumentEditorProps) {
    const [title, setTitle] = useState(initialContent?.title || '')
    const [subtitle, setSubtitle] = useState(initialContent?.subtitle || '')
    const registry = useAssetRegistry()

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
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
                // Only update if content is different to avoid cursor jumps or loops.
                // For simplified v1, we might skip deep comparison and assume initialContent is truly "initial".
                // But if we want to support external updates, we'd need more logic.
                // For now, let's respect the prop if it's provided on mount.
                // We won't force update the editor content on every render to avoid issues.
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
                try {
                    const text = await file.text()
                    // Validate CSV
                    const parsed = parseCsvText(text)
                    const url = URL.createObjectURL(file)
                    registry.register({
                        filename: file.name,
                        originalName: file.name,
                        mime: file.type,
                        url,
                        parsed
                    })
                    editor.chain().focus().insertContent({ type: 'csvEmbed', attrs: { filename: file.name } }).run()
                } catch (err) {
                    console.error('Failed to parse CSV', err)
                }
            }
        }
    }, [editor, registry])

    const handleImageSelect = (file: File) => {
        if (!editor) return
        const url = URL.createObjectURL(file)
        registry.register({
            filename: file.name,
            originalName: file.name,
            mime: file.type,
            url,
            parsed: undefined
        })
        editor.chain().focus().setImage({ src: url, alt: file.name }).updateAttributes('image', { filename: file.name }).run()
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleSaveClick = () => {
        if (!editor || !onSave) return
        onSave({
            title,
            subtitle,
            doc: editor.getJSON()
        })
    }

    return (
        <div
            className={`min-h-screen p-8 max-w-3xl mx-auto ${className}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <header className="mb-8 flex justify-between items-center">
                <div className="text-sm text-gray-500">Draft</div>
                {onSave && (
                    <button
                        onClick={handleSaveClick}
                        className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                        Save
                    </button>
                )}
            </header>

            <div className="mb-8 space-y-4">
                <input
                    type="text"
                    placeholder="Title"
                    className="w-full text-4xl font-bold border-none outline-none placeholder-gray-300"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Subtitle"
                    className="w-full text-xl text-gray-600 border-none outline-none placeholder-gray-300"
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
