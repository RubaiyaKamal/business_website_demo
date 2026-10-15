# GreenVolt Electronics — Business Website

A bilingual (English / Urdu) business website **and** admin dashboard for a retail
electronics shop: mobiles, laptops, TVs, home appliances, plus warranty and repair
service. Tagline: **"Power Up Your Life"**.

It is a monorepo with a **Next.js** front end and a **FastAPI** back end backed by
PostgreSQL.

---

## 1. What it does

**Public website** (`/en`, `/ur` — Urdu renders right-to-left)

- Home, About, Services (list + detail), Projects/Portfolio (list + detail),
  Blog (list + post), Testimonials, Contact, Privacy, 404.
- Bilingual content with SEO metadata, Open Graph/Twitter cards, JSON-LD,
  `sitemap.xml`, `robots.txt`.
- Contact form (validated on the client with Zod and on the server with Pydantic)
  that saves an inquiry and emails the owner + a confirmation to the sender.
- Floating WhatsApp button, Google Maps embed, Google Analytics (env-driven).
- Fast: server components, ISR caching, `next/font`, optimized images.

**Admin dashboard** (protected, at `/{locale}/admin`)

- Sign in with JWT stored in an httpOnly cookie.
- CRUD + publish toggles for Services, Projects, Blog posts and Testimonials.
- Image uploads with type/size validation.
- Inquiries inbox (search, filter, status, delete).
- Site settings editor (phone, WhatsApp, address, social links, GA ID, map).
- Optional **AI writing helper** for blog drafts and meta descriptions.

---

## 2. Tech stack

| Layer | Technology |
| --- | --- |
| Web | Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS |
| API | Python 3.12 · FastAPI · SQLModel · Alembic · Uvicorn |
| Database | PostgreSQL 16 (models kept portable / MySQL-friendly) |
| Auth | JWT in httpOnly cookies · bcrypt · roles `admin` / `user` |
| Security | Rate limiting (slowapi) · CSRF double-submit · strict CORS · security headers · HSTS |
| AI (optional) | OpenAI GPT-4o-mini, called only from the API, feature-flagged |
| Tooling | pytest · ruff · mypy · vitest · ESLint · Prettier |

---

## 3. Repository layout

```
business_website_demo/
├─ web/                       # Next.js app
│  ├─ src/
│  │  ├─ app/[locale]/        # public site + /admin dashboard (routes)
│  │  ├─ components/          # ui, layout, sections, forms, admin
│  │  ├─ lib/                 # api client, admin config, i18n, seo, types
│  │  ├─ dictionaries/        # en.json, ur.json
│  │  └─ middleware.ts        # locale routing + security headers + CSRF cookie
│  └─ tests/                  # vitest + testing-library
├─ api/                       # FastAPI app
│  ├─ app/
│  │  ├─ main.py              # app factory, CORS, middleware, rate-limit handler
│  │  ├─ core/                # config, security, deps, rate_limit, csrf, ai, email
│  │  ├─ models/  schemas/  crud/
│  │  ├─ api/v1/              # routers per resource
│  │  └─ seed.py              # sample content + admin user
│  ├─ alembic/                # migrations
│  └─ tests/                  # pytest
├─ docker-compose.yml         # db + api + web
├─ .env.example               # every setting, copy to .env
└─ PLAN.md                    # original build plan
```

---

## 4. Prerequisites

- **Docker + Docker Compose** — the easiest way to run everything, **or**
- For running locally without Docker:
  - **Node.js 20+** (22 recommended) and npm
  - **Python 3.12** (`api/pyproject.toml` targets 3.12)
  - **PostgreSQL 16** (or point `DATABASE_URL` at SQLite for a quick trial)

---

## 5. Quick start (one command — Docker)

```bash
# from the repository root
cp .env.example .env        # then edit values (at minimum SECRET_KEY + ADMIN_*)
docker compose up --build
```

On startup the API container automatically runs migrations (`alembic upgrade head`),
seeds sample content (`python -m app.seed`), then serves with auto-reload.

| Service | URL |
| --- | --- |
| Website | http://localhost:3000/en |
| Admin dashboard | http://localhost:3000/en/admin |
| API docs (Swagger) | http://localhost:8000/docs |
| API health | http://localhost:8000/health |

Sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `.env`.

---

## 6. Local development (without Docker)

### 6.1 Configure environment

```bash
cp .env.example .env
```

Edit `.env`. For local (non-Docker) runs point `DATABASE_URL` at your machine and set
`MAIL_SUPPRESS_SEND=true` so emails are logged instead of sent. Generate a strong
`SECRET_KEY` with `python -c "import secrets; print(secrets.token_urlsafe(64))"` —
in production the API refuses to start if it is blank, short, or a known placeholder.

### 6.2 Back end (FastAPI)

```bash
cd api
python -m venv .venv
# Windows: .venv\Scripts\activate     macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

alembic upgrade head        # create/update the database schema
python -m app.seed          # sample content + admin user
uvicorn app.main:app --reload
```

API runs at http://localhost:8000 (docs at `/docs`).

### 6.3 Front end (Next.js)

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000. The web app proxies `/api/v1/*` and `/media/*` to the
API (`API_PROXY_TARGET`, default `http://localhost:8000`), so cookies, CSRF and CORS
all behave as same-origin in the browser.

---

## 7. Environment variables

All variables live in `.env` (template in `.env.example`). The most important ones:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLAlchemy URL, e.g. `postgresql+psycopg://user:pass@host:5432/greenvolt` |
| `SECRET_KEY` | Signing key for JWTs. **Must be long + random in production.** |
| `ENVIRONMENT` | `development` or `production` |
| `BACKEND_CORS_ORIGINS` | Comma-separated allowed browser origins |
| `COOKIE_SECURE` / `ENABLE_HSTS` | Set `true` behind HTTPS |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT lifetime |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Seed admin account (no hardcoded creds) |
| `RATE_LIMIT_ENABLED`, `CONTACT_RATE_LIMIT`, `LOGIN_RATE_LIMIT` | Abuse protection |
| `MAIL_*` / `SMTP_*` | Outgoing email; `MAIL_SUPPRESS_SEND=true` logs instead of sending |
| `MEDIA_ROOT`, `MAX_UPLOAD_MB` | Where uploads are stored and their size limit |
| `ENABLE_AI`, `OPENAI_API_KEY`, `OPENAI_MODEL` | Optional AI helper |
| `ENABLE_USER_AUTH` | Allow public self-registration |
| `NEXT_PUBLIC_*` | Browser-visible web config (site name/URL, WhatsApp, GA ID, social links, `NEXT_PUBLIC_ENABLE_AI`) |
| `API_PROXY_TARGET` / `API_INTERNAL_URL` | Where Next.js proxies / fetches the API |

---

## 8. How it works

**Request flow.** The browser talks only to the Next.js origin. `web/src/middleware.ts`
handles locale routing and attaches security headers (plus a CSRF cookie). Next rewrites
`/api/v1/*` to FastAPI, so the browser sees a single same-origin app.

**Authentication.** `POST /api/v1/auth/login` verifies the password (bcrypt) and sets a
JWT in the httpOnly `gv_access` cookie (`SameSite=Lax`, `Secure` when configured). Admin
routes require the `admin` role. Because auth rides on cookies, every state-changing
admin request also needs a CSRF token.

**CSRF (double-submit).** The API (and web middleware) set a non-httpOnly `gv_csrf`
cookie. The web client echoes it back in the `x-csrf-token` header for POST/PUT/PATCH/
DELETE; the API compares the two with a constant-time check and rejects mismatches.

**Validation.** Forms are validated twice — Zod on the client, Pydantic on the server.
Passwords must contain a letter and a digit.

**Inquiries.** `POST /api/v1/inquiries` is rate-limited, validated, stored, and triggers
background email tasks (owner alert + sender confirmation).

**SEO / performance.** Pages use the Metadata API with canonical + `hreflang`, generate
`/sitemap.xml` and `/robots.txt`, embed JSON-LD, and are statically generated with
time-based revalidation (ISR). Images go through `next/image`.

**AI helper (optional).** With `ENABLE_AI=true` and a key set, the blog editor shows
"Draft with AI" and "Suggest meta description" buttons. The API calls OpenAI
server-side and returns editable text — nothing is ever auto-published.

---

## 9. API overview (prefix `/api/v1`)

| Area | Endpoints |
| --- | --- |
| Auth | `POST /auth/register` · `POST /auth/login` · `POST /auth/logout` · `GET /auth/me` |
| Public reads | `GET /services`, `/services/{slug}` · `/projects`, `/projects/{slug}` · `/blog`, `/blog/{slug}`, `/blog/{slug}/related`, `/blog/categories` · `/testimonials` · `/settings/public` |
| Contact | `POST /inquiries` (rate-limited) |
| Admin — content | CRUD on `/admin/services`, `/admin/projects`, `/admin/blog`, `/admin/testimonials` (+ `PATCH .../{id}/publish`) |
| Admin — ops | `GET /admin/stats` · `/admin/inquiries` (+ status/delete) · `GET/PUT /admin/settings` · `POST /admin/uploads` |
| Admin — AI | `POST /admin/ai/draft` (only when `ENABLE_AI=true`) |
| Ops | `GET /health` |

Full interactive docs: http://localhost:8000/docs

---

## 10. Common tasks

```bash
# API — tests, lint, types
cd api
.venv/Scripts/python -m pytest        # Windows
.venv/bin/python -m pytest            # macOS/Linux
.venv/Scripts/python -m ruff check
.venv/Scripts/python -m mypy app

# Web — lint, types, tests, production build
cd web
npm run lint
npm run typecheck
npm run test
npm run build

# Database migrations
cd api
alembic upgrade head                                   # apply
alembic revision --autogenerate -m "describe change"   # create a new one
python -m app.seed                                     # re-seed (idempotent)
```

---

## 11. Security notes

- No secrets in source; the admin account and `SECRET_KEY` come from the environment.
- In production the API refuses to boot with a placeholder/short `SECRET_KEY`.
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, and a production CSP) are set by the web middleware; the API
  adds its own headers + optional HSTS.
- Uploads are restricted to image types (SVG rejected) and capped by `MAX_UPLOAD_MB`.
- CORS is an explicit allow-list; there is no wildcard.
- Rate limiting protects the contact form and login/registration.

---

## 12. Build phases

The project was built in documented phases (see `PLAN.md`): setup → database & API →
public pages → admin dashboard → email → SEO & performance → security → AI helper →
docs & tests.
