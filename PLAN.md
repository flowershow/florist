Build a minimal Next.js-based editor that feels like Substack: title and subtitle inputs above a clean, centered TipTap editor. The editor supports basic text, image drops, and CSV drops. Content is persisted as markdown with frontmatter and asset references. Storage is in-memory only for v1, with mocked save output to console.

- [x] Select editor library **✅2025-12-25 TipTap**
- [x] Get basic working system
  - [x] CSV upload
  - [x] Image upload
- [x] Editor toolbar
- [x] Improve CSV preview experience
- [x] Markdown editing support e.g. `## title` converts to h2 title in tiptap - see https://tiptap.dev/docs/examples/basics/markdown-shortcuts
- [ ] Loading markdown - see https://tiptap.dev/docs/editor/markdown

Inbox

- [ ] Check that the "Save" button is outside the editor app - the editor should instead have API to get current content
  - [ ] That API should return an appropriate json object with e.g. title, subtitle and content (as markdown?)
  - [ ] Conversion of that structure to markdown with title and subtitle in frontmatter should be separate function outside the editor i think (factor this out and then use this)
- [ ] in demo we will need to wrap the Editor in a tiny bit of chrome to have a "Save" button like now.
  - [ ] Save button should lead to showing a dump of the output in a text area below the editor (with a little copy button) (as well as in console as we already have)
- [ ] In Github ersion also need to move Save out.

## Full app (wrapped around the editor)

- [x] Login to github
  - [x] make sure to ask for permissions to write to repos ... (on relevant organizations)
- [x] Select org
- [x] Select repo
- [x] Automatically loads README.md (or prepares to write to that if no existing README.md)
  - [x] Files like images or CSVs are stored directly into github repo in same directory as README.md
    - [x] you will need to use the relevant API for saving ...
  - [x] Uploading should happen with a spinner or holding sign in the editor (bonus if we can show progress on uploading)

Improvements to saving ...

- [ ] Change save to "Continue" in github version and have a follow on modal saying this will now publish to github.

Handle upload file name conflicts e.g. i upload same csv twice ...

Hmmm (not sure we need this yet ...)

- [ ] Auto-saving every few 5 seconds to local storage and recover 