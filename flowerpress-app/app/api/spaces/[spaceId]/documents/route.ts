import { NextRequest, NextResponse } from 'next/server'
import { Document } from '@/types'
import { serverStorage } from '@/lib/server-storage'

const globalDB = global as any

if (!globalDB.flowerpressDB) {
  globalDB.flowerpressDB = {
    folders: new Map(),
    documents: new Map<string, Document>()
  }
}

// Helper function to generate unique slug
function generateUniqueSlug(spaceId: string, baseTitle: string): string {
  const baseSlug = baseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const allDocs = Array.from(globalDB.flowerpressDB.documents.values()) as Document[]
  const existingDocs = allDocs.filter((d: Document) => d.spaceId === spaceId)

  // Check if base slug exists
  let slug = baseSlug
  let counter = 1

  while (existingDocs.some((d: Document) => d.slug === slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug || `doc-${Date.now()}`
}

export async function POST(
  request: NextRequest,
  { params }: { params: { spaceId: string } }
) {
  try {
    const { spaceId } = params
    const { title, folderId } = await request.json()

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Document title is required' },
        { status: 400 }
      )
    }

    const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const slug = generateUniqueSlug(spaceId, title)

    const document: Document = {
      id: docId,
      spaceId,
      slug,
      title: title.trim(),
      markdown: `# ${title.trim()}\n\n`,
      folderId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Save to "database"
    globalDB.flowerpressDB.documents.set(docId, document)

    // Save markdown file
    await serverStorage.saveMarkdown(spaceId, slug, document.markdown)

    return NextResponse.json(document)
  } catch (error) {
    console.error('Document creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { spaceId: string } }
) {
  try {
    const { spaceId } = params
    const allDocs = Array.from(globalDB.flowerpressDB.documents.values()) as Document[]
    const documents = allDocs.filter((d: Document) => d.spaceId === spaceId)

    return NextResponse.json(documents)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load documents' },
      { status: 500 }
    )
  }
}