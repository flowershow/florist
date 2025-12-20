'use client'

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { useAssetRegistry } from './AssetContext'

export function CsvNodeView(props: NodeViewProps) {
    const { node } = props
    const filename = node.attrs.filename
    const registry = useAssetRegistry()
    const asset = registry.get(filename)

    if (!asset || !asset.parsed) {
        return (
            <NodeViewWrapper className="my-4 p-4 border rounded bg-gray-50 text-gray-500 flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <div>
                    <div className="font-bold">CSV not found or invalid</div>
                    <div className="text-sm">{filename}</div>
                </div>
            </NodeViewWrapper>
        )
    }

    const rows = asset.parsed
    const header = rows[0]
    const body = rows.slice(1)

    return (
        <NodeViewWrapper className="my-6 border rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between text-xs text-gray-500 font-mono">
                <span>{filename}</span>
                <span>{rows.length} rows</span>
            </div>
            <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-white sticky top-0 shadow-sm z-10">
                        <tr>
                            {header.map((col, i) => (
                                <th key={i} className="px-4 py-2 bg-gray-50 border-b border-r last:border-r-0 font-medium text-gray-700 whitespace-nowrap">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {body.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                {row.map((cell, j) => (
                                    <td key={j} className="px-4 py-2 border-b border-r last:border-r-0 text-gray-900 whitespace-nowrap">
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
