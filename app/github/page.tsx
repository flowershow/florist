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
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">Florist</h1>
          <p className="text-gray-500 mb-8">Sign in with GitHub to continue</p>
          <Link
            href="/login"
            className="rounded-full bg-black px-8 py-4 text-sm font-bold text-white hover:bg-gray-800 transition-all shadow-xl"
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
    <GithubEditorShell
      owner={owner}
      repo={repo}
      initialMarkdown={readme}
    />
  )
}
