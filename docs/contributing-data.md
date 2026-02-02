# Contributing Data

Thank you for helping build a more transparent web! This guide explains how to add or update company data.

## Quick Start

1. Fork the repository
2. Edit `data/companies.json`
3. Submit a pull request

## Adding a New Company

### 1. Find the Domain

Use the company's primary domain (without `www.`):

- ✅ `example.com`
- ❌ `www.example.com`
- ❌ `https://example.com`

### 2. Research the Company

Gather information from reliable sources:

**For shareholders:**
- SEC 13F filings (for US public companies)
- Company proxy statements
- Annual reports
- Regulatory filings

**For flags:**
- News reports from major outlets
- NGO reports (Human Rights Watch, Amnesty, etc.)
- Government reports
- Academic research

### 3. Create the Entry

```json
"example.com": {
  "name": "Example Corporation",
  "shareholders": [
    { "name": "Major Investor", "percentage": 15.0 },
    { "name": "Another Investor", "percentage": 10.0 }
  ],
  "country": "USA",
  "headquarters": "New York, NY",
  "flags": ["relevant-flag-1", "relevant-flag-2"],
  "sources": ["SEC 13F Q4 2024", "Company annual report 2024"]
}
```

### 4. Validate Your JSON

Before submitting, validate your JSON:

- Use a JSON validator (like jsonlint.com)
- Ensure no trailing commas
- Check all brackets are closed

### 5. Submit a Pull Request

Include in your PR description:

```markdown
## Added: example.com

- **Company**: Example Corporation
- **Country**: USA
- **Major shareholders**: Major Investor (15%), Another Investor (10%)
- **Flags**: relevant-flag-1, relevant-flag-2

### Sources
- https://www.sec.gov/... (SEC 13F filing)
- https://example.com/annual-report (Company report)
```

## Updating Existing Data

Shareholder percentages change quarterly. When updating:

1. Include the date/quarter of your data
2. Cite your source
3. Note what changed in your PR

## Guidelines

### Do's

✅ Use official sources (SEC, company filings, regulatory bodies)
✅ Include multiple sources when possible
✅ Note when percentages are approximate
✅ Use `null` for unknown percentages
✅ Add context in the `notes` field
✅ Be objective and factual

### Don'ts

❌ Use social media as a primary source
❌ Add flags without evidence
❌ Make political editorializations
❌ Guess at ownership percentages
❌ Copy data from unreliable sites

## Flag Guidelines

### When to Add a Flag

Only add flags that are:

1. **Factually accurate** - Verifiable from reputable sources
2. **Significant** - Not minor or one-time issues
3. **Current** - Still relevant (not decades-old history)

### Examples

**✅ Good flag usage:**
```json
"flags": ["chinese-owned"]
// Company is headquartered in China and majority Chinese-owned
```

**❌ Bad flag usage:**
```json
"flags": ["controversial"]
// Too vague - what controversy? Use specific flags
```

### Adding New Flag Types

If you need a flag that doesn't exist:

1. Open an issue describing the flag
2. Explain why it's needed
3. Suggest an ID, label, and category
4. We'll discuss and potentially add it

## Acceptable Sources

### Tier 1 (Preferred)

- SEC filings (13F, 10-K, proxy statements)
- Regulatory filings (FCA, BaFin, etc.)
- Official company reports
- Court documents

### Tier 2 (Acceptable)

- Major news outlets (Reuters, Bloomberg, WSJ, NYT)
- Reputable NGO reports
- Academic research
- Government reports

### Tier 3 (Supplementary)

- Wikipedia (with citations)
- Industry publications
- Investigative journalism

### Not Acceptable

- Social media posts
- Anonymous blogs
- Unverified claims
- "I heard that..."

## PR Review Process

1. **Automated checks** - JSON validation
2. **Maintainer review** - Source verification
3. **Discussion** - If needed for controversial entries
4. **Merge** - Once approved

## Getting Help

- Open an issue for questions
- Tag maintainers for urgent data corrections
- Join discussions on existing PRs to learn the process
