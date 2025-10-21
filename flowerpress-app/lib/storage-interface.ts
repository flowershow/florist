// Pluggable storage interface for headless editor
export interface StorageBackend {
  saveMarkdown(spaceId: string, docSlug: string, markdown: string): Promise<{ version: string; etag: string }>
  getMarkdown(spaceId: string, docSlug: string): Promise<{ markdown: string; version?: string }>
  saveAsset(file: File, path: string): Promise<{ url: string; path: string }>
  deleteAsset(path: string): Promise<void>
}

export interface SaveEvent {
  timestamp: Date
  type: 'markdown' | 'asset'
  action: 'save' | 'delete'
  data: any
}

// Global save event handler
let saveEventHandler: ((event: SaveEvent) => void) | null = null

export function setSaveEventHandler(handler: (event: SaveEvent) => void) {
  saveEventHandler = handler
}

export function emitSaveEvent(event: SaveEvent) {
  if (saveEventHandler) {
    saveEventHandler(event)
  }
  console.log('💾 Save Event:', event)
}