# BehindTheSite

A Chrome extension that shows you who really owns the websites you visit - major shareholders, country of origin, and important flags.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- **Transparency Banner**: See ownership info at the top of every page
- **Shareholder Data**: Know if BlackRock, Vanguard, or other major institutions own the company
- **Country of Origin**: See where the company is headquartered
- **Warning Flags**: Get alerts for relevant associations (e.g., state-owned, foreign ownership)
- **Community-Driven**: Data is open source and community-maintained

## Installation

### From Source (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/zied-vvd/BehindTheSite.git
   ```

2. Open Chrome and go to `chrome://extensions/`

3. Enable "Developer mode" in the top right

4. Click "Load unpacked" and select the `BehindTheSite` folder

### From Chrome Web Store

Coming soon.

## How It Works

1. When you visit a website, the extension checks the domain against our database
2. If we have data on the company, a banner appears at the top of the page
3. The banner shows: company name, major shareholders, country, and any relevant flags
4. Data is fetched from GitHub and cached locally for 1 hour

## Data Sources

Our data comes from:
- SEC 13F filings (institutional holdings)
- Company proxy statements
- Public company disclosures
- Press reports and verified news sources

**Note**: Shareholder percentages change frequently. Our goal is directional accuracy, not real-time precision.

## Contributing

We need help building out the database! See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add companies.

### Quick Add

To add a company, submit a PR adding an entry to `data/companies.json`:

```json
"example.com": {
  "name": "Example Corp",
  "shareholders": [
    { "name": "Major Holder", "percentage": 10.5 }
  ],
  "country": "USA",
  "headquarters": "City, State",
  "flags": [],
  "sources": ["Source of information"]
}
```

## Flags

Available flags:
- `chinese-owned` - Majority Chinese ownership
- `russian-ties` - Significant Russian connections
- `state-owned` - Government ownership
- `controversial` - Subject of significant controversy

## Privacy

- The extension only reads the current page's domain
- No browsing data is collected or transmitted
- Data is fetched from GitHub (public repository)
- All code is open source for audit

## License

MIT License - see [LICENSE](LICENSE)

## Disclaimer

This extension provides informational data only. Shareholder information changes frequently and may not be current. This is not financial or investment advice. Always verify information from official sources before making decisions.
