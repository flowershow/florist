import { NextRequest, NextResponse } from 'next/server'
import { serverStorage } from '@/lib/server-storage'
import { Document } from '@/types'

const globalDB = global as any

if (!globalDB.flowerpressDB) {
  globalDB.flowerpressDB = {
    folders: new Map(),
    documents: new Map<string, Document>()
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { spaceId: string; id: string } }
) {
  try {
    const { spaceId, id } = params

    // Get document metadata from in-memory DB
    const document = globalDB.flowerpressDB.documents.get(id)
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Get the actual content from filesystem
    const { markdown } = await serverStorage.getMarkdown(spaceId, document.slug)

    return NextResponse.json({
      document,
      markdown
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load document content' },
      { status: 500 }
    )
  }
}