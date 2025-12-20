export type Asset = {
    filename: string
    originalName: string
    mime: string
    url: string
    parsed?: string[][]
}

export function createAssetRegistry() {
    const assets = new Map<string, Asset>()

    return {
        register(asset: Asset) {
            assets.set(asset.filename, asset)
        },
        get(filename: string) {
            return assets.get(filename)
        },
        list() {
            return Array.from(assets.values())
        }
    }
}
