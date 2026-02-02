# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BehindTheSite is a Chrome extension (Manifest V3) that displays transparency banners about company ownership, shareholders, and ethical flags (environment, labor, privacy, etc.) when visiting websites. Users personalize what they track through an onboarding flow.

## Development Setup

```bash
# Install dependencies (for data validation/build scripts)
npm install

# Validate data files
npm run validate

# Build data for extension
npm run build
```

To test the extension:
1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked" and select the project folder
4. After code changes: click refresh on the extension card, then refresh the target page

## Architecture

```
src/
├── content.js      → Runs on every page, extracts domain, fetches data, injects banner
├── background.js   → Opens onboarding on install, handles messages
├── popup.html/js   → Shows user preferences, quick actions
├── onboarding.*    → 3-step wizard for selecting concerns and tags
└── styles.css

data/
├── source/                      # Human-editable source files
│   ├── companies/               # One file per company (amazon.com.json)
│   ├── entities/                # Shareholders, investors (vanguard-group.json)
│   ├── tags/                    # Tag definitions by category
│   │   ├── labor/poor-labor.json
│   │   ├── environment/carbon-heavy.json
│   │   └── ...
│   ├── tag-assignments/         # Company-tag links with justifications
│   │   ├── amazon.com/
│   │   │   ├── poor-labor.json
│   │   │   └── monopoly.json
│   │   └── ...
│   └── changelog/               # Structured change records
├── dist/                        # Build output
│   └── companies.json           # Combined data for extension
└── schemas/                     # JSON Schema validation

scripts/
├── build.js        # Combines source → dist/companies.json
├── validate.js     # Schema + cross-reference validation
└── migrate.js      # One-time migration from old format
```

**Data flow**: Content script extracts root domain → fetches/caches `dist/companies.json` from GitHub → loads user preferences from Chrome sync storage → filters flags by user's selected tags → injects banner if match found.

**Storage**:
- `chrome.storage.local`: Company data cache
- `chrome.storage.sync`: User preferences (concerns, tags, onboarding state)

## Key Constants

`FLAG_LABELS` in `content.js` defines all 35+ flags with labels, icons, and badge types (warning/info/positive).

`concernToTags` in `onboarding.js` maps 8 user concerns (Environment, Privacy, Labor Rights, etc.) to specific tags.

## Adding New Features

### Adding a flag
1. Create tag definition: `data/source/tags/{category}/{flag-id}.json`
2. Add to `FLAG_LABELS` in `src/content.js`: `'flag-id': { label: '🏷️ Label', type: 'warning' }`
3. Add mapping in `concernToTags` in `src/onboarding.js`
4. Run `npm run validate && npm run build`

### Adding a concern
1. Add to `concernToTags` in `src/onboarding.js`
2. Add to `concernLabels` in both `onboarding.js` and `popup.js`
3. Add HTML element in `onboarding.html` concerns grid

### Adding company data
1. Create company file: `data/source/companies/domain.com.json`
2. Create entity files for new shareholders: `data/source/entities/entity-id.json`
3. Create tag assignment files: `data/source/tag-assignments/domain.com/tag-id.json`
4. Run `npm run validate && npm run build`

Example company file (`data/source/companies/example.com.json`):
```json
{
  "id": "example.com",
  "name": "Example Corp",
  "shareholders": [
    { "entityId": "vanguard-group", "percentage": 7.5 },
    { "name": "John Founder", "percentage": 15.0 }
  ],
  "country": "USA",
  "sources": ["SEC 13F filings"],
  "created": "2026-02-01T00:00:00Z"
}
```

Example tag assignment (`data/source/tag-assignments/example.com/poor-labor.json`):
```json
{
  "companyId": "example.com",
  "tagId": "poor-labor",
  "justification": "Detailed explanation with evidence...",
  "sources": [
    { "type": "regulatory", "url": "https://...", "title": "OSHA Citation" }
  ],
  "status": "active",
  "voting": { "enabled": false, "upvotes": 0, "downvotes": 0 },
  "author": { "github": "contributor" },
  "created": "2026-02-01T00:00:00Z"
}
```

## Data Scripts

```bash
npm run validate    # Validate all source files against schemas
npm run build       # Combine source files into dist/companies.json
npm run check       # Run both validate and build
npm run migrate     # One-time: convert old companies.json to new format
```

## Testing

Manual testing sites:
- amazon.com, google.com, tiktok.com, facebook.com (should show warning flags)
- patagonia.com, duckduckgo.com (should show positive flags)

Debug via DevTools console - look for "BehindTheSite:" prefixed logs.

## Important Behaviors

- Banner shows ALL flags if user hasn't selected specific tags; only matching flags otherwise
- Domain matching handles subdomains and 2-part TLDs like .co.uk
- No external API calls except GitHub for data; no tracking or telemetry
- Tag assignments require justifications and sources (community notes style)
- Build process resolves entity references and compiles active tag assignments into flags
