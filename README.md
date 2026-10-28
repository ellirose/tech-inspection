# Tech-Inspection: website

Rebuild of tech-inspection.com (previously Wix) in **Next.js 16 + Tailwind CSS 4**. Spanish is the default language, with Brazilian Portuguese and English.

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /es
npm run build && npm start
```

## Structure

| Path | Purpose |
|---|---|
| `src/app/[lang]/` | Every page, prerendered for `es`, `pt` and `en` |
| `src/app/[lang]/opengraph-image.tsx` | Open Graph image generated for each language |
| `src/app/icon.svg`, `apple-icon.png` | Favicon and touch icon |
| `src/app/api/quote/route.ts` | Lead intake for the quote wizard and the assistant (**connect it to email or a CRM before launch**) |
| `src/i18n/dictionaries.ts` | All interface copy in the three languages, type-checked against Spanish |
| `src/content/*.ts` | Business content: methods, services, certifications, contacts, documents |
| `src/components/home/` | Landing-page sections |
| `public/media/` | Curated photos and videos (see `scripts/prepare-media.mjs`) |
| `public/docs/` | HSEQ PDFs migrated from Wix |

`next.config.ts` permanently redirects every old Wix URL to its new route.

## Pending client input

- **Certification seals:** the site uses text badges (`components/visuals/Seal.tsx`) until the client sends the brand-usage manual for each mark.
- **New field photos and video:** replace files in `public/media/` and update `scripts/prepare-media.mjs`. Current field footage is 360p (the only version Wix had stored).
- **Tank inspection** (`content/services.ts`, `draft: true`): the old site showed the structural-inspection text, so this copy is a draft and needs confirming.
- **TI-QMS features:** the platform section's feature list and dashboard mock are illustrative and need confirming against the real system.
- **Contact directory:** confirm the emails flagged in `../scrape/SITE-AUDIT.md` §6 (`gerenciaoperaciones@` vs `gerencia-operaciones@`, and `dadministracion@`).
- **WhatsApp number:** `company.whatsapp` in `content/site.ts` (currently the main commercial line, 321 828 4129).
- **Assistant:** a guided, rule-based flow (intent detection, method recommendation, lead capture, WhatsApp hand-off). It can be connected to an LLM later through `/api/quote` or a new endpoint.

## Credits

The welding loop (`public/media/video/welding-loop.mp4`) is a free Mixkit clip (#47755) under the Mixkit License. All other photos and footage belong to Tech-Inspection S.A.S.
