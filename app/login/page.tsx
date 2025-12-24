
import { signIn } from "../../lib/auth"

export default function LoginPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="mb-4 text-2xl font-bold">Florist (Alpha)</h1>
                <p className="mb-8 text-gray-600">Sign in to manage your content</p>
                <form
                    action={async () => {
                        "use server"
                        await signIn("github", { redirectTo: "/" })
                    }}
                >
                    <button
                        type="submit"
                        className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                    >
                        Sign in with GitHub
                    </button>
                </form>
            </div>
        </div>
    )
}
