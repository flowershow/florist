'use client'

import { useState, useEffect } from 'react'
import SplitScreenEditor from '@/components/SplitScreenEditor'
import Sidebar from '@/components/Sidebar'
import SaveDumpViewer from '@/components/SaveDumpViewer'
import { useEditorStore } from '@/lib/store'
import { editorAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { Document } from '@/types'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import InlineTitleEditor from '@/components/InlineTitleEditor'

export default function Home() {
  const [spaceId] = useState('default-space')
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [newDocModal, setNewDocModal] = useState<{ isOpen: boolean, folderId?: string }>({ isOpen: false })
  const [unsavedConfirm, setUnsavedConfirm] = useState<{ isOpen: boolean, pendingDoc: Document | null }>({ isOpen: false, pendingDoc: null })
  const [isCreatingDocument, setIsCreatingDocument] = useState(false)

  const { currentDocument, isSaving, hasUnsavedChanges, setHasUnsavedChanges } = useEditorStore()

  // Initialize with a default document for headless mode
  useEffect(() => {
    const defaultDoc: Document = {
      id: 'welcome-doc',
      spaceId,
      slug: 'welcome',
      title: 'Welcome to Flowerpress',
      markdown: `# Welcome to Flowerpress

This is a headless markdown editor with drag & drop support!

## Features

- **Drag & Drop Images**: Drop image files to insert them automatically
- **CSV Support**: Drop CSV files to convert them to markdown tables
- **Save Visualization**: All saves are dumped to screen so you can see the flow
- **Multiple View Modes**: Rich text, split, source, and preview modes

## Try it out!

1. Try typing in this editor
2. Drag and drop an image file
3. Drop a CSV file to see it converted to a table
4. Click the "💾 Saves" button in the top right to see all save events

The backend is completely mocked - all saves are logged and displayed so you can see exactly what data would be sent to your real backend.
`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setDocuments([defaultDoc])
    setCurrentDoc(defaultDoc)
  }, [spaceId])

  const handleSave = async () => {
    if (!currentDocument?.markdown || !currentDoc) return

    try {
      await editorAPI.saveMarkdown(spaceId, currentDoc.slug, currentDocument.markdown)
      setHasUnsavedChanges(false)
      toast.success('Document saved successfully')
    } catch (error) {
      toast.error('Failed to save document')
    }
  }


  const handleDocumentSelect = (doc: Document) => {
    if (hasUnsavedChanges) {
      setUnsavedConfirm({ isOpen: true, pendingDoc: doc })
      return
    }
    setCurrentDoc(doc)
  }

  const handleDocumentUpdate = (updatedDoc: Document) => {
    setCurrentDoc(updatedDoc)
    // Update the document in the documents list
    setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc))
  }

  const handleTitleChange = (newTitle: string) => {
    if (!currentDoc) return

    const updatedDoc = {
      ...currentDoc,
      title: newTitle,
      updatedAt: new Date()
    }

    setCurrentDoc(updatedDoc)
    setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc))
    setHasUnsavedChanges(true)
  }

  const handleUnsavedConfirm = () => {
    if (unsavedConfirm.pendingDoc) {
      setCurrentDoc(unsavedConfirm.pendingDoc)
      setHasUnsavedChanges(false)
    }
    setUnsavedConfirm({ isOpen: false, pendingDoc: null })
  }

  const handleNewDocument = (folderId?: string) => {
    setNewDocModal({ isOpen: true, folderId })
  }

  const handleNewDocumentConfirm = async (title: string) => {
    if (isCreatingDocument) return // Prevent duplicate submissions

    try {
      setIsCreatingDocument(true)
      const newDoc = await editorAPI.createDocument(spaceId, title.trim(), newDocModal.folderId)

      // Add to documents list
      setDocuments(prev => [...prev, newDoc])
      setCurrentDoc(newDoc)
      toast.success('Document created')
    } catch (error) {
      console.error('Document creation error:', error)
      toast.error('Failed to create document')
    } finally {
      setIsCreatingDocument(false)
      setNewDocModal({ isOpen: false })
    }
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Flowerpress Header */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🌸</div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">Flowerpress</h1>
              <p className="text-xs text-gray-500">Headless Editor</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Documents</h2>
              <button
                onClick={() => setNewDocModal({ isOpen: true })}
                className="p-1 hover:bg-gray-200 rounded"
                title="New document"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Documents list */}
            <div className="space-y-1">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer ${
                    currentDoc?.id === doc.id ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                  onClick={() => setCurrentDoc(doc)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm">{doc.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="border-b border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentDoc ? (
                <InlineTitleEditor
                  title={currentDoc.title}
                  onTitleChange={handleTitleChange}
                  placeholder="Untitled Document"
                />
              ) : (
                <h1 className="text-xl font-bold text-gray-900">
                  No document selected
                </h1>
              )}
              {hasUnsavedChanges && !isSaving && (
                <span className="text-sm text-gray-500">• Unsaved changes</span>
              )}
              {isSaving && (
                <span className="text-sm text-gray-500">• Saving...</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving || !currentDoc}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0">
          {currentDoc ? (
            <div className="h-full">
              <SplitScreenEditor
                key={currentDoc.id}
                spaceId={spaceId}
                document={currentDoc}
                onDocumentUpdate={handleDocumentUpdate}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select or create a document to get started
            </div>
          )}
        </main>
      </div>

      {/* Modal for new document */}
      <Modal
        isOpen={newDocModal.isOpen}
        onClose={() => !isCreatingDocument && setNewDocModal({ isOpen: false })}
        onConfirm={handleNewDocumentConfirm}
        title="Create New Document"
        placeholder="Enter document title"
        confirmText={isCreatingDocument ? "Creating..." : "Create"}
        disabled={isCreatingDocument}
      />

      {/* Confirmation dialog for unsaved changes */}
      <ConfirmDialog
        isOpen={unsavedConfirm.isOpen}
        onClose={() => setUnsavedConfirm({ isOpen: false, pendingDoc: null })}
        onConfirm={handleUnsavedConfirm}
        title="Unsaved Changes"
        message="You have unsaved changes. Do you want to continue without saving?"
        confirmText="Continue"
        cancelText="Stay"
        variant="default"
      />

      {/* Save Dump Viewer */}
      <SaveDumpViewer />
    </div>
  )
}