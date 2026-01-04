# CLAUDE.md

> Keep this file under 200 lines. Update when architecture changes. Delete outdated info ruthlessly.

## Philosophy

Grug brain dev for charity site. Complexity bad. Simple good.

- Non-tech people edit content via Google Sheets
- Engineers/agents maintain code
- No database, no backend, no auth complexity
- Static site = fast, cheap, reliable
- If feature needs >50 lines, question if needed

## What This Is

RACTNZ community website. React + Vite + Tailwind. Hosted GitHub Pages.

**Live**: https://rajasthan.co.nz/

## The CMS (Important)

Content lives in **Google Sheets**. Three tabs: Events, Gallery, Committee.

Images live in **Google Drive**. Editors paste sharing links in spreadsheet.

At build time:
1. `scripts/fetchSheets.mjs` pulls sheet data
2. Downloads images from Drive to `src/assets/images/cms/`
3. Writes JSON to `src/data/`
4. Vite bundles everything

Result: fully static site, no runtime API calls.

## Commands

```bash
npm run dev      # fetch data + start dev server
npm run build    # fetch data + production build
```

## Environment

Need these (`.env` locally, GitHub Secrets for CI):
```
GOOGLE_SERVICE_ACCOUNT_KEY=<json>
GOOGLE_SHEETS_ID=<id from sheet url>
```

Service account: `ractnz-sheets-editor@ractnz.iam.gserviceaccount.com`

## Deployment

- Push to `main` = auto deploy
- Hourly scheduled rebuild picks up content changes
- Workflow: `.github/workflows/scheduled-build.yml`

## Content Updates (For Non-Tech)

1. Edit Google Sheet
2. Wait for hourly rebuild (or ask dev to trigger manually)
3. Done

For images: upload to Drive, copy sharing link, paste in sheet.

## Code Guidelines

**Do:**
- Keep components small
- Use existing patterns
- Prefer editing over creating new files
- Test locally before pushing

**Don't:**
- Over-engineer
- Add dependencies without good reason
- Create abstractions for one-time use
- Add features nobody asked for

## Adding Content Types

1. Add tab to Google Sheet
2. Add fetch config in `fetchSheets.mjs`
3. Create hook in `src/hooks/`
4. Use in component

That's it. No migrations, no schema changes.

## Gotchas

- `src/data/` and `src/assets/images/cms/` are gitignored (generated at build)
- Hero image is in repo, not CMS (intentional)
- Images must be publicly shared on Drive to download

## When Stuck

1. Check build logs in GitHub Actions
2. Verify Google Sheet column headers (lowercase)
3. Verify Drive images are shared publicly
4. Run `npm run dev` locally to debug

## Detailed Docs

See `docs/CMS_GUIDE.md` for comprehensive documentation.

---

**Maintainer note**: If this file exceeds 200 lines, trim it. Agents can explore codebase. Only document what's non-obvious or architectural.
