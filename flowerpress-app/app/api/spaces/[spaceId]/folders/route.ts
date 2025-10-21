import { NextRequest, NextResponse } from 'next/server'
import { Folder } from '@/types'

const globalDB = global as any

if (!globalDB.flowerpressDB) {
  globalDB.flowerpressDB = {
    folders: new Map<string, Folder>(),
    documents: new Map<string, Document>()
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { spaceId: string } }
) {
  try {
    const { spaceId } = params
    const { name, parentId } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      )
    }

    const folder: Folder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      parentId,
      spaceId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    globalDB.flowerpressDB.folders.set(folder.id, folder)

    return NextResponse.json(folder)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    )
  }
}