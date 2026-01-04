#!/usr/bin/env node
/**
 * Fetch data from Google Sheets and write to JSON files for build-time consumption.
 * This script runs before the build to pull CMS content.
 *
 * For Google Drive images:
 * - Detects Google Drive URLs in the data
 * - Downloads images to src/assets/images/cms/
 * - Replaces URLs with local paths in the JSON
 */

import { google } from 'googleapis';
import { readFileSync, writeFileSync, existsSync, mkdirSync, createWriteStream } from 'fs';
import { dirname, join, extname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const DATA_DIR = join(PROJECT_ROOT, 'src', 'data');
const CMS_IMAGES_DIR = join(PROJECT_ROOT, 'src', 'assets', 'images', 'cms');

// Configuration
const SHEET_ID = process.env.GOOGLE_SHEETS_ID || '1twV7lZqXy_rAnLW9lzddLyEvmNpwHsiDW6lwnfggMrc';
const SERVICE_ACCOUNT_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_PATH || join(PROJECT_ROOT, 'service-account-key.json');

// Sheet names
const SHEETS = {
  EVENTS: 'Events',
  GALLERY: 'Gallery',
  COMMITTEE: 'Committee',
};

/**
 * Extract Google Drive file ID from various URL formats
 */
function extractDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;

  // Match: drive.google.com/file/d/FILE_ID/...
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch) return fileMatch[1];

  // Match: drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch) return openMatch[1];

  // Match: drive.google.com/uc?...id=FILE_ID
  const ucMatch = url.match(/drive\.google\.com\/uc\?.*id=([^&]+)/);
  if (ucMatch) return ucMatch[1];

  return null;
}

/**
 * Download a file from a URL, following redirects
 */
function downloadFile(url, destPath, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) {
      reject(new Error('Too many redirects'));
      return;
    }

    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RACTNZ-CMS/1.0)',
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        let redirectUrl = response.headers.location;
        // Handle relative redirects
        if (redirectUrl.startsWith('/')) {
          const urlObj = new URL(url);
          redirectUrl = `${urlObj.protocol}//${urlObj.host}${redirectUrl}`;
        }
        downloadFile(redirectUrl, destPath, maxRedirects - 1)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const fileStream = createWriteStream(destPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(destPath);
      });

      fileStream.on('error', (err) => {
        reject(err);
      });
    });

    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Download a Google Drive image and return the local path
 */
async function downloadDriveImage(fileId, filename) {
  // Use lh3.googleusercontent.com which works better for direct downloads
  const downloadUrl = `https://lh3.googleusercontent.com/d/${fileId}`;

  // Determine file extension (default to .jpg if unknown)
  const ext = extname(filename) || '.jpg';
  const localFilename = `${fileId}${ext}`;
  const localPath = join(CMS_IMAGES_DIR, localFilename);

  // Skip if already downloaded
  if (existsSync(localPath)) {
    return localFilename;
  }

  try {
    await downloadFile(downloadUrl, localPath);
    return localFilename;
  } catch (error) {
    console.error(`    ⚠ Failed to download ${fileId}: ${error.message}`);
    return null;
  }
}

/**
 * Process image URLs in data - download Google Drive images and update paths
 */
async function processImageUrls(data, imageUrlField) {
  const processed = [];

  for (const item of data) {
    const url = item[imageUrlField];
    const fileId = extractDriveFileId(url);

    if (fileId) {
      // It's a Google Drive URL - download and replace
      console.log(`    📥 Downloading: ${item.alt || item.name || fileId}`);
      const localFilename = await downloadDriveImage(fileId, `${fileId}.jpg`);

      if (localFilename) {
        processed.push({
          ...item,
          [imageUrlField]: `cms/${localFilename}`,
        });
      } else {
        // Keep original URL as fallback
        processed.push(item);
      }
    } else {
      // Not a Drive URL - keep as-is (local identifier or other URL)
      processed.push(item);
    }
  }

  return processed;
}

/**
 * Transform sheet rows to array of objects using first row as headers
 */
function transformSheetData(rows) {
  if (!rows || rows.length < 2) return [];

  const [headers, ...dataRows] = rows;

  return dataRows
    .filter(row => row.some(cell => cell && cell.trim())) // Skip empty rows
    .map((row, index) => {
      const obj = { id: index + 1 };
      headers.forEach((header, i) => {
        const key = header.trim().toLowerCase().replace(/\s+/g, '_');
        obj[key] = row[i]?.trim() || '';
      });
      return obj;
    });
}

/**
 * Fetch a single sheet's data
 */
async function fetchSheet(sheets, sheetName) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A:Z`,
    });

    return response.data.values || [];
  } catch (error) {
    console.error(`  ❌ Failed to fetch ${sheetName}:`, error.message);
    return null;
  }
}

/**
 * Write data to JSON file
 */
function writeDataFile(filename, data) {
  const filepath = join(DATA_DIR, filename);
  writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`  ✓ Wrote ${filepath} (${data.length} items)`);
}

/**
 * Load fallback data from existing JSON files
 */
function loadFallbackData(filename) {
  const filepath = join(DATA_DIR, filename);
  if (existsSync(filepath)) {
    try {
      return JSON.parse(readFileSync(filepath, 'utf-8'));
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Ensure required directories exist
 */
function ensureDirectories() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(CMS_IMAGES_DIR)) {
    mkdirSync(CMS_IMAGES_DIR, { recursive: true });
    console.log('📁 Created CMS images directory:', CMS_IMAGES_DIR);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n📊 Fetching data from Google Sheets...\n');

  // Ensure directories exist
  ensureDirectories();

  // Check for service account file
  if (!existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error('❌ Service account file not found:', SERVICE_ACCOUNT_PATH);
    console.log('   Using fallback data from existing JSON files.\n');

    // Ensure data files exist with at least empty arrays
    const files = ['events.json', 'gallery.json', 'committee.json'];
    for (const file of files) {
      const filepath = join(DATA_DIR, file);
      if (!existsSync(filepath)) {
        writeFileSync(filepath, '[]');
        console.log(`  ✓ Created empty ${file}`);
      }
    }
    return;
  }

  try {
    // Load service account credentials
    const credentials = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
    console.log(`✓ Service account: ${credentials.client_email}\n`);

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch all sheets
    let hasErrors = false;

    // Events
    console.log('📅 Fetching Events...');
    const eventsRows = await fetchSheet(sheets, SHEETS.EVENTS);
    if (eventsRows) {
      const events = transformSheetData(eventsRows);
      writeDataFile('events.json', events);
    } else {
      hasErrors = true;
      const fallback = loadFallbackData('events.json');
      console.log(`  ⚠ Using fallback data (${fallback.length} items)`);
    }

    // Gallery (with image processing)
    console.log('🖼️  Fetching Gallery...');
    const galleryRows = await fetchSheet(sheets, SHEETS.GALLERY);
    if (galleryRows) {
      let gallery = transformSheetData(galleryRows);
      // Process Google Drive images
      gallery = await processImageUrls(gallery, 'imageurl');
      writeDataFile('gallery.json', gallery);
    } else {
      hasErrors = true;
      const fallback = loadFallbackData('gallery.json');
      console.log(`  ⚠ Using fallback data (${fallback.length} items)`);
    }

    // Committee (with image processing)
    console.log('👥 Fetching Committee...');
    const committeeRows = await fetchSheet(sheets, SHEETS.COMMITTEE);
    if (committeeRows) {
      let committee = transformSheetData(committeeRows);
      // Process Google Drive images
      committee = await processImageUrls(committee, 'photourl');
      writeDataFile('committee.json', committee);
    } else {
      hasErrors = true;
      const fallback = loadFallbackData('committee.json');
      console.log(`  ⚠ Using fallback data (${fallback.length} items)`);
    }

    console.log('\n========================================');
    if (hasErrors) {
      console.log('⚠️  Completed with some errors (using fallback data)');
    } else {
      console.log('✅ All data fetched successfully!');
    }
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.log('   Using fallback data from existing JSON files.\n');
    process.exit(1);
  }
}

main();
