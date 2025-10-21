import { NextRequest, NextResponse } from 'next/server'

const globalDB = global as any

if (!globalDB.flowerpressDB) {
  globalDB.flowerpressDB = {
    folders: new Map(),
    documents: new Map()
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { spaceId: string; id: string } }
) {
  try {
    const { id } = params
    const { folderId } = await request.json()

    const document = globalDB.flowerpressDB.documents.get(id)
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    document.folderId = folderId
    document.updatedAt = new Date()
    globalDB.flowerpressDB.documents.set(id, document)

    return NextResponse.json(document)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to move document' },
      { status: 500 }
    )
  }
}