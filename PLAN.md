# Tiptap V1 Editor Implementation Plan

## Goal Description
Build a minimal Next.js-based editor that feels like Substack: title and subtitle inputs above a clean, centered TipTap editor. The editor supports basic text, image drops, and CSV drops. Content is persisted as markdown with frontmatter and asset references. Storage is in-memory only for v1, with mocked save output to console.

## Proposed Changes
### Scaffold
#### [NEW] [./](file:///Users/rgrp/src/flowershow/florist-antigravity)
- Create Next.js App Router app in current directory.
- Use TypeScript, Tailwind CSS, ESLint, and pnpm.

### Core Logic
#### [NEW] [lib/assets.ts](file:///Users/rgrp/src/flowershow/florist-antigravity/lib/assets.ts)
- In-memory asset registry keyed by filename.
#### [NEW] [lib/csv.ts](file:///Users/rgrp/src/flowershow/florist-antigravity/lib/csv.ts)
- CSV parsing utility using PapaParse.
#### [NEW] [lib/serialization.ts](file:///Users/rgrp/src/flowershow/florist-antigravity/lib/serialization.ts)
- Markdown serialization with frontmatter.

### Editor Components
#### [NEW] [components/EditorShell.tsx](file:///Users/rgrp/src/flowershow/florist-antigravity/components/EditorShell.tsx)
- Main editor UI with Title/Subtitle inputs and TipTap editor.
- Handles drag-and-drop for images and CSVs.
#### [NEW] [components/Toolbar.tsx](file:///Users/rgrp/src/flowershow/florist-antigravity/components/Toolbar.tsx)
- Comprehensive formatting options:
  - Text: Bold, Italic, Strike, Code.
  - Headings: H1, H2, H3.
  - Lists: Bullet, Ordered.
  - specialized: Blockquote, Code Block, Horizontal Rule.
  - Insert: Image (via file picker).
  - History: Undo, Redo.
- Styling: Sticky top or fixed formatting bar above editor.

#### [MODIFY] [components/EditorShell.tsx](file:///Users/rgrp/src/flowershow/florist-antigravity/components/EditorShell.tsx)
- Insert `Toolbar` above `EditorContent`.
- Pass `editor` instance to `Toolbar`.

#### [NEW] [lib/tiptap/extensions/csvEmbed.ts](file:///Users/rgrp/src/flowershow/florist-antigravity/lib/tiptap/extensions/csvEmbed.ts)
- Custom TipTap node for embedded CSV tables.

#### [NEW] [components/AssetContext.tsx](file:///Users/rgrp/src/flowershow/florist-antigravity/components/AssetContext.tsx)
- Create a React Context to hold the `AssetRegistry`.
- `AssetProvider` wraps the editor.

#### [MODIFY] [lib/tiptap/extensions/csvEmbed.ts](file:///Users/rgrp/src/flowershow/florist-antigravity/lib/tiptap/extensions/csvEmbed.ts)
- Use `ReactNodeViewRenderer` pointing to `CsvNodeView`.
- Attribute `filename` remains the key.

#### [NEW] [components/CsvNodeView.tsx](file:///Users/rgrp/src/flowershow/florist-antigravity/components/CsvNodeView.tsx)
- Uses `useAssetRegistry` hook to find the asset by `filename`.
- Renders full table from `asset.parsed` data.
- Basic styling: scrollable container, sticky header.

#### [MODIFY] [components/EditorShell.tsx](file:///Users/rgrp/src/flowershow/florist-antigravity/components/EditorShell.tsx)
- Wrap in `AssetProvider`.
- Drop handler updates the registry via context/hook.

## Verification Plan
### Automated Tests
- logic tests using Vitest for `lib/` utilities.
- `pnpm test`

### Manual Verification
- Run `pnpm dev`.
- Verify UI layout matches Substack style.
- Test dragging and dropping an image.
- Test dragging and dropping a CSV file.
- Click "Save" and check console for markdown output.
