# RACTNZ Google Sheets CMS Guide

This document explains how the content management system works for the Rajasthan Association NZ website.

## Overview

The website uses a **Google Sheets-based CMS** where content editors can update events, gallery images, and committee members through a simple spreadsheet interface. Images are hosted on Google Drive and downloaded at build time.

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Google Sheets  │────▶│   Build Process  │────▶│  Static Site    │
│  (Content Data) │     │  (fetchSheets)   │     │  (GitHub Pages) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         │                       ▼
┌─────────────────┐     ┌──────────────────┐
│  Google Drive   │────▶│  Downloaded      │
│  (Images)       │     │  Images (cms/)   │
└─────────────────┘     └──────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `scripts/fetchSheets.mjs` | Fetches data from Google Sheets and downloads images from Google Drive |
| `scripts/populateSheets.mjs` | Utility to populate sheets with initial data |
| `src/hooks/useEvents.ts` | Hook to access events data |
| `src/hooks/useGallery.ts` | Hook to access gallery data with image resolution |
| `src/hooks/useCommittee.ts` | Hook to access committee data with image resolution |
| `src/data/*.json` | Generated JSON files from Google Sheets (gitignored in production) |
| `src/assets/images/cms/` | Downloaded images from Google Drive (gitignored) |

## Google Sheet Structure

The Google Sheet has three tabs:

### 1. Events Tab
| Column | Description |
|--------|-------------|
| id | Unique identifier (number) |
| title | Event name |
| date | Event date (e.g., "21st June 2025" or "August 2025") |
| location | Venue name |
| description | Brief event description |

### 2. Gallery Tab
| Column | Description |
|--------|-------------|
| id | Unique identifier (number) |
| imageurl | Google Drive sharing URL (see Image Workflow below) |
| alt | Alt text for accessibility |
| caption | Optional caption |

### 3. Committee Tab
| Column | Description |
|--------|-------------|
| id | Unique identifier (number) |
| name | Full name with title |
| title | Role (e.g., "Chairperson") |
| photourl | Google Drive sharing URL |

## Image Workflow

### For Content Editors

1. **Upload image to Google Drive** (in the shared RACTNZ folder)
2. **Right-click → Share → Copy link** (ensure "Anyone with the link can view")
3. **Paste the link** in the `imageurl` or `photourl` column

The system accepts various Google Drive URL formats:
- `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
- `https://drive.google.com/open?id=FILE_ID`
- Direct `FILE_ID` string

### Technical Details

At build time, `fetchSheets.mjs`:
1. Detects Google Drive URLs in the data
2. Extracts the file ID
3. Downloads the image to `src/assets/images/cms/{FILE_ID}.jpg`
4. Updates the JSON with local path `cms/{FILE_ID}.jpg`

The hooks use Vite's `import.meta.glob` to resolve these paths at runtime:
```typescript
const cmsImages = import.meta.glob('../assets/images/cms/*', { eager: true, import: 'default' });
```

## Build & Deploy Process

### Local Development

```bash
npm run dev    # Runs predev (fetchSheets) then starts Vite
```

### Production Build

```bash
npm run build  # Runs prebuild (fetchSheets) then builds with Vite
```

### Automated Deployment

The site automatically rebuilds and deploys:
- **On push to main**: Immediate build and deploy
- **Hourly**: Scheduled rebuild to pick up content changes

See `.github/workflows/scheduled-build.yml` for the workflow configuration.

## Environment Variables

### Required for Build

| Variable | Description |
|----------|-------------|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | JSON key for service account (base64 encoded or raw JSON) |
| `GOOGLE_SHEETS_ID` | The ID from the Google Sheet URL |

### Local Development

Create a `.env` file (see `.env.example`):
```
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_SHEETS_ID=your-sheet-id-here
```

Or use a key file:
```
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
GOOGLE_SHEETS_ID=your-sheet-id-here
```

### GitHub Secrets

These are configured in the repository settings:
- `GOOGLE_SERVICE_ACCOUNT_KEY`: The full JSON key content
- `GOOGLE_SHEETS_ID`: The sheet ID

## Service Account Setup

The service account `ractnz-sheets-editor@ractnz.iam.gserviceaccount.com` needs:
1. **Google Sheets API** access (read-only is sufficient)
2. **Editor access** to the specific Google Sheet (share the sheet with the service account email)
3. **Viewer access** to Google Drive images (images must be shared publicly or with the service account)

## Troubleshooting

### Images Not Loading
1. Check the Google Drive link is a sharing link (not just the file URL)
2. Ensure the image is shared as "Anyone with the link can view"
3. Check build logs for download errors

### Data Not Updating
1. Verify the Google Sheet has the correct column headers (lowercase)
2. Check that the service account has access to the sheet
3. Trigger a manual rebuild from GitHub Actions

### Build Failures
1. Check GitHub Actions logs for specific errors
2. Verify environment secrets are correctly set
3. Ensure the service account key is valid JSON

## Adding New Content Types

To add a new content type (e.g., "Sponsors"):

1. **Add a new tab** to the Google Sheet with appropriate columns
2. **Update `fetchSheets.mjs`** to fetch the new tab:
   ```javascript
   { name: 'Sponsors', range: 'Sponsors!A:E', imageField: 'logourl' }
   ```
3. **Create a new hook** `src/hooks/useSponsors.ts`
4. **Add TypeScript types** in `src/types/content.ts`
5. **Use the hook** in your component

## Architecture Decisions

### Why Google Sheets?
- Familiar interface for non-technical users
- Free and accessible
- Real-time collaboration
- No database setup required

### Why Download Images at Build Time?
- Faster page loads (images bundled with site)
- No CORS issues
- Works offline after initial load
- Vite optimizes images automatically

### Why Hourly Rebuilds?
- Balance between freshness and build minutes
- Content changes are typically not urgent
- Can manually trigger for immediate updates
