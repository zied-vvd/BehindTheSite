# Data Format

The company database is stored in `data/companies.json`. This document describes the data structure.

## Company Entry Structure

Each company is keyed by its domain:

```json
{
  "amazon.com": {
    "name": "Amazon.com, Inc.",
    "shareholders": [
      { "name": "Vanguard Group", "percentage": 7.1 },
      { "name": "BlackRock", "percentage": 6.4 },
      { "name": "Jeff Bezos", "percentage": 9.5 }
    ],
    "country": "USA",
    "headquarters": "Seattle, WA",
    "flags": ["poor-labor", "union-busting", "monopoly", "tax-avoidance"],
    "notes": "Optional additional context",
    "sources": ["SEC 13F filings", "Company proxy statements"]
  }
}
```

## Fields

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Official company name |
| `shareholders` | array | List of major shareholders |
| `country` | string | Country of incorporation/primary operations |
| `sources` | array | Where the information came from |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `headquarters` | string | City and state/country of HQ |
| `parent` | string | Domain of parent company (for subsidiaries) |
| `flags` | array | List of tag IDs (see below) |
| `notes` | string | Additional context or caveats |

### Shareholder Object

```json
{
  "name": "Shareholder Name",
  "percentage": 10.5
}
```

- `name` (required): Name of the shareholder
- `percentage` (optional): Ownership percentage (can be `null` if unknown)

## Available Flags

### Ownership & Country

| Flag ID | Display Label | Type |
|---------|--------------|------|
| `chinese-owned` | 🇨🇳 Chinese Owned | warning |
| `russian-ties` | 🇷🇺 Russian Ties | warning |
| `israeli-ties` | 🇮🇱 Israeli Ties | warning |
| `state-owned` | 🏛️ State Owned | warning |
| `foreign-owned` | 🌐 Foreign Owned | info |
| `sanctioned-country` | 🚫 Sanctioned Country | warning |
| `authoritarian-ties` | ⛓️ Authoritarian Ties | warning |

### Environment

| Flag ID | Display Label | Type |
|---------|--------------|------|
| `oil-industry` | 🛢️ Oil & Gas | warning |
| `deforestation` | 🌲 Deforestation Links | warning |
| `carbon-heavy` | 💨 High Carbon | warning |
| `plastic-producer` | 🥤 Major Plastic Producer | warning |
| `green-certified` | ✅ Green Certified | positive |

### Peace & Conflict

| Flag ID | Display Label | Type |
|---------|--------------|------|
| `weapons-manufacturer` | 🔫 Weapons Manufacturer | warning |
| `military-contractor` | 🎖️ Military Contractor | warning |
| `conflict-minerals` | ⛏️ Conflict Minerals | warning |

### Labor

| Flag ID | Display Label | Type |
|---------|--------------|------|
| `poor-labor` | ⚠️ Poor Labor Practices | warning |
| `child-labor` | 🧒 Child Labor Concerns | warning |
| `union-busting` | 🚷 Anti-Union | warning |
| `fair-trade` | ✅ Fair Trade | positive |
| `living-wage` | 💰 Living Wage | positive |

### Privacy

| Flag ID | Display Label | Type |
|---------|--------------|------|
| `data-harvesting` | 📊 Data Harvesting | warning |
| `surveillance` | 👁️ Surveillance Tech | warning |
| `data-breaches` | 🔓 Data Breaches | warning |
| `privacy-focused` | 🛡️ Privacy Focused | positive |

### Ethics

| Flag ID | Display Label | Type |
|---------|--------------|------|
| `monopoly` | 🏰 Monopoly | warning |
| `tax-avoidance` | 💸 Tax Avoidance | warning |
| `tax-haven` | 🏝️ Uses Tax Havens | warning |
| `lobbying` | 🏛️ Heavy Lobbying | info |
| `ceo-pay-ratio` | 📈 Extreme CEO Pay | warning |
| `b-corp` | ✅ B Corp | positive |

### Health

| Flag ID | Display Label | Type |
|---------|--------------|------|
| `tobacco` | 🚬 Tobacco | warning |
| `alcohol` | 🍺 Alcohol | info |
| `pharma-controversy` | 💊 Pharma Controversy | warning |
| `processed-food` | 🍟 Ultra-Processed | warning |
| `gambling` | 🎰 Gambling | warning |

### Democracy

| Flag ID | Display Label | Type |
|---------|--------------|------|
| `media-manipulation` | 📺 Media Manipulation | warning |
| `election-interference` | 🗳️ Election Issues | warning |
| `censorship` | 🔇 Censorship | warning |

## Flag Types

| Type | Color | Usage |
|------|-------|-------|
| `warning` | Red | Concerning practices |
| `info` | Blue | Neutral information |
| `positive` | Green | Good practices |

## Subdomain Handling

For companies with multiple domains, create separate entries or use the `parent` field:

```json
{
  "youtube.com": {
    "name": "YouTube (Alphabet Inc.)",
    "parent": "google.com",
    "shareholders": [...],
    "country": "USA",
    "flags": ["data-harvesting"],
    "sources": ["Subsidiary of Alphabet"]
  }
}
```

## Example Entries

### Tech Company

```json
{
  "google.com": {
    "name": "Alphabet Inc.",
    "shareholders": [
      { "name": "Vanguard Group", "percentage": 7.4 },
      { "name": "BlackRock", "percentage": 6.3 },
      { "name": "Larry Page", "percentage": 6.0 }
    ],
    "country": "USA",
    "headquarters": "Mountain View, CA",
    "flags": ["data-harvesting", "monopoly", "lobbying"],
    "sources": ["SEC 13F filings"]
  }
}
```

### Chinese Company

```json
{
  "tiktok.com": {
    "name": "TikTok (ByteDance Ltd.)",
    "shareholders": [
      { "name": "ByteDance (Private)", "percentage": 100 }
    ],
    "country": "China",
    "headquarters": "Beijing, China",
    "flags": ["chinese-owned", "data-harvesting", "censorship", "authoritarian-ties"],
    "notes": "Owned by ByteDance. Subject to Chinese data laws.",
    "sources": ["Company disclosures"]
  }
}
```

### Ethical Company

```json
{
  "patagonia.com": {
    "name": "Patagonia, Inc.",
    "shareholders": [
      { "name": "Holdfast Collective", "percentage": 98 },
      { "name": "Patagonia Purpose Trust", "percentage": 2 }
    ],
    "country": "USA",
    "headquarters": "Ventura, CA",
    "flags": ["b-corp", "green-certified", "fair-trade"],
    "sources": ["Company disclosures"]
  }
}
```
