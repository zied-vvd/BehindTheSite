# Data Format

The BehindTheSite data system uses a modular architecture with normalized entities and community-notes-style tag assignments.

## Directory Structure

```
data/
├── source/                      # Human-editable source files
│   ├── companies/               # One file per company (amazon.com.json)
│   ├── entities/                # Shareholders, investors (vanguard-group.json)
│   ├── tags/                    # Tag definitions organized by category
│   │   ├── labor/poor-labor.json
│   │   ├── environment/carbon-heavy.json
│   │   └── ...
│   ├── tag-assignments/         # Company-tag links with justifications
│   │   ├── amazon.com/
│   │   │   ├── poor-labor.json
│   │   │   └── monopoly.json
│   │   └── ...
│   └── changelog/               # Structured change records
│       └── 2026/2026-02.json
├── dist/                        # Build output for extension
│   └── companies.json           # Combined, flattened data
└── schemas/                     # JSON Schema validation files
```

## Company Entry (`data/source/companies/`)

Each company has its own JSON file named by domain:

```json
{
  "id": "amazon.com",
  "name": "Amazon.com, Inc.",
  "shareholders": [
    { "entityId": "vanguard-group", "percentage": 7.1 },
    { "entityId": "blackrock", "percentage": 6.4 },
    { "name": "Jeff Bezos", "percentage": 9.5 }
  ],
  "country": "USA",
  "headquarters": "Seattle, WA",
  "sources": ["SEC 13F filings", "Company proxy statements"],
  "created": "2026-02-01T00:00:00Z"
}
```

### Company Fields

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `id` | Yes | string | Domain name (must match filename) |
| `name` | Yes | string | Official company name |
| `shareholders` | Yes | array | Major shareholders (see below) |
| `country` | Yes | string | Country of incorporation |
| `sources` | Yes | array | Sources for company info |
| `headquarters` | No | string | City and state/country |
| `parent` | No | string | Parent company domain |
| `notes` | No | string | Additional context |
| `wikidata` | No | string | Wikidata entity ID |
| `created` | No | date-time | Entry creation date |
| `updated` | No | date-time | Last update date |

### Shareholder Object

```json
{
  "entityId": "vanguard-group",  // Reference to entity file
  "percentage": 7.1              // Ownership percentage (null if unknown)
}
// OR
{
  "name": "John Doe",            // Direct name for individuals
  "percentage": 5.0
}
```

## Entity (`data/source/entities/`)

Normalized shareholders/investors to avoid duplication:

```json
{
  "id": "vanguard-group",
  "name": "Vanguard Group",
  "type": "institution",
  "country": "US",
  "description": "World's largest asset manager",
  "wikidata": "Q849452"
}
```

### Entity Types

- `institution` - Investment firms, asset managers
- `individual` - Named persons
- `fund` - Investment funds, trusts
- `government` - State entities, sovereign wealth funds
- `nonprofit` - Foundations, nonprofits
- `private` - Private companies
- `other` - Everything else

## Tag Definition (`data/source/tags/{category}/`)

Each tag has clear criteria for application:

```json
{
  "id": "poor-labor",
  "label": "⚠️ Poor Labor Practices",
  "category": "labor",
  "type": "warning",
  "definition": "Documented patterns of labor practices violating workers' rights...",
  "criteria": [
    {
      "description": "Significant OSHA violations within past 5 years",
      "threshold": ">3 serious OR any willful"
    },
    { "description": "Documented wage theft affecting substantial workers" }
  ],
  "counterCriteria": ["Issues fully remediated with verification"],
  "references": [
    { "title": "OSHA Database", "url": "https://osha.gov/..." }
  ],
  "relatedTags": ["child-labor", "union-busting"]
}
```

### Tag Categories

| Category | Description |
|----------|-------------|
| `ownership` | Country ties, state ownership |
| `environment` | Climate, pollution, sustainability |
| `peace` | Weapons, military, conflicts |
| `labor` | Working conditions, unions |
| `privacy` | Data practices, surveillance |
| `ethics` | Monopoly, taxes, governance |
| `health` | Products affecting health |
| `democracy` | Media, elections, censorship |

### Tag Types

| Type | Color | Usage |
|------|-------|-------|
| `warning` | Red | Concerning practices |
| `info` | Blue | Neutral information |
| `positive` | Green | Good practices |

## Tag Assignment (`data/source/tag-assignments/{company}/`)

Community-notes-style linking of tags to companies with justifications:

```json
{
  "companyId": "amazon.com",
  "tagId": "poor-labor",
  "justification": "Amazon warehouse injury rates are documented to be double the industry average. OSHA has issued multiple citations...",
  "sources": [
    {
      "type": "regulatory",
      "url": "https://osha.gov/...",
      "title": "OSHA Citation 2024"
    },
    {
      "type": "news",
      "url": "https://nytimes.com/...",
      "title": "Investigation into Amazon warehouses"
    }
  ],
  "wikiLinks": [
    { "url": "https://en.wikipedia.org/wiki/...", "title": "..." }
  ],
  "status": "active",
  "voting": {
    "enabled": false,
    "upvotes": 0,
    "downvotes": 0
  },
  "author": { "github": "contributor-username" },
  "created": "2026-02-01T10:00:00Z"
}
```

### Source Types

- `regulatory` - Government/regulatory filings
- `news` - News articles from major outlets
- `academic` - Academic research, studies
- `legal` - Court documents, settlements
- `company` - Company disclosures
- `ngo` - NGO reports
- `government` - Government reports
- `other` - Other credible sources

### Assignment Status

- `active` - Currently applies
- `disputed` - Under review or contested
- `pending_review` - New submission awaiting review
- `historical` - No longer applies but kept for record

## Build Output (`data/dist/companies.json`)

The build process combines all source files into the extension-compatible format:

```json
{
  "amazon.com": {
    "name": "Amazon.com, Inc.",
    "shareholders": [
      { "name": "Vanguard Group", "percentage": 7.1 },
      { "name": "BlackRock", "percentage": 6.4 }
    ],
    "country": "USA",
    "headquarters": "Seattle, WA",
    "flags": ["poor-labor", "union-busting", "monopoly"],
    "sources": ["SEC 13F filings"]
  }
}
```

Note: Entity references are resolved to names, and flags are compiled from active tag assignments.

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
