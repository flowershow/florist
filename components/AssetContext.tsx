'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { type Asset } from '../lib/assets'

type AssetContextType = {
    register: (asset: Asset) => void
    get: (filename: string) => Asset | undefined
    list: () => Asset[]
    repoInfo?: { owner: string; repo: string }
}

const AssetContext = createContext<AssetContextType | null>(null)

export function AssetProvider({
    children,
    repoInfo
}: {
    children: ReactNode,
    repoInfo?: { owner: string; repo: string }
}) {
    const [assets, setAssets] = useState<Map<string, Asset>>(new Map())

    const register = useCallback((asset: Asset) => {
        setAssets(prev => {
            const next = new Map(prev)
            next.set(asset.filename, asset)
            return next
        })
    }, [])

    const get = useCallback((filename: string) => {
        return assets.get(filename)
    }, [assets])

    const list = useCallback(() => {
        return Array.from(assets.values())
    }, [assets])

    return (
        <AssetContext.Provider value={{ register, get, list, repoInfo }}>
            {children}
        </AssetContext.Provider>
    )
}

export function useAssetRegistry() {
    const context = useContext(AssetContext)
    if (!context) {
        throw new Error('useAssetRegistry must be used within an AssetProvider')
    }
    return context
}
