import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Mapping from lucide-react to @tabler/icons-react
const iconMapping = {
  // Common icons
  'Plus': 'IconPlus',
  'PlusCircle': 'IconCirclePlus',
  'PlusCircleIcon': 'IconCirclePlus',
  'Search': 'IconSearch',
  'X': 'IconX',
  'Check': 'IconCheck',
  'CheckCircle': 'IconCircleCheck',
  'ChevronRight': 'IconChevronRight',
  'ChevronLeft': 'IconChevronLeft',
  'ChevronDown': 'IconChevronDown',
  'ChevronUp': 'IconChevronUp',
  'ChevronsUpDown': 'IconChevronsUpDown',
  'MoreHorizontal': 'IconDots',
  'MoreVertical': 'IconDotsVertical',

  // Navigation & Layout
  'LayoutDashboard': 'IconLayoutDashboard',
  'Menu': 'IconMenu2',
  'Home': 'IconHome',
  'Settings': 'IconSettings',
  'Command': 'IconTerminal2',

  // Data & Documents
  'File': 'IconFile',
  'FileText': 'IconFileText',
  'Files': 'IconFiles',
  'Folder': 'IconFolder',
  'Download': 'IconDownload',
  'Upload': 'IconUpload',
  'Database': 'IconDatabase',
  'ClipboardList': 'IconClipboard',
  'Clipboard': 'IconClipboard',
  'ReceiptText': 'IconReceipt',
  'Receipt': 'IconReceipt',

  // Users & People
  'Users': 'IconUsers',
  'User': 'IconUser',
  'CircleUser': 'IconUserCircle',
  'UserCircle': 'IconUserCircle',

  // Finance & Money
  'DollarSign': 'IconCurrencyDollar',
  'Banknote': 'IconCash',
  'CreditCard': 'IconCreditCard',
  'TrendingUp': 'IconTrendingUp',
  'TrendingDown': 'IconTrendingDown',

  // Charts & Analytics
  'ChartBar': 'IconChartBar',
  'BarChart': 'IconChartBar',
  'BarChart3': 'IconChartHistogram',
  'Activity': 'IconActivity',
  'Gauge': 'IconGauge',

  // Communication
  'Mail': 'IconMail',
  'MailIcon': 'IconMail',
  'MessageSquare': 'IconMessageSquare',
  'MessageSquareDot': 'IconMessageCircle',
  'MessageCircle': 'IconMessageCircle',

  // Shopping & Commerce
  'ShoppingBag': 'IconShoppingBag',
  'ShoppingCart': 'IconShoppingCart',

  // Actions & UI
  'Edit': 'IconEdit',
  'Trash': 'IconTrash',
  'Trash2': 'IconTrash',
  'Save': 'IconDeviceFloppy',
  'Copy': 'IconCopy',
  'Eye': 'IconEye',
  'EyeOff': 'IconEyeOff',
  'Lock': 'IconLock',
  'Unlock': 'IconLockOpen',
  'LogOut': 'IconLogout',
  'LogIn': 'IconLogin',

  // Arrows & Directions
  'ArrowRight': 'IconArrowRight',
  'ArrowLeft': 'IconArrowLeft',
  'ArrowUp': 'IconArrowUp',
  'ArrowDown': 'IconArrowDown',
  'ArrowUpRight': 'IconArrowUpRight',
  'SquareArrowUpRight': 'IconExternalLink',
  'ExternalLink': 'IconExternalLink',

  // Status & Alerts
  'AlertCircle': 'IconAlertCircle',
  'AlertTriangle': 'IconAlertTriangle',
  'Info': 'IconInfoCircle',
  'CircleHelp': 'IconHelp',
  'HelpCircle': 'IconHelp',

  // Time & Calendar
  'Calendar': 'IconCalendar',
  'Clock': 'IconClock',

  // Misc
  'Sun': 'IconSun',
  'Moon': 'IconMoon',
  'Star': 'IconStar',
  'Heart': 'IconHeart',
  'Fingerprint': 'IconFingerprint',
  'Kanban': 'IconLayoutKanban',
  'GraduationCap': 'IconSchool',
  'Forklift': 'IconTruckDelivery',
  'Bell': 'IconBell',
  'Filter': 'IconFilter',
  'SlidersHorizontal': 'IconAdjustmentsHorizontal',
  'RefreshCw': 'IconRefresh',
  'Loader2': 'IconLoader2',
  'Loader': 'IconLoader',
  'EllipsisVertical': 'IconDotsVertical',
  'Ellipsis': 'IconDots',
  'MapPin': 'IconMapPin',
  'Building': 'IconBuilding',
  'Phone': 'IconPhone',
  'Percent': 'IconPercentage',
  'Hash': 'IconHash',
  'Link': 'IconLink',
  'Image': 'IconPhoto',
  'Paperclip': 'IconPaperclip',
  'Tag': 'IconTag',
  'Zap': 'IconBolt',
};

function replaceIconsInFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;

  // Check if file imports from lucide-react
  if (!content.includes('from "lucide-react"') && !content.includes("from 'lucide-react'")) {
    return false;
  }

  console.log(`Processing: ${filePath}`);

  // Replace import statement
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*["']lucide-react["'];?/g;
  content = content.replace(importRegex, (match, imports) => {
    modified = true;
    const importList = imports.split(',').map(i => i.trim()).filter(Boolean);
    const mappedImports = importList.map(imp => {
      // Handle "type LucideIcon" or similar type imports
      if (imp.startsWith('type ')) {
        const typeName = imp.replace('type ', '').trim();
        if (typeName === 'LucideIcon') {
          return 'type Icon';
        }
        return imp; // Keep other type imports as-is
      }
      return iconMapping[imp] || imp;
    });

    return `import { ${mappedImports.join(', ')} } from "@tabler/icons-react";`;
  });

  // Replace type annotations
  content = content.replace(/:\s*LucideIcon/g, ': Icon');
  content = content.replace(/<LucideIcon>/g, '<Icon>');

  // Replace icon usage in JSX - add size and stroke props
  Object.entries(iconMapping).forEach(([lucide, tabler]) => {
    // Pattern 1: <IconName />
    const selfClosingRegex = new RegExp(`<${lucide}\\s*/>`, 'g');
    content = content.replace(selfClosingRegex, `<${tabler} size={20} stroke={2} />`);

    // Pattern 2: <IconName className="..." />
    const withClassRegex = new RegExp(`<${lucide}\\s+className=`, 'g');
    content = content.replace(withClassRegex, `<${tabler} size={20} stroke={2} className=`);

    // Pattern 3: <IconName ... /> with other props
    const withPropsRegex = new RegExp(`<${lucide}\\s+(?!size)`, 'g');
    content = content.replace(withPropsRegex, `<${tabler} size={20} stroke={2} `);
  });

  if (modified) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Updated: ${filePath}`);
    return true;
  }

  return false;
}

function processDirectory(dir, stats = { processed: 0, updated: 0 }) {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules, .git, .next, etc.
      if (['node_modules', '.git', '.next', 'dist', 'build'].includes(entry)) {
        continue;
      }
      processDirectory(fullPath, stats);
    } else if (stat.isFile() && (entry.endsWith('.tsx') || entry.endsWith('.ts') || entry.endsWith('.jsx') || entry.endsWith('.js'))) {
      stats.processed++;
      if (replaceIconsInFile(fullPath)) {
        stats.updated++;
      }
    }
  }

  return stats;
}

// Start processing from src directory
const srcDir = join(process.cwd(), 'src');
console.log('Starting icon replacement...\n');
const stats = processDirectory(srcDir);
console.log(`\n✓ Complete! Processed ${stats.processed} files, updated ${stats.updated} files.`);
