'use server'

import { auth } from "@/lib/auth"
import { getOctokit } from "@/lib/github"

export async function fetchOrgs() {
    const session = await auth()
    // @ts-expect-error - session type extension
    if (!session?.accessToken) return []

    // @ts-expect-error - session type extension
    const octokit = getOctokit(session.accessToken as string)
    try {
        // Get user's own profile and orgs
        const { data: user } = await octokit.rest.users.getAuthenticated()
        const { data: orgs } = await octokit.rest.orgs.listForAuthenticatedUser()

        return [
            { login: user.login, avatar_url: user.avatar_url, type: 'User' },
            ...orgs
        ]
    } catch (e) {
        console.error(e)
        return []
    }
}

export async function fetchRepos(org: string) {
    const session = await auth()
    // @ts-expect-error - session type extension
    if (!session?.accessToken) return []

    // @ts-expect-error - session type extension
    const octokit = getOctokit(session.accessToken as string)
    try {
        // If org is the authenticated user, list their repos
        // If it's an actual org, list org repos
        const { data: user } = await octokit.rest.users.getAuthenticated()

        if (org === user.login) {
            const { data } = await octokit.rest.repos.listForAuthenticatedUser({
                sort: 'updated',
                per_page: 100,
                type: 'owner' // only repos owned by user
            })
            return data
        } else {
            const { data } = await octokit.rest.repos.listForOrg({
                org,
                sort: 'updated',
                per_page: 100
            })
            return data
        }
    } catch (e) {
        console.error(e)
        return []
    }
}

export async function getReadme(owner: string, repo: string) {
    const session = await auth()
    // @ts-expect-error - session type extension
    if (!session?.accessToken) return null

    // @ts-expect-error - session type extension
    const octokit = getOctokit(session.accessToken as string)
    try {
        // Try getting README.md
        // We use .rest.repos.getContent but it returns encoded content.
        // For raw content, we can use the raw media type or decode.
        try {
            const { data } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: 'README.md',
                mediaType: {
                    format: 'raw'
                }
            })
            return data as unknown as string // When format is raw, data is string
        } catch (err: any) {
            if (err.status === 404) {
                return "" // File not found, return empty
            }
            throw err
        }
    } catch (e) {
        console.error("Failed to fetch README", e)
        return null
    }
}

export async function saveReadme(owner: string, repo: string, content: string, message: string = "Update README.md") {
    const session = await auth()
    // @ts-expect-error - session type extension
    if (!session?.accessToken) throw new Error("Unauthorized")

    // @ts-expect-error - session type extension
    const octokit = getOctokit(session.accessToken as string)

    // Get current SHA to update
    let sha: string | undefined
    try {
        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: 'README.md'
        })
        // @ts-expect-error - loose typing on octokit response
        if (!Array.isArray(data) && data.sha) {
            // @ts-expect-error - loose typing
            sha = data.sha
        }
    } catch { }

    // Convert string to base64
    const contentBase64 = Buffer.from(content).toString('base64')

    await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: 'README.md',
        message,
        content: contentBase64,
        sha
    })
}

export async function uploadAsset(owner: string, repo: string, filename: string, formData: FormData) {
    const session = await auth()
    // @ts-expect-error - session type extension
    if (!session?.accessToken) throw new Error("Unauthorized")

    const file = formData.get('file') as File
    if (!file) throw new Error("No file provided")

    // We can't easily get SHA for unique filenames unless we check first.
    // For now, assume unique or overwrite.
    // Better: prefix with timestamp?
    const timestamp = Date.now()
    const uniqueFilename = `${timestamp}-${filename}`

    const buffer = await file.arrayBuffer()
    const contentBase64 = Buffer.from(buffer).toString('base64')

    // @ts-expect-error - session type extension
    const octokit = getOctokit(session.accessToken as string)

    const { data } = await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: uniqueFilename, // Root directory
        message: `Upload ${filename}`,
        content: contentBase64
    })

    // @ts-expect-error - loose typing
    return data.content?.download_url || ""
}
