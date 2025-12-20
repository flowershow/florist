'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { createAssetRegistry, type Asset } from '../lib/assets'

// We need a wrapper to make the registry reactive or just expose methods that force update
// Since createAssetRegistry is just a map wrapper, we can just use a React state map
// or ref+forceUpdate. React state based map is easier.

type AssetContextType = {
    register: (asset: Asset) => void
    get: (filename: string) => Asset | undefined
    list: () => Asset[]
}

const AssetContext = createContext<AssetContextType | null>(null)

export function AssetProvider({ children }: { children: ReactNode }) {
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
        <AssetContext.Provider value={{ register, get, list }}>
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
