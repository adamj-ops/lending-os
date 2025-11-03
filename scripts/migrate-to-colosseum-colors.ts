#!/usr/bin/env tsx
/**
 * Colosseum Color Migration Script
 *
 * This script performs SAFE, semantic color replacements for Tier 1 files.
 * Only replaces colors where semantic meaning is 100% clear.
 *
 * Usage: npx tsx scripts/migrate-to-colosseum-colors.ts [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP_DIR = path.join(process.cwd(), '.color-migration-backups');

// Safe replacements - ONLY patterns with 100% clear semantic meaning
const SAFE_REPLACEMENTS: Record<string, string> = {
  // Primary (Blue/Cyan → Teal brand-primary)
  'bg-blue-500': 'bg-brand-primary-500',
  'bg-blue-600': 'bg-brand-primary-600',
  'bg-blue-700': 'bg-brand-primary-700',
  'hover:bg-blue-500': 'hover:bg-brand-primary-500',
  'hover:bg-blue-600': 'hover:bg-brand-primary-600',
  'hover:bg-blue-700': 'hover:bg-brand-primary-700',
  'active:bg-blue-700': 'active:bg-brand-primary-700',
  'text-blue-600': 'text-brand-primary-600',
  'text-blue-700': 'text-brand-primary-700',
  'border-blue-500': 'border-brand-primary-500',
  'border-blue-600': 'border-brand-primary-600',
  'ring-blue-500': 'ring-brand-primary-500',

  'bg-cyan-500': 'bg-brand-primary-500',
  'bg-cyan-600': 'bg-brand-primary-600',
  'text-cyan-600': 'text-brand-primary-600',
  'border-cyan-500': 'border-brand-primary-500',

  'bg-teal-500': 'bg-brand-primary-500',
  'bg-teal-600': 'bg-brand-primary-600',
  'text-teal-600': 'text-brand-primary-600',

  // Success (Green → brand-success)
  'bg-green-500': 'bg-brand-success-500',
  'bg-green-600': 'bg-brand-success-600',
  'bg-green-700': 'bg-brand-success-700',
  'hover:bg-green-600': 'hover:bg-brand-success-600',
  'text-green-500': 'text-brand-success-500',
  'text-green-600': 'text-brand-success-600',
  'text-green-700': 'text-brand-success-700',
  'border-green-500': 'border-brand-success-500',
  'border-green-600': 'border-brand-success-600',

  'bg-emerald-500': 'bg-brand-success-500',
  'bg-emerald-600': 'bg-brand-success-600',
  'text-emerald-600': 'text-brand-success-600',

  // Danger (Red → brand-danger)
  'bg-red-500': 'bg-brand-danger-500',
  'bg-red-600': 'bg-brand-danger-600',
  'bg-red-700': 'bg-brand-danger-700',
  'hover:bg-red-600': 'hover:bg-brand-danger-600',
  'active:bg-red-700': 'active:bg-brand-danger-700',
  'text-red-500': 'text-brand-danger-500',
  'text-red-600': 'text-brand-danger-600',
  'text-red-700': 'text-brand-danger-700',
  'border-red-500': 'border-brand-danger-500',
  'border-red-600': 'border-brand-danger-600',

  // Accent/Warning (Orange/Yellow → brand-accent)
  'bg-orange-500': 'bg-brand-accent-500',
  'bg-orange-600': 'bg-brand-accent-600',
  'bg-orange-700': 'bg-brand-accent-700',
  'hover:bg-orange-600': 'hover:bg-brand-accent-600',
  'text-orange-500': 'text-brand-accent-500',
  'text-orange-600': 'text-brand-accent-600',
  'text-orange-700': 'text-brand-accent-700',
  'border-orange-500': 'border-brand-accent-500',
  'border-orange-600': 'border-brand-accent-600',

  'bg-yellow-500': 'bg-brand-accent-500',
  'bg-yellow-600': 'bg-brand-accent-600',
  'text-yellow-600': 'text-brand-accent-600',
  'border-yellow-600': 'border-brand-accent-600',

  'bg-amber-500': 'bg-brand-accent-500',
  'bg-amber-600': 'bg-brand-accent-600',
  'text-amber-600': 'text-brand-accent-600',
};

// Tier 1 files - Safe for automated replacement
const TIER_1_FILES = [
  'src/components/ui/button.tsx',
  'src/components/ui/badge.tsx',
  // Add more as confidence grows
];

// Tier 2 files - Manual review required (documented for reference)
const TIER_2_FILES = [
  'src/components/statistic-card-7.tsx',
  'src/components/statistic-card-14.tsx',
  'src/components/ui/metric-card.tsx',
  'src/app/(main)/(ops)/analytics/**/*.tsx',
  'src/components/ai/**/*.tsx',
  'src/components/dashboard/**/*.tsx',
  // These require semantic analysis
];

interface MigrationResult {
  file: string;
  replacements: number;
  changes: Array<{ from: string; to: string; count: number }>;
}

/**
 * Create backup of file before modification
 */
function createBackup(filePath: string): void {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const backupPath = path.join(BACKUP_DIR, path.basename(filePath));
  fs.copyFileSync(filePath, backupPath);
  console.log(`${colors.cyan}📁 Backup created: ${backupPath}${colors.reset}`);
}

/**
 * Migrate colors in a single file
 */
function migrateFile(filePath: string): MigrationResult {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`${colors.yellow}⚠️  File not found: ${filePath}${colors.reset}`);
    return { file: filePath, replacements: 0, changes: [] };
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;

  const changes: Array<{ from: string; to: string; count: number }> = [];
  let totalReplacements = 0;

  // Apply each safe replacement
  for (const [oldColor, newColor] of Object.entries(SAFE_REPLACEMENTS)) {
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${oldColor}\\b`, 'g');
    const matches = content.match(regex);

    if (matches && matches.length > 0) {
      content = content.replace(regex, newColor);
      changes.push({ from: oldColor, to: newColor, count: matches.length });
      totalReplacements += matches.length;
    }
  }

  // Only write if changes were made
  if (totalReplacements > 0 && !DRY_RUN) {
    createBackup(fullPath);
    fs.writeFileSync(fullPath, content, 'utf-8');
  }

  return { file: filePath, replacements: totalReplacements, changes };
}

/**
 * Main migration function
 */
async function migrate(): Promise<void> {
  console.log(`${colors.bright}${colors.blue}
╔═══════════════════════════════════════════════════════════╗
║   Colosseum Color Migration Script                       ║
║   Safe, semantic color replacements                       ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);

  if (DRY_RUN) {
    console.log(`${colors.yellow}🔍 DRY RUN MODE - No files will be modified${colors.reset}\n`);
  }

  console.log(`${colors.cyan}📋 Tier 1 Files (Safe for automation):${colors.reset}`);
  TIER_1_FILES.forEach(f => console.log(`   • ${f}`));
  console.log();

  console.log(`${colors.yellow}⚠️  Tier 2 Files (Manual review required):${colors.reset}`);
  console.log(`   ${TIER_2_FILES.length} patterns require manual semantic analysis`);
  console.log(`   See COMPONENT-AUDIT-REPORT.md for details\n`);

  console.log(`${colors.cyan}🎨 Safe Replacements Configured:${colors.reset}`);
  console.log(`   ${Object.keys(SAFE_REPLACEMENTS).length} color patterns\n`);

  console.log(`${colors.bright}Starting migration...${colors.reset}\n`);

  const results: MigrationResult[] = [];

  // Process Tier 1 files
  for (const filePath of TIER_1_FILES) {
    console.log(`${colors.cyan}Processing: ${filePath}${colors.reset}`);
    const result = migrateFile(filePath);
    results.push(result);

    if (result.replacements > 0) {
      console.log(`${colors.green}✓ ${result.replacements} replacements made${colors.reset}`);
      result.changes.forEach(change => {
        console.log(`  ${change.from} → ${change.to} (${change.count}x)`);
      });
    } else {
      console.log(`${colors.yellow}• No changes needed${colors.reset}`);
    }
    console.log();
  }

  // Summary
  console.log(`${colors.bright}${colors.blue}
╔═══════════════════════════════════════════════════════════╗
║   Migration Summary                                       ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);

  const totalFiles = results.length;
  const filesChanged = results.filter(r => r.replacements > 0).length;
  const totalReplacements = results.reduce((sum, r) => sum + r.replacements, 0);

  console.log(`${colors.cyan}Files processed:${colors.reset} ${totalFiles}`);
  console.log(`${colors.green}Files changed:${colors.reset} ${filesChanged}`);
  console.log(`${colors.green}Total replacements:${colors.reset} ${totalReplacements}\n`);

  if (filesChanged > 0 && !DRY_RUN) {
    console.log(`${colors.green}✓ Migration complete!${colors.reset}`);
    console.log(`${colors.cyan}📁 Backups saved to: ${BACKUP_DIR}${colors.reset}\n`);
  }

  // Next steps
  console.log(`${colors.bright}${colors.yellow}Next Steps:${colors.reset}`);
  console.log(`1. Run: ${colors.cyan}npm run lint${colors.reset} to check for issues`);
  console.log(`2. Run: ${colors.cyan}npx tsc --noEmit${colors.reset} to verify TypeScript`);
  console.log(`3. Review changes in your editor`);
  console.log(`4. Test visually in browser`);
  console.log(`5. Manually handle Tier 2 files (see COMPONENT-AUDIT-REPORT.md)\n`);

  if (DRY_RUN) {
    console.log(`${colors.yellow}Re-run without --dry-run to apply changes${colors.reset}\n`);
  }
}

// Run migration
migrate().catch(error => {
  console.error(`${colors.red}Error during migration:${colors.reset}`, error);
  process.exit(1);
});
