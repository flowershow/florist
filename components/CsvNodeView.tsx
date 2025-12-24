'use client'

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { useAssetRegistry } from './AssetContext'
import { useEffect, useState } from 'react'
import { getFileContent } from '../app/actions'
import { parseCsvText } from '../lib/csv'

export function CsvNodeView(props: NodeViewProps) {
    const { node } = props
    const filename = node.attrs.filename
    const registry = useAssetRegistry()
    const asset = registry.get(filename)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // If asset is missing and we have repo info, try to fetch it
        if (!asset && registry.repoInfo && !isLoading && !error) {
            const { owner, repo } = registry.repoInfo
            setIsLoading(true)

            getFileContent(owner, repo, filename)
                .then(content => {
                    if (content) {
                        try {
                            const parsed = parseCsvText(content)
                            registry.register({
                                filename,
                                originalName: filename,
                                mime: 'text/csv',
                                url: '', // Not needed for display if we have parsed
                                parsed
                            })
                        } catch (err) {
                            setError('Failed to parse CSV data')
                        }
                    } else {
                        setError('File not found in repository')
                    }
                })
                .catch(() => setError('Failed to fetch from GitHub'))
                .finally(() => setIsLoading(false))
        }
    }, [filename, asset, registry, isLoading, error])

    if (isLoading) {
        return (
            <NodeViewWrapper className="my-4 p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 flex flex-col items-center justify-center gap-4 transition-all animate-pulse">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                    Fetching data from GitHub...
                </div>
            </NodeViewWrapper>
        )
    }

    if (!asset || !asset.parsed) {
        return (
            <NodeViewWrapper className="my-4 p-6 border-2 border-red-50 rounded-xl bg-red-50/20 text-red-600 flex items-center gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-xl shrink-0">⚠️</div>
                <div>
                    <div className="font-bold text-red-900">
                        {error || 'CSV not found or invalid'}
                    </div>
                    <div className="text-sm opacity-75 font-mono">{filename}</div>
                </div>
            </NodeViewWrapper>
        )
    }

    const rows = asset.parsed
    const header = rows[0]
    const body = rows.slice(1)

    return (
        <NodeViewWrapper className="my-6 border border-gray-100 rounded-xl overflow-hidden shadow-xl bg-white">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                    {filename}
                </span>
                <span>{rows.length} rows</span>
            </div>
            <div className="overflow-x-auto max-h-[400px] scrollbar-hide">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-white sticky top-0 shadow-sm z-10">
                        <tr>
                            {header.map((col, i) => (
                                <th key={i} className="px-4 py-3 bg-gray-50/50 border-b border-r border-gray-100 last:border-r-0 font-bold text-gray-600 whitespace-nowrap">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {body.map((row, i) => (
                            <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                {row.map((cell, j) => (
                                    <td key={j} className="px-4 py-3 border-r border-gray-50 last:border-r-0 text-gray-700 whitespace-nowrap tabular-nums">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </NodeViewWrapper>
    )
}
