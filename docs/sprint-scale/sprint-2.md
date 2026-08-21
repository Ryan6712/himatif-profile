# 🚀 SPRINT 2 - COMPLETE GUIDE (Prisma 7)
## HIMATIF Profile v2.0 - Public Pages & Proker Blog

**Status:** Ready after Sprint 1 complete  
**Duration:** 2 weeks  
**Team Level:** Intermediate  
**Prisma Version:** 7.x  
**Sprint Focus:** Database-driven pages + Proker blog detail pages  
**Next Sprint Preview:** Better Auth integration (Sprint 3)

**Prerequisite:** Sprint 1 MUST be complete (all data seeded)

---

## 📑 Table of Contents

1. [Sprint 2 Overview](#sprint-2-overview)
2. [Key Concepts](#key-concepts)
3. [Detailed Tasks](#detailed-tasks)
4. [Code Examples](#code-examples)
5. [Testing & Verification](#testing--verification)
6. [Better Auth Preview](#better-auth-preview)

---

# Part 1: SPRINT 2 OVERVIEW

## 🎯 Goals

Sprint 2 fokus pada:
1. **Refactor `/devisi` route** - Query dari database bukan JSON
2. **Refactor `/member` route** - Filter by devisi, display alumni
3. **Refactor `/proker` route** - List semua programs dengan database
4. **Create `/proker/[slug]` detail page** - Blog detail dengan markdown rendering
5. **Remove static/data folder** - Semua data sudah di database
6. **Prepare untuk Sprint 3** - Better Auth integration

## 📊 What Happens in Sprint 2

```
START (dari Sprint 1):
Database full, JSON files archived
Static pages exist tapi pakai JSON files
          ↓
Task 1: Refactor /devisi route
          ↓
Task 2: Refactor /member route
          ↓
Task 3: Refactor /proker list route
          ↓
Task 4: Create /proker/[slug] detail page (NEW)
          ↓
Task 5: Add markdown rendering untuk proker content
          ↓
Task 6: Test all public pages
          ↓
Task 7: Remove static/data folder
          ↓
END (Sprint 2):
All public pages use database, Proker blog functional
Ready untuk Sprint 3 (Better Auth)
```

## 📁 File Changes

```
Sprint 2 Changes:
├── src/routes/
│   ├── (public)/
│   │   ├── devisi/
│   │   │   ├── +page.server.ts      ✅ REFACTOR (JSON → DB)
│   │   │   └── +page.svelte         (keep, maybe minor updates)
│   │   │
│   │   ├── member/
│   │   │   ├── +page.server.ts      ✅ REFACTOR (JSON → DB)
│   │   │   └── +page.svelte         (keep, maybe minor updates)
│   │   │
│   │   ├── proker/
│   │   │   ├── +page.server.ts      ✅ REFACTOR (JSON → DB)
│   │   │   ├── +page.svelte         (keep, maybe minor updates)
│   │   │   │
│   │   │   └── [slug]/              ✅ NEW - Blog detail route
│   │   │       ├── +page.server.ts
│   │   │       └── +page.svelte
│   │   │
│   │   └── +page.svelte             (home, maybe update)
│   │
│   └── ...
│
├── src/lib/
│   └── utils/
│       └── markdown.ts              ✅ NEW - Markdown renderer
│
├── static/data/                     🗑️ DELETE (after verification)
│
└── archive/                         ✓ (keep as backup)
```

---

# Part 2: KEY CONCEPTS

## 🔄 SvelteKit Load Functions (Server-side)

Load functions di SvelteKit:
- Run di server sebelum component render
- Secure untuk database queries
- Access ke event (headers, cookies, etc)
- Return data ke component via props

**Pattern untuk Sprint 2:**
```typescript
// src/routes/(public)/devisi/+page.server.ts

import prisma from '$lib/db';

export async function load() {
  // Database query di sini (server-side, aman)
  const devisiList = await prisma.devisi.findMany({
    include: {
      members: true // Include related members
    },
    orderBy: { nama: 'asc' }
  });

  return {
    devisiList // Pass ke component
  };
}
```

Component menerima data:
```svelte
<script>
  export let data; // Dari load function
</script>

{#each data.devisiList as devisi}
  <div>{devisi.nama}</div>
{/each}
```

## 📄 Dynamic Routes dengan Slug

Proker detail page menggunakan `[slug]` parameter:
- Route: `/proker/upgrading-organisasi`
- File: `src/routes/(public)/proker/[slug]/+page.server.ts`
- Access slug: `event.params.slug`

**Pattern untuk Sprint 2:**
```typescript
export async function load({ params }) {
  const proker = await prisma.proker.findUnique({
    where: { slug: params.slug }
  });

  if (!proker) {
    throw error(404, 'Proker not found');
  }

  return { proker };
}
```

## 🔤 Markdown Rendering

Proker content di database adalah markdown. Perlu render ke HTML:
1. `marked` - parse markdown
2. `dompurify` - sanitize HTML (security)
3. Display di component

```typescript
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const htmlContent = DOMPurify.sanitize(await marked(markdownContent));
```

---

# Part 3: DETAILED TASKS

## ✅ Task 1: Refactor /devisi Route (30 minutes)

### Current State (JSON-based)
```typescript
// OLD: src/routes/(public)/devisi/+page.server.ts
import { devisi } from './data.json'; // From JSON

export async function load() {
  return { devisi };
}
```

### New State (Database-based)

**Create/Update: src/routes/(public)/devisi/+page.server.ts**

```typescript
import prisma from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Query all devisi with member counts
  const devisiList = await prisma.devisi.findMany({
    include: {
      _count: {
        select: { members: true } // Count members per devisi
      }
    },
    orderBy: { nama: 'asc' }
  });

  return {
    devisiList
  };
};
```

### Update Component (if needed)

Check `src/routes/(public)/devisi/+page.svelte` - might need minor updates:

```svelte
<script>
  export let data;
</script>

{#each data.devisiList as devisi}
  <div class="devisi-card">
    <h2>{devisi.nama}</h2>
    <p>{devisi.deskripsi}</p>
    <p>Members: {devisi._count.members}</p>
  </div>
{/each}
```

## ✅ Task 2: Refactor /member Route (45 minutes)

### New: src/routes/(public)/member/+page.server.ts

```typescript
import prisma from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  // Optional: filter by member type
  const memberType = url.searchParams.get('type');

  const where = memberType 
    ? { memberType: memberType as any }
    : {};

  // Query members with their devisi
  const members = await prisma.member.findMany({
    where,
    include: {
      devisi: true // Include devisi data
    },
    orderBy: [
      { memberType: 'desc' }, // BPH first
      { name: 'asc' }
    ]
  });

  // Group by memberType & devisi for better display
  const membersByType = {
    BPH: members.filter(m => m.memberType === 'BPH'),
    KADIV: members.filter(m => m.memberType === 'KADIV'),
    REGULAR: members.filter(m => m.memberType === 'REGULAR'),
    ALUMNI: members.filter(m => m.memberType === 'ALUMNI')
  };

  return {
    members,
    membersByType,
    activeFilter: memberType
  };
};
```

### Component Usage

```svelte
<script>
  export let data;
</script>

<h2>BPH (Badan Pengurus Harian)</h2>
{#each data.membersByType.BPH as member}
  <div>
    <h3>{member.name}</h3>
    <p>{member.position}</p>
    {#if member.devisi}
      <span>{member.devisi.nama}</span>
    {/if}
  </div>
{/each}

<h2>Alumni</h2>
{#each data.membersByType.ALUMNI as member}
  <div>
    <h3>{member.name}</h3>
    <p>{member.position}</p>
  </div>
{/each}
```

## ✅ Task 3: Refactor /proker List Route (30 minutes)

### New: src/routes/(public)/proker/+page.server.ts

```typescript
import prisma from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Query all published proker sorted by date (newest first)
  const prokerList = await prisma.proker.findMany({
    where: {
      publishedAt: {
        not: null // Only published
      }
    },
    orderBy: {
      date: 'desc'
    },
    select: {
      id: true,
      title: true,
      date: true,
      thumbnail: true,
      description: true,
      slug: true
    }
  });

  return {
    prokerList
  };
};
```

## ✅ Task 4: Create /proker/[slug] Detail Page (1 hour)

### NEW: src/routes/(public)/proker/[slug]/+page.server.ts

```typescript
import prisma from '$lib/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  // Query proker by slug
  const proker = await prisma.proker.findUnique({
    where: { slug: params.slug }
  });

  // 404 if not found
  if (!proker) {
    throw error(404, 'Proker tidak ditemukan');
  }

  // Query other recent proker untuk "related posts"
  const relatedProker = await prisma.proker.findMany({
    where: {
      NOT: { id: proker.id },
      publishedAt: { not: null }
    },
    orderBy: { date: 'desc' },
    take: 3,
    select: {
      id: true,
      title: true,
      date: true,
      slug: true,
      thumbnail: true
    }
  });

  return {
    proker,
    relatedProker
  };
};
```

### NEW: src/routes/(public)/proker/[slug]/+page.svelte

```svelte
<script>
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';

  export let data;

  // Render markdown to HTML
  $: htmlContent = DOMPurify.sanitize(marked(data.proker.content));
</script>

<article>
  <header>
    <h1>{data.proker.title}</h1>
    <time>{new Date(data.proker.date).toLocaleDateString('id-ID')}</time>
  </header>

  <img src={data.proker.thumbnail} alt={data.proker.title} />

  <div class="content">
    {@html htmlContent}
  </div>

  <aside>
    <h3>Program Kerja Lainnya</h3>
    <ul>
      {#each data.relatedProker as related}
        <li>
          <a href="/proker/{related.slug}">
            {related.title}
          </a>
        </li>
      {/each}
    </ul>
  </aside>
</article>

<style>
  .content :global(p) {
    line-height: 1.6;
  }
</style>
```

## ✅ Task 5: Create Markdown Renderer Utility (20 minutes)

### Create: src/lib/utils/markdown.ts

```typescript
import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Render markdown content to safe HTML
 * @param markdown - Markdown content
 * @returns Sanitized HTML string
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  // Configure marked options
  marked.setOptions({
    breaks: true,
    gfm: true // GitHub Flavored Markdown
  });

  // Convert markdown to HTML
  const html = await marked(markdown);

  // Sanitize untuk prevent XSS
  const safe = DOMPurify.sanitize(html);

  return safe;
}

/**
 * Extract excerpt dari markdown (first 200 chars)
 */
export function getExcerpt(markdown: string, maxLength: number = 200): string {
  // Remove markdown syntax
  const text = markdown
    .replace(/[#*`\[\]()]/g, '')
    .split('\n')[0];

  return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
}
```

### Install Dependencies (if not done in Sprint 0)

```bash
npm install marked dompurify
npm install -D @types/dompurify
```

## ✅ Task 6: Install & Configure Better Auth (Prep for Sprint 3)

### Why Better Auth?

Better Auth adalah modern auth library untuk SvelteKit yang:
- ✅ Lebih cepat setup dibanding manual auth
- ✅ Built-in session management
- ✅ Multiple providers support (email, OAuth, etc)
- ✅ Better security defaults
- ✅ Follows SvelteKit best practices
- ✅ Mempercepat Sprint 3 development

### Install (sekarang, biar ready untuk Sprint 3)

```bash
npm install better-auth
npm install -D @better-auth/cli
```

### Init Better Auth Config

```bash
npx better-auth init

# Follow prompts:
# - Choose SvelteKit
# - Choose MySQL
# - Set database URL (use .env.local DATABASE_URL)
```

### What Gets Created

```
├── auth.ts                    # Better Auth config
├── auth.client.ts            # Client-side utilities
├── hooks.server.ts           # Updated with Better Auth
└── (auth)/                   # Auth routes (generated)
    ├── signin/
    ├── signup/
    └── callback/
```

**Note:** Better Auth integration details di Sprint 3. For Sprint 2, just install & configure.

## ✅ Task 7: Testing All Pages (1 hour)

### Test Public Pages

```bash
npm run dev

# Test URLs:
# http://localhost:5173/devisi
# http://localhost:5173/member
# http://localhost:5173/member?type=BPH (filter)
# http://localhost:5173/member?type=ALUMNI
# http://localhost:5173/proker
# http://localhost:5173/proker/upgrading-organisasi (or any slug)
```

### Verification Checklist

- [ ] `/devisi` page loads, shows all divisions
- [ ] `/member` page loads, shows members grouped by type
- [ ] `/member?type=ALUMNI` shows only alumni
- [ ] `/proker` page loads, shows all programs
- [ ] `/proker/[slug]` loads individual proker
- [ ] Markdown renders correctly (headings, paragraphs, lists)
- [ ] Related proker shows on detail page
- [ ] No 404 errors (unless testing non-existent slug)
- [ ] Images load correctly

## ✅ Task 8: Remove Static Data Files (15 minutes)

### After Verification

```bash
# ONLY after everything works with database!

# Remove JSON files
rm static/data/devisi.json
rm static/data/member.json
rm static/data/proker.json
rm -rf static/data/

# Verify git
git status
# Should show deleted files

# Commit
git add -A
git commit -m "chore: Remove static JSON data (now in database)"
git push
```

---

# Part 4: CODE EXAMPLES

## 🔧 Example 1: Load Function with Error Handling

```typescript
import { error } from '@sveltejs/kit';
import prisma from '$lib/db';

export async function load({ params }) {
  try {
    const proker = await prisma.proker.findUnique({
      where: { slug: params.slug }
    });

    if (!proker) {
      throw error(404, 'Proker not found');
    }

    return { proker };
  } catch (err) {
    console.error('Load error:', err);
    throw error(500, 'Failed to load proker');
  }
}
```

## 🔧 Example 2: Markdown Rendering in Component

```svelte
<script>
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';

  export let content;

  $: html = DOMPurify.sanitize(marked(content));
</script>

<div class="prose">
  {@html html}
</div>

<style>
  :global(.prose p) {
    margin: 1rem 0;
  }
  :global(.prose h2) {
    margin-top: 2rem;
  }
</style>
```

## 🔧 Example 3: Conditional Display by Member Type

```svelte
<script>
  export let members;
</script>

{#if members.BPH.length > 0}
  <section>
    <h2>BPH</h2>
    {#each members.BPH as member}
      <div>{member.name} - {member.position}</div>
    {/each}
  </section>
{/if}

{#if members.ALUMNI.length > 0}
  <section>
    <h2>Alumni</h2>
    {#each members.ALUMNI as member}
      <div>{member.name}</div>
    {/each}
  </section>
{/if}
```

---

# Part 5: TESTING & VERIFICATION

## ✅ Verification Checklist

### Database Queries
- [ ] All `find*` queries return correct data
- [ ] Filtering works (member type, published status)
- [ ] Sorting works (by date, name, etc)
- [ ] Includes/relations work (devisi with members)

### Pages Rendering
- [ ] No console errors
- [ ] Images load
- [ ] Links work (to `/proker/[slug]`)
- [ ] 404 shows when accessing non-existent slug

### Markdown Rendering
- [ ] Headings render correctly
- [ ] Paragraphs have proper spacing
- [ ] Lists render as HTML lists
- [ ] No HTML injection (sanitized)
- [ ] Links in markdown work

### Static Files
- [ ] JSON files deleted
- [ ] No "file not found" errors
- [ ] All data comes from database

### Git & Cleanup
- [ ] All changes committed
- [ ] .env.local not committed
- [ ] archive/ folder kept as backup

---

# Part 6: BETTER AUTH PREVIEW

## 🔐 What's Coming in Sprint 3

### Better Auth Setup (already installed in Sprint 2)

Better Auth replaces manual auth from Sprint 0 with:
- Automatic session management
- Database schema creation
- Auth routes generation
- Security best practices

### Sprint 3 Auth Flow

```
Login Form
    ↓
Better Auth Handler
    ↓
Verify admin credentials
    ↓
Create session (Better Auth)
    ↓
Set session cookie
    ↓
Redirect to /admin
```

### Admin Routes Protected

```typescript
// src/routes/admin/+layout.server.ts

import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth';

export async function load(event) {
  // Better Auth handles session checking
  const session = await auth.api.getSession({ headers: event.request.headers });

  if (!session) {
    throw redirect(303, '/login');
  }

  return { user: session.user };
}
```

### Better Auth Benefits for Timeline

1. **Faster Development**
   - Pre-built auth routes
   - Automatic database schema
   - Session management included

2. **Better Security**
   - Industry-standard practices
   - CSRF protection built-in
   - Password handling optimized

3. **Less Code**
   - Manual auth in Sprint 0 can be removed
   - hooks.server.ts simplified
   - Fewer potential bugs

---

## 🎯 Timeline Consideration

**With Better Auth in Sprint 3:**
- Sprint 3 auth implementation: 1 week instead of 1-2 weeks
- More time for testing & polish
- Ready for Sprint 4 (admin CRUD) faster

**Recommended Sprint 3 Flow:**
1. Swap out Sprint 0 manual auth with Better Auth (2-3 days)
2. Create admin login page (1 day)
3. Create admin layout with protection (1 day)
4. Testing & refinement (2-3 days)

---

# Common Issues & Solutions

## Issue: Markdown not rendering

**Cause:** DOMPurify might strip custom elements

**Solution:**
```typescript
import DOMPurify from 'dompurify';

const config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'a', 'code', 'pre'],
  ALLOWED_ATTR: ['href', 'class']
};

const safe = DOMPurify.sanitize(html, config);
```

## Issue: 404 on valid slug

**Cause:** Slug doesn't match database

**Solution:**
```bash
# Check database
mysql -u[user] -p[password] himatif_profile_dev

SELECT slug FROM Proker;
# Verify slug exists & matches URL
```

## Issue: Member filter not working

**Cause:** URL param not read correctly

**Solution:**
```typescript
const memberType = url.searchParams.get('type');
// memberType should be 'BPH', 'KADIV', 'REGULAR', or 'ALUMNI'

// Debug:
console.log('Filter:', memberType);
```

---

# Sprint 2 Completion Checklist

Sprint 2 is done when:

- [ ] `/devisi` uses database ✅
- [ ] `/member` uses database with filtering ✅
- [ ] `/proker` list uses database ✅
- [ ] `/proker/[slug]` detail page works ✅
- [ ] Markdown renders correctly ✅
- [ ] Static JSON files deleted ✅
- [ ] All pages tested & working ✅
- [ ] Better Auth installed & configured ✅
- [ ] Ready for Sprint 3 (Better Auth integration) ✅

---

# What's Next (Sprint 3)

After Sprint 2:
1. Integrate Better Auth (replace manual auth)
2. Create admin login page
3. Create protected `/admin` layout
4. Setup admin CRUD foundations

**Timeline:** Sprint 3 akan lebih cepat karena Better Auth sudah installed!

---

**Sprint 2 Ready! Database-driven pages incoming!** 🚀

Questions? Check Issues & Solutions section above.