// Server-side storage using file system for persistence
import fs from 'fs/promises'
import path from 'path'

const STORAGE_DIR = path.join(process.cwd(), '.flowerpress-storage')

async function ensureDir(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
}

export class ServerStorage {
  async saveMarkdown(spaceId: string, docSlug: string, markdown: string) {
    const key = `spaces/${spaceId}/${docSlug}/README.md`
    const filePath = path.join(STORAGE_DIR, key)
    await ensureDir(path.dirname(filePath))

    await fs.writeFile(filePath, markdown, 'utf-8')

    return {
      version: Date.now().toString(),
      etag: Date.now().toString()
    }
  }

  async getMarkdown(spaceId: string, docSlug: string) {
    const key = `spaces/${spaceId}/${docSlug}/README.md`
    const filePath = path.join(STORAGE_DIR, key)

    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return {
        markdown: content,
        version: Date.now().toString()
      }
    } catch (error) {
      return {
        markdown: '# Untitled Document\n',
        version: Date.now().toString()
      }
    }
  }
}

export const serverStorage = new ServerStorage()