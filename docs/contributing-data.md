# Contributing Data

Thank you for helping build a more transparent web! This guide explains how to add or update company data using the new modular data system.

## Quick Start

1. Fork the repository
2. Run `npm install` to install dependencies
3. Add/edit files in `data/source/`
4. Run `npm run validate` to check your changes
5. Run `npm run build` to generate output
6. Submit a pull request

## Adding a New Company

### Step 1: Create the Company File

Create `data/source/companies/{domain}.json`:

```json
{
  "id": "example.com",
  "name": "Example Corporation",
  "shareholders": [
    { "entityId": "vanguard-group", "percentage": 8.5 },
    { "name": "John Founder", "percentage": 15.0 }
  ],
  "country": "USA",
  "headquarters": "New York, NY",
  "sources": ["SEC 13F Q4 2025", "Company annual report 2025"],
  "created": "2026-02-01T00:00:00Z"
}
```

**Note**: Use `entityId` to reference existing entities in `data/source/entities/`, or `name` for individuals or new entities.

### Step 2: Create Entity Files (if needed)

If a major shareholder doesn't exist yet, create `data/source/entities/{id}.json`:

```json
{
  "id": "new-investment-firm",
  "name": "New Investment Firm LLC",
  "type": "institution",
  "country": "USA",
  "created": "2026-02-01T00:00:00Z"
}
```

### Step 3: Create Tag Assignments

For each tag that applies, create `data/source/tag-assignments/{domain}/{tag-id}.json`:

```json
{
  "companyId": "example.com",
  "tagId": "poor-labor",
  "justification": "OSHA records show Example Corp received 5 serious safety violations in 2024-2025, with worker injury rates 40% above industry average according to BLS data.",
  "sources": [
    {
      "type": "regulatory",
      "url": "https://www.osha.gov/...",
      "title": "OSHA Inspection Records",
      "date": "2025-06-15"
    },
    {
      "type": "news",
      "url": "https://www.nytimes.com/...",
      "title": "Investigation: Warehouse Safety Failures",
      "date": "2025-08-20"
    }
  ],
  "status": "active",
  "voting": { "enabled": false, "upvotes": 0, "downvotes": 0 },
  "author": { "github": "your-username" },
  "created": "2026-02-01T00:00:00Z"
}
```

### Step 4: Validate and Build

```bash
npm run validate  # Check all files are valid
npm run build     # Generate dist/companies.json
```

### Step 5: Submit PR

Include in your PR description:

```markdown
## Added: example.com

**Company**: Example Corporation
**Country**: USA
**Major shareholders**: Vanguard Group (8.5%), John Founder (15%)
**Tags assigned**: poor-labor

### Sources
- OSHA Inspection Records: https://osha.gov/...
- NYT Investigation: https://nytimes.com/...

### Justification for poor-labor tag
OSHA records document 5 serious violations with injury rates 40% above industry average.
```

## Updating Existing Data

### Updating Company Information

Edit `data/source/companies/{domain}.json` directly. Remember to:
- Update the `updated` field with current timestamp
- Cite your source for any changes
- Add a changelog entry

### Updating Tag Assignments

Edit or add files in `data/source/tag-assignments/{domain}/`:
- To add a tag: Create a new `{tag-id}.json` file
- To remove a tag: Change `status` to `"historical"` (don't delete)
- To update justification: Edit the existing file

### Updating Entities

Edit `data/source/entities/{id}.json` for shareholder information changes.

## Tag Assignment Guidelines

### Writing Good Justifications

Justifications should be:
- **Factual**: Based on verifiable evidence
- **Specific**: Include numbers, dates, outcomes
- **Substantial**: At least 50 characters explaining why the tag applies
- **Neutral**: Objective language, no editorializing

**Good example:**
> "Amazon warehouse injury rates were documented at 6.5 per 100 workers in 2024, compared to 3.1 for the industry average. OSHA issued citations for 12 serious violations across 5 facilities."

**Bad example:**
> "Amazon is known to be bad for workers."

### Required Sources

Every tag assignment needs at least one source. Preferred source types:

**Tier 1 (Preferred)**
- `regulatory`: SEC filings, OSHA records, FTC actions
- `legal`: Court documents, settlements, judgments
- `government`: Official government reports

**Tier 2 (Good)**
- `news`: Major outlets (Reuters, Bloomberg, NYT, WSJ)
- `ngo`: Established NGOs (Human Rights Watch, EFF, etc.)
- `academic`: Peer-reviewed research

**Tier 3 (Supplementary)**
- `company`: Company's own disclosures
- `other`: Wikipedia (with citations), industry publications

### Tag Criteria

Before assigning a tag, check its criteria in `data/source/tags/{category}/{tag-id}.json`. Each tag has:
- `definition`: What the tag represents
- `criteria`: Conditions that must be met
- `counterCriteria`: Conditions that would disqualify

Only assign a tag if the company clearly meets at least one criterion.

## Creating a New Tag

If you need a tag that doesn't exist:

1. Open an issue to discuss the new tag
2. Once approved, create `data/source/tags/{category}/{tag-id}.json`:

```json
{
  "id": "new-tag",
  "label": "🏷️ New Tag Label",
  "category": "ethics",
  "type": "warning",
  "definition": "Clear definition of what this tag represents...",
  "criteria": [
    { "description": "Specific, measurable criterion" },
    { "description": "Another criterion", "threshold": "quantitative threshold" }
  ],
  "counterCriteria": ["When this tag should NOT apply"],
  "references": [
    { "title": "Reference Source", "url": "https://..." }
  ],
  "created": "2026-02-01T00:00:00Z"
}
```

3. Add the tag to `FLAG_LABELS` in `src/content.js`
4. Add to appropriate concern mapping in `src/onboarding.js`

## Changelog

For significant changes, add an entry to `data/source/changelog/{year}/{year-month}.json`:

```json
{
  "month": "2026-02",
  "entries": [
    {
      "date": "2026-02-15",
      "type": "company_added",
      "target": { "type": "company", "id": "example.com" },
      "description": "Added Example Corporation with poor-labor tag",
      "author": { "github": "your-username" },
      "pullRequest": "#123"
    }
  ]
}
```

## Local Development

```bash
# Install dependencies
npm install

# Validate all source files
npm run validate

# Build distribution file
npm run build

# Run both validate and build
npm run check
```

## PR Review Process

1. **Automated validation** runs on all PRs
2. **Maintainer reviews** sources and justifications
3. **Discussion** for contested tags
4. **Merge** once approved
5. **Auto-build** updates `dist/companies.json`

## Guidelines Summary

### Do's

- Use official, verifiable sources
- Write detailed justifications with specific evidence
- Check tag criteria before assigning
- Include dates on sources
- Run validation before submitting

### Don'ts

- Assign tags without evidence
- Use social media as primary sources
- Write vague justifications
- Guess at ownership percentages
- Skip the validation step

## Getting Help

- Check existing entries for examples
- Open an issue for questions
- Tag maintainers for data corrections
