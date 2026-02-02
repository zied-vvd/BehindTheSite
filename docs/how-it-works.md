# How It Works

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Chrome Browser                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Popup      │    │  Background  │    │   Content    │  │
│  │  (popup.js)  │    │   Service    │    │   Script     │  │
│  │              │    │  Worker      │    │ (content.js) │  │
│  └──────┬───────┘    └──────────────┘    └──────┬───────┘  │
│         │                                        │          │
│         │         ┌──────────────┐               │          │
│         └────────►│ Chrome       │◄──────────────┘          │
│                   │ Storage API  │                          │
│                   └──────────────┘                          │
│                          ▲                                  │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                    ┌──────┴───────┐
                    │   GitHub     │
                    │ (data repo)  │
                    └──────────────┘
```

## Components

### 1. Content Script (`src/content.js`)

The content script runs on every page you visit. It:

1. **Extracts the domain** from the current URL
2. **Fetches company data** from cache or GitHub
3. **Loads user preferences** from Chrome storage
4. **Checks for matches** between site flags and user's selected tags
5. **Injects the banner** if there's a match

```
Page Load
    │
    ▼
Extract Domain (e.g., "amazon.com")
    │
    ▼
Fetch Company Data ─────► Cache hit? ─── Yes ──► Use cached data
    │                         │
    │                         No
    │                         │
    │                         ▼
    │                    Fetch from GitHub
    │                         │
    │                         ▼
    │                    Cache for 1 hour
    │                         │
    ◄─────────────────────────┘
    │
    ▼
Load User Preferences
    │
    ▼
Match site flags against user tags
    │
    ▼
Match found? ─── No ──► Do nothing
    │
   Yes
    │
    ▼
Inject banner at top of page
```

### 2. Popup (`src/popup.html`, `src/popup.js`)

The popup appears when you click the extension icon. It shows:

- Current concerns and tracked tags
- Database statistics
- Quick action buttons (settings, refresh, contribute)

### 3. Onboarding (`src/onboarding.html`, `src/onboarding.js`)

A full-page setup wizard that:

1. Collects user concerns (environment, privacy, etc.)
2. Suggests relevant tags based on concerns
3. Allows custom tag creation
4. Saves preferences to Chrome sync storage

### 4. Background Service Worker (`src/background.js`)

Handles extension lifecycle events:

- Opens onboarding on first install
- Responds to messages from popup/content scripts

## Data Flow

### Company Data

```
GitHub Repository
    │
    │ Raw JSON fetch
    ▼
Content Script
    │
    │ Parse & cache
    ▼
Chrome Local Storage (cached 1 hour)
    │
    │ Read on page load
    ▼
Banner Display
```

### User Preferences

```
Onboarding Page
    │
    │ User selections
    ▼
Chrome Sync Storage
    │
    │ Read on page load
    ▼
Content Script (filters flags)
    │
    ▼
Popup (displays current prefs)
```

## Storage

### Local Storage (`chrome.storage.local`)

- `companyData` - Cached company JSON from GitHub
- `lastFetch` - Timestamp of last fetch (for cache expiry)

### Sync Storage (`chrome.storage.sync`)

- `preferences` - User preferences object:
  ```json
  {
    "concerns": ["environment", "privacy"],
    "tags": ["chinese-owned", "oil-industry", "data-harvesting"],
    "customTags": ["nestle-owned"],
    "onboardingComplete": true,
    "setupDate": 1706745600000
  }
  ```

## Domain Matching

The extension matches domains using a root domain extraction:

```javascript
"www.amazon.com"     → "amazon.com"
"smile.amazon.com"   → "amazon.com"
"docs.google.com"    → "google.com"
"bbc.co.uk"          → "bbc.co.uk"  (handles 2-part TLDs)
```

## Flag Filtering

When displaying the banner, flags are filtered based on user preferences:

1. If user has no tags selected → show all flags
2. If user has tags selected → only show matching flags
3. If no flags match user's tags → don't show banner at all
