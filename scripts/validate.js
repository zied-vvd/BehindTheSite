#!/usr/bin/env node

/**
 * Validation script for BehindTheSite data system
 * Validates JSON schemas and cross-references between files
 */

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOURCE_DIR = join(ROOT, 'data', 'source');
const SCHEMAS_DIR = join(ROOT, 'data', 'schemas');

// Initialize AJV with 2020-12 draft support
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

// Track validation results
const errors = [];
const warnings = [];
const stats = {
  companies: 0,
  entities: 0,
  tags: 0,
  tagAssignments: 0,
  changelogs: 0
};

/**
 * Load and compile a JSON schema
 */
async function loadSchema(name) {
  const schemaPath = join(SCHEMAS_DIR, `${name}.schema.json`);
  const content = await readFile(schemaPath, 'utf-8');
  return ajv.compile(JSON.parse(content));
}

/**
 * Read and parse a JSON file
 */
async function readJson(filePath) {
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Read all JSON files from a directory
 */
async function readJsonDir(dirPath) {
  const items = [];
  try {
    const files = await readdir(dirPath);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = join(dirPath, file);
        const data = await readJson(filePath);
        items.push({ file, path: filePath, data });
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  return items;
}

/**
 * Validate companies
 */
async function validateCompanies(validate, entities) {
  console.log('\nValidating companies...');
  const companiesDir = join(SOURCE_DIR, 'companies');
  const companies = await readJsonDir(companiesDir);
  const companyIds = new Set();

  for (const { file, path, data } of companies) {
    const expectedId = file.replace('.json', '');

    // Schema validation
    if (!validate(data)) {
      errors.push(`${path}: Schema validation failed - ${ajv.errorsText(validate.errors)}`);
      continue;
    }

    // ID consistency
    if (data.id !== expectedId) {
      errors.push(`${path}: ID mismatch - file is "${expectedId}" but id field is "${data.id}"`);
    }

    // Entity references
    for (const sh of data.shareholders || []) {
      if (sh.entityId && !entities.has(sh.entityId)) {
        warnings.push(`${path}: Shareholder references unknown entity "${sh.entityId}"`);
      }
    }

    // Parent reference
    if (data.parent) {
      // Parent validation happens after all companies are loaded
      companyIds.add(expectedId);
    }

    companyIds.add(expectedId);
    stats.companies++;
  }

  // Second pass: validate parent references
  for (const { file, path, data } of companies) {
    if (data.parent && !companyIds.has(data.parent)) {
      errors.push(`${path}: Parent company "${data.parent}" not found`);
    }
  }

  console.log(`  Validated ${stats.companies} companies`);
  return companyIds;
}

/**
 * Validate entities
 */
async function validateEntities(validate) {
  console.log('\nValidating entities...');
  const entitiesDir = join(SOURCE_DIR, 'entities');
  const entities = await readJsonDir(entitiesDir);
  const entityIds = new Set();

  for (const { file, path, data } of entities) {
    const expectedId = file.replace('.json', '');

    // Schema validation
    if (!validate(data)) {
      errors.push(`${path}: Schema validation failed - ${ajv.errorsText(validate.errors)}`);
      continue;
    }

    // ID consistency
    if (data.id !== expectedId) {
      errors.push(`${path}: ID mismatch - file is "${expectedId}" but id field is "${data.id}"`);
    }

    entityIds.add(expectedId);
    stats.entities++;
  }

  console.log(`  Validated ${stats.entities} entities`);
  return entityIds;
}

/**
 * Validate tag definitions
 */
async function validateTags(validate) {
  console.log('\nValidating tag definitions...');
  const tagsDir = join(SOURCE_DIR, 'tags');
  const tagIds = new Set();

  try {
    const categories = await readdir(tagsDir);
    for (const category of categories) {
      const categoryPath = join(tagsDir, category);
      const tags = await readJsonDir(categoryPath);

      for (const { file, path, data } of tags) {
        const expectedId = file.replace('.json', '');

        // Schema validation
        if (!validate(data)) {
          errors.push(`${path}: Schema validation failed - ${ajv.errorsText(validate.errors)}`);
          continue;
        }

        // ID consistency
        if (data.id !== expectedId) {
          errors.push(`${path}: ID mismatch - file is "${expectedId}" but id field is "${data.id}"`);
        }

        // Category consistency
        if (data.category !== category) {
          warnings.push(`${path}: Tag is in "${category}" folder but has category "${data.category}"`);
        }

        tagIds.add(expectedId);
        stats.tags++;
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  console.log(`  Validated ${stats.tags} tag definitions`);
  return tagIds;
}

/**
 * Validate tag assignments
 */
async function validateTagAssignments(validate, companyIds, tagIds) {
  console.log('\nValidating tag assignments...');
  const assignmentsDir = join(SOURCE_DIR, 'tag-assignments');

  try {
    const companyDirs = await readdir(assignmentsDir);
    for (const companyId of companyDirs) {
      // Company directory should match a known company
      if (!companyIds.has(companyId)) {
        errors.push(`tag-assignments/${companyId}/: Company "${companyId}" not found in companies/`);
        continue;
      }

      const companyPath = join(assignmentsDir, companyId);
      const assignments = await readJsonDir(companyPath);

      for (const { file, path, data } of assignments) {
        const expectedTagId = file.replace('.json', '');

        // Schema validation
        if (!validate(data)) {
          errors.push(`${path}: Schema validation failed - ${ajv.errorsText(validate.errors)}`);
          continue;
        }

        // Company ID consistency
        if (data.companyId !== companyId) {
          errors.push(`${path}: companyId "${data.companyId}" doesn't match directory "${companyId}"`);
        }

        // Tag ID consistency
        if (data.tagId !== expectedTagId) {
          errors.push(`${path}: tagId "${data.tagId}" doesn't match filename "${expectedTagId}"`);
        }

        // Tag existence
        if (!tagIds.has(data.tagId)) {
          warnings.push(`${path}: References undefined tag "${data.tagId}"`);
        }

        // Source quality checks
        if (data.sources && data.sources.length === 0) {
          warnings.push(`${path}: Has empty sources array`);
        }

        // Justification quality
        if (data.justification && data.justification.length < 50) {
          warnings.push(`${path}: Justification seems short (${data.justification.length} chars)`);
        }

        stats.tagAssignments++;
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  console.log(`  Validated ${stats.tagAssignments} tag assignments`);
}

/**
 * Validate changelogs
 */
async function validateChangelogs(validate) {
  console.log('\nValidating changelogs...');
  const changelogDir = join(SOURCE_DIR, 'changelog');

  try {
    const years = await readdir(changelogDir);
    for (const year of years) {
      const yearPath = join(changelogDir, year);
      const logs = await readJsonDir(yearPath);

      for (const { file, path, data } of logs) {
        // Schema validation
        if (!validate(data)) {
          errors.push(`${path}: Schema validation failed - ${ajv.errorsText(validate.errors)}`);
          continue;
        }

        // Month consistency
        const expectedMonth = file.replace('.json', '');
        if (data.month !== expectedMonth) {
          errors.push(`${path}: month "${data.month}" doesn't match filename "${expectedMonth}"`);
        }

        stats.changelogs++;
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  console.log(`  Validated ${stats.changelogs} changelog files`);
}

/**
 * Main validation function
 */
async function validate() {
  console.log('BehindTheSite Data Validation\n' + '='.repeat(40));

  try {
    // Load schemas
    console.log('\nLoading schemas...');
    const companySchema = await loadSchema('company');
    const entitySchema = await loadSchema('entity');
    const tagSchema = await loadSchema('tag');
    const tagAssignmentSchema = await loadSchema('tag-assignment');
    const changelogSchema = await loadSchema('changelog');
    console.log('  All schemas loaded successfully');

    // Validate in order to build reference sets
    const entityIds = await validateEntities(entitySchema);
    const companyIds = await validateCompanies(companySchema, entityIds);
    const tagIds = await validateTags(tagSchema);
    await validateTagAssignments(tagAssignmentSchema, companyIds, tagIds);
    await validateChangelogs(changelogSchema);

    // Report results
    console.log('\n' + '='.repeat(40));
    console.log('VALIDATION SUMMARY');
    console.log('='.repeat(40));

    console.log(`\nStats:`);
    console.log(`  Companies: ${stats.companies}`);
    console.log(`  Entities: ${stats.entities}`);
    console.log(`  Tags: ${stats.tags}`);
    console.log(`  Tag Assignments: ${stats.tagAssignments}`);
    console.log(`  Changelogs: ${stats.changelogs}`);

    if (warnings.length > 0) {
      console.log(`\n⚠️  Warnings (${warnings.length}):`);
      for (const warning of warnings) {
        console.log(`  - ${warning}`);
      }
    }

    if (errors.length > 0) {
      console.log(`\n❌ Errors (${errors.length}):`);
      for (const error of errors) {
        console.log(`  - ${error}`);
      }
      console.log('\nValidation FAILED');
      process.exit(1);
    }

    console.log('\n✅ Validation PASSED');

  } catch (err) {
    console.error('\nValidation failed with error:', err.message);
    process.exit(1);
  }
}

// Run validation
validate();
