'use client'

import { useEffect, useState } from 'react'
import { editorAPI } from '@/lib/api'
import { MarkdownPreview } from '@/components/CodeMirrorEditor'

interface PageProps {
  params: {
    spaceId: string
    slug: string
  }
}

export default function ViewPage({ params }: PageProps) {
  const { spaceId, slug } = params
  const [markdown, setMarkdown] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const docData = await editorAPI.getMarkdown(spaceId, slug)
        setMarkdown(docData.markdown)
      } catch (error) {
        console.error('Failed to load document:', error)
        setMarkdown('# Document Not Found\n\nThis document has not been published yet.')
      } finally {
        setLoading(false)
      }
    }

    loadDocument()
  }, [spaceId, slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading document...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <MarkdownPreview markdown={markdown} />
      </div>
    </div>
  )
}