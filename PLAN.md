Build a minimal Next.js-based editor that feels like Substack: title and subtitle inputs above a clean, centered TipTap editor. The editor supports basic text, image drops, and CSV drops. Content is persisted as markdown with frontmatter and asset references. Storage is in-memory only for v1, with mocked save output to console.

- [x] Select editor library **✅2025-12-25 TipTap**
- [x] Get basic working system
  - [x] CSV upload
  - [x] Image upload
- [x] Editor toolbar
- [x] Improve CSV preview experience
- [x] Markdown editing support e.g. `## title` converts to h2 title in tiptap - see https://tiptap.dev/docs/examples/basics/markdown-shortcuts
- [ ] Loading markdown - see https://tiptap.dev/docs/editor/markdown