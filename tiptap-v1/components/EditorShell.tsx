'use client'

import { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { createAssetRegistry } from '@/lib/assets'
import { parseCsvText } from '@/lib/csv'
import { CsvEmbed } from '@/lib/tiptap/extensions/csvEmbed'

type DraftPayload = {
  title: string
  subtitle: string
  doc: Record<string, unknown>
  assets: ReturnType<ReturnType<typeof createAssetRegistry>['list']>
  updatedAt: number
}

const STORAGE_KEY = 'tiptap-v1:draft'
const AUTOSAVE_INTERVAL = 5000

const ImageWithFilename = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      filename: {
        default: ''
      }
    }
  }
})

function createFilename(file: File) {
  const safeName = file.name.replace(/\s+/g, '-').toLowerCase()
  const nonce = Math.random().toString(16).slice(2, 8)
  return `${Date.now()}-${nonce}-${safeName}`
}

export function EditorShell() {
  const registryRef = useRef(createAssetRegistry())
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const pendingDraftRef = useRef<DraftPayload | null>(null)

  const editor = useEditor({
    extensions: [StarterKit, ImageWithFilename, CsvEmbed],
    editorProps: {
      attributes: {
        class: 'editor-body'
      }
    }
  })

  const hasContent = editor ? !editor.isEmpty : false

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as DraftPayload
      pendingDraftRef.current = parsed
      setTitle(parsed.title || '')
      setSubtitle(parsed.subtitle || '')
      setLastSavedAt(parsed.updatedAt || null)
    } catch (error) {
      console.warn('Failed to load draft', error)
    }
  }, [])

  useEffect(() => {
    if (!editor) return
    const pending = pendingDraftRef.current
    if (!pending) return
    editor.commands.setContent(pending.doc)
    pending.assets.forEach((asset) => {
      registryRef.current.register(asset)
    })
    pendingDraftRef.current = null
  }, [editor])

  useEffect(() => {
    if (!editor) return
    const interval = window.setInterval(() => {
      const payload: DraftPayload = {
        title,
        subtitle,
        doc: editor.getJSON(),
        assets: registryRef.current.list(),
        updatedAt: Date.now()
      }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
        setLastSavedAt(payload.updatedAt)
      } catch (error) {
        console.warn('Autosave failed', error)
      }
    }, AUTOSAVE_INTERVAL)

    return () => window.clearInterval(interval)
  }, [editor, title, subtitle])

  const hintVisible = !title && !subtitle && !hasContent

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    if (!editor) return
    if (!event.dataTransfer?.files?.length) return
    event.preventDefault()

    const files = Array.from(event.dataTransfer.files)
    for (const file of files) {
      const filename = createFilename(file)
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        registryRef.current.register({
          filename,
          originalName: file.name,
          mime: file.type,
          url
        })
        editor.chain().focus().setImage({ src: url, alt: file.name, filename }).run()
        continue
      }

      if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
        const url = URL.createObjectURL(file)
        let parsed: string[][] | undefined
        try {
          const text = await file.text()
          parsed = parseCsvText(text)
        } catch (error) {
          console.warn('CSV parse failed', error)
        }

        registryRef.current.register({
          filename,
          originalName: file.name,
          mime: file.type,
          url,
          parsed
        })
        editor
          .chain()
          .focus()
          .insertContent({ type: 'csvEmbed', attrs: { filename } })
          .run()
        continue
      }

      console.warn(`Unsupported file: ${file.name}`)
    }
  }

  return (
    <div className="editor-shell" onDrop={handleDrop} onDragOver={(event) => event.preventDefault()}>
      <div className="editor-frame">
        <input
          className="editor-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
        />
        <input
          className="editor-subtitle"
          value={subtitle}
          onChange={(event) => setSubtitle(event.target.value)}
          placeholder="Subtitle"
        />
        <div className="editor-separator" />
        {hintVisible ? (
          <div className="editor-hint">Drop an image or CSV, or start writing below.</div>
        ) : null}
        <EditorContent editor={editor} />
        {lastSavedAt ? (
          <div className="autosave-status">
            Autosaved {new Date(lastSavedAt).toLocaleTimeString()}
          </div>
        ) : null}
      </div>
    </div>
  )
}
