'use client'

import { useState, useRef, useEffect } from 'react'

interface InlineTitleEditorProps {
  title: string
  onTitleChange: (newTitle: string) => void
  placeholder?: string
  className?: string
}

export default function InlineTitleEditor({
  title,
  onTitleChange,
  placeholder = "Untitled Document",
  className = ""
}: InlineTitleEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingTitle, setEditingTitle] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update editing title when prop changes
  useEffect(() => {
    setEditingTitle(title)
  }, [title])

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const startEditing = () => {
    setIsEditing(true)
    setEditingTitle(title)
  }

  const stopEditing = (save: boolean = true) => {
    setIsEditing(false)
    if (save && editingTitle.trim() && editingTitle !== title) {
      onTitleChange(editingTitle.trim())
    } else {
      setEditingTitle(title)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      stopEditing(true)
    } else if (e.key === 'Escape') {
      stopEditing(false)
    }
  }

  const handleBlur = () => {
    stopEditing(true)
  }

  const displayTitle = title || placeholder

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editingTitle}
        onChange={(e) => setEditingTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`bg-transparent border-none outline-none font-bold text-xl text-gray-900 w-full min-w-0 ${className}`}
        placeholder={placeholder}
      />
    )
  }

  return (
    <button
      onClick={startEditing}
      className={`text-left font-bold text-xl text-gray-900 hover:bg-gray-50 px-2 py-1 -mx-2 -my-1 rounded transition-colors ${className}`}
      title="Click to edit title"
    >
      {displayTitle}
    </button>
  )
}