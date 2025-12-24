import Link from "next/link"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
            <div className="max-w-xl w-full text-center space-y-12">
                {/* Logo/Hero */}
                <div className="space-y-4">
                    <h1 className="text-6xl font-black tracking-tighter">Florist</h1>
                    <p className="text-xl text-gray-500 font-medium leading-tight">
                        A minimal, Substack-style rich text editor <br />for your Markdown workflows.
                    </p>
                </div>

                {/* Entry Points */}
                <div className="grid gap-4 mt-8">
                    <Link
                        href="/demo"
                        className="group flex flex-col items-center p-8 bg-gray-50 rounded-[2rem] border border-transparent hover:border-black hover:bg-white transition-all duration-300"
                    >
                        <span className="text-2xl mb-2">📝</span>
                        <h2 className="text-xl font-bold">Try the Demo</h2>
                        <p className="text-sm text-gray-400 mt-1">In-memory writing experience</p>
                    </Link>

                    <div className="flex items-center gap-4 px-4 text-gray-300">
                        <div className="h-px flex-1 bg-current"></div>
                        <span className="text-xs font-bold uppercase tracking-widest">or</span>
                        <div className="h-px flex-1 bg-current"></div>
                    </div>

                    <Link
                        href="/github"
                        className="group flex flex-col items-center p-8 bg-black text-white rounded-[2rem] hover:scale-[1.02] transition-all duration-300"
                    >
                        <span className="text-2xl mb-2">🐙</span>
                        <h2 className="text-xl font-bold">GitHub Editor</h2>
                        <p className="text-sm text-gray-400 mt-1">Direct repo & asset integration</p>
                    </Link>
                </div>

                {/* Footer info */}
                <div className="pt-12 flex justify-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-300">
                    <a href="https://github.com/flowershow/florist-antigravity" className="hover:text-black transition-colors">Source Code</a>
                    <span className="select-none">•</span>
                    <span>Alpha v0.1</span>
                </div>
            </div>
        </div>
    )
}
