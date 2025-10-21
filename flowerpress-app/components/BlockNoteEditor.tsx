'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import { editorAPI } from '@/lib/api'
import '@blocknote/mantine/style.css'

interface BlockNoteEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function BlockNoteEditor({ value, onChange }: BlockNoteEditorProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [lastValue, setLastValue] = useState(value)
  const isUpdatingFromProps = useRef(false)

  useEffect(() => {
    setIsInitialized(false)
    setLastValue(value)
  }, [])

  // Mock asset upload integrated with our storage system
  const uploadAsset = useCallback(async (file: File): Promise<string> => {
    console.log('Upload Asset called:', file.name, file.type)
    try {
      // Use our mock storage system
      const result = await editorAPI.saveAsset(file, 'default-space', 'current-doc')
      console.log('Upload Asset result:', result.url)
      return result.url
    } catch (error) {
      console.error('Failed to upload asset:', error)
      // Fallback to object URL for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        console.log('Fallback URL created:', url)
        return url
      }
      throw error
    }
  }, [])

  // Create editor with stable configuration
  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: "paragraph",
        content: "Start writing your document..."
      }
    ],
    // Don't use uploadFile prop to avoid conflicts with our custom paste handler
    domAttributes: {
      editor: {
        class: 'flowerpress-editor'
      }
    }
  })

  // Initialize editor content only once or when document changes significantly
  useEffect(() => {
    if (!editor) return

    const initializeContent = async () => {
      try {
        if (value && (value !== lastValue || !isInitialized)) {
          setLastValue(value)

          if (value.trim()) {
            const blocks = await editor.tryParseMarkdownToBlocks(value)
            isUpdatingFromProps.current = true
            editor.replaceBlocks(editor.document, blocks)
            isUpdatingFromProps.current = false
          }
        } else if (!value && !isInitialized) {
          isUpdatingFromProps.current = true
          editor.replaceBlocks(editor.document, [
            {
              type: "paragraph",
              content: "Start writing your document..."
            }
          ])
          isUpdatingFromProps.current = false
        }

        setIsInitialized(true)
      } catch (error) {
        console.warn('Failed to initialize editor content:', error)
        isUpdatingFromProps.current = false
        setIsInitialized(true)
      }
    }

    initializeContent()
  }, [value, editor])

  // Handle paste events for images - create image blocks specifically
  useEffect(() => {
    if (!editor) return

    const handlePaste = async (event: Event) => {
      const clipboardEvent = event as ClipboardEvent
      const items = clipboardEvent.clipboardData?.items
      if (!items) return

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          // Prevent default and stop propagation to handle image paste ourselves
          event.preventDefault()
          event.stopPropagation()
          const file = item.getAsFile()
          if (file) {
            try {
              console.log('Processing image paste:', file.name, file.type)
              const url = await uploadAsset(file)
              console.log('Image uploaded, inserting block:', url)

              // Insert specifically as an image block
              const currentBlock = editor.getTextCursorPosition().block
              await editor.insertBlocks([
                {
                  type: 'image',
                  props: {
                    url: url,
                    caption: ''
                  }
                }
              ], currentBlock, 'after')

              console.log('Image block inserted successfully')
            } catch (error) {
              console.error('Failed to paste image:', error)
            }
          }
          // Break after handling first image to avoid duplicates
          break
        }
      }
    }

    // Add paste listener
    const editorElement = document.querySelector('.flowerpress-editor')
    if (editorElement) {
      editorElement.addEventListener('paste', handlePaste)
      return () => {
        editorElement.removeEventListener('paste', handlePaste)
      }
    }
  }, [editor, uploadAsset])

  // Handle changes from the editor
  const handleChange = useCallback(async () => {
    if (!editor || isUpdatingFromProps.current || !isInitialized) return

    try {
      const markdown = await editor.blocksToMarkdownLossy(editor.document)

      // Only call onChange if the content actually changed
      if (markdown !== lastValue) {
        setLastValue(markdown)
        onChange(markdown)
      }
    } catch (error) {
      console.error('Failed to convert blocks to markdown:', error)
    }
  }, [editor, onChange, lastValue, isInitialized])

  // Error boundary for block operations
  const handleError = useCallback((error: Error) => {
    console.error('BlockNote editor error:', error)
    // Don't crash the app, just log the error
  }, [])

  if (!editor) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-500">
        Loading editor...
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme="light"
        className="h-full"
      />
    </div>
  )
}