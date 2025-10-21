import { create } from 'zustand'
import { Document } from '@/types'

interface EditorStore {
  currentDocument: Document | null
  isLoading: boolean
  isSaving: boolean
  hasUnsavedChanges: boolean

  setDocument: (doc: Document) => void
  updateMarkdown: (markdown: string) => void
  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  currentDocument: null,
  isLoading: false,
  isSaving: false,
  hasUnsavedChanges: false,

  setDocument: (doc) => set({ currentDocument: doc }),
  updateMarkdown: (markdown) => set((state) => ({
    currentDocument: state.currentDocument
      ? { ...state.currentDocument, markdown }
      : null,
    hasUnsavedChanges: true
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setSaving: (saving) => set({ isSaving: saving }),
  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges })
}))