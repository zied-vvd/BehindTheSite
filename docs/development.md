# Development Guide

This guide is for developers who want to contribute code to BehindTheSite.

## Project Structure

```
BehindTheSite/
├── manifest.json          # Chrome extension manifest (v3)
├── src/
│   ├── content.js         # Injected into web pages
│   ├── styles.css         # Banner styling
│   ├── background.js      # Service worker
│   ├── popup.html         # Extension popup UI
│   ├── popup.js           # Popup logic
│   ├── onboarding.html    # Setup wizard page
│   └── onboarding.js      # Onboarding logic
├── data/
│   └── companies.json     # Company database
├── icons/
│   ├── icon.svg           # Source icon
│   ├── icon16.png         # 16x16 toolbar icon
│   ├── icon48.png         # 48x48 extensions page
│   └── icon128.png        # 128x128 store icon
├── docs/                   # Documentation
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

## Setup

### Prerequisites

- Chrome browser
- Git
- Text editor (VS Code recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/zied-vvd/BehindTheSite.git
cd BehindTheSite

# Load in Chrome
# 1. Go to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the BehindTheSite folder
```

### Development Workflow

1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension
4. Test your changes

For content script changes, you also need to refresh the target page.

## Key Files

### manifest.json

Chrome extension configuration. Key sections:

```json
{
  "manifest_version": 3,
  "permissions": ["activeTab", "storage"],
  "host_permissions": ["<all_urls>"],
  "content_scripts": [...],
  "background": { "service_worker": "src/background.js" },
  "action": { "default_popup": "src/popup.html" }
}
```

### content.js

The main logic that runs on every page:

```javascript
// Key functions:
getRootDomain(hostname)    // Extract root domain
getUserPreferences()       // Load from chrome.storage.sync
fetchCompanyData()         // Fetch from GitHub or cache
shouldShowBanner()         // Check if flags match preferences
createBanner()             // Build the DOM element
init()                     // Main entry point
```

### onboarding.js

Handles the setup wizard:

```javascript
// Key data structures:
concernToTags = { ... }    // Maps concerns to suggested tags
concernLabels = { ... }    // Display labels for concerns

// State:
selectedConcerns           // Set of selected concern IDs
selectedTags               // Set of selected tag IDs
customTags                 // Array of custom tag strings
```

## Chrome APIs Used

### Storage

```javascript
// Sync storage (user preferences)
chrome.storage.sync.get(['preferences'])
chrome.storage.sync.set({ preferences: {...} })

// Local storage (cached data)
chrome.storage.local.get(['companyData', 'lastFetch'])
chrome.storage.local.set({ companyData: {...}, lastFetch: Date.now() })
```

### Tabs

```javascript
// Open new tab
chrome.tabs.create({ url: 'https://...' })

// Get current tab
chrome.tabs.query({ active: true, currentWindow: true })

// Reload tab
chrome.tabs.reload(tabId)
```

### Runtime

```javascript
// Get extension URL
chrome.runtime.getURL('src/onboarding.html')

// Listen for install
chrome.runtime.onInstalled.addListener(...)
```

## Adding New Features

### Adding a New Flag

1. Add to `FLAG_LABELS` in `content.js`:
   ```javascript
   'new-flag': { label: '🏷️ New Flag', type: 'warning' }
   ```

2. Add to `concernToTags` in `onboarding.js`:
   ```javascript
   relevantConcern: [
     { id: 'new-flag', label: 'New Flag', icon: '🏷️' },
     ...
   ]
   ```

3. Document in `docs/data-format.md`

### Adding a New Concern

1. Add to `concernToTags` in `onboarding.js` with its tags
2. Add to `concernLabels` in both `onboarding.js` and `popup.js`
3. Add HTML in `onboarding.html` concerns grid
4. Document in `docs/onboarding.md`

### Modifying the Banner

The banner is styled in `styles.css`:

```css
.bts-banner { ... }        /* Main container */
.bts-content { ... }       /* Content wrapper */
.bts-badge { ... }         /* Base badge style */
.bts-badge-warning { ... } /* Warning (red) badge */
.bts-badge-positive { ... }/* Positive (green) badge */
.bts-badge-info { ... }    /* Info (blue) badge */
```

## Testing

### Manual Testing

1. Load extension in Chrome
2. Visit sites in the database (amazon.com, google.com, etc.)
3. Check banner appears with correct info
4. Test onboarding flow
5. Verify preferences are saved and applied

### Test Sites

| Site | Expected Flags |
|------|---------------|
| amazon.com | poor-labor, monopoly, tax-avoidance |
| tiktok.com | chinese-owned, data-harvesting |
| patagonia.com | b-corp, green-certified (positive) |
| duckduckgo.com | privacy-focused (positive) |
| lockheedmartin.com | weapons-manufacturer |

### Debugging

1. Open Chrome DevTools on any page
2. Go to Console tab
3. Look for "BehindTheSite:" prefixed messages
4. For popup/onboarding, right-click → Inspect

## Code Style

- Vanilla JavaScript (no frameworks)
- No build step required
- Use `async/await` for promises
- Use template literals for HTML
- Keep functions small and focused

## Pull Request Guidelines

1. **One feature per PR** - Keep changes focused
2. **Test thoroughly** - Manual testing before submitting
3. **Update docs** - If adding features, update relevant docs
4. **Descriptive commits** - Clear commit messages

## Browser Compatibility

Currently Chrome-only (Manifest V3). Future plans:

- [ ] Firefox (Manifest V2/V3)
- [ ] Safari
- [ ] Edge (should work, untested)

## Resources

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
