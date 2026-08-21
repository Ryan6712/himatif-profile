# 🚀 SPRINT 0 - COMPLETE GUIDE (Prisma 7)
## HIMATIF Profile v2.0 - Database Setup & Foundation

**Status:** Ready to Start  
**Duration:** 1 week  
**Team Level:** Beginner-friendly (semua step dijelasin detail)  
**Prisma Version:** 7.x (Latest)  
**Goal:** Database ready + Prisma 7 configured + Team aligned

---

## 📑 Table of Contents

1. [Pre-Sprint Requirements](#pre-sprint-requirements)
2. [Architecture Overview](#architecture-overview)
3. [8 Detailed Tasks](#8-detailed-tasks)
4. [Code Examples (9 Files)](#code-examples-9-files)
5. [Team Setup Workflow](#team-setup-workflow)
6. [Verification Checklist](#verification-checklist)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [Prisma Schema](#prisma-schema)

---

# Part 1: PRE-SPRINT REQUIREMENTS

## 📋 Pre-Sprint Checklist ✅

Sebelum mulai, pastikan semua sudah siap:

### Hardware & Software
- [ ] **Node.js v18+** - Check: `node --version` (harus >= 18.x.x)
- [ ] **npm** - Check: `npm --version` (usually comes with Node)
- [ ] **Git** - Check: `git --version`
- [ ] **MySQL 8.0+** - Install locally OR use Docker
- [ ] **VS Code** - (recommended editor)
- [ ] **SvelteKit project** - sudah ada di `E:\serius-cuy\himatif_profile`

### MySQL Setup - Pilih Salah Satu

#### Option A: Local MySQL Installation
```bash
# 1. Download & install dari: https://dev.mysql.com/downloads/mysql/
# 2. Start MySQL service
# 3. Verify running:
mysql --version
# Output: mysql  Ver 8.0.x for Windows/Linux/Mac
```

#### Option B: Docker MySQL (Recommended for beginners)
```bash
# 1. Install Docker Desktop: https://www.docker.com/products/docker-desktop
# 2. Run this command ONCE:
docker run --name himatif-mysql -e MYSQL_ROOT_PASSWORD=password123 -e MYSQL_DATABASE=himatif_profile_dev -p 3306:3306 -d mysql:8.0

# 3. Verify running:
docker ps
# Should show: himatif-mysql container running

# 4. Connect to MySQL:
docker exec -it himatif-mysql mysql -uroot -ppassword123

# 5. Inside MySQL:
mysql> SHOW DATABASES;
# Should see: himatif_profile_dev
```

### Knowledge Check
- [ ] Team paham Git workflow (commit, push, PR)
- [ ] Team bisa buka terminal/PowerShell
- [ ] Team familiar dengan npm (install, scripts)
- [ ] Team siap untuk 1 minggu setup (bukan coding features)

### Access & Credentials
- [ ] Everyone has GitHub access
- [ ] Everyone has MySQL credentials (atau Docker running)
- [ ] Everyone can access Discord/Slack
- [ ] Tech lead (Ryza) confirmed ready

---

# Part 2: ARCHITECTURE OVERVIEW

## 🏗️ Tech Stack & Requirements

### Database & ORM
- **Database:** MySQL 8.0+
- **ORM:** Prisma 7.x (Latest)
- **Password Hashing:** Bcrypt
- **Auth Type:** Admin-only (no member login)

### Key Changes in Prisma 7
- Modern query API improvements
- Better error messages
- Enhanced TypeScript support
- Performance improvements
- Latest features & stability

### Project Structure
```
himatif_profile/
├── prisma/
│   ├── schema.prisma              ✅ Create in Task 3
│   ├── .env.example               ✅ Create in Task 2b
│   ├── migrations/                ✅ Auto-generated in Task 4
│   └── seed.ts                    🟡 Sprint 1
│
├── src/
│   ├── lib/
│   │   ├── db.ts                  ✅ Create in Task 5
│   │   ├── auth.ts                ✅ Create in Task 6
│   │   └── server/
│   │
│   ├── routes/
│   │   ├── (public)/
│   │   │   ├── devisi/
│   │   │   ├── member/
│   │   │   └── proker/
│   │   ├── login/                 🟡 Sprint 3
│   │   ├── admin/                 🟡 Sprint 3+
│   │   └── +layout.svelte
│   │
│   ├── types/
│   │   └── index.ts               ✅ Create in Task 7
│   │
│   ├── app.d.ts                   ✅ Update in Task 6b
│   └── hooks.server.ts            ✅ Create in Task 6c
│
├── .env.local                     ⚠️ DO NOT COMMIT
├── .env.example                   🟡 Manual reference
├── package.json                   ✅ Update in Task 8
└── .gitignore                     ✅ Check .env.local there

Legend: ✅ = Do now | 🟡 = Later | ⚠️ = Important
```

## 📊 Data Models (Prisma)

### Organization (Singleton)
```
id              Integer (1 only)
nama            String (HIMATIF)
namaLengkap     String (Himpunan Mahasiswa...)
visi            Text
misi            Text
tujuan          Text
logoSmall       String (URL)
logoBesar       String (URL)
```

### Devisi (Departments)
```
id              Integer (auto)
nama            String unique (Kominfo, Humas, DBM)
namaLengkap     String
logoUrl         String
thumbnailUrl    String
deskripsi       Text
members         Relation to Member[]
```

### Member (People)
```
id              Integer (auto)
name            String unique
position        String
imageUrl        String
memberType      Enum (BPH, KADIV, REGULAR, ALUMNI)
devisiId        Integer? (nullable for alumni)
devisi          Relation to Devisi?
```

### Proker (Programs with Blog)
```
id              Integer (auto)
title           String unique
date            DateTime
thumbnail       String (URL)
description     Text (short desc)
content         LongText (full blog markdown)
slug            String unique (URL-friendly)
publishedAt     DateTime? (null = draft)
```

### AdminAccount (Auth)
```
id              Integer (auto)
username        String unique
passwordHash    String (bcrypt)
email           String unique
lastLogin       DateTime?
```

---

# Part 3: 8 DETAILED TASKS

## ✅ Task 1: Setup MySQL Database (30 minutes)

### If Using Local MySQL
```bash
# 1. Open MySQL Command Line / MySQL Workbench
# 2. Connect as root user
# 3. Run this command:

CREATE DATABASE himatif_profile_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 4. Verify:
SHOW DATABASES;
# You should see: himatif_profile_dev

# 5. Optional - Create dedicated user:
CREATE USER 'himatif_user'@'localhost' IDENTIFIED BY 'himatif_password_123';
GRANT ALL PRIVILEGES ON himatif_profile_dev.* TO 'himatif_user'@'localhost';
FLUSH PRIVILEGES;
```

### If Using Docker MySQL
```bash
# Already running from pre-sprint
# Connect to container:
docker exec -it himatif-mysql mysql -uroot -ppassword123

# Inside MySQL:
mysql> USE himatif_profile_dev;
mysql> SHOW TABLES;
# Should be empty
```

**Penjelasan:**
- `CHARACTER SET utf8mb4` = support emoji & special characters
- `COLLATE utf8mb4_unicode_ci` = case-insensitive comparison
- Dedicated user = lebih aman dari root

---

## ✅ Task 2: Install & Configure Prisma 7 (45 minutes)

### Step 2.1: Install Dependencies
```bash
# Navigate ke project folder
cd E:\serius-cuy\himatif_profile

# Install Prisma 7 + related packages
npm install @prisma/client@7 prisma@7 bcryptjs marked

# Install dev dependencies
npm install -D @prisma/internals

# Verify installation
npx prisma --version
# Should show: Prisma 7.x.x (contoh: Prisma 7.2.0)
```

**Package explanations:**
- `@prisma/client@7` = Runtime client untuk query database (Prisma 7)
- `prisma@7` = CLI untuk migrations & development (Prisma 7)
- `bcryptjs` = Password hashing library
- `marked` = Markdown parser (untuk Proker blog)
- `@prisma/internals` = Dev dependency untuk Prisma tools

### Step 2.2: Initialize Prisma
```bash
# Initialize Prisma (creates prisma/ folder)
npx prisma init

# Output: Creates:
# - prisma/schema.prisma
# - .env.local
```

### Step 2.3: Configure .env.local

Edit `.env.local` yang baru dibuat:

**For Local MySQL (root user):**
```env
DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/himatif_profile_dev"
```

**For Docker MySQL:**
```env
DATABASE_URL="mysql://root:password123@localhost:3306/himatif_profile_dev"
```

**For Dedicated User:**
```env
DATABASE_URL="mysql://himatif_user:himatif_password_123@localhost:3306/himatif_profile_dev"
```

**Testing:**
```bash
# Verify connection
mysql -u[USERNAME] -p[PASSWORD] -h localhost -e "USE himatif_profile_dev; SHOW TABLES;"
```

### Step 2.4: Create .env.example (Template for Team)

Create file `prisma/.env.example`:

```env
# ====================================
# HIMATIF Profile - Environment Setup
# ====================================
# Each developer needs their own .env.local with credentials
# This is template - DO NOT commit credentials!

# Database Connection
# Format: mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="mysql://USERNAME:PASSWORD@localhost:3306/himatif_profile_dev"

# Examples:
# For root: mysql://root:password123@localhost:3306/himatif_profile_dev
# For user: mysql://himatif_user:password123@localhost:3306/himatif_profile_dev
# For docker: mysql://root:password123@localhost:3306/himatif_profile_dev
```

---

## ✅ Task 3: Create Prisma 7 Schema (1 hour)

Delete semua isi `prisma/schema.prisma`, lalu paste schema lengkap dari [Section: Complete Prisma Schema](#complete-prisma-schema) di bawah.

**Prisma 7 Features Digunakan:**
- Modern syntax (sudah default di 7)
- Enhanced type safety
- Latest field attributes

**Validation:**
```bash
npx prisma validate
# Should show: ✔ Your schema is valid
```

---

## ✅ Task 4: Create Initial Migration (30 minutes)

### Step 4.1: Run Migration
```bash
npx prisma migrate dev --name init

# Output:
# ✔ Created your migrations folder.
# ✔ Created migration: 20240115123456_init
# ✔ Generated Prisma Client (v7)
# ✔ Ran 1 migration
```

### Step 4.2: Verify in MySQL
```bash
# Open MySQL CLI / Workbench:
USE himatif_profile_dev;
SHOW TABLES;

# Should see 5 tables:
# - Organization
# - Devisi
# - Member
# - Proker
# - AdminAccount
# - _prisma_migrations (internal, ignore)

# Check table structure:
DESCRIBE Organization;
DESCRIBE Member;
```

### Step 4.3: Open Prisma Studio
```bash
npx prisma studio

# Opens browser at http://localhost:5555
# Prisma 7 Studio has improved UI & performance
# You can:
# - View all tables & data
# - Add/edit/delete records
# - See relationships visually

# Close with Ctrl+C
```

---

## ✅ Task 5: Create Prisma 7 Database Instance (30 minutes)

### Create file: src/lib/db.ts

```typescript
// src/lib/db.ts
// Prisma 7 Database Client Singleton
// Use this throughout the app (not multiple instances)

import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
```

**Penjelasan:**
- Singleton pattern = 1 instance di seluruh app (tidak boleh banyak)
- `globalThis` = persist across hot reload (dev mode)
- Export default = import di file lain sebagai `import prisma from '$lib/db'`
- Kompatibel dengan Prisma 7

**Usage Example:**
```typescript
// Di route atau anywhere:
import prisma from '$lib/db';

export async function load() {
  const devisiCount = await prisma.devisi.count();
  return { devisiCount };
}
```

---

## ✅ Task 6: Setup Authentication Utilities (1 hour)

### Step 6a: Create src/lib/auth.ts

```typescript
// src/lib/auth.ts
// Password hashing & verification utilities for admin login

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10; // Balans between security & speed

/**
 * Hash password untuk disimpan di database
 * @param password - Plain text password
 * @returns Hashed password (aman untuk DB)
 */
export async function hashPassword(password: string): Promise<string> {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  return hash;
}

/**
 * Verify password saat login
 * @param password - Plain text password dari form
 * @param passwordHash - Hashed password dari database
 * @returns true jika match, false jika tidak
 */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  const isValid = await bcrypt.compare(password, passwordHash);
  return isValid;
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object dengan isValid & error messages
 */
export function validatePassword(password: string): {
  isValid: boolean;
  messages: string[];
} {
  const messages: string[] = [];

  if (password.length < 8) {
    messages.push('Password minimal 8 karakter');
  }
  if (!/[A-Z]/.test(password)) {
    messages.push('Password harus mengandung huruf besar (A-Z)');
  }
  if (!/[a-z]/.test(password)) {
    messages.push('Password harus mengandung huruf kecil (a-z)');
  }
  if (!/[0-9]/.test(password)) {
    messages.push('Password harus mengandung angka (0-9)');
  }

  return {
    isValid: messages.length === 0,
    messages
  };
}

/**
 * Generate random token string
 * @param length - Token length (default 32)
 * @returns Random string
 */
export function generateToken(length: number = 32): string {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    token += charset[randomIndex];
  }

  return token;
}
```

### Step 6b: Update src/app.d.ts

```typescript
// src/app.d.ts
// Global TypeScript type definitions untuk SvelteKit

declare global {
  namespace App {
    interface Locals {
      // Admin user (dari middleware, Sprint 3)
      admin?: {
        id: number;
        username: string;
        email: string;
      };

      // Auth status flag
      isAuthenticated: boolean;
    }
  }
}

export {};
```

### Step 6c: Create src/hooks.server.ts

```typescript
// src/hooks.server.ts
// SvelteKit Server Hooks - runs on every request

import type { Handle } from '@sveltejs/kit';

/**
 * Handle hook: middleware for every server request
 * Will check auth, attach to locals, etc in Sprint 3
 * For now: skeleton
 */
export const handle: Handle = async ({ event, resolve }) => {
  // Placeholder: auth akan di-implement di Sprint 3
  const sessionToken = event.cookies.get('session_token');

  if (sessionToken) {
    // TODO: Verify token, get admin user
    // const admin = await verifyToken(sessionToken);
    // event.locals.admin = admin;
    // event.locals.isAuthenticated = true;
  } else {
    event.locals.isAuthenticated = false;
  }

  return resolve(event);
};
```

---

## ✅ Task 7: Setup TypeScript Types (30 minutes)

### Create file: src/types/index.ts

```typescript
// src/types/index.ts
// Re-export types from Prisma 7 schema

export type {
  Organization,
  Devisi,
  Member,
  MemberType,
  Proker,
  AdminAccount
} from '@prisma/client';

// ============================================
// Custom Types (tambahan)
// ============================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Form validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}
```

**Usage:**
```typescript
import type { Member, ApiResponse } from '$types';

const response: ApiResponse<Member[]> = {
  success: true,
  data: members
};
```

---

## ✅ Task 8: Add NPM Scripts (15 minutes)

### Update package.json

Find `"scripts"` section and add Prisma commands:

```json
{
  "name": "himatif-profile",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write .",
    
    "prisma:studio": "prisma studio",
    "prisma:migrate": "prisma migrate dev",
    "prisma:migrate:prod": "prisma migrate deploy",
    "prisma:db:seed": "node --loader ts-node/esm prisma/seed.ts",
    "prisma:reset": "prisma migrate reset",
    "prisma:generate": "prisma generate",
    "prisma:validate": "prisma validate"
  },
  "devDependencies": {
    "@prisma/internals": "^7.0.0",
    "@sveltejs/adapter-auto": "^3.0.0",
    "@sveltejs/kit": "^2.0.0",
    "@types/node": "^20.0.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.0.0",
    "eslint-plugin-svelte": "^2.0.0",
    "postcss": "^8.0.0",
    "prettier": "^3.0.0",
    "svelte": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  },
  "dependencies": {
    "@prisma/client": "^7.0.0",
    "bcryptjs": "^2.4.3",
    "marked": "^9.0.0"
  }
}
```

**Key change for Prisma 7:**
- `@prisma/client` = `^7.0.0` (v7)
- `@prisma/internals` = `^7.0.0` (v7)

**Testing:**
```bash
npm run prisma:studio
# Opens browser

npm run prisma:validate
# Shows schema validation

npm run prisma:migrate
# Create new migration
```

---

# Part 4: COMPLETE PRISMA SCHEMA

## prisma/schema.prisma

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ============================================
// Organization Profile - Visi, Misi, Tujuan, Logos
// ============================================
model Organization {
  id              Int     @id @default(1)
  nama            String  @default("HIMATIF")
  namaLengkap     String  @default("Himpunan Mahasiswa Informatika ITB Yadika")
  visi            String  @db.Text
  misi            String  @db.Text
  tujuan          String  @db.Text
  logoSmall       String
  logoBesar       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([id])
}

// ============================================
// Division/Department
// ============================================
model Devisi {
  id              Int     @id @default(autoincrement())
  nama            String  @unique
  namaLengkap     String
  logoUrl         String
  thumbnailUrl    String
  deskripsi       String  @db.Text
  members         Member[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([nama])
}

// ============================================
// Member - Staff/Anggota HIMATIF
// ============================================
model Member {
  id              Int     @id @default(autoincrement())
  name            String  @unique
  position        String
  imageUrl        String
  memberType      MemberType @default(REGULAR)
  devisi          Devisi? @relation(fields: [devisiId], references: [id], onDelete: SetNull)
  devisiId        Int?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([memberType])
  @@index([devisiId])
}

enum MemberType {
  BPH
  KADIV
  REGULAR
  ALUMNI
}

// ============================================
// Program Kerja (Work Program)
// ============================================
model Proker {
  id              Int     @id @default(autoincrement())
  title           String  @unique
  date            DateTime
  thumbnail       String
  description     String  @db.Text
  content         String  @db.LongText
  slug            String  @unique
  publishedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([slug])
  @@index([date])
}

// ============================================
// Admin Account - for authentication
// ============================================
model AdminAccount {
  id              Int     @id @default(autoincrement())
  username        String  @unique
  passwordHash    String
  email           String  @unique
  lastLogin       DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

# Part 5: VERIFICATION CHECKLIST

## ✅ Sprint 0 Completion Checklist

After completing all tasks, verify each item:

### Database & Prisma 7
- [ ] MySQL database `himatif_profile_dev` created
- [ ] Can connect via MySQL CLI
- [ ] All 5 tables exist (Organization, Devisi, Member, Proker, AdminAccount)
- [ ] `npx prisma studio` opens successfully (Prisma 7 UI)
- [ ] Can see empty tables in Prisma Studio

### Dependencies Installed (Prisma 7)
- [✅] `npm ls @prisma/client` shows v7.x.x
- [✅] `npm ls prisma` shows v7.x.x
- [✅] `npm ls bcryptjs` shows installed
- [✅] `npm ls marked` shows installed
- [✅] `npx prisma --version` shows v7.x.x ✅

### Code Files Created
- [ ] `prisma/schema.prisma` exists (200+ lines)
- [ ] `.env.local` exists with DATABASE_URL (NOT committed)
- [ ] `prisma/.env.example` exists (template)
- [ ] `src/lib/db.ts` exists with Prisma 7 singleton
- [ ] `src/lib/auth.ts` exists with hash/verify functions
- [ ] `src/hooks.server.ts` exists with Handle hook
- [ ] `src/app.d.ts` updated with Locals interface
- [ ] `src/types/index.ts` exists with exports
- [ ] `package.json` has prisma:* scripts

### Validation & Testing
- [ ] `npm run prisma:validate` passes
- [ ] `npm run prisma:studio` opens at localhost:5555 (Prisma 7)
- [ ] `npm run prisma:migrate` can run
- [ ] `npm run prisma:generate` regenerates Prisma Client (v7)
- [ ] No compilation errors: `npm run build`

### Git & Version Control
- [ ] `.env.local` is in `.gitignore` (NOT committed)
- [ ] All other files committed
- [ ] Changes pushed to repo
- [ ] Team can pull & setup without .env.local

### Team Readiness
- [ ] Tech lead (Ryza) completed all tasks ✅
- [ ] All team members cloned project ✅
- [ ] All team members created .env.local ✅
- [ ] All team members ran `npm install` ✅
- [ ] All team members can open Prisma 7 Studio ✅
- [ ] Weekly standup: "Everyone ready for Sprint 1" ✅

---

# Part 6: TROUBLESHOOTING GUIDE

## 🐛 Common Issues (Prisma 7)

### Issue 1: "Cannot find module '@prisma/client' version 7"
**Cause:** Dependencies not installed or old version  
**Solution:**
```bash
npm install @prisma/client@7 prisma@7
npx prisma generate
npm run build
```

### Issue 2: "Prisma version mismatch"
**Cause:** @prisma/client and prisma versions don't match  
**Solution:**
```bash
# Reinstall both with same version
npm uninstall @prisma/client prisma @prisma/internals
npm install @prisma/client@7 prisma@7
npm install -D @prisma/internals
```

### Issue 3: "Access denied for user 'root'@'localhost'"
**Cause:** Wrong password in DATABASE_URL  
**Solution:**
```bash
# Check MySQL is running:
mysql -uroot -p

# Update .env.local dengan correct password
DATABASE_URL="mysql://root:CORRECT_PASSWORD@localhost:3306/himatif_profile_dev"

# Test connection:
npx prisma db execute --stdin < /dev/null
```

### Issue 4: "Database 'himatif_profile_dev' doesn't exist"
**Cause:** Database not created  
**Solution:**
```bash
mysql -uroot -p

# Inside MySQL:
CREATE DATABASE himatif_profile_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;

# Then run migration:
npx prisma migrate dev --name init
```

### Issue 5: "Port 3306 already in use"
**Cause:** Another MySQL instance running  
**Solution:**
```bash
# Windows:
netstat -ano | findstr 3306

# Mac/Linux:
lsof -i :3306

# Change port atau kill process
```

### Issue 6: "Prisma studio won't open"
**Cause:** Port 5555 in use or Prisma cache issue  
**Solution:**
```bash
npm cache clean --force
npm reinstall @prisma/client prisma
npx prisma studio
```

---

# Quick Reference - Prisma 7 Commands

```bash
# Verify version
npx prisma --version
# Should show: Prisma 7.x.x

# Validate schema
npx prisma validate

# Create migration
npx prisma migrate dev --name init

# Apply migrations (production)
npx prisma migrate deploy

# Open visual database browser
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Reset database (dev only!)
npx prisma migrate reset

# Push schema to database
npx prisma db push
```

---

**Sprint 0 Ready to Begin! (Prisma 7)** 🚀

Questions? Check Troubleshooting section above.