# Chrome Extension Installation Guide

## For Development (Unpacked Extension)

### Prerequisites
- Chrome or Edge browser
- Node.js 18+ installed
- Extension code built (`npm run build` in extension folder)

### Step 1: Build the Extension

```bash
cd extension
npm install
npm run build
```

This creates the `extension/dist/` folder.

### Step 2: Open Chrome Extensions Page

1. Open Chrome
2. Type `chrome://extensions` in the address bar
3. Press Enter

### Step 3: Enable Developer Mode

1. Find the "Developer mode" toggle in the top-right corner
2. Click it to turn it ON (should turn blue)

### Step 4: Load the Extension

1. Click "Load unpacked" button (top-left area)
2. Navigate to your CleanStream folder
3. Select the `extension/dist` folder
4. Click "Select Folder"

### Step 5: Verify Installation

You should see:
- "CleanStream" listed in your extensions
- A CleanStream icon in your Chrome toolbar (might be in the puzzle-piece menu)

### Step 6: Pin the Extension (Optional but Recommended)

1. Click the puzzle-piece icon in Chrome toolbar
2. Find CleanStream in the list
3. Click the pin icon to keep it visible

## Using the Extension

### On YouTube

1. Go to any YouTube video
2. If a Sync Pack exists for this video, you'll see a badge in the top-right
3. Click the CleanStream icon in your toolbar to open the side panel
4. Follow the sync instructions

### Side Panel Features

- **Open Official Track**: Opens the official music in a new tab
- **Nudge Controls**: Fine-tune sync with ±50ms/±200ms buttons
- **Reset**: Return to the default offset
- **Tab List**: See all your YouTube tabs and their sync status

## Troubleshooting

### Extension Doesn't Appear

1. Make sure you built the extension: `npm run build`
2. Check that `extension/dist/manifest.json` exists
3. Reload the extension on the extensions page

### "Manifest file missing"

You may have selected the wrong folder. Make sure to select `extension/dist`, not just `extension`.

### Extension Icon is Grayed Out

The extension only activates on YouTube pages. Navigate to youtube.com to see it light up.

### Side Panel Won't Open

1. Check that you're on a YouTube page
2. Try right-clicking the extension icon and selecting "Open side panel"
3. Check Chrome DevTools for errors (right-click icon → "Inspect popup")

### Changes Not Showing Up

After editing extension code:
1. Run `npm run build` in the extension folder
2. Go to `chrome://extensions`
3. Click the refresh icon on the CleanStream extension
4. Reload any YouTube tabs

## Updating the Extension

When you pull new code or make changes:

```bash
cd extension
npm run build
```

Then reload in Chrome:
1. Go to `chrome://extensions`
2. Find CleanStream
3. Click the refresh/reload icon
4. Reload YouTube tabs

## Edge Browser

The process is identical for Microsoft Edge:
1. Go to `edge://extensions`
2. Enable Developer mode
3. Load unpacked from `extension/dist`

## For Production (Chrome Web Store)

*Coming soon* - The extension will be published to the Chrome Web Store once it's ready for public use. Then installation will be a single click from the store page.
