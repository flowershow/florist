'use client'

import { useState, useMemo, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { CsvEmbed } from '../lib/tiptap/extensions/csvEmbed'
import { createAssetRegistry } from '../lib/assets'
import { parseCsvText } from '../lib/csv'
import { serializeToMarkdown } from '../lib/serialization'

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

export default function EditorShell() {
    const [title, setTitle] = useState('')
    const [subtitle, setSubtitle] = useState('')
    const registry = useMemo(() => createAssetRegistry(), [])

    const editor = useEditor({
        extensions: [
            StarterKit,
            CustomImage,
            CsvEmbed
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-lg focus:outline-none max-w-none',
            },
        },
        content: '',
    })

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault()
        if (!editor) return

        const files = Array.from(e.dataTransfer.files)
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file)
                registry.register({
                    filename: file.name,
                    originalName: file.name,
                    mime: file.type,
                    url,
                })
                editor.chain().focus().setImage({ src: url, alt: file.name }).updateAttributes('image', { filename: file.name }).run()
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

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleSave = () => {
        if (!editor) return
        const markdown = serializeToMarkdown({
            title,
            subtitle,
            doc: editor.getJSON(),
        })
        console.log('--- SAVED MARKDOWN ---')
        console.log(markdown)
        console.log('--- ASSET REGISTRY ---')
        console.log(registry.list())
    }

    return (
        <div
            className="min-h-screen p-8 max-w-3xl mx-auto"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <header className="mb-8 flex justify-between items-center">
                <div className="text-sm text-gray-500">Draft</div>
                <button
                    onClick={handleSave}
                    className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                    Save
                </button>
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
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}
