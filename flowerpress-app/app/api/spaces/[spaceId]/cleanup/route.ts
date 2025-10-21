import { NextRequest, NextResponse } from 'next/server'
import { Document } from '@/types'

const globalDB = global as any

if (!globalDB.flowerpressDB) {
  globalDB.flowerpressDB = {
    folders: new Map(),
    documents: new Map<string, Document>()
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { spaceId: string } }
) {
  try {
    const { spaceId } = params

    const documents = Array.from(globalDB.flowerpressDB.documents.values()) as Document[]
    const filteredDocuments = documents.filter((d: Document) => d.spaceId === spaceId)

    // Group by slug to find duplicates
    const slugGroups = new Map<string, Document[]>()

    filteredDocuments.forEach((doc: Document) => {
      const existing = slugGroups.get(doc.slug) || []
      existing.push(doc)
      slugGroups.set(doc.slug, existing)
    })

    let removedCount = 0

    // Keep only the most recent document for each slug
    slugGroups.forEach((docs, slug) => {
      if (docs.length > 1) {
        // Sort by updatedAt, keep the most recent
        docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

        // Remove all but the first (most recent)
        for (let i = 1; i < docs.length; i++) {
          globalDB.flowerpressDB.documents.delete(docs[i].id)
          removedCount++
        }
      }
    })

    return NextResponse.json({
      message: `Removed ${removedCount} duplicate documents`,
      removedCount
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to cleanup documents' },
      { status: 500 }
    )
  }
}