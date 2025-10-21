'use client'

import { useState, useEffect, useCallback } from 'react'
import CodeMirrorEditor, { MarkdownPreview } from './CodeMirrorEditor'
import BlockNoteEditor from './BlockNoteEditor'
import FileDropZone from './FileDropZone'
import ErrorBoundary from './ErrorBoundary'
import { useEditorStore } from '@/lib/store'
import { editorAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { Document } from '@/types'

interface SplitScreenEditorProps {
  spaceId: string
  document: Document
  onDocumentUpdate?: (doc: Document) => void
}

export default function SplitScreenEditor({ spaceId, document, onDocumentUpdate }: SplitScreenEditorProps) {
  const [markdown, setMarkdown] = useState(document.markdown || '')
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'rich' | 'split' | 'source' | 'preview'>('rich')

  const {
    setDocument,
    setSaving,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    updateMarkdown
  } = useEditorStore()

  // Initialize editor with document data
  useEffect(() => {
    setMarkdown(document.markdown || '')
    setDocument(document)
    setHasUnsavedChanges(false)
  }, [document.id, setDocument, setHasUnsavedChanges]) // Use document.id to ensure proper reinitialization

  // Load fresh content from server
  const loadDocumentContent = useCallback(async () => {
    try {
      setIsLoading(true)
      const { markdown: content, version } = await editorAPI.getMarkdown(spaceId, document.slug)
      const title = content?.split('\n')[0]?.replace(/^#\s*/, '') || document.title

      const updatedDoc = {
        ...document,
        markdown: content || '',
        version,
        title
      }

      setMarkdown(content || '')
      setDocument(updatedDoc)
      onDocumentUpdate?.(updatedDoc)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to load document:', error)
      toast.error('Failed to load document')
    } finally {
      setIsLoading(false)
    }
  }, [spaceId, document, setDocument, setHasUnsavedChanges, onDocumentUpdate])

  // Handle markdown changes
  const handleMarkdownChange = useCallback((newMarkdown: string) => {
    setMarkdown(newMarkdown)

    const title = newMarkdown.split('\n')[0]?.replace(/^#\s*/, '') || document.title
    const updatedDoc = {
      ...document,
      title,
      markdown: newMarkdown,
      updatedAt: new Date()
    }

    setDocument(updatedDoc)
    updateMarkdown(newMarkdown)
    onDocumentUpdate?.(updatedDoc)
    setHasUnsavedChanges(true)
  }, [document, setDocument, updateMarkdown, onDocumentUpdate, setHasUnsavedChanges])

  // Manual save function
  const handleSave = useCallback(async () => {
    if (!hasUnsavedChanges || !markdown) return

    try {
      setSaving(true)
      const result = await editorAPI.saveMarkdown(spaceId, document.slug, markdown)

      const updatedDoc = {
        ...document,
        markdown,
        version: result.version,
        updatedAt: new Date()
      }

      setDocument(updatedDoc)
      onDocumentUpdate?.(updatedDoc)
      setHasUnsavedChanges(false)
      toast.success('Document saved')
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('Failed to save document')
    } finally {
      setSaving(false)
    }
  }, [hasUnsavedChanges, markdown, spaceId, document, setSaving, setHasUnsavedChanges, setDocument, onDocumentUpdate])

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(async () => {
      if (hasUnsavedChanges && markdown && document) {
        try {
          setSaving(true)
          const result = await editorAPI.saveMarkdown(spaceId, document.slug, markdown)

          // Update document with new version info
          const updatedDoc = {
            ...document,
            markdown,
            version: result.version,
            updatedAt: new Date()
          }

          setDocument(updatedDoc)
          onDocumentUpdate?.(updatedDoc)
          setHasUnsavedChanges(false)
        } catch (error) {
          console.error('Autosave failed:', error)
          // Don't show toast for autosave failures as they're too noisy
        } finally {
          setSaving(false)
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [hasUnsavedChanges, markdown, spaceId, document, setSaving, setHasUnsavedChanges, setDocument, onDocumentUpdate])

  // Handle file insertion from drag & drop
  const handleFileInsert = useCallback((insertMarkdown: string) => {
    const cursorPos = markdown.length // Insert at end for now
    const newMarkdown = markdown + '\n\n' + insertMarkdown
    handleMarkdownChange(newMarkdown)
  }, [markdown, handleMarkdownChange])

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading editor...</div>
      </div>
    )
  }

  return (
    <FileDropZone
      spaceId={spaceId}
      document={document}
      onFileInsert={handleFileInsert}
    >
      <div className="h-full flex flex-col">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">View:</span>
          <div className="flex items-center gap-1 bg-white rounded-lg p-1">
            <button
              onClick={() => setViewMode('rich')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'rich'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Rich
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'split'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('source')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'source'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Source
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'preview'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Preview
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadDocumentContent}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            title="Reload content"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 min-h-0">
        {viewMode === 'rich' && (
          <div className="h-full bg-white">
            <ErrorBoundary>
              <BlockNoteEditor
                key={`${document.id}-rich`}
                value={markdown}
                onChange={handleMarkdownChange}
              />
            </ErrorBoundary>
          </div>
        )}

        {viewMode === 'split' && (
          <div className="h-full flex">
            <div className="w-1/2 border-r border-gray-200 bg-white">
              <CodeMirrorEditor
                key={`${document.id}-split`}
                value={markdown}
                onChange={handleMarkdownChange}
              />
            </div>
            <div className="w-1/2 overflow-y-auto bg-white">
              <MarkdownPreview markdown={markdown} />
            </div>
          </div>
        )}

        {viewMode === 'source' && (
          <div className="h-full bg-white">
            <CodeMirrorEditor
              key={`${document.id}-source`}
              value={markdown}
              onChange={handleMarkdownChange}
            />
          </div>
        )}

        {viewMode === 'preview' && (
          <div className="h-full overflow-y-auto bg-white">
            <MarkdownPreview markdown={markdown} />
          </div>
        )}
      </div>
      </div>
    </FileDropZone>
  )
}