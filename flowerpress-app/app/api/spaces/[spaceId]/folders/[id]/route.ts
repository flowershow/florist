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
    const { name } = await request.json()

    const folder = globalDB.flowerpressDB.folders.get(id)
    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    folder.name = name
    folder.updatedAt = new Date()
    globalDB.flowerpressDB.folders.set(id, folder)

    return NextResponse.json(folder)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to rename folder' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { spaceId: string; id: string } }
) {
  try {
    const { id } = params

    // Check if folder has children
    const hasChildren = Array.from(globalDB.flowerpressDB.folders.values())
      .some((f: any) => f.parentId === id)

    const hasDocuments = Array.from(globalDB.flowerpressDB.documents.values())
      .some((d: any) => d.folderId === id)

    if (hasChildren || hasDocuments) {
      return NextResponse.json(
        { error: 'Cannot delete folder with contents' },
        { status: 400 }
      )
    }

    globalDB.flowerpressDB.folders.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    )
  }
}