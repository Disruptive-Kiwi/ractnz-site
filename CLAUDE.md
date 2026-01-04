# CLAUDE.md - AI Agent Context

This file provides context for AI agents working on this codebase.

## Project Overview

**Rajasthan Association NZ (RACTNZ)** - A community website for Rajasthani people in New Zealand.

- **Live Site**: https://rajasthan.co.nz/
- **Tech Stack**: React + TypeScript + Vite + Tailwind CSS
- **Hosting**: GitHub Pages
- **CMS**: Google Sheets (with Google Drive for images)

## Quick Start

```bash
npm install
npm run dev      # Fetches CMS data then starts dev server
npm run build    # Fetches CMS data then builds for production
```

## Architecture

### Content Management System

Content is managed via **Google Sheets** with three tabs:
- **Events**: Upcoming/past events
- **Gallery**: Photo gallery images
- **Committee**: Committee member profiles

**Image handling**: Images are stored in Google Drive. At build time, `scripts/fetchSheets.mjs` downloads them to `src/assets/images/cms/` and the JSON data references local paths.

### Key Directories

```
src/
├── App.tsx                    # Main app component
├── components/
│   └── CommitteeSection.tsx   # Committee display component
├── hooks/
│   ├── useEvents.ts           # Events data hook
│   ├── useGallery.ts          # Gallery data + image resolution
│   └── useCommittee.ts        # Committee data + image resolution
├── data/                      # Generated JSON from Google Sheets (gitignored)
├── assets/images/
│   ├── cms/                   # Downloaded CMS images (gitignored)
│   └── ractnz-group-pic.jpg   # Hero image (in repo)
└── types/
    └── content.ts             # TypeScript types for CMS data

scripts/
├── fetchSheets.mjs            # Fetches data + downloads images
└── populateSheets.mjs         # Utility to seed initial data

.github/workflows/
└── scheduled-build.yml        # Hourly rebuild + deploy workflow
```

### Data Flow

1. Editor updates Google Sheet (events, gallery, committee)
2. For images, editor pastes Google Drive sharing link
3. Build runs `fetchSheets.mjs`:
   - Fetches sheet data via Google Sheets API
   - Downloads images from Google Drive URLs
   - Writes JSON to `src/data/`
   - Images saved to `src/assets/images/cms/`
4. Vite builds the site with bundled images
5. GitHub Pages serves the static site

## Environment Variables

Required for builds (set in `.env` locally, GitHub Secrets for CI):

```
GOOGLE_SERVICE_ACCOUNT_KEY=<JSON key or base64>
GOOGLE_SHEETS_ID=<sheet ID from URL>
```

## Common Tasks

### Update content
Edit the Google Sheet directly. Site rebuilds hourly or trigger manually from GitHub Actions.

### Add new content type
1. Add tab to Google Sheet
2. Update `fetchSheets.mjs` to fetch new tab
3. Create new hook in `src/hooks/`
4. Add types in `src/types/content.ts`

### Debug image issues
- Check image is shared publicly in Google Drive
- Look for download errors in build logs
- Verify image URL format in sheet

## Important Notes

- `src/data/` and `src/assets/images/cms/` are gitignored (generated at build time)
- Hero image `ractnz-group-pic.jpg` is kept in repo (not CMS-managed)
- Service account: `ractnz-sheets-editor@ractnz.iam.gserviceaccount.com`
- Deployment branch policy allows `main` to deploy to `github-pages` environment

## Related Documentation

- [CMS Guide](./docs/CMS_GUIDE.md) - Detailed CMS documentation
- [CMS Plan](./docs/GOOGLE_SHEETS_CMS_PLAN.md) - Original implementation plan
