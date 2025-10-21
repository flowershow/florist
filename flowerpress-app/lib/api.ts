import { SaveMarkdownResponse } from '@/types'
import { mockStorage } from './mock-storage'

// Use mock storage for headless editor mode
const USE_MOCK_STORAGE = true

const api = {
  async post(url: string, data: any) {
    const response = await fetch(`/api${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return { data: await response.json() }
  },

  async get(url: string) {
    const response = await fetch(`/api${url}`)
    return { data: await response.json() }
  }
}

export const editorAPI = {
  async saveMarkdown(spaceId: string, docSlug: string, markdown: string): Promise<SaveMarkdownResponse> {
    if (USE_MOCK_STORAGE) {
      return await mockStorage.saveMarkdown(spaceId, docSlug, markdown)
    }

    const response = await api.post(`/spaces/${spaceId}/docs/${docSlug}/markdown`, {
      markdown
    })
    return response.data
  },

  async getMarkdown(spaceId: string, docSlug: string): Promise<{ markdown: string; version?: string }> {
    if (USE_MOCK_STORAGE) {
      return await mockStorage.getMarkdown(spaceId, docSlug)
    }

    const response = await api.get(`/spaces/${spaceId}/docs/${docSlug}/markdown`)
    return response.data
  },

  async createDocument(spaceId: string, title: string, folderId?: string): Promise<any> {
    if (USE_MOCK_STORAGE) {
      return await mockStorage.createDocument(spaceId, title, folderId)
    }

    const response = await api.post(`/spaces/${spaceId}/documents`, {
      title,
      folderId
    })
    return response.data
  },

  async saveAsset(file: File, spaceId: string, docSlug: string): Promise<{ url: string; path: string }> {
    const path = `${spaceId}/${docSlug}/assets/${file.name}`

    if (USE_MOCK_STORAGE) {
      return await mockStorage.saveAsset(file, path)
    }

    // Real implementation would upload to server
    throw new Error('Real asset upload not implemented yet')
  }
}