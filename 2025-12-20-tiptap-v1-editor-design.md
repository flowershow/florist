# TipTap v1 Editor Design

## Summary

Build a minimal Next.js-based editor that feels like Substack: title and subtitle inputs above a clean, centered TipTap editor. The editor supports basic text, image drops, and CSV drops. Content is persisted as markdown with frontmatter and asset references. Storage is in-memory only for v1, with mocked save output to console.

## Goals

- Provide a Substack-like writing experience with title/subtitle inputs.
- Support drag-drop images and CSV files.
- Serialize to markdown with frontmatter on save.
- Keep asset handling in-memory but aligned with future upload flow.

## Non-Goals (v1)

- Persistent storage (IndexedDB, server uploads).
- Advanced table rendering or data exploration.
- Real backend APIs or authentication.

## Architecture

- Next.js App Router app in `tiptap-v1`.
- Single editor route (e.g. `/`) with client components.
- TipTap with StarterKit plus custom `csvEmbed` node.
- In-memory asset registry keyed by filename.

## Implementation Details

- Scaffold with `create-next-app` in `tiptap-v1`.
- Use TypeScript, Tailwind CSS, ESLint, and pnpm.
- Skip `src/` directory for a simpler layout.
- Use TipTap v2 packages (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`).
- Keep the page thin; move UI/state into `components/EditorShell.tsx`.

## Implementation Details

- Scaffold with `create-next-app` in `tiptap-v1`.
- Use TypeScript, Tailwind CSS, ESLint, and pnpm.
- Skip `src/` directory for a simpler layout.
- Use TipTap v2 packages (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`).
- Keep the page thin; move UI/state into `components/EditorShell.tsx`.

## UI Layout

- Centered content column with generous margins.
- Title input (large, bold).
- Subtitle input (smaller, lighter).
- TipTap editor below with minimal chrome.
- Optional hint row that disappears once content exists.

## Data Model

- `title` and `subtitle` stored in frontmatter.
- TipTap document stores image and CSV nodes with `filename`.
- Assets registry: `{ filename, originalName, mime, url, parsed? }`.

## Serialization

- Markdown output:
  - Frontmatter:
    - `title`
    - `subtitle`
  - Body from TipTap.
- Image node serializes to `![alt](./filename)`.
- CSV node serializes to `{{table: filename}}`.
- Save logs markdown and asset metadata to console.

## File Handling

- Image drop:
  - Create object URL.
  - Register asset.
  - Insert image node.
- CSV drop:
  - Create object URL.
  - Parse CSV in browser (simple table preview).
  - Register asset.
  - Insert CSV embed node.

## Error Handling

- Unsupported files ignored with console warning.
- CSV parse errors show inline placeholder but keep markdown reference.
- Missing assets render a friendly placeholder in editor.

## Future Considerations

- Swap in real uploads and replace object URLs with permanent URLs.
- Replace CSV preview with more powerful table rendering (and later DuckDB).

---

# TipTap v1 Editor Implementation Plan

Task summary (detail below) with status info.

- [x] Task 1: Scaffold app (create-next-app, commit)
- [ ] Task 2: Add TipTap + CSV deps
- [ ] Task 3: Add Vitest tooling
- [ ] Task 4: Asset registry (TDD)
- [ ] Task 5: CSV parser (TDD)
- [ ] Task 6: Markdown serialization (TDD)
- [ ] Task 7: csvEmbed TipTap extension
- [ ] Task 8: EditorShell UI + drop handling
- [ ] Task 9: Save + serialize to markdown
- [ ] Task 10: Editor styling (ProseMirror)
- [ ] Task 11: Verify (tests + dev server)


> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a new `tiptap-v1/` Next.js app with a Substack-like TipTap editor, drag-drop images/CSV, and markdown+frontmatter serialization.

**Architecture:** Single `/` route with a thin page component that renders a client `EditorShell`. TipTap v2 manages document state; drops insert `image` and `csvEmbed` nodes. Serialization and asset registry live in small `lib/` utilities with unit tests.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, TipTap v2, pnpm, Vitest for unit tests.

### Task 1: Scaffold the app

**Files:**
- Create: `tiptap-v1/` (Next.js scaffold)

**Step 1: Run scaffold command**

Run:
```bash
pnpm create next-app tiptap-v1 --ts --tailwind --eslint --app --no-src-dir --use-pnpm
```
Expected: `tiptap-v1/` directory with Next.js App Router setup.

**Step 2: Commit**

```bash
git add tiptap-v1
git commit -m "chore: scaffold tiptap-v1 app"
```

### Task 2: Add TipTap and CSV parsing dependencies

**Files:**
- Modify: `tiptap-v1/package.json`

**Step 1: Add dependencies**

Run:
```bash
cd tiptap-v1
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-image
pnpm add papaparse
```
Expected: dependencies added to `package.json` and lockfile.

**Step 2: Commit**

```bash
git add tiptap-v1/package.json tiptap-v1/pnpm-lock.yaml
git commit -m "chore: add tiptap and csv dependencies"
```

### Task 3: Add unit test tooling for utilities (TDD)

**Files:**
- Modify: `tiptap-v1/package.json`
- Create: `tiptap-v1/vitest.config.ts`

**Step 1: Add test dependencies**

Run:
```bash
cd tiptap-v1
pnpm add -D vitest @types/node
```

**Step 2: Create vitest config**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts']
  }
})
```

**Step 3: Add test script**

Add to `package.json`:
```json
"scripts": {
  "test": "vitest run"
}
```

**Step 4: Run tests to confirm empty suite**

Run: `pnpm test`  
Expected: PASS with 0 tests.

**Step 5: Commit**

```bash
git add tiptap-v1/package.json tiptap-v1/vitest.config.ts tiptap-v1/pnpm-lock.yaml
git commit -m "chore: add vitest for utility tests"
```

### Task 4: Implement asset registry (TDD)

**Files:**
- Create: `tiptap-v1/lib/assets.ts`
- Create: `tiptap-v1/lib/assets.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { createAssetRegistry } from './assets'

describe('asset registry', () => {
  it('registers and returns assets by filename', () => {
    const registry = createAssetRegistry()
    registry.register({
      filename: 'image.png',
      originalName: 'image.png',
      mime: 'image/png',
      url: 'blob://image'
    })

    expect(registry.get('image.png')?.mime).toBe('image/png')
    expect(registry.list()).toHaveLength(1)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test lib/assets.test.ts`  
Expected: FAIL with "createAssetRegistry is not defined".

**Step 3: Write minimal implementation**

```ts
type Asset = {
  filename: string
  originalName: string
  mime: string
  url: string
  parsed?: string[][]
}

export function createAssetRegistry() {
  const assets = new Map<string, Asset>()

  return {
    register(asset: Asset) {
      assets.set(asset.filename, asset)
    },
    get(filename: string) {
      return assets.get(filename)
    },
    list() {
      return Array.from(assets.values())
    }
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test lib/assets.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add tiptap-v1/lib/assets.ts tiptap-v1/lib/assets.test.ts
git commit -m "feat: add in-memory asset registry"
```

### Task 5: Implement CSV parser utility (TDD)

**Files:**
- Create: `tiptap-v1/lib/csv.ts`
- Create: `tiptap-v1/lib/csv.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { parseCsvText } from './csv'

describe('parseCsvText', () => {
  it('parses rows and handles quoted commas', () => {
    const input = 'name,desc\\n\"foo\",\"bar, baz\"'
    const rows = parseCsvText(input)
    expect(rows).toEqual([
      ['name', 'desc'],
      ['foo', 'bar, baz']
    ])
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test lib/csv.test.ts`  
Expected: FAIL with "parseCsvText is not defined".

**Step 3: Write minimal implementation**

```ts
import Papa from 'papaparse'

export function parseCsvText(text: string): string[][] {
  const result = Papa.parse<string[]>(text.trim(), { skipEmptyLines: true })
  if (result.errors.length > 0) {
    throw new Error(result.errors[0].message)
  }
  return result.data
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test lib/csv.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add tiptap-v1/lib/csv.ts tiptap-v1/lib/csv.test.ts
git commit -m "feat: add csv parsing utility"
```

### Task 6: Add serialization utility (TDD)

**Files:**
- Create: `tiptap-v1/lib/serialization.ts`
- Create: `tiptap-v1/lib/serialization.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { serializeToMarkdown } from './serialization'

describe('serializeToMarkdown', () => {
  it('adds frontmatter and serializes image and csv nodes', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
        { type: 'image', attrs: { alt: 'Alt', filename: 'cat.png' } },
        { type: 'csvEmbed', attrs: { filename: 'data.csv' } }
      ]
    }

    const markdown = serializeToMarkdown({
      title: 'Title',
      subtitle: 'Subtitle',
      doc
    })

    expect(markdown).toContain('title: \"Title\"')
    expect(markdown).toContain('subtitle: \"Subtitle\"')
    expect(markdown).toContain('![Alt](./cat.png)')
    expect(markdown).toContain('{{table: data.csv}}')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test lib/serialization.test.ts`  
Expected: FAIL with "serializeToMarkdown is not defined".

**Step 3: Write minimal implementation**

```ts
type SerializeInput = {
  title: string
  subtitle: string
  doc: Record<string, unknown>
}

export function serializeToMarkdown({ title, subtitle, doc }: SerializeInput) {
  const frontmatter = [
    '---',
    `title: \"${title}\"`,
    `subtitle: \"${subtitle}\"`,
    '---',
    ''
  ].join('\\n')

  const body = serializeNode(doc)
  return `${frontmatter}${body}`.trim() + '\\n'
}

function serializeNode(node: any): string {
  if (!node) return ''
  if (Array.isArray(node)) return node.map(serializeNode).join('')
  if (node.type === 'text') return node.text || ''
  if (node.type === 'paragraph') return `${serializeNode(node.content || [])}\\n\\n`
  if (node.type === 'image') {
    const alt = node.attrs?.alt || ''
    const filename = node.attrs?.filename || ''
    return `![${alt}](./${filename})\\n\\n`
  }
  if (node.type === 'csvEmbed') {
    const filename = node.attrs?.filename || ''
    return `{{table: ${filename}}}\\n\\n`
  }
  return serializeNode(node.content || [])
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test lib/serialization.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add tiptap-v1/lib/serialization.ts tiptap-v1/lib/serialization.test.ts
git commit -m "feat: add markdown serialization helper"
```

### Task 7: Add CSV embed TipTap extension

**Files:**
- Create: `tiptap-v1/lib/tiptap/extensions/csvEmbed.ts`

**Step 1: Implement extension**

```ts
import { Node, mergeAttributes } from '@tiptap/core'

export const CsvEmbed = Node.create({
  name: 'csvEmbed',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      filename: { default: '' }
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-csv-embed]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-csv-embed': '' }), 0]
  }
})
```

**Step 2: Commit**

```bash
git add tiptap-v1/lib/tiptap/extensions/csvEmbed.ts
git commit -m "feat: add csv embed tiptap extension"
```

### Task 8: Build EditorShell UI and drop handling

**Files:**
- Create: `tiptap-v1/components/EditorShell.tsx`
- Modify: `tiptap-v1/app/page.tsx`
- Create: `tiptap-v1/app/globals.css` (if missing)

**Step 1: Implement EditorShell**

- Title and subtitle inputs.
- `EditorContent` with centered layout.
- Drop handler: images insert `image` node with `filename` attr, CSV inserts `csvEmbed`.
- Use `createAssetRegistry` to store assets and log on save.
- Hint row hidden when editor has content.

**Step 2: Wire into page**

`app/page.tsx` renders `<EditorShell />` only.

**Step 3: Commit**

```bash
git add tiptap-v1/components/EditorShell.tsx tiptap-v1/app/page.tsx tiptap-v1/app/globals.css
git commit -m "feat: add tiptap editor shell and drop handling"
```

### Task 9: Add serialization + save button

**Files:**
- Modify: `tiptap-v1/components/EditorShell.tsx`

**Step 1: Implement save**

On click, call `serializeToMarkdown({ title, subtitle, doc: editor.getJSON() })` and log markdown + `registry.list()`.

**Step 2: Commit**

```bash
git add tiptap-v1/components/EditorShell.tsx
git commit -m "feat: serialize markdown on save"
```

### Task 10: Basic styling for editor content

**Files:**
- Modify: `tiptap-v1/app/globals.css`

**Step 1: Add ProseMirror styles**

- Centered content width and padding.
- Minimal focus styles for inputs.
- CSV placeholder styling.

**Step 2: Commit**

```bash
git add tiptap-v1/app/globals.css
git commit -m "feat: style tiptap editor content"
```

### Task 11: Verify

**Step 1: Run tests**

Run: `pnpm test`  
Expected: PASS for utility tests.

**Step 2: Run dev server**

Run: `pnpm dev`  
Expected: editor loads at `http://localhost:3000`.

**Step 3: Commit verification notes**

Add a note to `tiptap-v1/README.md` about running tests/dev server if needed.

---

# TipTap v1 Editor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a new `tiptap-v1/` Next.js app with a Substack-like TipTap editor, drag-drop images/CSV, and markdown+frontmatter serialization.

**Architecture:** Single `/` route with a thin page component that renders a client `EditorShell`. TipTap v2 manages document state; drops insert `image` and `csvEmbed` nodes. Serialization and asset registry live in small `lib/` utilities with unit tests.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, TipTap v2, pnpm, Vitest for unit tests.

### Task 1: Scaffold the app

**Files:**
- Create: `tiptap-v1/` (Next.js scaffold)

**Step 1: Run scaffold command**

Run:
```bash
pnpm create next-app tiptap-v1 --ts --tailwind --eslint --app --no-src-dir --use-pnpm
```
Expected: `tiptap-v1/` directory with Next.js App Router setup.

**Step 2: Commit**

```bash
git add tiptap-v1
git commit -m "chore: scaffold tiptap-v1 app"
```

### Task 2: Add TipTap and CSV parsing dependencies

**Files:**
- Modify: `tiptap-v1/package.json`

**Step 1: Add dependencies**

Run:
```bash
cd tiptap-v1
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-image
pnpm add -D papaparse
```
Expected: dependencies added to `package.json` and lockfile.

**Step 2: Commit**

```bash
git add tiptap-v1/package.json tiptap-v1/pnpm-lock.yaml
git commit -m "chore: add tiptap and csv dependencies"
```

### Task 3: Add unit test tooling for utilities (TDD)

**Files:**
- Modify: `tiptap-v1/package.json`
- Create: `tiptap-v1/vitest.config.ts`

**Step 1: Add test dependencies**

Run:
```bash
cd tiptap-v1
pnpm add -D vitest @types/node
```

**Step 2: Create vitest config**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts']
  }
})
```

**Step 3: Add test script**

Add to `package.json`:
```json
"scripts": {
  "test": "vitest run"
}
```

**Step 4: Run tests to confirm empty suite**

Run: `pnpm test`  
Expected: PASS with 0 tests.

**Step 5: Commit**

```bash
git add tiptap-v1/package.json tiptap-v1/vitest.config.ts tiptap-v1/pnpm-lock.yaml
git commit -m "chore: add vitest for utility tests"
```

### Task 4: Implement asset registry (TDD)

**Files:**
- Create: `tiptap-v1/lib/assets.ts`
- Create: `tiptap-v1/lib/assets.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { createAssetRegistry } from './assets'

describe('asset registry', () => {
  it('registers and returns assets by filename', () => {
    const registry = createAssetRegistry()
    registry.register({
      filename: 'image.png',
      originalName: 'image.png',
      mime: 'image/png',
      url: 'blob://image'
    })

    expect(registry.get('image.png')?.mime).toBe('image/png')
    expect(registry.list()).toHaveLength(1)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test lib/assets.test.ts`  
Expected: FAIL with "createAssetRegistry is not defined".

**Step 3: Write minimal implementation**

```ts
type Asset = {
  filename: string
  originalName: string
  mime: string
  url: string
  parsed?: string[][]
}

export function createAssetRegistry() {
  const assets = new Map<string, Asset>()

  return {
    register(asset: Asset) {
      assets.set(asset.filename, asset)
    },
    get(filename: string) {
      return assets.get(filename)
    },
    list() {
      return Array.from(assets.values())
    }
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test lib/assets.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add tiptap-v1/lib/assets.ts tiptap-v1/lib/assets.test.ts
git commit -m "feat: add in-memory asset registry"
```

### Task 5: Implement CSV parser utility (TDD)

**Files:**
- Create: `tiptap-v1/lib/csv.ts`
- Create: `tiptap-v1/lib/csv.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { parseCsvText } from './csv'

describe('parseCsvText', () => {
  it('parses rows and handles quoted commas', () => {
    const input = 'name,desc\\n"foo","bar, baz"'
    const rows = parseCsvText(input)
    expect(rows).toEqual([
      ['name', 'desc'],
      ['foo', 'bar, baz']
    ])
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test lib/csv.test.ts`  
Expected: FAIL with "parseCsvText is not defined".

**Step 3: Write minimal implementation**

```ts
import Papa from 'papaparse'

export function parseCsvText(text: string): string[][] {
  const result = Papa.parse<string[]>(text.trim(), { skipEmptyLines: true })
  if (result.errors.length > 0) {
    throw new Error(result.errors[0].message)
  }
  return result.data
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test lib/csv.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add tiptap-v1/lib/csv.ts tiptap-v1/lib/csv.test.ts
git commit -m "feat: add csv parsing utility"
```

### Task 6: Add serialization utility (TDD)

**Files:**
- Create: `tiptap-v1/lib/serialization.ts`
- Create: `tiptap-v1/lib/serialization.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { serializeToMarkdown } from './serialization'

describe('serializeToMarkdown', () => {
  it('adds frontmatter and serializes image and csv nodes', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
        { type: 'image', attrs: { alt: 'Alt', filename: 'cat.png' } },
        { type: 'csvEmbed', attrs: { filename: 'data.csv' } }
      ]
    }

    const markdown = serializeToMarkdown({
      title: 'Title',
      subtitle: 'Subtitle',
      doc
    })

    expect(markdown).toContain('title: \"Title\"')
    expect(markdown).toContain('subtitle: \"Subtitle\"')
    expect(markdown).toContain('![Alt](./cat.png)')
    expect(markdown).toContain('{{table: data.csv}}')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test lib/serialization.test.ts`  
Expected: FAIL with "serializeToMarkdown is not defined".

**Step 3: Write minimal implementation**

```ts
type SerializeInput = {
  title: string
  subtitle: string
  doc: Record<string, unknown>
}

export function serializeToMarkdown({ title, subtitle, doc }: SerializeInput) {
  const frontmatter = [
    '---',
    `title: "${title}"`,
    `subtitle: "${subtitle}"`,
    '---',
    ''
  ].join('\n')

  const body = serializeNode(doc)
  return `${frontmatter}${body}`.trim() + '\n'
}

function serializeNode(node: any): string {
  if (!node) return ''
  if (Array.isArray(node)) return node.map(serializeNode).join('')
  if (node.type === 'text') return node.text || ''
  if (node.type === 'paragraph') return `${serializeNode(node.content || [])}\n\n`
  if (node.type === 'image') {
    const alt = node.attrs?.alt || ''
    const filename = node.attrs?.filename || ''
    return `![${alt}](./${filename})\n\n`
  }
  if (node.type === 'csvEmbed') {
    const filename = node.attrs?.filename || ''
    return `{{table: ${filename}}}\n\n`
  }
  return serializeNode(node.content || [])
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test lib/serialization.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add tiptap-v1/lib/serialization.ts tiptap-v1/lib/serialization.test.ts
git commit -m "feat: add markdown serialization helper"
```

### Task 7: Add CSV embed TipTap extension

**Files:**
- Create: `tiptap-v1/lib/tiptap/extensions/csvEmbed.ts`

**Step 1: Implement extension**

```ts
import { Node, mergeAttributes } from '@tiptap/core'

export const CsvEmbed = Node.create({
  name: 'csvEmbed',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      filename: { default: '' }
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-csv-embed]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-csv-embed': '' }), 0]
  }
})
```

**Step 2: Commit**

```bash
git add tiptap-v1/lib/tiptap/extensions/csvEmbed.ts
git commit -m "feat: add csv embed tiptap extension"
```

### Task 8: Build EditorShell UI and drop handling

**Files:**
- Create: `tiptap-v1/components/EditorShell.tsx`
- Modify: `tiptap-v1/app/page.tsx`
- Create: `tiptap-v1/app/globals.css` (if missing)

**Step 1: Implement EditorShell**

- Title and subtitle inputs.
- `EditorContent` with centered layout.
- Drop handler: images insert `image` node with `filename` attr, CSV inserts `csvEmbed`.
- Use `createAssetRegistry` to store assets and log on save.
- Hint row hidden when editor has content.

**Step 2: Wire into page**

`app/page.tsx` renders `<EditorShell />` only.

**Step 3: Commit**

```bash
git add tiptap-v1/components/EditorShell.tsx tiptap-v1/app/page.tsx tiptap-v1/app/globals.css
git commit -m "feat: add tiptap editor shell and drop handling"
```

### Task 9: Add serialization + save button

**Files:**
- Modify: `tiptap-v1/components/EditorShell.tsx`

**Step 1: Implement save**

On click, call `serializeToMarkdown({ title, subtitle, doc: editor.getJSON() })` and log markdown + `registry.list()`.

**Step 2: Commit**

```bash
git add tiptap-v1/components/EditorShell.tsx
git commit -m "feat: serialize markdown on save"
```

### Task 10: Basic styling for editor content

**Files:**
- Modify: `tiptap-v1/app/globals.css`

**Step 1: Add ProseMirror styles**

- Centered content width and padding.
- Minimal focus styles for inputs.
- CSV placeholder styling.

**Step 2: Commit**

```bash
git add tiptap-v1/app/globals.css
git commit -m "feat: style tiptap editor content"
```

### Task 11: Verify

**Step 1: Run tests**

Run: `pnpm test`  
Expected: PASS for utility tests.

**Step 2: Run dev server**

Run: `pnpm dev`  
Expected: editor loads at `http://localhost:3000`.

**Step 3: Commit verification notes**

Add a note to `tiptap-v1/README.md` about running tests/dev server if needed.
