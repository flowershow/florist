'use client'

import { useEffect, useRef, useState } from 'react'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { basicSetup } from 'codemirror'
import { marked } from 'marked'
import CSVPreview from './CSVPreview'

// CSV Preview component for raw data
function CSVPreviewFromData({ data, title }: { data: string; title?: string }) {
  const [parsedData, setParsedData] = useState<string[][]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const parseCSV = (text: string) => {
      const lines = text.split('\n').filter(line => line.trim())
      const rows = lines.map(line => {
        // Simple CSV parsing - handles basic cases
        const cells: string[] = []
        let current = ''
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          const nextChar = line[i + 1]

          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              current += '"'
              i++ // Skip next quote
            } else {
              inQuotes = !inQuotes
            }
          } else if (char === ',' && !inQuotes) {
            cells.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        cells.push(current.trim())
        return cells
      })

      setParsedData(rows)
      setLoading(false)
    }

    parseCSV(data)
  }, [data])

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="animate-pulse">Loading CSV...</div>
      </div>
    )
  }

  if (parsedData.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="text-gray-500">Empty CSV data</div>
      </div>
    )
  }

  const headers = parsedData[0]
  const rows = parsedData.slice(1)

  return (
    <div className="overflow-x-auto">
      {title && <h4 className="font-semibold mb-2">{title}</h4>}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {headers.map((_, colIndex) => (
                <td
                  key={colIndex}
                  className="px-4 py-2 whitespace-nowrap text-sm text-gray-900"
                >
                  {row[colIndex] || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 text-xs text-gray-500">
        {rows.length} rows × {headers.length} columns
      </div>
    </div>
  )
}

interface CodeMirrorEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function CodeMirrorEditor({ value, onChange }: CodeMirrorEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        markdown(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString()
            onChange(newValue)
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px',
            backgroundColor: 'white'
          },
          '.cm-content': {
            padding: '20px',
            minHeight: '100%',
            color: '#1a1a1a',
            backgroundColor: 'white'
          },
          '.cm-focused': {
            outline: 'none'
          },
          '.cm-editor': {
            height: '100%',
            backgroundColor: 'white'
          },
          '.cm-editor.cm-focused': {
            outline: 'none'
          },
          '.cm-scroller': {
            height: '100%',
            backgroundColor: 'white'
          },
          '.cm-line': {
            color: '#1a1a1a'
          },
          '.cm-gutters': {
            backgroundColor: '#f5f5f5',
            color: '#666',
            borderRight: '1px solid #ddd'
          },
          '.cm-activeLineGutter': {
            backgroundColor: '#e8f2ff'
          },
          '.cm-activeLine': {
            backgroundColor: '#f0f8ff'
          }
        })
      ]
    })

    const view = new EditorView({
      state,
      parent: editorRef.current
    })

    viewRef.current = view

    return () => {
      view.destroy()
    }
  }, [])

  // Update editor content when value changes externally
  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value
        }
      })
    }
  }, [value])

  return (
    <div className="h-full w-full bg-white">
      <div ref={editorRef} className="h-full" />
    </div>
  )
}

// Markdown Preview Component
interface MarkdownPreviewProps {
  markdown: string
}

export function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  const [content, setContent] = useState<{ html: string; csvBlocks: Array<{ id: string; data: string; title?: string; isData: boolean }> }>({
    html: '',
    csvBlocks: []
  })

  useEffect(() => {
    const renderMarkdown = async () => {
      try {
        const csvBlocks: Array<{ id: string; data: string; title?: string; isData: boolean }> = []
        let processedMarkdown = markdown

        // Match both csv-data (content) and csv (URL) blocks
        const csvBlockRegex = /```csv(-data)?\n([\s\S]*?)\n```/g
        let match
        let blockIndex = 0

        while ((match = csvBlockRegex.exec(markdown)) !== null) {
          const isData = match[1] === '-data'
          const content = match[2].trim()
          const blockId = `csv-block-${blockIndex++}`

          const beforeBlock = markdown.substring(0, match.index)
          const titleMatch = beforeBlock.match(/###\s+([^\n]+)\n*$/m)
          const title = titleMatch ? titleMatch[1].trim() : undefined

          csvBlocks.push({
            id: blockId,
            data: content,
            title,
            isData
          })

          processedMarkdown = processedMarkdown.replace(match[0], `<div id="${blockId}" class="csv-preview-placeholder"></div>`)
        }

        const rendered = await marked.parse(processedMarkdown)
        setContent({ html: rendered, csvBlocks })
      } catch (error) {
        console.error('Error rendering markdown:', error)
        setContent({ html: '<p>Error rendering markdown</p>', csvBlocks: [] })
      }
    }

    renderMarkdown()
  }, [markdown])

  return (
    <div className="h-full w-full overflow-auto bg-white">
      <div
        className="p-6 prose prose-gray max-w-none
                   prose-headings:text-gray-900
                   prose-p:text-gray-700
                   prose-a:text-blue-600
                   prose-strong:text-gray-900
                   prose-code:text-pink-600
                   prose-code:bg-gray-100
                   prose-code:px-1
                   prose-code:py-0.5
                   prose-code:rounded
                   prose-pre:bg-gray-100
                   prose-pre:text-gray-800
                   prose-blockquote:text-gray-700
                   prose-blockquote:border-gray-300"
      >
        <div dangerouslySetInnerHTML={{ __html: content.html }} />

        {/* Render CSV previews */}
        {content.csvBlocks.map(block => (
          <div key={block.id} className="my-4">
            {block.isData ? (
              <CSVPreviewFromData data={block.data} title={block.title} />
            ) : (
              <CSVPreview url={block.data} title={block.title} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

