'use client'

import { useState, useEffect } from 'react'
import { SaveEvent, setSaveEventHandler } from '@/lib/storage-interface'

export default function SaveDumpViewer() {
  const [saves, setSaves] = useState<SaveEvent[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSave, setSelectedSave] = useState<SaveEvent | null>(null)

  useEffect(() => {
    setSaveEventHandler((event: SaveEvent) => {
      setSaves(prev => [event, ...prev].slice(0, 50)) // Keep last 50 saves
    })
  }, [])

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString() + '.' + timestamp.getMilliseconds().toString().padStart(3, '0')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const openInNewWindow = (save: SaveEvent) => {
    const content = save.type === 'markdown'
      ? save.data.markdown
      : JSON.stringify(save.data, null, 2)

    const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes')
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Save Dump - ${save.data.docSlug || save.data.fileName || 'Unknown'}</title>
          <style>
            body { font-family: monospace; padding: 20px; background: #f5f5f5; color: #333; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
            .header { background: #fff; padding: 10px; margin-bottom: 20px; border-radius: 4px; border: 1px solid #ddd; }
            .content { background: #fff; padding: 15px; border-radius: 4px; border: 1px solid #ddd; }
            img { max-width: 100%; height: auto; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Save Event: ${save.type} ${save.action}</h2>
            <p><strong>Time:</strong> ${formatTimestamp(save.timestamp)}</p>
            ${save.type === 'markdown' ? `
              <p><strong>Document:</strong> ${save.data.spaceId}/${save.data.docSlug}</p>
              <p><strong>Size:</strong> ${formatFileSize(save.data.size)}</p>
              <p><strong>Version:</strong> ${save.data.version}</p>
            ` : `
              <p><strong>File:</strong> ${save.data.fileName}</p>
              <p><strong>Type:</strong> ${save.data.fileType}</p>
              <p><strong>Size:</strong> ${formatFileSize(save.data.fileSize)}</p>
              <p><strong>Path:</strong> ${save.data.path}</p>
            `}
          </div>
          <div class="content">
            ${save.type === 'markdown' ? `
              <h3>Markdown Content:</h3>
              <pre>${content}</pre>
            ` : save.data.preview ? `
              <h3>Asset Preview:</h3>
              <img src="${save.data.preview}" alt="${save.data.fileName}" />
              <h3>Asset Details:</h3>
              <pre>${content}</pre>
            ` : `
              <h3>Asset Details:</h3>
              <pre>${content}</pre>
            `}
          </div>
        </body>
        </html>
      `)
      newWindow.document.close()
    }
  }

  return (
    <>
      {/* Floating save indicator */}
      <div className="fixed bottom-4 right-20 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg ${
            saves.length > 0
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          💾 Saves ({saves.length})
        </button>
      </div>

      {/* Save dump panel */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-3/4 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Save Events</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSaves([])}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex">
              {/* Save list */}
              <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
                {saves.length === 0 ? (
                  <div className="p-4 text-gray-500 text-center">No saves yet</div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {saves.map((save, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedSave(save)}
                        className={`p-3 cursor-pointer hover:bg-gray-50 ${
                          selectedSave === save ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {save.type === 'markdown' ? '📝' : '📁'}
                            </span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {save.type === 'markdown'
                                  ? save.data.docSlug
                                  : save.data.fileName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatTimestamp(save.timestamp)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openInNewWindow(save)
                            }}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            View
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {save.type === 'markdown'
                            ? `${formatFileSize(save.data.size)} • ${save.data.version}`
                            : `${save.data.fileType} • ${formatFileSize(save.data.fileSize)}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save preview */}
              <div className="w-1/2 overflow-y-auto">
                {selectedSave ? (
                  <div className="p-4">
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-900">
                        {selectedSave.type === 'markdown' ? '📝 Markdown Save' : '📁 Asset Save'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatTimestamp(selectedSave.timestamp)}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {selectedSave.type === 'markdown' ? (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Document:</label>
                            <p className="text-sm text-gray-900">{selectedSave.data.spaceId}/{selectedSave.data.docSlug}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Size:</label>
                            <p className="text-sm text-gray-900">{formatFileSize(selectedSave.data.size)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Content Preview:</label>
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                              {selectedSave.data.markdown.substring(0, 500)}
                              {selectedSave.data.markdown.length > 500 ? '...' : ''}
                            </pre>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-700">File:</label>
                            <p className="text-sm text-gray-900">{selectedSave.data.fileName}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Type:</label>
                            <p className="text-sm text-gray-900">{selectedSave.data.fileType}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Size:</label>
                            <p className="text-sm text-gray-900">{formatFileSize(selectedSave.data.fileSize)}</p>
                          </div>
                          {selectedSave.data.preview && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Preview:</label>
                              <img
                                src={selectedSave.data.preview}
                                alt={selectedSave.data.fileName}
                                className="max-w-full h-auto rounded mt-1"
                                style={{ maxHeight: '200px' }}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-gray-500 text-center">
                    Select a save event to preview
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}