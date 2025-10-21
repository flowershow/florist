// Backend interface definition for Flowerpress
// This provides a clean, pluggable backend interface

export interface BackendResponse {
  success: boolean
  info?: any
  error?: string
}

export interface SaveContentResponse extends BackendResponse {
  version?: string
  etag?: string
}

export interface SaveAssetResponse extends BackendResponse {
  url: string
  path?: string
}

export interface Backend {
  // Save markdown content
  saveContent(content: string, metadata?: Record<string, any>): Promise<SaveContentResponse>

  // Save asset (image, CSV, etc.)
  saveAsset(file: File): Promise<SaveAssetResponse>

  // Optional: Get content (for future backend implementations)
  getContent?(id: string): Promise<{ content: string; metadata?: Record<string, any> }>

  // Optional: List assets
  listAssets?(): Promise<Array<{ name: string; url: string; type: string }>>
}

// Mock Backend Implementation
export class MockBackend implements Backend {
  private saveEvents: Array<{
    timestamp: Date
    type: 'content' | 'asset'
    data: any
  }> = []

  async saveContent(content: string, metadata?: Record<string, any>): Promise<SaveContentResponse> {
    const saveEvent = {
      timestamp: new Date(),
      type: 'content' as const,
      data: {
        content,
        metadata,
        size: new Blob([content]).size,
        lines: content.split('\n').length
      }
    }

    this.saveEvents.push(saveEvent)

    // Log to console for visibility
    console.log('📝 Content saved:', {
      size: `${(saveEvent.data.size / 1024).toFixed(2)}KB`,
      lines: saveEvent.data.lines,
      metadata
    })

    // Display in UI (emit event)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backend:save', { detail: saveEvent }))
    }

    return {
      success: true,
      version: Date.now().toString(),
      etag: `etag-${Date.now()}`,
      info: {
        size: saveEvent.data.size,
        lines: saveEvent.data.lines
      }
    }
  }

  async saveAsset(file: File): Promise<SaveAssetResponse> {
    // For mock backend, create object URL for the asset
    const url = URL.createObjectURL(file)

    const saveEvent = {
      timestamp: new Date(),
      type: 'asset' as const,
      data: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        url,
        preview: file.type.startsWith('image/') ? url : null
      }
    }

    this.saveEvents.push(saveEvent)

    // Log to console
    console.log('📁 Asset saved:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)}KB`
    })

    // Display in UI (emit event)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backend:save', { detail: saveEvent }))
    }

    return {
      success: true,
      url,
      path: `mock://assets/${file.name}`
    }
  }

  // Get all save events for debugging/display
  getSaveEvents() {
    return this.saveEvents
  }

  // Clear save events
  clearSaveEvents() {
    this.saveEvents = []
  }
}

// Global backend instance
let backendInstance: Backend | null = null

// Initialize backend
export function initializeBackend(backend?: Backend): Backend {
  if (!backend) {
    backend = new MockBackend()
  }
  backendInstance = backend
  return backend
}

// Get current backend instance
export function getBackend(): Backend {
  if (!backendInstance) {
    backendInstance = new MockBackend()
  }
  return backendInstance
}

// Export default mock backend for immediate use
export const mockBackend = new MockBackend()