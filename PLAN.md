Build a minimal Next.js-based editor that feels like Substack: title and subtitle inputs above a clean, centered TipTap editor. The editor supports basic text, image drops, and CSV drops. Content is persisted as markdown with frontmatter and asset references. Storage is in-memory only for v1, with mocked save output to console.

- [x] Select editor library **✅2025-12-25 TipTap**
- [x] Get basic working system
  - [x] CSV upload
  - [x] Image upload
- [x] Editor toolbar
- [x] Improve CSV preview experience
- [x] Markdown editing support e.g. `## title` converts to h2 title in tiptap - see https://tiptap.dev/docs/examples/basics/markdown-shortcuts
- [ ] Loading markdown - see https://tiptap.dev/docs/editor/markdown

## Full app (wrapped around the editor)

- [ ] Login to github
  - [ ] make sure to ask for permissions to write to repos ... (on relevant organizations)
- [ ] Select org
- [ ] Select repo
- [ ] Automatically loads README.md (or prepares to write to that if no existing README.md)
  - [ ] Files like images or CSVs are stored directly into github repo in same directory as README.md
    - [ ] you will need to use the relevant API for saving ...
  - [ ] Uploading should happen with a spinner or holding sign in the editor (bonus if we can show progress on uploading)