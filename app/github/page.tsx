import { auth } from "@/lib/auth"
import RepoPicker from "@/components/RepoPicker"
import GithubEditorShell from "@/components/GithubEditorShell"
import { getReadme } from "../actions"
import Link from "next/link"

export default async function Home(props: {
  searchParams: Promise<{ owner?: string; repo?: string }>
}) {
  const session = await auth()
  const searchParams = await props.searchParams
  const { owner, repo } = searchParams

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Florist (Alpha)</h1>
          <Link
            href="/login"
            className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Sign in with GitHub
          </Link>
        </div>
      </div>
    )
  }

  if (!owner || !repo) {
    return <RepoPicker />
  }

  // Fetch README server-side
  const readme = await getReadme(owner, repo)

  return (
    <main>
      <div className="max-w-3xl mx-auto px-8 pt-4 flex justify-between items-center bg-white/80 backdrop-blur sticky top-0 z-10 border-b border-gray-100 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-black">Florist</Link>
          <span>/</span>
          <span className="font-medium text-black">{owner}</span>
          <span>/</span>
          <span className="font-medium text-black">{repo}</span>
        </div>
        <div className="flex items-center gap-4 py-2">
          <span className="text-xs text-gray-400">Authenticated as {session.user?.name}</span>
          <Link href="/api/auth/signout" className="text-xs text-blue-600 hover:underline">Sign out</Link>
        </div>
      </div>

      <GithubEditorShell
        owner={owner}
        repo={repo}
        initialMarkdown={readme}
      />
    </main>
  )
}
