// Mock storage backend that dumps saves to screen
import { StorageBackend, SaveEvent, emitSaveEvent } from './storage-interface'

class MockStorageBackend implements StorageBackend {
  private documents = new Map<string, { markdown: string; version: string }>()
  private documentMeta = new Map<string, any>() // Store document metadata

  async createDocument(spaceId: string, title: string, folderId?: string): Promise<any> {
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `doc-${Date.now()}`

    const document = {
      id: docId,
      spaceId,
      slug,
      title: title.trim(),
      markdown: `# ${title.trim()}\n\nStart writing your document here...\n`,
      folderId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Store document metadata
    this.documentMeta.set(docId, document)

    // Store initial markdown content
    const key = `${spaceId}/${slug}`
    this.documents.set(key, {
      markdown: document.markdown,
      version: Date.now().toString()
    })

    // Emit save event for display
    emitSaveEvent({
      timestamp: new Date(),
      type: 'markdown',
      action: 'save',
      data: {
        spaceId,
        docSlug: slug,
        markdown: document.markdown,
        version: Date.now().toString(),
        etag: `etag-${Date.now()}`,
        size: new Blob([document.markdown]).size,
        action: 'create',
        title: document.title
      }
    })

    console.log(`📝 Document created: ${title} (${slug})`)

    return document
  }

  async saveMarkdown(spaceId: string, docSlug: string, markdown: string): Promise<{ version: string; etag: string }> {
    const version = Date.now().toString()
    const etag = `etag-${version}`

    // Store in memory
    const key = `${spaceId}/${docSlug}`
    this.documents.set(key, { markdown, version })

    // Emit save event for display
    emitSaveEvent({
      timestamp: new Date(),
      type: 'markdown',
      action: 'save',
      data: {
        spaceId,
        docSlug,
        markdown,
        version,
        etag,
        size: new Blob([markdown]).size
      }
    })

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100))

    return { version, etag }
  }

  async getMarkdown(spaceId: string, docSlug: string): Promise<{ markdown: string; version?: string }> {
    const key = `${spaceId}/${docSlug}`
    const doc = this.documents.get(key)

    if (doc) {
      return {
        markdown: doc.markdown,
        version: doc.version
      }
    }

    // Return default content for new documents
    return {
      markdown: `# ${docSlug.replace(/-/g, ' ')}\n\nStart writing your document here...\n`,
      version: Date.now().toString()
    }
  }

  async saveAsset(file: File, path: string): Promise<{ url: string; path: string }> {
    // Create a mock URL for the asset
    const url = URL.createObjectURL(file)

    // For CSV files, store the content as well
    let csvContent = null
    if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
      try {
        csvContent = await file.text()
      } catch (error) {
        console.error('Failed to read CSV content:', error)
      }
    }

    // Emit save event for display
    emitSaveEvent({
      timestamp: new Date(),
      type: 'asset',
      action: 'save',
      data: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        path,
        url,
        preview: file.type.startsWith('image/') ? url : null,
        csvContent
      }
    })

    console.log(`📁 Asset saved: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)}KB)`)

    return { url, path }
  }

  async deleteAsset(path: string): Promise<void> {
    emitSaveEvent({
      timestamp: new Date(),
      type: 'asset',
      action: 'delete',
      data: { path }
    })

    console.log(`🗑️ Asset deleted: ${path}`)
  }
}

export const mockStorage = new MockStorageBackend()