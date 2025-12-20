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
