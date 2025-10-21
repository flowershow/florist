'use client'

import { useState, useEffect } from 'react'

interface CSVPreviewProps {
  url: string
  title?: string
}

export default function CSVPreview({ url, title }: CSVPreviewProps) {
  const [data, setData] = useState<string[][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCSV = async () => {
      try {
        setLoading(true)
        setError(null)

        if (url.startsWith('blob:') || url.startsWith('data:')) {
          const response = await fetch(url)
          const text = await response.text()
          parseCSV(text)
        } else {
          setError('External CSV URLs not yet supported')
        }
      } catch (err) {
        console.error('Failed to load CSV:', err)
        setError('Failed to load CSV file')
      } finally {
        setLoading(false)
      }
    }

    loadCSV()
  }, [url])

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    const rows = lines.map(line => {
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

    setData(rows)
  }

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="animate-pulse">Loading CSV...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="text-gray-500">Empty CSV file</div>
      </div>
    )
  }

  const headers = data[0]
  const rows = data.slice(1)

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