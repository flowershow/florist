import EditorShell from "@/components/EditorShell"

export default function DemoPage() {
    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur sticky top-0 z-10 mb-4">
                <div className="font-bold text-xl tracking-tight">Florist <span className="text-gray-400 font-normal">Demo</span></div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">In-memory only</div>
            </div>
            <EditorShell />
        </main>
    )
}
