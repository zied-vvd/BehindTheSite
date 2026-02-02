# Contributing to BehindTheSite

Thanks for helping build a more transparent web! Here's how you can contribute.

## Adding Company Data

The most valuable contribution is adding verified company information.

### Data Format

Each company entry in `data/companies.json` should follow this format:

```json
"domain.com": {
  "name": "Official Company Name",
  "shareholders": [
    { "name": "Shareholder Name", "percentage": 10.5 },
    { "name": "Another Shareholder", "percentage": 5.0 }
  ],
  "country": "Country Name",
  "headquarters": "City, State/Country",
  "flags": [],
  "notes": "Optional additional context",
  "sources": ["Source 1", "Source 2"]
}
```

### Required Fields

| Field | Description |
|-------|-------------|
| `name` | Official company name |
| `shareholders` | Array of major shareholders (top 3-5) |
| `country` | Country of incorporation or primary operations |
| `sources` | Where you got this information |

### Optional Fields

| Field | Description |
|-------|-------------|
| `headquarters` | City and state/country of HQ |
| `parent` | Domain of parent company (for subsidiaries) |
| `flags` | Array of relevant flags (see below) |
| `notes` | Additional context |

### Available Flags

- `chinese-owned` - Majority Chinese ownership or control
- `russian-ties` - Significant Russian connections or ownership
- `state-owned` - Government/state ownership
- `controversial` - Subject of significant, documented controversy

**Use flags responsibly.** Only add flags that are:
1. Factually accurate
2. Relevant to ownership/control
3. Verifiable from reputable sources

### Data Sources

Acceptable sources:
- SEC filings (13F, proxy statements)
- Official company reports
- Regulatory filings (any country)
- Major news outlets (Reuters, Bloomberg, WSJ, etc.)
- Wikipedia (with citations)

NOT acceptable:
- Social media posts
- Unverified blogs
- "I heard that..."

### Submitting a PR

1. Fork the repository
2. Edit `data/companies.json`
3. Validate your JSON (use a JSON validator)
4. Submit a PR with:
   - What companies you added/updated
   - Your sources (links preferred)

### Example PR Description

```
## Added: walmart.com

- Company: Walmart Inc.
- Major shareholders: Walton Family (47%), Vanguard (5.2%), BlackRock (4.1%)
- Country: USA
- Sources:
  - https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000104169
  - Walmart 2024 Proxy Statement
```

## Code Contributions

### Setup

```bash
git clone https://github.com/zied-vvd/BehindTheSite.git
cd BehindTheSite
```

Load in Chrome:
1. Go to `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked" and select the folder

### Guidelines

- Keep it simple - this is a lightweight extension
- No external dependencies (vanilla JS only)
- Test on multiple sites before submitting
- Follow existing code style

### Areas for Improvement

- [ ] Firefox support
- [ ] Safari support
- [ ] Better domain matching (subdomains, redirects)
- [ ] Offline mode with bundled data
- [ ] Search/lookup in popup
- [ ] User preferences (hide certain flags, etc.)

## Reporting Issues

- Data inaccuracy: Open an issue with correct info + sources
- Bug: Include steps to reproduce and browser version
- Feature request: Describe the use case

## Code of Conduct

- Be respectful
- Cite your sources
- Don't add politically motivated flags without solid evidence
- This is about transparency, not activism

## License

By contributing, you agree that your contributions will be licensed under MIT.
