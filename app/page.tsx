import Link from "next/link"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#fafafa] transition-colors duration-500">
            <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
                <div className="text-2xl font-black tracking-tighter hover:scale-105 transition-transform cursor-default">FLORIST</div>
                <div className="flex gap-8 text-sm font-medium text-gray-500">
                    <a href="https://github.com/flowershow/florist-antigravity" className="hover:text-black transition-colors">GitHub</a>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
                <div className="max-w-3xl">
                    <h1 className="text-7xl font-black tracking-tight leading-[0.9] mb-8 bg-gradient-to-br from-black to-gray-500 bg-clip-text text-transparent">
                        Writing, <br />refined.
                    </h1>
                    <p className="text-2xl text-gray-500 font-medium leading-tight mb-12 max-w-xl">
                        A minimal, Substack-style rich text editor for your Markdown workflows. Directly integrated with your Git repositories.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mt-20">
                    <Link
                        href="/demo"
                        className="group relative overflow-hidden bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                    >
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-4 group-hover:text-blue-600 transition-colors">Try the Demo</h2>
                            <p className="text-gray-500 text-lg leading-snug max-w-[280px]">
                                Experience the clean interface and rich text capabilities in minutes. No account required.
                            </p>
                        </div>
                        <div className="absolute bottom-0 right-0 p-8 scale-150 opacity-10 group-hover:opacity-20 transition-opacity">
                            📝
                        </div>
                    </Link>

                    <Link
                        href="/github"
                        className="group relative overflow-hidden bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                    >
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-4 group-hover:text-green-600 transition-colors">GitHub Editor</h2>
                            <p className="text-gray-500 text-lg leading-snug max-w-[280px]">
                                Connect your repositories to directly edit READMEs and manage assets in the cloud.
                            </p>
                        </div>
                        <div className="absolute bottom-0 right-0 p-8 scale-150 opacity-10 group-hover:opacity-20 transition-opacity">
                            🐙
                        </div>
                    </Link>
                </div>

                <div className="mt-32 pt-16 border-t border-gray-200 grid md:grid-cols-3 gap-12 text-sm">
                    <div>
                        <h3 className="font-bold mb-4">Focused Experience</h3>
                        <p className="text-gray-500">Distraction-free writing with a centered, Substack-inspired interface that prioritizes your thoughts.</p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-4">Seamless Assets</h3>
                        <p className="text-gray-500">Drag and drop images or CSVs. We handle the formatting and storage so you don't have to.</p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-4">Git-Native</h3>
                        <p className="text-gray-500">Commit changes directly to GitHub with ease. Your content stays version-controlled and portable.</p>
                    </div>
                </div>
            </main>

            <footer className="py-12 text-center text-xs text-gray-400 border-t border-gray-100">
                &copy; 2025 Florist Alpha. Built for the open web.
            </footer>
        </div>
    )
}
