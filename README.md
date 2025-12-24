# Florist Antigravity Editor

A minimal, Substack-style rich text editor built with [Next.js](https://nextjs.org) and [Tiptap](https://tiptap.dev).

## Features

- **Clean Interface**: Title and subtitle inputs with a centered writing experience.
- **Rich Text**: Formatting controls via a sticky toolbar (Bold, Italic, Headings, Lists, etc.).
- **Media Support**: Drag and drop images directly into the editor.
- **CSV Handling**: Drag and drop CSV files to render them as interactive tables.
- **Markdown Output**: Content is serialized to Markdown with frontmatter.

## Github Editor

The Github Editor flow allows you to:
- **Direct Integration**: Log in with your GitHub account to browse organizations and repositories.
- **Native Markdown**: Edit `README.md` files directly using the rich text interface.
- **Cloud Storage**: Images and CSV files dropped into the editor are automatically committed to the repository in the same directory as the content.
- **Portable Content**: Assets are referenced via relative paths, ensuring your repository remains portable and standard-compliant.

## Getting Started

### Prerequisites

- Node.js
- [pnpm](https://pnpm.io/) (preferred package manager)

### Installation

```bash
pnpm install
```

### Running Locally

Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Developer Guide

### Architecture

This project uses **Next.js 16 (App Router)** primarily as a wrapper to serve the React-based editor application.

- **Stack**: Next.js, React 19, Tailwind CSS, Tiptap.
- **Core Components**:
  - `components/EditorShell.tsx`: The main container managing the editor state, title/subtitle, and drag-and-drop logic.
  - `components/Toolbar.tsx`: The formatting toolbar.
  - `components/CsvNodeView.tsx`: Custom Node View for rendering CSV data files using `papaparse`.
- **State Management**:
  - `lib/assets.ts` & `components/AssetContext.tsx`: Manages an in-memory registry of dropped files (images/CSVs) to simulate local asset handling.
- **Serialization**:
  - `lib/serialization.ts`: Handles converting the editor state back to Markdown + Frontmatter.

### Key Directory Structure

```
├── app/                  # Next.js App Router pages
│   └── page.tsx          # Renders <EditorShell />
├── components/           # React components (Editor, Toolbar, etc.)
├── lib/                  # Utilities (CSV parsing, serialization)
├── PLAN.md               # Original implementation plan and requirements
└── public/               # Static assets
```

### Contributing

1. Fork and clone the repository.
2. Install dependencies: `pnpm install`.
3. Make your changes.
4. Verify changes by running `pnpm dev`.

## AI Agent Context

Use this section to quickly understand the project context if you are an AI agent picking up this task.

- **Goal**: Create a high-quality, "Substack-like" writing environment.
- **Current State**: The editor acts as a Single Page Application (SPA) embedded in Next.js.
- **Key Constraints**: 
  - Styling uses Tailwind CSS.
  - No external database (currently in-memory only for demo).
  - Assets are handled via `AssetContext`.
- **References**: See `PLAN.md` for the detailed feature checklist and implementation steps.
