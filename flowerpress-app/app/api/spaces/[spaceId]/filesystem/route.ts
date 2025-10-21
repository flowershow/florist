import { NextRequest, NextResponse } from 'next/server'
import { Document, Folder } from '@/types'
import fs from 'fs/promises'
import path from 'path'

// Mock database for folders and documents metadata
// In production, this would be a real database
const globalDB = global as any

if (!globalDB.flowerpressDB) {
  globalDB.flowerpressDB = {
    folders: new Map<string, Folder>(),
    documents: new Map<string, Document>()
  }
}

// Sync documents from filesystem on startup/request
async function syncDocumentsFromFilesystem(spaceId: string) {
  const storageDir = path.join(process.cwd(), '.flowerpress-storage', 'spaces', spaceId)

  try {
    await fs.mkdir(storageDir, { recursive: true })
    const entries = await fs.readdir(storageDir, { withFileTypes: true })

    // Get existing documents to avoid duplicates
    const allDocs = Array.from(globalDB.flowerpressDB.documents.values()) as Document[]
    const existingDocs = allDocs.filter((d: Document) => d.spaceId === spaceId)

    const existingSlugs = new Set(existingDocs.map((d: Document) => d.slug))

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const slug = entry.name
        const readmePath = path.join(storageDir, slug, 'README.md')

        try {
          const exists = await fs.access(readmePath).then(() => true).catch(() => false)

          if (exists && !existingSlugs.has(slug)) {
            // Create document entry from filesystem only if it doesn't exist
            const content = await fs.readFile(readmePath, 'utf-8')
            const title = content.split('\n')[0].replace(/^#\s*/, '') || slug

            const doc: Document = {
              id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              spaceId,
              slug,
              title,
              markdown: content,
              createdAt: new Date(),
              updatedAt: new Date()
            }

            globalDB.flowerpressDB.documents.set(doc.id, doc)
            existingSlugs.add(slug) // Prevent adding duplicates in the same sync
          }
        } catch (error) {
          console.log(`Could not read ${readmePath}:`, error)
        }
      }
    }
  } catch (error) {
    console.log('Storage directory does not exist yet')
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { spaceId: string } }
) {
  try {
    const { spaceId } = params

    // Sync documents from filesystem
    await syncDocumentsFromFilesystem(spaceId)

    const folders = (Array.from(globalDB.flowerpressDB.folders.values()) as Folder[])
      .filter((f: Folder) => f.spaceId === spaceId)

    const documents = (Array.from(globalDB.flowerpressDB.documents.values()) as Document[])
      .filter((d: Document) => d.spaceId === spaceId)

    return NextResponse.json({
      folders,
      documents
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load file system' },
      { status: 500 }
    )
  }
}