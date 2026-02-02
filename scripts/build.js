#!/usr/bin/env node

/**
 * Build script for BehindTheSite data system
 * Combines modular source files into dist/companies.json for extension use
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOURCE_DIR = join(ROOT, 'data', 'source');
const DIST_DIR = join(ROOT, 'data', 'dist');

/**
 * Read all JSON files from a directory
 */
async function readJsonDir(dirPath) {
  const items = {};
  try {
    const files = await readdir(dirPath);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await readFile(join(dirPath, file), 'utf-8');
        const data = JSON.parse(content);
        const id = file.replace('.json', '');
        items[id] = data;
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  return items;
}

/**
 * Read all tag assignments from nested directories
 */
async function readTagAssignments(baseDir) {
  const assignments = {};
  try {
    const companyDirs = await readdir(baseDir);
    for (const companyId of companyDirs) {
      const companyPath = join(baseDir, companyId);
      const stats = await readdir(companyPath).catch(() => null);
      if (!stats) continue;

      assignments[companyId] = [];
      for (const file of stats) {
        if (file.endsWith('.json')) {
          const content = await readFile(join(companyPath, file), 'utf-8');
          const data = JSON.parse(content);
          assignments[companyId].push(data);
        }
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  return assignments;
}

/**
 * Read all tag definitions from category subdirectories
 */
async function readTagDefinitions(baseDir) {
  const tags = {};
  try {
    const categories = await readdir(baseDir);
    for (const category of categories) {
      const categoryPath = join(baseDir, category);
      const files = await readdir(categoryPath).catch(() => []);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await readFile(join(categoryPath, file), 'utf-8');
          const data = JSON.parse(content);
          tags[data.id] = data;
        }
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  return tags;
}

/**
 * Load entity data for resolving shareholder references
 */
async function loadEntities(entitiesDir) {
  return readJsonDir(entitiesDir);
}

/**
 * Build the combined companies.json for extension use
 */
async function build() {
  console.log('Building BehindTheSite data...\n');

  // Load all source data
  console.log('Loading source files...');
  const companies = await readJsonDir(join(SOURCE_DIR, 'companies'));
  const entities = await loadEntities(join(SOURCE_DIR, 'entities'));
  const tagAssignments = await readTagAssignments(join(SOURCE_DIR, 'tag-assignments'));
  const tagDefinitions = await readTagDefinitions(join(SOURCE_DIR, 'tags'));

  console.log(`  Companies: ${Object.keys(companies).length}`);
  console.log(`  Entities: ${Object.keys(entities).length}`);
  console.log(`  Tag definitions: ${Object.keys(tagDefinitions).length}`);
  console.log(`  Companies with tag assignments: ${Object.keys(tagAssignments).length}`);

  // Build output in extension-compatible format
  const output = {};
  let tagAssignmentCount = 0;

  for (const [companyId, company] of Object.entries(companies)) {
    // Resolve entity references in shareholders with full metadata
    const shareholders = company.shareholders.map(sh => {
      if (sh.entityId && entities[sh.entityId]) {
        const entity = entities[sh.entityId];
        return {
          name: entity.name,
          percentage: sh.percentage,
          type: entity.type,
          description: entity.description || null,
          country: entity.country || null,
          wikipedia: entity.wikipedia || null,
          wikidata: entity.wikidata || null
        };
      }
      return {
        name: sh.name || sh.entityId,
        percentage: sh.percentage,
        type: 'unknown'
      };
    });

    // Get flags from tag assignments (only active ones) with justifications
    const companyAssignments = tagAssignments[companyId] || [];
    const flagsData = companyAssignments
      .filter(a => a.status === 'active')
      .map(a => {
        const tagDef = tagDefinitions[a.tagId] || {};
        return {
          id: a.tagId,
          justification: a.justification,
          sources: a.sources || [],
          definition: tagDef.definition || null,
          category: tagDef.category || null
        };
      });
    tagAssignmentCount += flagsData.length;

    // Build company entry
    const entry = {
      name: company.name,
      shareholders,
      country: company.country,
      flags: flagsData.map(f => f.id),  // Simple array for backward compatibility
      flagsData,  // Full flag data with justifications
      sources: company.sources
    };

    // Add optional fields if present
    if (company.headquarters) entry.headquarters = company.headquarters;
    if (company.parent) entry.parent = company.parent;
    if (company.notes) entry.notes = company.notes;

    output[companyId] = entry;
  }

  // Ensure dist directory exists
  await mkdir(DIST_DIR, { recursive: true });

  // Write output
  const outputPath = join(DIST_DIR, 'companies.json');
  await writeFile(outputPath, JSON.stringify(output, null, 2));

  console.log(`\nBuild complete!`);
  console.log(`  Output: ${outputPath}`);
  console.log(`  Companies: ${Object.keys(output).length}`);
  console.log(`  Total tag assignments: ${tagAssignmentCount}`);

  // Validate output matches expected format
  const sampleEntry = Object.values(output)[0];
  if (sampleEntry) {
    const hasRequiredFields = sampleEntry.name && sampleEntry.shareholders && sampleEntry.country;
    if (!hasRequiredFields) {
      console.error('\nWarning: Output may not match expected extension format!');
      process.exit(1);
    }
  }

  return output;
}

// Run build
build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
