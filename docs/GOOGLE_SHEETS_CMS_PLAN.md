# Google Sheets CMS Integration Plan

**Project**: Rajasthan Association NZ Website
**Date**: January 2026
**Purpose**: Enable non-technical users to update website content via Google Sheets

---

## Executive Summary

This plan outlines the implementation of a **Google Sheets-powered CMS** for the RACTNZ website. The solution will allow authorized users to update Events, Gallery, and Committee Members directly from Google Sheets, with automatic website updates via build triggers.

**Key Benefits**:
- ✅ Non-technical content management
- ✅ No backend infrastructure needed
- ✅ Works with existing GitHub Pages deployment
- ✅ Free (within Google API quotas)
- ✅ Fast static site performance

---

## Architecture Overview

### Data Flow

```
Google Sheets (Content Source)
      ↓
Google Sheets API v4 (Fetch at build time)
      ↓
Vite Build Process (SSG - Static Site Generation)
      ↓
Static HTML/JS Files
      ↓
GitHub Pages (Deployment)
```

### Approach: **Build-Time Data Fetching (SSG)**

We'll use **Static Site Generation** where Google Sheets data is fetched during the build process and baked into the static HTML/JS files.

**Why SSG over Runtime Fetching?**
- ⚡ **Performance**: No API calls on page load = instant content
- 🔒 **Security**: API keys never exposed to client
- 💰 **Cost**: Fewer API quota usage (only builds, not every page view)
- 🚀 **Reliability**: Site works even if Google Sheets API is down
- 📦 **SEO**: Content is in HTML (better for search engines)

**Trade-off**: Content updates require a rebuild/redeploy

---

## Google Sheets Structure

### Sheet 1: "Events"

| Column A | Column B | Column C | Column D |
|----------|----------|----------|----------|
| **title** | **date** | **location** | **description** |
| International Yoga Day | 21st June 2025 | Avondale Community Centre | Yoga, mindfulness, and wellness celebration. |
| Teej Mela (Fair) | 2nd August 2025 | Blockhouse Bay Community Centre | Traditional Rajasthani festivals celebration. |
| Ganesh Chaturthi | August 2025 | TBC | Lord Ganesha festival with prayers and performances. |

**Note**: Row 1 is headers, data starts from Row 2

### Sheet 2: "Gallery"

| Column A | Column B | Column C |
|----------|----------|----------|
| **imageUrl** | **alt** | **caption** |
| https://example.com/image1.jpg | Rajasthani Cultural Day | Event from March 2024 |
| https://example.com/image2.jpg | Gangaur Puja | Annual celebration |

**Note**: Images must be publicly accessible URLs (can use Google Drive with public sharing links)

### Sheet 3: "Committee"

| Column A | Column B | Column C |
|----------|----------|----------|
| **name** | **title** | **photoUrl** |
| Mrs. Gurudhari (Reema) Sharma | Chairperson | https://example.com/photo1.jpg |
| Mrs. Nirmala Agarwal | Secretary | https://example.com/photo2.jpg |
| Mrs. Rachana Nadgir | Treasurer | https://example.com/photo3.jpg |

---

## Technical Implementation

### 1. Google Cloud Setup

**Steps**:
1. Create/use existing Google Cloud Project
2. Enable **Google Sheets API v4**
3. Create **API Key** (for public data access)
4. Restrict API key to:
   - Google Sheets API only
   - (Optional) Restrict to specific domains if needed

**Security Note**: Since the spreadsheet will be public (view-only), API key exposure is low-risk. For added security, we can use environment variables in GitHub Actions.

### 2. Google Sheets Setup

**Steps**:
1. Create new Google Sheet with 3 tabs: "Events", "Gallery", "Committee"
2. Set up column structure (see above)
3. Share settings: **Anyone with the link can VIEW**
4. Copy Spreadsheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### 3. Code Architecture

**New Files to Create**:

```
/src
  ├── services/
  │   └── googleSheets.ts        # Fetch data from Google Sheets API
  ├── hooks/
  │   ├── useEvents.ts            # Hook to get events data
  │   ├── useGallery.ts           # Hook to get gallery data
  │   └── useCommittee.ts         # Hook to get committee data
  ├── types/
  │   └── content.ts              # TypeScript types for content
  └── data/
      ├── events.json             # Generated at build time
      ├── gallery.json            # Generated at build time
      └── committee.json          # Generated at build time
```

**Modified Files**:

```
/src
  ├── App.tsx                     # Remove hardcoded data, use hooks
  └── components/
      └── CommitteeSection.tsx    # Remove hardcoded data, use hooks
```

### 4. Data Fetching Strategy

**Option A: Build Script (Recommended)**

Create a Node.js script that fetches data during build:

```json
// package.json
{
  "scripts": {
    "prebuild": "node scripts/fetchSheets.js",
    "build": "tsc -b && vite build"
  }
}
```

**Pros**:
- ✅ Simple implementation
- ✅ Data baked into build
- ✅ No runtime dependencies

**Cons**:
- ❌ Requires Node.js script (not just frontend code)

**Option B: Vite Plugin (Advanced)**

Create a custom Vite plugin to fetch data during build.

**Pros**:
- ✅ Integrated into Vite build pipeline
- ✅ Type-safe with TypeScript

**Cons**:
- ❌ More complex implementation

**Decision**: Use **Option A** for simplicity

### 5. API Endpoint Structure

**Google Sheets API v4 Endpoint**:
```
GET https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/{SHEET_NAME}?key={API_KEY}
```

**Example for Events**:
```
GET https://sheets.googleapis.com/v4/spreadsheets/ABC123.../values/Events?key=YOUR_API_KEY
```

**Response Format**:
```json
{
  "range": "Events!A1:Z1000",
  "majorDimension": "ROWS",
  "values": [
    ["title", "date", "location", "description"],
    ["International Yoga Day", "21st June 2025", "Avondale Community Centre", "Yoga, mindfulness..."]
  ]
}
```

### 6. Data Processing

**Transform rows to objects**:

```typescript
// Input: [["title", "date", "location", "description"], ["Event 1", "2025-06-21", "Auckland", "Description"]]
// Output: [{ title: "Event 1", date: "2025-06-21", location: "Auckland", description: "Description" }]

function transformSheetData<T>(rows: string[][]): T[] {
  if (rows.length < 2) return [];

  const [headers, ...dataRows] = rows;

  return dataRows.map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj as T;
  });
}
```

---

## Deployment & Updates

### Automatic Updates with GitHub Actions

**Goal**: When Google Sheets data changes, automatically rebuild and deploy the site.

**Approach 1: Scheduled Builds** (Simple)

```yaml
# .github/workflows/scheduled-build.yml
name: Scheduled Rebuild
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm run deploy
    env:
      GOOGLE_SHEETS_API_KEY: ${{ secrets.GOOGLE_SHEETS_API_KEY }}
      GOOGLE_SHEETS_ID: ${{ secrets.GOOGLE_SHEETS_ID }}
```

**Pros**:
- ✅ Simple setup
- ✅ Automatic updates every 6 hours

**Cons**:
- ❌ Not instant (up to 6 hour delay)
- ❌ Builds even when no changes

**Approach 2: Webhook Trigger** (Advanced)

Use Google Apps Script to trigger GitHub Actions when sheet is edited.

**Pros**:
- ✅ Instant updates
- ✅ Only builds when data changes

**Cons**:
- ❌ More complex setup
- ❌ Requires Apps Script knowledge

**Decision**: Start with **Approach 1** (scheduled), upgrade to **Approach 2** if needed

---

## Implementation Steps

### Phase 1: Setup & Infrastructure (1-2 hours)

**Tasks**:
1. ✅ Create Google Cloud Project
2. ✅ Enable Google Sheets API v4
3. ✅ Generate API Key
4. ✅ Create Google Sheets with proper structure
5. ✅ Populate sample data
6. ✅ Add API key to GitHub Secrets

### Phase 2: Data Fetching Script (2-3 hours)

**Tasks**:
1. ✅ Create `/scripts/fetchSheets.js` Node.js script
2. ✅ Implement fetch logic for all 3 sheets
3. ✅ Transform data to JSON format
4. ✅ Write JSON files to `/src/data/`
5. ✅ Add error handling and logging
6. ✅ Test with sample data

### Phase 3: Frontend Integration (2-3 hours)

**Tasks**:
1. ✅ Create TypeScript types in `/src/types/content.ts`
2. ✅ Create hooks to import JSON data
3. ✅ Update `App.tsx` to use hooks instead of hardcoded data
4. ✅ Update `CommitteeSection.tsx` to use hooks
5. ✅ Handle loading states and errors
6. ✅ Test with local JSON files

### Phase 4: Build Pipeline Integration (1 hour)

**Tasks**:
1. ✅ Update `package.json` scripts to run fetch before build
2. ✅ Add environment variables for API key and Sheet ID
3. ✅ Create `.env.example` with required variables
4. ✅ Test full build pipeline locally
5. ✅ Update `.gitignore` to exclude generated JSON files (optional)

### Phase 5: GitHub Actions Setup (1-2 hours)

**Tasks**:
1. ✅ Create scheduled build workflow
2. ✅ Add secrets to GitHub repo
3. ✅ Test manual workflow trigger
4. ✅ Verify scheduled builds work
5. ✅ Update documentation

### Phase 6: Testing & Documentation (1-2 hours)

**Tasks**:
1. ✅ Test adding/editing/removing content in Google Sheets
2. ✅ Verify builds complete successfully
3. ✅ Check deployed site reflects changes
4. ✅ Document process for content editors (user guide)
5. ✅ Create troubleshooting guide

---

## Image Handling Strategy

### Challenge
Gallery and Committee photos are currently local files, but Google Sheets can only reference URLs.

### Solutions

**Option 1: Google Drive Public Links** (Recommended for MVP)

1. Upload images to Google Drive
2. Set sharing to "Anyone with the link can view"
3. Get public URL (format: `https://drive.google.com/uc?id=FILE_ID`)
4. Use in Google Sheets

**Pros**:
- ✅ Simple, no code changes
- ✅ Same Google ecosystem
- ✅ Content editors already familiar

**Cons**:
- ❌ Slower load times vs local images
- ❌ Subject to Google Drive rate limits
- ❌ Requires manual URL formatting

**Option 2: GitHub Repository Assets** (Best for Performance)

1. Create `/public/uploads/` folder
2. Content editors commit images via GitHub web UI
3. Reference as relative URLs: `/uploads/image.jpg`
4. Google Sheets stores filename only, frontend adds `/uploads/` prefix

**Pros**:
- ✅ Fast (served from GitHub Pages CDN)
- ✅ Version controlled
- ✅ No external dependencies

**Cons**:
- ❌ Requires basic GitHub knowledge
- ❌ Extra step for non-technical users

**Option 3: Image CDN (Cloudinary/Imgix)** (Overkill for now)

**Pros**:
- ✅ Professional solution
- ✅ Image optimization/transformations
- ✅ Fast CDN delivery

**Cons**:
- ❌ Cost (free tier limited)
- ❌ Extra complexity
- ❌ Overkill for small gallery

**Decision**: Start with **Option 1** (Google Drive), provide instructions for **Option 2** for power users

---

## Content Editor User Guide

### How to Update Website Content

#### 1. Access the Google Sheet
- Open: [LINK TO GOOGLE SHEET]
- You should have "Editor" access (request from admin if not)

#### 2. Update Events
- Go to "Events" tab
- Add/edit rows (do NOT modify headers in Row 1)
- Columns:
  - **title**: Event name
  - **date**: Event date (e.g., "21st June 2025" or "June 2025")
  - **location**: Venue name
  - **description**: Short description (1-2 sentences)

#### 3. Update Gallery
- Go to "Gallery" tab
- Add/edit rows
- Columns:
  - **imageUrl**: Full URL to image (see Image Upload Guide)
  - **alt**: Description for accessibility (e.g., "Diwali Dance 2024")
  - **caption**: Optional caption shown on hover

#### 4. Update Committee
- Go to "Committee" tab
- Add/edit rows
- Columns:
  - **name**: Full name (e.g., "Mrs. Gurudhari Sharma")
  - **title**: Position (e.g., "Chairperson", "Secretary")
  - **photoUrl**: Full URL to photo (see Image Upload Guide)

#### 5. Publish Changes
- Changes are automatically saved in Google Sheets
- Website updates within 6 hours (automatic rebuild)
- For immediate update: [Contact admin to trigger manual rebuild]

---

## Environment Variables

```bash
# .env (local development)
VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
VITE_GOOGLE_SHEETS_ID=your_spreadsheet_id_here

# GitHub Secrets (production)
GOOGLE_SHEETS_API_KEY=your_api_key_here
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
```

**Security Notes**:
- ✅ Never commit `.env` to git (already in `.gitignore`)
- ✅ Use GitHub Secrets for production
- ✅ API key should be restricted to Google Sheets API only
- ✅ Spreadsheet should be view-only for public

---

## Rollback Plan

If Google Sheets integration fails:

1. **Keep fallback data**: Store last successful fetch in git
2. **Error handling**: If API fails during build, use cached JSON
3. **Manual override**: Allow local JSON files to override Sheets data
4. **Monitoring**: Log build failures to catch issues early

---

## Cost Analysis

| Service | Cost | Notes |
|---------|------|-------|
| Google Sheets API | **FREE** | 500 requests/min, 25,000/day (way more than needed) |
| GitHub Actions | **FREE** | 2,000 mins/month (free tier) |
| GitHub Pages | **FREE** | Included with repo |
| Google Drive (images) | **FREE** | 15GB free storage |
| **TOTAL** | **$0/month** | 🎉 Completely free! |

---

## Timeline Estimate

| Phase | Time Estimate | Can Start |
|-------|---------------|-----------|
| Phase 1: Setup | 1-2 hours | Immediately |
| Phase 2: Fetch Script | 2-3 hours | After Phase 1 |
| Phase 3: Frontend | 2-3 hours | After Phase 2 |
| Phase 4: Build Pipeline | 1 hour | After Phase 3 |
| Phase 5: GitHub Actions | 1-2 hours | After Phase 4 |
| Phase 6: Testing & Docs | 1-2 hours | After Phase 5 |
| **TOTAL** | **8-13 hours** | ~2 work days |

---

## Success Criteria

- ✅ Content editors can update Events, Gallery, and Committee via Google Sheets
- ✅ Changes reflect on website within 6 hours (or instantly with manual trigger)
- ✅ No manual code changes needed for content updates
- ✅ Build process is automated and reliable
- ✅ Images load properly from Google Drive/GitHub
- ✅ Site performance remains fast (static generation)
- ✅ SEO is maintained (content in HTML)
- ✅ Zero hosting costs

---

## Future Enhancements

### Short-term (Optional)
- 🔄 Webhook-based instant updates (Google Apps Script → GitHub Actions)
- 📸 Image upload workflow via Google Forms → Drive → Sheets
- 📊 Content validation (ensure required fields are filled)
- 🎨 Rich text support (Markdown in descriptions)

### Long-term (If needed)
- 🔐 Private content sections (require authentication)
- 📅 Event RSVP tracking
- 📧 Newsletter integration
- 🌐 Multi-language support (separate sheets per language)
- 📱 Admin mobile app (React Native + same API)

---

## Resources & References

### Official Documentation
- [Google Sheets API v4 Docs](https://developers.google.com/sheets/api)
- [Google Sheets API JavaScript Quickstart](https://developers.google.com/sheets/api/quickstart/js)
- [GitHub Actions Documentation](https://docs.github.com/actions)

### Tutorials (from research)
- [Step-by-Step Guide: Reading Public Google Sheets Data Using JavaScript](https://medium.com/@ravipatel.it/step-by-step-guide-reading-public-google-sheets-data-using-javascript-and-displaying-it-on-an-html-f6aee8416a9c)
- [How to Build a Serverless Astro.js + Google Sheets CMS](https://iabhinavj.com/blog/astro-google-sheets-cms/)
- [Use Google Sheets as a CMS for your Next.js blog](https://andreaskeller.name/blog/nextjs-google-sheets-cms)
- [Using Google Sheets as your CMS (Enterspeed)](https://www.enterspeed.com/blog/using-google-sheets-as-your-cms)

### Tools
- [Google API Console](https://console.cloud.google.com/)
- [Google Sheets API Explorer](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get)

---

## Questions & Decisions Needed

1. **Image hosting preference**: Google Drive or GitHub repo?
   - **Recommendation**: Start with Google Drive for ease of use

2. **Update frequency**: 6 hours or instant (webhook)?
   - **Recommendation**: 6 hours to start, add webhook if needed

3. **Content validation**: Require all fields or allow optional?
   - **Recommendation**: Allow optional (handle in frontend)

4. **Who gets Google Sheets editor access?**
   - **Recommendation**: Core committee members only initially

5. **Backup strategy**: Auto-backup sheet data?
   - **Recommendation**: Git commits = automatic backup of JSON files

---

**Next Step**: Get approval on this plan, then proceed with Phase 1 implementation.
