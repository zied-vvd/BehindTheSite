# Onboarding Flow

The onboarding flow personalizes BehindTheSite to show you information that matters to you.

## Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Step 1       │     │    Step 2       │     │    Step 3       │
│                 │     │                 │     │                 │
│  Select your    │────►│  Choose tags    │────►│  Confirm &      │
│  concerns       │     │  to track       │     │  start          │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Step 1: What Matters to You?

Select one or more concerns that reflect your values:

| Concern | Description |
|---------|-------------|
| 🌍 **Environment** | Climate change, pollution, sustainability |
| 🕊️ **Peace / Anti-war** | Military involvement, conflict zones |
| 👷 **Labor Rights** | Worker treatment, fair wages, unions |
| 🔒 **Data Privacy** | Data collection, surveillance, security |
| 🏠 **Support Local** | Local vs foreign ownership |
| ⚖️ **Corporate Ethics** | Tax practices, monopolies, lobbying |
| 🏥 **Public Health** | Tobacco, alcohol, processed food |
| 🗳️ **Democracy** | Media influence, censorship, elections |

## Step 2: Choose Tags to Track

Based on your selected concerns, relevant tags are suggested:

### Environment Tags
- 🛢️ Oil & Gas Industry
- 🌲 Linked to Deforestation
- 💨 High Carbon Footprint
- 🥤 Major Plastic Producer
- ✅ Green Certified (positive)

### Peace / Anti-war Tags
- 🇷🇺 Russian Ties
- 🇮🇱 Israeli Ties
- 🔫 Weapons Manufacturer
- 🎖️ Military Contractor
- ⛏️ Uses Conflict Minerals
- 🚫 Sanctioned Country Ties

### Labor Rights Tags
- ⚠️ Poor Labor Practices
- 🧒 Child Labor Concerns
- 🚷 Anti-Union History
- ✅ Fair Trade Certified (positive)
- 💰 Pays Living Wage (positive)

### Data Privacy Tags
- 🇨🇳 Chinese Owned
- 📊 Data Harvesting
- 👁️ Surveillance Tech
- 🔓 History of Data Breaches
- 🛡️ Privacy Focused (positive)

### Support Local Tags
- 🌐 Foreign Owned
- 🏝️ Uses Tax Havens
- 🏪 Local Business (positive)
- ✈️ HQ Overseas

### Corporate Ethics Tags
- 🏰 Monopoly/Anti-competitive
- 💸 Tax Avoidance
- 🏛️ Heavy Political Lobbying
- 📈 Extreme CEO Pay Ratio
- ✅ B Corp Certified (positive)

### Public Health Tags
- 🚬 Tobacco Industry
- 🍺 Alcohol Industry
- 💊 Pharma Controversies
- 🍟 Ultra-Processed Food
- 🎰 Gambling Industry

### Democracy Tags
- 🏛️ State Owned
- ⛓️ Authoritarian Country Ties
- 📺 Media Manipulation
- 🗳️ Election Interference
- 🔇 Practices Censorship

### Custom Tags

You can also add your own tags to track specific things:

- Type any text (e.g., "Nestle-owned", "Saudi investment")
- Custom tags are prefixed with `custom:` in storage
- These appear as 🏷️ badges in the banner

## Step 3: Confirm and Start

Review your selections:

- **Your concerns** - The values you selected
- **Tags you're tracking** - All selected and custom tags

Click "Start Browsing" to save and begin.

## Re-running Onboarding

You can access the onboarding wizard anytime:

1. Click the BehindTheSite extension icon
2. Click the ⚙️ (settings) button in the header
3. The onboarding opens in a new tab with your current selections pre-loaded

## How Preferences Affect the Banner

| Scenario | Banner Behavior |
|----------|-----------------|
| No onboarding completed | Shows all available flags |
| Onboarding done, no tags selected | Shows all available flags |
| Onboarding done, tags selected | Only shows matching flags |
| Site has no matching flags | Banner doesn't appear |

## Storage

Preferences are saved to `chrome.storage.sync`, which means:

- They sync across your Chrome browsers (if signed in)
- They persist when you close the browser
- They're only accessible by this extension
