#!/usr/bin/env node
/**
 * Populate Google Sheets with initial/correct data.
 * This script has WRITE access to update the sheets.
 */

import { google } from 'googleapis';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// Configuration
const SHEET_ID = process.env.GOOGLE_SHEETS_ID || '1twV7lZqXy_rAnLW9lzddLyEvmNpwHsiDW6lwnfggMrc';
const SERVICE_ACCOUNT_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_PATH || join(PROJECT_ROOT, 'service-account-key.json');

// Data to populate
const EVENTS_DATA = [
  ['title', 'date', 'location', 'description'],
  ['International Yoga Day', '21st June 2025', 'Avondale Community Centre', 'Yoga, mindfulness, and wellness celebration.'],
  ['Teej Mela (Fair)', '2nd August 2025', 'Blockhouse Bay Community Centre', 'Traditional Rajasthani festivals celebration.'],
  ['Ganesh Chaturthi', 'August 2025', 'TBC', 'Lord Ganesha festival with prayers and performances.'],
];

// Gallery uses local image identifiers that map to bundled images
const GALLERY_DATA = [
  ['imageUrl', 'alt', 'caption'],
  ['event-cultural-day', 'Rajasthani Cultural Day', 'Cultural celebration event'],
  ['event-gangaur-puja', 'Gangaur Puja', 'Traditional Gangaur festival'],
  ['event-diwali-dance', 'Auckland Diwali Dance', 'Diwali dance performance'],
  ['event-hariyali-teej', 'Hariyali Teej', 'Hariyali Teej celebration'],
  ['event-basant-panchmi-picnic', 'Basant Panchmi Picnic', 'Community picnic event'],
  ['ractnz-group-pic', 'Rajasthan Diwas Celebration', 'Group photo from Rajasthan Diwas'],
];

// Committee uses local image identifiers
const COMMITTEE_DATA = [
  ['name', 'title', 'photoUrl'],
  ['Mrs. Gurudhari (Reema) Sharma', 'Chairperson', 'committee-members-chairperson'],
  ['Mrs. Nirmala Agarwal', 'Secretary', 'committee-members-secretary'],
  ['Mrs. Rachana Nadgir', 'Treasurer', 'committee-members-treasurer'],
];

async function main() {
  console.log('\n📝 Populating Google Sheets with correct data...\n');

  if (!existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error('❌ Service account file not found:', SERVICE_ACCOUNT_PATH);
    process.exit(1);
  }

  try {
    const credentials = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
    console.log(`✓ Service account: ${credentials.client_email}\n`);

    // Create auth client with WRITE scope
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Update Events sheet
    console.log('📅 Updating Events sheet...');
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: 'Events!A1:D100',
      valueInputOption: 'RAW',
      requestBody: {
        values: EVENTS_DATA,
      },
    });
    console.log(`  ✓ Events updated (${EVENTS_DATA.length - 1} items)`);

    // Clear extra rows in Events
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,
      range: `Events!A${EVENTS_DATA.length + 1}:D100`,
    });

    // Update Gallery sheet
    console.log('🖼️  Updating Gallery sheet...');
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: 'Gallery!A1:C100',
      valueInputOption: 'RAW',
      requestBody: {
        values: GALLERY_DATA,
      },
    });
    console.log(`  ✓ Gallery updated (${GALLERY_DATA.length - 1} items)`);

    // Clear extra rows in Gallery
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,
      range: `Gallery!A${GALLERY_DATA.length + 1}:C100`,
    });

    // Update Committee sheet
    console.log('👥 Updating Committee sheet...');
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: 'Committee!A1:C100',
      valueInputOption: 'RAW',
      requestBody: {
        values: COMMITTEE_DATA,
      },
    });
    console.log(`  ✓ Committee updated (${COMMITTEE_DATA.length - 1} items)`);

    // Clear extra rows in Committee
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,
      range: `Committee!A${COMMITTEE_DATA.length + 1}:C100`,
    });

    console.log('\n========================================');
    console.log('✅ All sheets populated successfully!');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

main();
