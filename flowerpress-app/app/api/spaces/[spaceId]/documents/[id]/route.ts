import { NextRequest, NextResponse } from 'next/server'
import { serverStorage } from '@/lib/server-storage'
import fs from 'fs/promises'
import path from 'path'

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

    const document = globalDB.flowerpressDB.documents.get(id)
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    document.title = name
    document.updatedAt = new Date()
    globalDB.flowerpressDB.documents.set(id, document)

    return NextResponse.json(document)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to rename document' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { spaceId: string; id: string } }
) {
  try {
    const { spaceId, id } = params

    // Get document info before deleting
    const document = globalDB.flowerpressDB.documents.get(id)

    if (document) {
      // Delete the markdown file from filesystem
      const filePath = path.join(process.cwd(), '.flowerpress-storage', 'spaces', spaceId, document.slug, 'README.md')
      try {
        // Check if file exists before trying to delete
        await fs.access(filePath)
        await fs.unlink(filePath)

        // Try to remove the document directory if empty
        const dirPath = path.dirname(filePath)
        try {
          await fs.rmdir(dirPath)
        } catch (dirError) {
          // Directory might not be empty or might not exist
          console.log('Could not remove directory:', dirError)
        }
      } catch (error) {
        // File doesn't exist, which is fine for deletion
        console.log('File already deleted or never existed:', filePath)
      }
    }

    globalDB.flowerpressDB.documents.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}