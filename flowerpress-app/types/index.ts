export interface Space {
  id: string
  ownerId: string
  name?: string
  createdAt: Date
  updatedAt: Date
}

export interface Document {
  id: string
  spaceId: string
  slug: string
  title: string
  markdown: string
  folderId?: string
  version?: string
  etag?: string
  createdAt: Date
  updatedAt: Date
}

export interface Folder {
  id: string
  name: string
  parentId?: string
  spaceId: string
  createdAt: Date
  updatedAt: Date
}

export type FileSystemItem = {
  type: 'folder' | 'document'
  item: Folder | Document
}


export interface SaveMarkdownResponse {
  version: string
  etag: string
}