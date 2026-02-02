#!/usr/bin/env node

/**
 * Migration script for BehindTheSite data system
 * Converts the existing companies.json into the new modular format
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OLD_DATA = join(ROOT, 'data', 'companies.json');
const SOURCE_DIR = join(ROOT, 'data', 'source');

const NOW = new Date().toISOString();

/**
 * Generate a slug ID from a name
 */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

/**
 * Determine entity type from name patterns
 */
function inferEntityType(name) {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('family') || lowerName.includes('trust')) return 'fund';
  if (lowerName.includes('group') || lowerName.includes('holdings') || lowerName.includes('inc') || lowerName.includes('corp')) return 'institution';
  if (lowerName.includes('government') || lowerName.includes('state')) return 'government';
  if (lowerName.includes('foundation') || lowerName.includes('non-profit') || lowerName.includes('nonprofit')) return 'nonprofit';
  if (lowerName.includes('private')) return 'private';
  // Check if it looks like a person's name (first + last)
  const parts = name.split(' ').filter(p => p.length > 0);
  if (parts.length >= 2 && parts.length <= 4 && !lowerName.includes('&')) {
    return 'individual';
  }
  return 'institution';
}

/**
 * Extract unique shareholders and create entity files
 */
function extractEntities(companies) {
  const entities = new Map();

  for (const company of Object.values(companies)) {
    for (const sh of company.shareholders || []) {
      const name = sh.name;
      if (!name) continue;

      // Skip generic names
      if (name.match(/^(Various|Private|Employee|Non-profit|Other)/i)) continue;

      const id = slugify(name);
      if (!entities.has(id)) {
        entities.set(id, {
          id,
          name,
          type: inferEntityType(name),
          created: NOW
        });
      }
    }
  }

  return entities;
}

/**
 * Create a company file from old format
 */
function createCompanyFile(domain, oldData, entities) {
  const shareholders = (oldData.shareholders || []).map(sh => {
    const entityId = slugify(sh.name);
    const entityExists = entities.has(entityId) && !sh.name.match(/^(Various|Private|Employee|Non-profit|Other)/i);

    return {
      ...(entityExists ? { entityId } : { name: sh.name }),
      percentage: sh.percentage
    };
  });

  const company = {
    id: domain,
    name: oldData.name,
    shareholders,
    country: oldData.country,
    sources: oldData.sources || []
  };

  // Add optional fields
  if (oldData.headquarters) company.headquarters = oldData.headquarters;
  if (oldData.parent) company.parent = oldData.parent;
  if (oldData.notes) company.notes = oldData.notes;

  company.created = NOW;

  return company;
}

/**
 * Create tag assignment files from company flags
 */
function createTagAssignments(domain, flags, notes) {
  const assignments = [];

  for (const tagId of flags || []) {
    assignments.push({
      companyId: domain,
      tagId,
      justification: `Migrated from original BehindTheSite data. ${notes || 'Justification needs to be added with specific evidence.'}`,
      sources: [
        {
          type: 'other',
          title: 'Original BehindTheSite data (needs verification)',
          date: '2026-02-01'
        }
      ],
      status: 'active',
      voting: {
        enabled: false,
        upvotes: 0,
        downvotes: 0
      },
      author: {
        github: 'behindthesite-migration'
      },
      created: NOW
    });
  }

  return assignments;
}

/**
 * Write a JSON file
 */
async function writeJson(filePath, data) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('BehindTheSite Data Migration\n' + '='.repeat(40));

  // Load old data
  console.log('\nLoading existing companies.json...');
  const oldDataRaw = await readFile(OLD_DATA, 'utf-8');
  const oldData = JSON.parse(oldDataRaw);
  console.log(`  Found ${Object.keys(oldData).length} companies`);

  // Extract entities
  console.log('\nExtracting entities...');
  const entities = extractEntities(oldData);
  console.log(`  Found ${entities.size} unique entities`);

  // Write entity files
  console.log('\nWriting entity files...');
  for (const [id, entity] of entities) {
    const filePath = join(SOURCE_DIR, 'entities', `${id}.json`);
    await writeJson(filePath, entity);
  }
  console.log(`  Wrote ${entities.size} entity files`);

  // Process companies
  console.log('\nMigrating companies...');
  let companyCount = 0;
  let assignmentCount = 0;

  for (const [domain, companyData] of Object.entries(oldData)) {
    // Create company file
    const company = createCompanyFile(domain, companyData, entities);
    const companyPath = join(SOURCE_DIR, 'companies', `${domain}.json`);
    await writeJson(companyPath, company);
    companyCount++;

    // Create tag assignment files
    const assignments = createTagAssignments(domain, companyData.flags, companyData.notes);
    for (const assignment of assignments) {
      const assignmentPath = join(
        SOURCE_DIR,
        'tag-assignments',
        domain,
        `${assignment.tagId}.json`
      );
      await writeJson(assignmentPath, assignment);
      assignmentCount++;
    }
  }

  console.log(`  Wrote ${companyCount} company files`);
  console.log(`  Wrote ${assignmentCount} tag assignment files`);

  // Create initial changelog
  console.log('\nCreating changelog...');
  const changelog = {
    month: '2026-02',
    entries: [
      {
        date: '2026-02-01',
        type: 'bulk_import',
        target: {
          type: 'company',
          id: '*'
        },
        description: `Initial migration from companies.json: ${companyCount} companies, ${entities.size} entities, ${assignmentCount} tag assignments`,
        author: {
          github: 'behindthesite-migration'
        }
      }
    ]
  };
  await writeJson(join(SOURCE_DIR, 'changelog', '2026', '2026-02.json'), changelog);

  // Summary
  console.log('\n' + '='.repeat(40));
  console.log('MIGRATION COMPLETE');
  console.log('='.repeat(40));
  console.log(`\nCreated:`);
  console.log(`  - ${entities.size} entity files in data/source/entities/`);
  console.log(`  - ${companyCount} company files in data/source/companies/`);
  console.log(`  - ${assignmentCount} tag assignment files in data/source/tag-assignments/`);
  console.log(`  - 1 changelog file in data/source/changelog/2026/`);
  console.log(`\nNext steps:`);
  console.log(`  1. Create tag definition files (scripts/create-tags.js or manually)`);
  console.log(`  2. Run validation: bun run validate`);
  console.log(`  3. Build output: bun run build`);
  console.log(`  4. Add detailed justifications to tag assignments`);
}

// Run migration
migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
