# GreenVolt Electronics — Build Plan

## 1. Project summary

- **Business:** GreenVolt Electronics — retail electronics shop (mobiles, laptops, home appliances, TVs, accessories) with warranty + repair service.
- **Tagline:** "Power Up Your Life"
- **Tone:** friendly, simple, trustworthy. No heavy jargon.
- **Languages:** English + Urdu (i18n with `en` default, `ur` with RTL support).
- **Contact:** info@greenvolt.example · WhatsApp +92 300 0000000 · Shop 12, Electronics Market, Saddar, Karachi.
- **Social:** Facebook, Instagram, TikTok (placeholder URLs).

## 2. Brand

| Token | Value | Use |
| --- | --- | --- |
| `primary` | `#1E8E3E` | Brand green, links, headings accents |
| `dark` | `#0B3D2E` | Dark green, footer, nav |
| `accent` | `#FF8A00` | Buttons, sale badges, sparing highlights |
| `bg` | `#F4FAF6` | Light page background |
| `text` | `#1A1A1A` | Body text |

- **Logo:** simple lightning bolt inside a rounded green shape + "GreenVolt" bold sans-serif wordmark. Shipped as inline SVG component + `/public/logo.svg`.
- **Fonts:** `next/font` — Inter (Latin) + Noto Nastaliq Urdu (Urdu).

## 3. Tech stack

- **Web:** Next.js (App Router) + TypeScript strict + Tailwind CSS, Node.js runtime.
- **API:** Python 3.12 + FastAPI + SQLModel + Alembic. *(Local machine has Python 3.14; Docker pins 3.12. See Assumptions.)*
- **DB:** PostgreSQL (models kept MySQL-compatible: no Postgres-only types beyond `JSON`, portable `String`/`Text` lengths).
- **Auth:** JWT in httpOnly cookies, bcrypt hashing, roles `admin` / `user`.
- **AI (flagged):** OpenAI GPT-4o-mini, only called from FastAPI.
- **Dev:** docker-compose (db + api + web), `.env.example` for all settings.

## 4. Monorepo structure

```
business_website_demo/
├─ web/                     # Next.js App Router app
│  ├─ src/
│  │  ├─ app/
│  │  │  ├─ (site)/         # public site route group
│  │  │  │  ├─ page.tsx              # Home
│  │  │  │  ├─ about/page.tsx
│  │  │  │  ├─ services/page.tsx
│  │  │  │  ├─ services/[slug]/page.tsx
│  │  │  │  ├─ projects/page.tsx
│  │  │  │  ├─ projects/[slug]/page.tsx
│  │  │  │  ├─ blog/page.tsx
│  │  │  │  ├─ blog/[slug]/page.tsx
│  │  │  │  ├─ testimonials/page.tsx
│  │  │  │  ├─ contact/page.tsx
│  │  │  │  └─ privacy/page.tsx
│  │  │  ├─ (auth)/
│  │  │  │  ├─ login/page.tsx
│  │  │  │  └─ register/page.tsx
│  │  │  ├─ admin/          # protected dashboard
│  │  │  │  ├─ layout.tsx           # auth guard + sidebar
│  │  │  │  ├─ page.tsx             # overview stats
│  │  │  │  ├─ services/...
│  │  │  │  ├─ projects/...
│  │  │  │  ├─ blog/...             # + AI draft button
│  │  │  │  ├─ testimonials/...
│  │  │  │  ├─ inquiries/...
│  │  │  │  └─ settings/...
│  │  │  ├─ api/health/route.ts
│  │  │  ├─ sitemap.ts
│  │  │  ├─ robots.ts
│  │  │  ├─ not-found.tsx           # 404
│  │  │  └─ layout.tsx
│  │  ├─ components/        # ui/, layout/, sections/, forms/
│  │  ├─ lib/               # api client, zod schemas, seo, i18n, utils
│  │  ├─ dictionaries/      # en.json, ur.json
│  │  ├─ middleware.ts      # admin guard, security headers
│  │  └─ styles/
│  ├─ public/               # logo, og image, uploads placeholder
│  ├─ tests/                # vitest + testing-library
│  └─ package.json, tsconfig.json, tailwind.config.ts, next.config.mjs
├─ api/                     # FastAPI backend
│  ├─ app/
│  │  ├─ main.py
│  │  ├─ core/              # config, security, deps, rate_limit, csrf, email
│  │  ├─ models/            # SQLModel tables
│  │  ├─ schemas/           # Pydantic request/response
│  │  ├─ api/v1/            # routers: auth, services, projects, blog, testimonials, inquiries, settings, uploads, ai
│  │  ├─ crud/              # data access
│  │  └─ seed.py
│  ├─ alembic/              # migrations
│  ├─ tests/                # pytest
│  ├─ Dockerfile
│  └─ pyproject.toml / requirements.txt
├─ docker-compose.yml
├─ .env.example
├─ README.md
├─ ADMIN_GUIDE.md
├─ PLAN.md
└─ .gitignore
```

## 5. Data models (SQLModel)

| Model | Key fields |
| --- | --- |
| **User** | id, email (unique), hashed_password, full_name, role (`admin`/`user`), is_active, created_at |
| **Service** | id, slug (unique), title, title_ur, summary, summary_ur, body, body_ur, icon, image_url, price_from, is_published, sort_order, created_at, updated_at |
| **Project** | id, slug (unique), title, title_ur, summary, summary_ur, body, body_ur, client, image_url, gallery (JSON), completed_at, is_published, created_at, updated_at |
| **BlogPost** | id, slug (unique), title, title_ur, excerpt, excerpt_ur, body, body_ur, cover_image_url, category, tags (JSON), reading_time, author_id→User, is_published, published_at, created_at, updated_at |
| **Testimonial** | id, name, role, message, message_ur, rating (1–5), avatar_url, is_published, sort_order, created_at |
| **ContactMessage** | id, name, email, phone, subject, message, service_id (nullable), status (`new`/`read`/`replied`), source, created_at |
| **SiteSettings** | id, key (unique), value (JSON/text) — singleton rows for phone, whatsapp, address, email, social URLs, GA ID, map embed |

- All tables: `created_at`, `updated_at` where relevant. Indexes on `slug`, `is_published`, `status`, `category`.
- MySQL-compatible: `JSON` columns for gallery/tags, no `ARRAY`, no native `UUID`, integer PKs.

## 6. API routes (FastAPI, prefix `/api/v1`)

**Auth**
- `POST /auth/register` (flag `ENABLE_USER_AUTH`) · `POST /auth/login` · `POST /auth/logout` · `GET /auth/me`
- JWT set/cleared in httpOnly, `SameSite=Lax`, `Secure` per env. CSRF double-submit cookie on state-changing requests.

**Public (read)**
- `GET /services`, `GET /services/{slug}`
- `GET /projects`, `GET /projects/{slug}`
- `GET /blog` (category, page, `page_size`), `GET /blog/{slug}` (+ related)
- `GET /testimonials`
- `GET /settings/public`
- `POST /inquiries` (rate-limited, validated, saves + queues emails)

**Admin (role=admin, JWT)**
- CRUD: `/admin/services`, `/admin/projects`, `/admin/blog`, `/admin/testimonials`
- `PATCH .../publish` to toggle `is_published`
- `GET /admin/inquiries` (search, filter), `PATCH /admin/inquiries/{id}` (status), `DELETE /admin/inquiries/{id}`
- `GET/PUT /admin/settings`
- `POST /admin/uploads` (image upload, type/size validated, stored under `api/media`)
- `POST /admin/ai/draft` (flag `ENABLE_AI`) — blog draft / meta description

**Ops**
- `GET /health`

## 7. Frontend features per requirement

- **Public pages:** Home (hero, featured services, projects, testimonials, CTA), About, Services list/detail, Projects list/detail, Blog list/post, Testimonials, Contact, Privacy, Login/Register, 404.
- **Forms:** Zod (client) + Pydantic (server). Contact form → email notification + DB row.
- **Built-ins:** WhatsApp floating button, social links, Google Maps embed, GA via env.
- **Admin dashboard:** CRUD + publish toggles for all content types, image upload, slug fields, drafts, inquiries inbox (search/read/replied/delete), settings editor.
- **Blog:** categories, pagination, reading time, related posts.
- **Email (SMTP env, FastAPI BackgroundTasks):** owner alert + sender confirmation.
- **SEO:** Metadata API per page, OG/Twitter cards, canonical, `sitemap.xml`, `robots.txt`, JSON-LD (Organization, BlogPosting, Service), semantic HTML, alt text.
- **Speed:** RSC + ISR where sensible, `next/font`, lazy loading, cache headers. Lighthouse 90+ mobile target.
- **Security:** double validation, admin middleware + API checks, rate limiting (forms/login), strict CORS, security headers, CSRF for cookie auth, HTTPS-ready secure cookies + HSTS via env, no hardcoded secrets, seed admin from env.
- **AI helper (flag):** admin blog editor "Draft with AI" / "Suggest meta description" using GPT-4o-mini; output editable, never auto-published; graceful error handling.

## 8. Build phases (commit after each)

1. **Setup** — monorepo scaffold, `web` + `api` skeletons, docker-compose, `.env.example`, `.gitignore`, base Tailwind theme + layout + logo, `next.config`, lint/format/type/test tooling. → `chore: scaffold monorepo`
2. **Database & API** — models, Alembic migration, auth, CRUD routers, seed script, pytest for auth + CRUD. → `feat(api): models, auth, CRUD, seed`
3. **Public pages** — all public routes, i18n EN/UR, static assets, API client, components. → `feat(web): public pages`
4. **Admin dashboard** — guarded `/admin`, CRUD UI, uploads, publish toggles, inquiries inbox, settings. → `feat(admin): dashboard CRUD + inbox`
5. **Email** — SMTP config, templates, background tasks, inquiry flow end-to-end. → `feat(api): email notifications`
6. **SEO & speed** — metadata, sitemap/robots, JSON-LD, ISR/caching, image optimization, GA. → `feat(web): seo, sitemap, performance`
7. **Security** — rate limiting, CSRF, CORS, security headers, HSTS/secure cookies, validation hardening. → `feat: security hardening`
8. **AI helper** — flagged AI endpoints + admin editor button. → `feat(ai): blog drafting helper`
9. **Docs & tests** — README (one-command run), ADMIN_GUIDE.md, expand API + frontend tests, final lint/type/test. → `docs: readme, admin guide, tests`

## 9. Testing & quality gates (run after every phase)

- `web`: `npm run lint`, `npm run typecheck`, `npm run test`.
- `api`: `ruff check`, `mypy`, `pytest`.
- Fix all failures before moving on.

## 10. Assumptions / decisions needing your sign-off

1. **Python version:** local has 3.14; I'll pin **3.12** in the API Dockerfile per spec. Local (non-Docker) runs may need 3.12 installed — OK?
2. **"Projects"** = installation/customer-fix showcases (e.g., "café POS setup", "home theater install"). Reasonable?
3. **i18n scope:** EN + UR for content fields and static UI; admin UI stays English. OK?
4. **File uploads** stored on local disk (`api/media`, volume-mounted) rather than S3, since deployment is out of scope. OK?
5. **Rate limiter** = in-process (slowapi) for now; Redis not added unless you want it. OK?
6. **No CI/CD, deployment, or server config** — as instructed.
7. **Seed admin** from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env; password never hardcoded.

Awaiting your approval (or edits) before I begin Phase 1.
