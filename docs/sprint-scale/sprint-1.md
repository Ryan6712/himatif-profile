# 🚀 SPRINT 1 - COMPLETE GUIDE (Prisma 7)
## HIMATIF Profile v2.0 - Data Migration & Seeding

**Status:** Ready after Sprint 0 complete  
**Duration:** 1-2 weeks  
**Team Level:** Intermediate (menggunakan Prisma 7 + file parsing)  
**Prisma Version:** 7.x (Latest)  
**Goal:** Migrate semua data JSON → MySQL, create seed script, validate data

**Prerequisite:** Sprint 0 MUST be complete (Prisma 7 setup, database ready)

---

## 📑 Table of Contents

1. [Sprint 1 Overview](#sprint-1-overview)
2. [Key Concepts](#key-concepts)
3. [Detailed Tasks](#detailed-tasks)
4. [Code Examples](#code-examples)
5. [Verification & Testing](#verification--testing)
6. [Troubleshooting](#troubleshooting)

---

# Part 1: SPRINT 1 OVERVIEW

## 🎯 Goals

Sprint 1 fokus pada:
1. Parse JSON files yang existing (`devisi.json`, `member.json`, `proker.json`)
2. Transform data ke format Prisma 7
3. Create seed script (`prisma/seed.ts`)
4. Insert Organization singleton record
5. Populate semua tables dengan data JSON
6. Validate data integrity
7. Archive/backup JSON files
8. Persiapan team untuk Sprint 2 (public pages pakai database)

## 📊 What Happens in Sprint 1

```
START (dari Sprint 0 Prisma 7):
Database kosong (5 empty tables)
          ↓
Task 1: Read JSON files
          ↓
Task 2: Create Organization record
          ↓
Task 3: Parse & transform Devisi data
          ↓
Task 4: Parse & transform Member data
          ↓
Task 5: Parse & transform Proker data
          ↓
Task 6: Run seed script dengan Prisma 7
          ↓
END (Sprint 1):
Database penuh data, siap untuk Sprint 2
```

## 📁 File Changes

```
Sprint 1 Deliverables:
├── prisma/seed.ts              ✅ NEW - Main seeding script (Prisma 7)
├── src/lib/
│   └── utils/
│       └── slug.ts             ✅ NEW - Slug generator utility
├── static/data/                ✓ (existing, will read)
├── archive/                    ✅ NEW - Backup folder
└── MIGRATION_LOG.md            ✅ NEW - Documentation
```

---

# Part 2: KEY CONCEPTS

## 🔑 Prisma 7 Seed Script

Seed script adalah file TypeScript yang:
- Runs saat `npm run prisma:db:seed`
- Bisa parse JSON, transform, insert ke database (dengan Prisma 7 client)
- Useful untuk initial data atau testing
- Can run multiple times (perlu idempotent logic)
- Prisma 7 has improved performance & error messages

**Seed Script Flow:**
```
1. Delete existing data (optional, untuk reset)
2. Create Organization record (Prisma 7)
3. Parse JSON files
4. Transform data format
5. Insert into database (Prisma 7)
6. Validate counts
7. Log success/errors
```

## 📝 Data Transformation

JSON format (lama):
```json
{
  "id": 1,
  "nama": "Kominfo",
  "deskripsi": "..."
}
```

Prisma 7 format (baru):
```typescript
{
  nama: "Kominfo",
  namaLengkap: "Kominfo - Komunikasi dan Informasi",
  deskripsi: "...",
  logoUrl: "url",
  thumbnailUrl: "url"
}
```

## 🔗 Relationships (Prisma 7)

- **Member → Devisi:** Foreign key relationship
  - Regular members harus punya devisiId
  - Alumni bisa null (devisiId = null)

- **Organization:** Singleton (hanya 1 record)
  - id = 1 always
  - Create once, update in Sprint 3

## 📌 Slug Generation

Proker memerlukan slug untuk URL:
- Input: "Upgrading Organisasi 2024"
- Output: "upgrading-organisasi-2024"
- Rules:
  - Lowercase
  - Replace spaces dengan dash
  - Remove special characters
  - Unique per record

---

# Part 3: DETAILED TASKS

## ✅ Task 1: Read Existing JSON Files (15 minutes)

### Step 1.1: Examine Current Data

```bash
cd E:\serius-cuy\himatif_profile

cat static/data/devisi.json | head -20
cat static/data/member.json | head -20
cat static/data/proker.json | head -20
```

### Step 1.2: Understand Data Structure

**devisi.json:**
```json
{
  "id": 1,
  "nama": "Kominfo",
  "namaLengkap": "Kominfo - Komunikasi dan Informasi",
  "logoUrl": "...",
  "thumbnailUrl": "...",
  "deskripsi": "..."
}
```

**member.json:**
```json
{
  "id": 1,
  "name": "Zaskia Az-zara Dewi",
  "position": "Ketua Umum",
  "imageUrl": "...",
  "devisiId": 1
}
```

**proker.json:**
```json
{
  "id": 1,
  "title": "Upgrading Organisasi",
  "date": "2024-01-15",
  "thumbnail": "...",
  "description": "...",
  "content": "Blog content here"
}
```

---

## ✅ Task 2: Create Slug Utility (20 minutes)

### Create file: src/lib/utils/slug.ts

```typescript
/**
 * Generate URL-friendly slug from text (works with Prisma 7)
 * @param text - Input text
 * @returns slug (lowercase, dash-separated)
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Make slug unique by appending number if duplicate
 * Compatible with Prisma 7 unique constraint
 */
export function makeSlugUnique(
  slug: string,
  existingSlugs: string[]
): string {
  if (!existingSlugs.includes(slug)) {
    return slug;
  }

  let counter = 2;
  while (existingSlugs.includes(`${slug}-${counter}`)) {
    counter++;
  }

  return `${slug}-${counter}`;
}
```

---

## ✅ Task 3: Create Prisma 7 Seed Script (1-2 hours)

### Create file: prisma/seed.ts

**Key changes for Prisma 7:**
- Updated Prisma 7 client import
- Improved error handling
- Better type inference

```typescript
// prisma/seed.ts
// Prisma 7 Database seeding script

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { generateSlug, makeSlugUnique } from '../src/lib/utils/slug';

const prisma = new PrismaClient();

// ============================================
// Helper function: Load JSON file
// ============================================
function loadJSON<T>(filePath: string): T {
  const fullPath = path.join(process.cwd(), filePath);
  const data = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(data);
}

// ============================================
// Type definitions (from JSON structure)
// ============================================
interface DevisiJSON {
  id: number;
  nama: string;
  namaLengkap: string;
  logoUrl: string;
  thumbnailUrl: string;
  deskripsi: string;
}

interface MemberJSON {
  id: number;
  name: string;
  position: string;
  imageUrl: string;
  devisiId?: number | null;
  memberType?: string;
}

interface ProkerJSON {
  id: number;
  title: string;
  date: string;
  thumbnail: string;
  description: string;
  content?: string;
}

// ============================================
// Main seed function
// ============================================
async function main() {
  console.log('🌱 Starting database seed (Prisma 7)...\n');

  try {
    // Step 1: Create Organization
    console.log('📋 Creating Organization record...');
    await seedOrganization();
    console.log('✅ Organization created\n');

    // Step 2: Seed Devisi
    console.log('📁 Seeding Devisi...');
    const devisiMap = await seedDevisi();
    console.log(`✅ ${devisiMap.size} Devisi created\n`);

    // Step 3: Seed Member
    console.log('👥 Seeding Member...');
    await seedMember(devisiMap);
    console.log('✅ Members created\n');

    // Step 4: Seed Proker
    console.log('📢 Seeding Proker...');
    await seedProker();
    console.log('✅ Proker created\n');

    // Step 5: Validate
    console.log('🔍 Validating data...');
    await validateData();
    console.log('✅ Data validation passed\n');

    console.log('🎉 Database seed completed successfully! (Prisma 7)');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================
// Seed functions (Prisma 7 compatible)
// ============================================

async function seedOrganization() {
  // Delete existing
  await prisma.organization.deleteMany({});

  // Create singleton Organization
  await prisma.organization.create({
    data: {
      id: 1,
      nama: 'HIMATIF',
      namaLengkap: 'Himpunan Mahasiswa Informatika ITB Yadika',
      visi: 'Menjadi organisasi yang berdampak positif bagi mahasiswa informatika',
      misi: '1. Mengembangkan softskill\n2. Memberikan wadah networking\n3. Mempromosikan informatika',
      tujuan: 'Membentuk generasi informatikawan yang kompeten dan berkarakter',
      logoSmall: 'https://example.com/logo-small.png',
      logoBesar: 'https://example.com/logo-large.png'
    }
  });
}

async function seedDevisi(): Promise<Map<number, string>> {
  const devisiData = loadJSON<DevisiJSON[]>('static/data/devisi.json');

  // Delete existing
  await prisma.devisi.deleteMany({});

  const devisiMap = new Map<number, string>();

  for (const devisi of devisiData) {
    const created = await prisma.devisi.create({
      data: {
        nama: devisi.nama,
        namaLengkap: devisi.namaLengkap,
        logoUrl: devisi.logoUrl,
        thumbnailUrl: devisi.thumbnailUrl,
        deskripsi: devisi.deskripsi
      }
    });

    devisiMap.set(devisi.id, String(created.id));
    console.log(`  ✓ ${devisi.nama}`);
  }

  return devisiMap;
}

async function seedMember(devisiMap: Map<number, string>) {
  const memberData = loadJSON<MemberJSON[]>('static/data/member.json');

  // Delete existing
  await prisma.member.deleteMany({});

  for (const member of memberData) {
    let memberType: 'BPH' | 'KADIV' | 'REGULAR' | 'ALUMNI' = 'REGULAR';
    if (member.memberType) {
      memberType = member.memberType as any;
    }
    if (member.position.toLowerCase().includes('ketua')) {
      memberType = 'BPH';
    }

    let devisiId: number | null = null;
    if (member.devisiId && devisiMap.has(member.devisiId)) {
      devisiId = parseInt(devisiMap.get(member.devisiId)!);
    }

    await prisma.member.create({
      data: {
        name: member.name,
        position: member.position,
        imageUrl: member.imageUrl,
        memberType: memberType,
        devisiId: devisiId
      }
    });

    console.log(`  ✓ ${member.name} (${memberType})`);
  }
}

async function seedProker() {
  const prokerData = loadJSON<ProkerJSON[]>('static/data/proker.json');

  // Delete existing
  await prisma.proker.deleteMany({});

  const slugs: string[] = [];

  for (const proker of prokerData) {
    let slug = generateSlug(proker.title);
    slug = makeSlugUnique(slug, slugs);
    slugs.push(slug);

    const date = new Date(proker.date);

    await prisma.proker.create({
      data: {
        title: proker.title,
        date: date,
        thumbnail: proker.thumbnail,
        description: proker.description,
        content: proker.content || proker.description,
        slug: slug,
        publishedAt: date
      }
    });

    console.log(`  ✓ ${proker.title} (slug: ${slug})`);
  }
}

async function validateData() {
  const orgCount = await prisma.organization.count();
  const devisiCount = await prisma.devisi.count();
  const memberCount = await prisma.member.count();
  const prokerCount = await prisma.proker.count();

  console.log(`  Organization: ${orgCount} (expected: 1)`);
  console.log(`  Devisi: ${devisiCount}`);
  console.log(`  Member: ${memberCount}`);
  console.log(`  Proker: ${prokerCount}`);

  if (orgCount !== 1) {
    throw new Error('Organization count is not 1!');
  }

  const membersWithoutDevisi = await prisma.member.findMany({
    where: { devisiId: null }
  });
  console.log(`  Members without Devisi: ${membersWithoutDevisi.length} (alumni)`);

  const prokers = await prisma.proker.findMany({
    select: { slug: true }
  });
  const slugSet = new Set(prokers.map(p => p.slug));
  if (slugSet.size !== prokers.length) {
    throw new Error('Duplicate slugs found!');
  }

  console.log('  All validations passed ✓');
}

// ============================================
// Run seed
// ============================================
main().catch((e) => {
  console.error('Error in seed:', e);
  process.exit(1);
});
```

---

## ✅ Task 4: Run Seed Script (30 minutes)

### Step 4.1: Test Seed with Prisma 7

```bash
npm run prisma:db:seed

# Expected output:
# 🌱 Starting database seed (Prisma 7)...
# 📋 Creating Organization record...
# ✅ Organization created
# 📁 Seeding Devisi...
# ✅ 3 Devisi created
# 👥 Seeding Member...
# ✅ Members created
# 📢 Seeding Proker...
# ✅ Proker created
# 🔍 Validating data...
# ✅ Data validation passed
# 🎉 Database seed completed successfully! (Prisma 7)
```

### Step 4.2: Verify in Prisma 7 Studio

```bash
npm run prisma:studio

# Check each table:
# - Organization: 1 record
# - Devisi: All divisions
# - Member: All members
# - Proker: All programs with slugs
# Prisma 7 Studio has improved UI
```

### Step 4.3: Manual Query Verification

```bash
mysql -u[user] -p[password] himatif_profile_dev

# Inside MySQL:
SELECT COUNT(*) FROM Organization;
SELECT COUNT(*) FROM Devisi;
SELECT COUNT(*) FROM Member;
SELECT COUNT(*) FROM Proker;
```

---

## ✅ Task 5: Archive JSON Files (15 minutes)

```bash
mkdir -p archive

cp static/data/devisi.json archive/devisi.json.bak
cp static/data/member.json archive/member.json.bak
cp static/data/proker.json archive/proker.json.bak

# Create MIGRATION_LOG.md
cat > MIGRATION_LOG.md << 'EOF'
# Data Migration Log - Sprint 1 (Prisma 7)

## Date: [TODAY]
## Tech: Prisma 7

### Summary
- Migrated JSON data to MySQL using Prisma 7
- Created seed script: prisma/seed.ts
- Validated data integrity

### Seed Command
```bash
npm run prisma:db:seed
```

### Validation Passed
- ✅ All tables populated
- ✅ Organization singleton verified
- ✅ Member-Devisi relationships valid
- ✅ Proker slugs unique

### Next Steps
- Sprint 2: Refactor public pages to use database
EOF
```

---

## ✅ Task 6: Test Seed Idempotency (20 minutes)

```bash
# Run seed multiple times
npm run prisma:db:seed
# Check Prisma Studio - data exists

npm run prisma:db:seed
# Run again - should delete & recreate (no duplicates)

npm run prisma:db:seed
# Run third time - should work same (idempotent)
```

---

# Part 4: CODE EXAMPLES

## 🔧 Example 1: Simple Slug Generator

```typescript
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

slugify("Upgrading Organisasi 2024!")
// Returns: "upgrading-organisasi-2024"
```

## 🔧 Example 2: Date Parsing with Prisma 7

```typescript
function parseDate(dateStr: any): Date {
  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr === 'string') return new Date(dateStr);
  return new Date();
}
```

## 🔧 Example 3: Member Type Inference

```typescript
function inferMemberType(position: string): 'BPH' | 'KADIV' | 'REGULAR' {
  const pos = position.toLowerCase();
  if (pos.includes('ketua') || pos.includes('bendahara')) {
    return 'BPH';
  }
  if (pos.includes('kepala') || pos.includes('head')) {
    return 'KADIV';
  }
  return 'REGULAR';
}
```

---

# Part 5: VERIFICATION & TESTING

## ✅ Verification Checklist

### Seed Script (Prisma 7)
- [ ] `prisma/seed.ts` created (200+ lines)
- [ ] `src/lib/utils/slug.ts` created
- [ ] Uses Prisma 7 client
- [ ] `npm run prisma:db:seed` runs without errors
- [ ] No TypeScript compilation errors

### Data Integrity
- [ ] Organization: exactly 1 record
- [ ] Devisi: all records present
- [ ] Member: all records present
- [ ] Proker: all records present
- [ ] No duplicate slugs
- [ ] All Member-Devisi relationships valid

### Backup & Archive
- [ ] `archive/` folder created with 3 .bak files
- [ ] `MIGRATION_LOG.md` created
- [ ] All files committed to git

### Seed Idempotency
- [ ] Run `npm run prisma:db:seed` 3 times
- [ ] No errors on subsequent runs
- [ ] Data consistent (no duplicates)

---

# Part 6: TROUBLESHOOTING

## 🐛 Common Issues (Prisma 7)

### Issue 1: "Cannot find module 'ts-node/esm' (Prisma 7)"
**Solution:**
```bash
npm install -D ts-node
npm install -D @types/node
```

### Issue 2: "Foreign key constraint failed (Prisma 7)"
**Solution:**
```typescript
// Verify devisiId exists before creating member:
if (member.devisiId && !devisiMap.has(member.devisiId)) {
  member.devisiId = null;
}
```

### Issue 3: "Duplicate Proker slug error"
**Solution:**
```typescript
slug = makeSlugUnique(slug, existingSlugs);
```

### Issue 4: "Prisma 7 seed times out"
**Solution:**
```bash
# Increase timeout or optimize queries
# Add logging to see progress
```

---

## 📝 Sprint 1 Completion Checklist

- [ ] Seed script runs: `npm run prisma:db:seed` ✅
- [ ] All tables populated from JSON
- [ ] Organization verified (1 record)
- [ ] Proker slugs unique
- [ ] Member relationships valid
- [ ] Backup created & MIGRATION_LOG.md documented
- [ ] Changes committed & pushed
- [ ] Ready for Sprint 2 ✅

---

**Sprint 1 Ready! (Prisma 7)** 🚀