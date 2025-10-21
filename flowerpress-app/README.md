# FlowerPress App

A React/Next.js implementation of FlowerPress - a Substack/Notion-style editor for markdown-based data-rich documents.

## Features

- ✨ Notion-like block editor with markdown persistence
- 📸 Drag-and-drop image uploads
- 📊 CSV file support with interactive table rendering
- 💾 Autosave functionality (every 5 seconds)
- 🚀 Instant publishing workflow
- 📝 Markdown-first approach

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the editor.

## Architecture

- **Frontend**: React with BlockNote editor
- **Backend**: Next.js API routes
- **Storage**: Local storage (development), R2/S3 (production)
- **State Management**: Zustand

## Usage

1. **Write Content**: Use the block editor to write markdown content
2. **Add Images**: Drag and drop images directly into the editor
3. **Add CSV Tables**: Drop CSV files to automatically create interactive tables
4. **Save**: Content autosaves every 5 seconds, or click Save manually
5. **Publish**: Click Publish to make your document publicly viewable

## Project Structure

```
flowerpress-app/
├── app/
│   ├── api/           # API routes for backend
│   ├── view/          # Public view pages
│   └── page.tsx       # Main editor page
├── components/        # React components
├── lib/              # Utilities and services
└── types/            # TypeScript types
```

## API Endpoints

- `POST /api/spaces/:spaceId/docs/:slug/markdown` - Save markdown
- `GET /api/spaces/:spaceId/docs/:slug/markdown` - Get markdown
- `POST /api/spaces/:spaceId/docs/:slug/assets` - Upload asset
- `GET /api/spaces/:spaceId/docs/:slug/assets` - List assets

## Next Steps

- [ ] Add R2/S3 integration for production storage
- [ ] Implement user authentication
- [ ] Add real-time collaboration
- [ ] Support for charts and data visualizations
- [ ] GitHub sync functionality