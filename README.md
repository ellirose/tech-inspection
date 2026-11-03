# Tech-Inspection: website

Rebuild of tech-inspection.com (previously Wix) in **Next.js 16 + Tailwind CSS 4 + PostgreSQL 16**. Spanish is the default language, with Brazilian Portuguese and English.

## Getting started

Requires Node.js 24 and a PostgreSQL 16 database.

```bash
npm install
cp .env.example .env.local     # DATABASE_URL already points at the local database below

# Database: either one
docker compose up -d           # PostgreSQL, Redis, MinIO and Mailpit
npm run db:dev                 # PostgreSQL only, no Docker (keep it running in its own terminal)

npm run db:setup               # apply migrations, then load the site content
npm run dev                    # http://localhost:3000 → redirects to /es
```

`npm run build` prerenders pages from the database, so the database must be running and seeded for builds too.

| Command | Does |
|---|---|
| `npm run db:generate` | Write a new SQL migration after changing `src/db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations (also run by the deploy job) |
| `npm run db:seed` | Load `src/content/*.ts` into an empty database; `-- --force` wipes content tables and reloads |
| `npm run db:studio` | Browse the database in Drizzle Studio |
| `npm run leads:export -- [--since YYYY-MM-DD] [--out file.csv]` | Leads as CSV for Excel, until the admin inbox exists. The file holds personal data: keep it out of the repository |
| `npm run admin:invite -- --bootstrap` | Create the first super-admin from `ADMIN_BOOTSTRAP_EMAIL` and print its one-time setup link |
| `npm run admin:invite -- --email … --name "…" --role editor|sales|super_admin` | Create another account (or resend a link to an existing one) |
| `npm test` | Unit tests, plus database checks when `DATABASE_URL` is set |
| `npm run lint` / `npm run typecheck` | Static checks (CI runs all of these and a full build) |
| `GET /api/health` | Status and database round-trip, for monitoring and deploys |

## Structure

| Path | Purpose |
|---|---|
| `src/app/[lang]/` | Every page, prerendered for `es`, `pt` and `en` |
| `src/app/[lang]/opengraph-image.tsx` | Open Graph image generated for each language |
| `src/app/icon.svg`, `apple-icon.png` | Favicon and touch icon |
| `src/app/api/leads/route.ts` | Lead intake for the quote wizard and the assistant: validation, honeypot, rate limit, Turnstile, then storage and email |
| `src/lib/leads/` | Lead validation, storage, notification emails and CSV export, shared by every channel |
| `src/app/[lang]/gracias/` | Thank-you page after a quote request (not indexed; the conversion URL for analytics) |
| `src/app/api/health/route.ts` | Health check |
| `src/app/admin/` | Admin panel (Spanish, not indexed): sign-in, account setup and recovery, and the signed-in sections under `(panel)/` |
| `src/lib/auth/` | Better Auth configuration, roles and permissions (`roles.ts`), and the session checks every admin page and action calls |
| `src/proxy.ts` | Sends visitors without a session to the admin login and marks admin responses `noindex` |
| `src/db/schema.ts`, `src/db/migrations/` | Database tables and their versioned SQL migrations |
| `src/lib/data/content.ts` | The only way pages read content: cached, tagged queries returning the types the components use |
| `src/i18n/dictionaries.ts` | All interface copy in the three languages, type-checked against Spanish |
| `src/content/*.ts` | Seed source and shared types for the content now stored in the database. Edits here reach the site only through `npm run db:seed -- --force` |
| `src/components/home/` | Landing-page sections |
| `public/media/` | Curated photos and videos (see `scripts/prepare-media.mjs`) |
| `public/docs/` | HSEQ PDFs migrated from Wix |

Old Wix URLs are redirected from the `redirect` table (seeded from `src/db/seed/redirects.ts`, editable under Redirecciones).

## Admin panel

`/admin`, in Spanish, for three roles: **super-admin** (everything), **editor** (content and media) and **comercial** (leads; content read-only). The server checks the role on every page and action; the menu only hides what a role cannot open, and a section outside the role answers with the not-found page.

- **Accounts:** there is no public sign-up and no default password. `npm run admin:invite` creates an account and emails a one-time link (valid 24 hours) to set the password; the first super-admin comes from `ADMIN_BOOTSTRAP_EMAIL` with `--bootstrap`, and the link is also printed for when email is not set up yet.
- **Sign-in:** passwords of at least 12 characters, hashed with argon2id. Five wrong passwords lock the account for 15 minutes (codes have the same limit), and sign-in requests are rate-limited per IP.
- **Two-step verification:** an authenticator-app code plus backup codes, set up under *Seguridad*. Super-admins must turn it on before using anything else.
- **History:** sign-ins, failures, lockouts, sign-outs and security changes go to `audit_log`, shown under *Historial*.
- **Deployment:** set `AUTH_SECRET` (`openssl rand -base64 32`) and `AUTH_URL` to the public origin. Nginx must set `X-Real-IP` to the client address, since sign-in limits and the history read it.

Sections so far:

- **Leads:** the inbox with search and filters (status, source, service, priority, assignee, dates); each lead shows the full request, its origin, its attachments and a history; status changes, internal notes, assignment; CSV export of the filtered list (every export is logged). Attachments download through `/admin/leads/<reference>/adjuntos/<n>`, which checks the role, logs the download and, with Spaces, redirects to a link that expires after five minutes.
- **Usuarios:** invite, change name and role (applies at once), deactivate (ends open sessions), unlock, reset two-step verification, resend the access link. Nobody manages their own account there, and the last active super-admin cannot be demoted or deactivated.
- **Configuración:** company data, contact lines, hours, TI-QMS URL and lead-notification recipients; saving updates the public site at once.
- **Redirecciones:** the old Wix URLs (seeded) and any added later, applied by `src/proxy.ts` within a minute of a change.
- **Historial:** every sign-in, account change, lead change, export and settings change.

- **Contenido:** services, methods, clients, figures, certifications, documents and policies, leadership and contact lines, plus the texts of the fixed page sections. One generic editor built from field definitions (`src/lib/admin/collections.ts`, `fields.ts`), so validation and form come from the same place:
  - every translation is required once one is given; translated lists keep the same number of lines per language; image and PDF paths must exist under `/public` or in the media library;
  - new items start as drafts; publish, unpublish and reorder from the list; only super-admins delete;
  - **preview:** a draft's *Vista previa* link opens the public page with drafts included, for that browser only (Next.js draft mode via `/admin/vista-previa`, which checks the session; a banner shows the mode and leaves it). Signing out ends it: the proxy drops the preview cookie once the session cookie is gone. Each preview request logs a few `Unexpected cache miss after cache warming` warnings from Next.js 16.4.3: draft mode keeps cached results out of the cache, which its two-pass render does not expect, and it falls back to rendering live. The page is correct and visitors are not affected. Page sections have no drafts: a saved section is live;
  - a save never overwrites a newer version saved by someone else, and the form warns about unsaved changes and keeps what was typed when a save is rejected;
  - saving refreshes the cached data and rebuilds the affected public pages in the background (`src/lib/admin/refresh.ts`), so the site shows the change within seconds;
  - page sections are edited by value only: their structure and internal keys cannot change;
  - certifications warn 60 days before expiry (Contenido and dashboard) and leave the site once expired;
  - services and methods have optional search-result title and description per language.

- **Medios:** upload JPG, PNG or WebP images (up to 15 MB) and PDFs (up to 20 MB). The type is read from the file's content; images are turned upright, stripped of camera data (GPS included), reduced to 2400 px on the long side and stored as WebP with their size in the name (`/media/uploads/2026/name-1a2b3c4d-1600x1200.webp`), so pages lay them out without a lookup. Images need a Spanish text alternative. Copy a file's path into any image, gallery or document field. A file still used by any content, page section or setting cannot be deleted; the message says where it is used. Editors upload; the sales role can only look.

Not built yet: drag-and-drop ordering (up/down buttons for now), and editors for industries, case studies and FAQs, which need public pages first. The site still describes images with each item's name in the page's language; the Spanish text alternative from the library is not used on the pages yet.

## File storage

`src/lib/storage.ts`. With `DO_SPACES_KEY`, `DO_SPACES_SECRET`, `DO_SPACES_BUCKET`, `DO_SPACES_REGION` and `DO_SPACES_ENDPOINT` set, uploads go to DigitalOcean Spaces (or MinIO from `docker-compose.yml`: endpoint `http://localhost:9000`, create the bucket in its console first); without them, to `.data/uploads` (development only). The bucket stays private: public files are served by the site's own routes (`/media/uploads/…`, `/docs/uploads/…`, cached for a year since names never repeat), so URLs do not change if storage does. Quote attachments go under `leads/`, which no public route serves; they are only reachable from the admin.

## Leads

Every request is stored in the `lead` table first, then emailed: a notification to the recipients set under Configuración (or `LEAD_NOTIFY_TO` while that is empty; in Spanish, reply-to set to the requester) and a confirmation to the requester in their language. Each email outcome is recorded in `lead_event`. In development, set `EMAIL_OUTBOX_DIR` to get the emails as `.html` files instead of sending them. Server logs carry the lead reference only, never personal data.

The quote form takes up to three PDF, JPG or PNG files, 10 MB in total (design document §11.2), checked by content on the server and kept as sent. The emails list the file names; the files themselves stay in private storage and the team opens them from the lead's page. With files, the wizard posts multipart form data; Nginx needs `client_max_body_size 11m` on `/api/leads`.

Before launch: a Resend account with `send.tech-inspection.com` verified (DNS records added by the domain owner), the real Turnstile keys, and the mailbox list for `LEAD_NOTIFY_TO`.

## Pending client input

- **Certification seals:** the site uses text badges (`components/visuals/Seal.tsx`) until the client sends the brand-usage manual for each mark.
- **New field photos and video:** replace files in `public/media/` and update `scripts/prepare-media.mjs`. Current field footage is 360p (the only version Wix had stored).
- **Tank inspection** (`needs_review` in the `service` table; seeded from `draft: true` in `content/services.ts`): the old site showed the structural-inspection text, so this copy is a draft and needs confirming.
- **TI-QMS features:** the platform section's feature list and dashboard mock are illustrative and need confirming against the real system.
- **Contact directory:** confirm the emails flagged in `../../doc/03-diagnostic/SITE-AUDIT.md` §6 (`gerenciaoperaciones@` vs `gerencia-operaciones@`, and `dadministracion@`).
- **WhatsApp number:** `company.whatsapp` in the `site_settings` table (currently the main commercial line, 321 828 4129).
- **Assistant:** a guided, rule-based flow (intent detection, method recommendation, lead capture, WhatsApp hand-off). Its leads go through `/api/leads` with the same checks as the form, after the visitor consents in the chat. The LLM chatbot (stage 6) will use the same lead service.

## Credits

The welding loop (`public/media/video/welding-loop.mp4`) is a free Mixkit clip (#47755) under the Mixkit License. All other photos and footage belong to Tech-Inspection S.A.S.
