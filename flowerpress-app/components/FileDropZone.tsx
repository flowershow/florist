'use client'

import { useCallback, useState, useRef } from 'react'
import { editorAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface FileDropZoneProps {
  spaceId: string
  document: { slug: string }
  onFileInsert?: (markdown: string) => void
  children: React.ReactNode
}

export default function FileDropZone({ spaceId, document, onFileInsert, children }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/')
      const isCSV = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')
      const isText = file.type.startsWith('text/')

      return isImage || isCSV || isText
    })

    if (validFiles.length === 0) {
      toast.error('Please drop images, CSV files, or text files only')
      return
    }

    setIsUploading(true)
    const results: string[] = []

    for (const file of validFiles) {
      try {
        if (file.type.startsWith('image/')) {
          // Handle image files
          const { url } = await editorAPI.saveAsset(file, spaceId, document.slug)
          const altText = file.name.replace(/\.[^/.]+$/, '') // Remove extension
          results.push(`![${altText}](${url})`)

        } else if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
          // Read CSV content for embedding in markdown
          const csvContent = await file.text()

          // Also save as asset for backup
          await editorAPI.saveAsset(file, spaceId, document.slug)

          // Embed the actual CSV content in the markdown
          results.push(`\n\n### ${file.name}\n\n\`\`\`csv-data\n${csvContent}\n\`\`\`\n\n`)

          toast.success(`CSV file "${file.name}" uploaded successfully`)

        } else if (file.type.startsWith('text/')) {
          // Handle other text files
          const content = await file.text()
          const language = file.name.split('.').pop() || 'text'
          results.push(`\n\n### ${file.name}\n\n\`\`\`${language}\n${content}\n\`\`\`\n\n`)

          // Save as asset too
          await editorAPI.saveAsset(file, spaceId, document.slug)
        }

      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error)
        toast.error(`Failed to process ${file.name}`)
      }
    }

    if (results.length > 0 && onFileInsert) {
      onFileInsert(results.join('\n\n'))
      toast.success(`Inserted ${results.length} file(s)`)
    }

    setIsUploading(false)
  }, [spaceId, document.slug, onFileInsert])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    // Only set dragging to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  return (
    <div
      className="relative h-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      {children}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.csv,text/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="fixed bottom-4 right-4 z-30 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Upload files"
      >
        📎
      </button>

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-40 bg-blue-500 bg-opacity-20 border-4 border-dashed border-blue-500 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="text-4xl mb-2">📂</div>
            <div className="text-lg font-medium text-gray-900">
              Drop files here
            </div>
            <div className="text-sm text-gray-600">
              Images, CSV files, and text files supported
            </div>
          </div>
        </div>
      )}

      {/* Upload overlay */}
      {isUploading && (
        <div className="absolute inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin text-4xl mb-2">⏳</div>
            <div className="text-lg font-medium text-gray-900">
              Processing files...
            </div>
          </div>
        </div>
      )}
    </div>
  )
}