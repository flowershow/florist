'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchOrgs, fetchRepos } from '../app/actions'

type Account = { login: string, avatar_url?: string, type?: string }
type Repo = { name: string, description?: string | null }

export default function RepoPicker() {
    const [accounts, setAccounts] = useState<Account[]>([])
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
    const [repos, setRepos] = useState<Repo[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        fetchOrgs().then(data => {
            setAccounts(data as any)
        })
    }, [])

    const handleAccountSelect = async (login: string) => {
        setSelectedAccount(login)
        setLoading(true)
        const data = await fetchRepos(login)
        setRepos(data as any)
        setLoading(false)
    }

    const handleRepoSelect = (repo: string) => {
        if (!selectedAccount) return
        // Navigate to ?owner=X&repo=Y
        router.push(`/?owner=${selectedAccount}&repo=${repo}`)
    }

    return (
        <div className="max-w-xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-8">Select a Repository</h1>

            {!selectedAccount ? (
                <div className="grid gap-4">
                    <h2 className="text-lg font-semibold text-gray-700">Accounts</h2>
                    {accounts.map(account => (
                        <button
                            key={account.login}
                            onClick={() => handleAccountSelect(account.login)}
                            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-black transition-colors text-left"
                        >
                            {account.avatar_url && (
                                <img src={account.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                            )}
                            <span className="font-medium">{account.login}</span>
                        </button>
                    ))}
                    {accounts.length === 0 && <p className="text-gray-500">Loading accounts...</p>}
                </div>
            ) : (
                <div className="grid gap-4">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => setSelectedAccount(null)}
                            className="text-sm text-gray-500 hover:text-black"
                        >
                            ← Back to accounts
                        </button>
                        <h2 className="text-lg font-semibold">
                            {selectedAccount} / Repositories
                        </h2>
                    </div>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading repositories...</div>
                    ) : (
                        <div className="max-h-[60vh] overflow-y-auto grid gap-2">
                            {repos.map(repo => (
                                <button
                                    key={repo.name}
                                    onClick={() => handleRepoSelect(repo.name)}
                                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-black transition-colors text-left group"
                                >
                                    <div className="font-medium group-hover:text-blue-600">{repo.name}</div>
                                    {repo.description && (
                                        <div className="text-sm text-gray-500 truncate">{repo.description}</div>
                                    )}
                                </button>
                            ))}
                            {repos.length === 0 && (
                                <div className="text-gray-500">No repositories found.</div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
