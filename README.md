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
| `npm test` | Unit tests, plus database checks when `DATABASE_URL` is set |
| `npm run lint` / `npm run typecheck` | Static checks (CI runs all of these and a full build) |
| `GET /api/health` | Status and database round-trip, for monitoring and deploys |

## Structure

| Path | Purpose |
|---|---|
| `src/app/[lang]/` | Every page, prerendered for `es`, `pt` and `en` |
| `src/app/[lang]/opengraph-image.tsx` | Open Graph image generated for each language |
| `src/app/icon.svg`, `apple-icon.png` | Favicon and touch icon |
| `src/app/api/quote/route.ts` | Lead intake for the quote wizard and the assistant (**connect it to email or a CRM before launch**) |
| `src/app/api/health/route.ts` | Health check |
| `src/db/schema.ts`, `src/db/migrations/` | Database tables and their versioned SQL migrations |
| `src/lib/data/content.ts` | The only way pages read content: cached, tagged queries returning the types the components use |
| `src/i18n/dictionaries.ts` | All interface copy in the three languages, type-checked against Spanish |
| `src/content/*.ts` | Seed source and shared types for the content now stored in the database. Edits here reach the site only through `npm run db:seed -- --force` |
| `src/components/home/` | Landing-page sections |
| `public/media/` | Curated photos and videos (see `scripts/prepare-media.mjs`) |
| `public/docs/` | HSEQ PDFs migrated from Wix |

`next.config.ts` permanently redirects every old Wix URL to its new route.

## Pending client input

- **Certification seals:** the site uses text badges (`components/visuals/Seal.tsx`) until the client sends the brand-usage manual for each mark.
- **New field photos and video:** replace files in `public/media/` and update `scripts/prepare-media.mjs`. Current field footage is 360p (the only version Wix had stored).
- **Tank inspection** (`needs_review` in the `service` table; seeded from `draft: true` in `content/services.ts`): the old site showed the structural-inspection text, so this copy is a draft and needs confirming.
- **TI-QMS features:** the platform section's feature list and dashboard mock are illustrative and need confirming against the real system.
- **Contact directory:** confirm the emails flagged in `../../doc/03-diagnostic/SITE-AUDIT.md` §6 (`gerenciaoperaciones@` vs `gerencia-operaciones@`, and `dadministracion@`).
- **WhatsApp number:** `company.whatsapp` in the `site_settings` table (currently the main commercial line, 321 828 4129).
- **Assistant:** a guided, rule-based flow (intent detection, method recommendation, lead capture, WhatsApp hand-off). It can be connected to an LLM later through `/api/quote` or a new endpoint.

## Credits

The welding loop (`public/media/video/welding-loop.mp4`) is a free Mixkit clip (#47755) under the Mixkit License. All other photos and footage belong to Tech-Inspection S.A.S.
