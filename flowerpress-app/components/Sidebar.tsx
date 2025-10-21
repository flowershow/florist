'use client'

import { useState, useEffect } from 'react'
import { Document, Folder } from '@/types'
import { useEditorStore } from '@/lib/store'
import toast from 'react-hot-toast'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'

interface SidebarProps {
  spaceId: string
  currentDocId?: string
  onDocumentSelect: (doc: Document) => void
  onNewDocument: (folderId?: string) => void
}

export default function Sidebar({
  spaceId,
  currentDocId,
  onDocumentSelect,
  onNewDocument
}: SidebarProps) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [renamingItem, setRenamingItem] = useState<{ type: 'folder' | 'document', id: string } | null>(null)
  const [newName, setNewName] = useState('')
  const [creatingFolder, setCreatingFolder] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<{ type: 'folder' | 'document', id: string } | null>(null)
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type: 'folder' | 'document'
    parentId?: string
  }>({ isOpen: false, type: 'folder' })
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    type: 'folder' | 'document'
    id: string
    name: string
  }>({ isOpen: false, type: 'folder', id: '', name: '' })

  useEffect(() => {
    loadFileSystem()

    const handleRefresh = () => {
      loadFileSystem()
    }

    window.addEventListener('refresh-sidebar', handleRefresh)
    return () => {
      window.removeEventListener('refresh-sidebar', handleRefresh)
    }
  }, [spaceId])

  const loadFileSystem = async () => {
    try {
      const response = await fetch(`/api/spaces/${spaceId}/filesystem`)
      const data = await response.json()
      setFolders(data.folders || [])
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Failed to load file system:', error)
    }
  }

  const handleCreateFolder = (parentId?: string) => {
    setModalState({ isOpen: true, type: 'folder', parentId })
  }

  const handleCreateFolderConfirm = async (folderName: string) => {
    try {
      const response = await fetch(`/api/spaces/${spaceId}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: folderName, parentId: modalState.parentId })
      })

      if (response.ok) {
        await loadFileSystem()
        toast.success('Folder created')
      }
    } catch (error) {
      toast.error('Failed to create folder')
    } finally {
      setModalState({ isOpen: false, type: 'folder' })
    }
  }

  const handleRename = async () => {
    if (!renamingItem || !newName) return

    try {
      const endpoint = renamingItem.type === 'folder'
        ? `/api/spaces/${spaceId}/folders/${renamingItem.id}`
        : `/api/spaces/${spaceId}/documents/${renamingItem.id}`

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      })

      if (response.ok) {
        await loadFileSystem()
        toast.success('Renamed successfully')
        setRenamingItem(null)
        setNewName('')
      }
    } catch (error) {
      toast.error('Failed to rename')
    }
  }

  const handleDelete = (type: 'folder' | 'document', id: string, name: string) => {
    setDeleteConfirm({ isOpen: true, type, id, name })
  }

  const handleDeleteConfirm = async () => {
    const { type, id } = deleteConfirm
    try {
      const endpoint = type === 'folder'
        ? `/api/spaces/${spaceId}/folders/${id}`
        : `/api/spaces/${spaceId}/documents/${id}`

      const response = await fetch(endpoint, { method: 'DELETE' })

      if (response.ok) {
        await loadFileSystem()
        toast.success('Deleted successfully')
      }
    } catch (error) {
      toast.error('Failed to delete')
    } finally {
      setDeleteConfirm({ isOpen: false, type: 'folder', id: '', name: '' })
    }
  }

  const handleDragStart = (e: React.DragEvent, type: 'folder' | 'document', id: string) => {
    setDraggedItem({ type, id })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetFolderId?: string) => {
    e.preventDefault()
    if (!draggedItem) return

    try {
      if (draggedItem.type === 'document') {
        const response = await fetch(`/api/spaces/${spaceId}/documents/${draggedItem.id}/move`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderId: targetFolderId })
        })

        if (response.ok) {
          await loadFileSystem()
          toast.success('Document moved')
        }
      }
    } catch (error) {
      toast.error('Failed to move item')
    } finally {
      setDraggedItem(null)
    }
  }

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const renderFolder = (folder: Folder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id)
    const childFolders = folders.filter(f => f.parentId === folder.id)
    const childDocuments = documents.filter(d => d.folderId === folder.id)

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer group`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, folder.id)}
        >
          <button
            onClick={() => toggleFolder(folder.id)}
            className="p-0.5"
          >
            <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
            </svg>
          </button>

          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>

          {renamingItem?.type === 'folder' && renamingItem.id === folder.id ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="flex-1 px-1 py-0.5 text-sm border rounded"
              autoFocus
            />
          ) : (
            <span
              className="flex-1 text-sm select-none"
              onDoubleClick={() => {
                setRenamingItem({ type: 'folder', id: folder.id })
                setNewName(folder.name)
              }}
            >
              {folder.name}
            </span>
          )}

          <div className="hidden group-hover:flex items-center gap-1">
            <button
              onClick={() => onNewDocument(folder.id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="New document"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => handleCreateFolder(folder.id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="New folder"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button
              onClick={() => handleDelete('folder', folder.id, folder.name)}
              className="p-1 hover:bg-red-200 dark:hover:bg-red-900 rounded"
              title="Delete"
            >
              <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {isExpanded && (
          <div>
            {childFolders.map(childFolder => renderFolder(childFolder, level + 1))}
            {childDocuments.map(doc => renderDocument(doc, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const renderDocument = (doc: Document, level: number = 0) => {
    const isActive = doc.id === currentDocId

    return (
      <div
        key={doc.id}
        draggable
        onDragStart={(e) => handleDragStart(e, 'document', doc.id)}
        className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer group ${
          isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onDocumentSelect(doc)}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>

        {renamingItem?.type === 'document' && renamingItem.id === doc.id ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 px-1 py-0.5 text-sm border rounded"
            autoFocus
          />
        ) : (
          <span
            className="flex-1 text-sm truncate"
            onDoubleClick={(e) => {
              e.stopPropagation()
              setRenamingItem({ type: 'document', id: doc.id })
              setNewName(doc.title)
            }}
          >
            {doc.title}
          </span>
        )}

        <div className="hidden group-hover:flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete('document', doc.id, doc.title)
            }}
            className="p-1 hover:bg-red-200 dark:hover:bg-red-900 rounded"
            title="Delete"
          >
            <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  const rootFolders = folders.filter(f => !f.parentId)
  const rootDocuments = documents.filter(d => !d.folderId)

  return (
    <div className="w-64 h-full bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Documents</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onNewDocument()}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="New document"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => handleCreateFolder()}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="New folder"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className="space-y-1"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, undefined)}
      >
        {rootFolders.map(folder => renderFolder(folder))}
        {rootDocuments.map(doc => renderDocument(doc))}
      </div>

      {/* Modal for creating folders */}
      <Modal
        isOpen={modalState.isOpen && modalState.type === 'folder'}
        onClose={() => setModalState({ isOpen: false, type: 'folder' })}
        onConfirm={handleCreateFolderConfirm}
        title="Create New Folder"
        placeholder="Enter folder name"
        confirmText="Create"
      />

      {/* Confirmation dialog for deletion */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, type: 'folder', id: '', name: '' })}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deleteConfirm.type === 'folder' ? 'Folder' : 'Document'}`}
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}