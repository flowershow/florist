import { type Editor } from '@tiptap/react'
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    SquareCode,
    Minus,
    Undo,
    Redo,
    Image as ImageIcon
} from 'lucide-react'
import { useCallback, useRef } from 'react'
import { createAssetRegistry } from '../lib/assets'

type ToolbarProps = {
    editor: Editor | null
}

export function Toolbar({ editor }: ToolbarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    // We need to access the registry to register uploaded images
    // In a real app we might pass this down or use a context, 
    // but for now we'll re-instantiate or assume the Registry is global/singleton if needed.
    // Actually, EditorShell has the registry. We should probably accept a callback or handle image upload in parent.
    // Ideally Toolbar just emits "insertImage" or we handle it here if we pass the registry or a handler.
    // Let's modify the props to accept an onImageUpload callback to keep Toolbar pure-ish.
    // But for simplicity in this task, let's keep image handling in Toolbar or pass a handler.
    // Passing a handler is cleaner.
    // Wait, EditorShell has the drag-drop logic which registers assets. 
    // Let's assume we pass a `onImageSelect` prop for commonality.
}

// Actually, rewriting to keep it simple and self-contained or functional.
// Let's define the specific component below.

export default function ToolbarComponent({ editor, onImageSelect }: { editor: Editor | null, onImageSelect?: (file: File) => void }) {
    const fileInput = useRef<HTMLInputElement>(null)

    if (!editor) return null

    const handleImageClick = () => {
        fileInput.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && onImageSelect) {
            onImageSelect(file)
        }
        // Reset input
        if (fileInput.current) fileInput.current.value = ''
    }

    const Button = ({
        onClick,
        isActive = false,
        disabled = false,
        children
    }: {
        onClick: () => void
        isActive?: boolean
        disabled?: boolean
        children: React.ReactNode
    }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive ? 'bg-gray-200 text-black' : 'text-gray-600'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    )

    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 pb-4 mb-4 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-1 mr-4 border-r pr-4 border-gray-200">
                <Button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                >
                    <Bold size={18} />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                >
                    <Italic size={18} />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                >
                    <Strikethrough size={18} />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    isActive={editor.isActive('code')}
                >
                    <Code size={18} />
                </Button>
            </div>

            <div className="flex items-center gap-1 mr-4 border-r pr-4 border-gray-200">
                <Button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                >
                    <Heading1 size={18} />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                >
                    <Heading2 size={18} />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                >
                    <Heading3 size={18} />
                </Button>
            </div>

            <div className="flex items-center gap-1 mr-4 border-r pr-4 border-gray-200">
                <Button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                >
                    <List size={18} />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                >
                    <ListOrdered size={18} />
                </Button>
            </div>

            <div className="flex items-center gap-1 mr-4 border-r pr-4 border-gray-200">
                <Button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                >
                    <Quote size={18} />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                >
                    <SquareCode size={18} />
                </Button>
                <Button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                    <Minus size={18} />
                </Button>
            </div>

            <div className="flex items-center gap-1 mr-4 border-r pr-4 border-gray-200">
                <input
                    type="file"
                    ref={fileInput}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
                <Button onClick={handleImageClick}>
                    <ImageIcon size={18} />
                </Button>
            </div>

            <div className="flex items-center gap-1">
                <Button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <Undo size={18} />
                </Button>
                <Button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <Redo size={18} />
                </Button>
            </div>
        </div>
    )
}
