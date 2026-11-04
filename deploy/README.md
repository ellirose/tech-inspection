# Deploying

The site runs on one DigitalOcean droplet (Ubuntu 24.04): Nginx in front, the Next.js app (pages, API and admin) under systemd, and PostgreSQL 16 on the same machine. Everything on the server is driven by one command, `ti`, which is this folder's [`ti`](ti) script.

## Deploy

**Push to `main`.** Every two minutes the server checks `main`; once the commit's CI run has passed, it builds it and switches to it. A failed build or health check leaves the live site as it was. Nothing needs to be set up in GitHub: the repository is public and the server polls it.

From any chat or terminal with SSH access to the server:

```bash
ssh root@165.245.163.217 ti status            # what is live, what main is, CI, health
ssh root@165.245.163.217 ti deploy            # deploy main now (after CI has passed)
ssh root@165.245.163.217 ti deploy <sha>      # a specific commit; add --force to skip the CI check
ssh root@165.245.163.217 ti rollback          # back to the previous release
ssh root@165.245.163.217 ti logs 200          # app log
ssh root@165.245.163.217 ti help              # every command
```

A deploy takes about 5 to 10 minutes: `npm ci`, `db:migrate`, `db:seed` (does nothing once content exists), `next build`, then the switch and a health check against `/api/health`, which must report the new commit. The last five releases are kept for `ti rollback`. Each step is logged in `/srv/tech-inspection/shared/deploy.log`.

Migrations run before the switch, while the previous release is still serving, so a migration must not break the code that is live (add columns and tables; rename or drop in a later release).

## Settings

Settings live in `/srv/tech-inspection/shared/.env` (the names are in [`.env.example`](../.env.example)); the file never leaves the server.

```bash
ssh root@165.245.163.217 ti env                                   # list, secrets masked
ssh root@165.245.163.217 ti set RESEND_API_KEY=re_xxx LEAD_NOTIFY_TO=ventas@tech-inspection.com
ssh root@165.245.163.217 ti restart                               # run-time settings
ssh root@165.245.163.217 ti deploy --force                        # build-time ones: NEXT_PUBLIC_*, ANTHROPIC_API_KEY
```

## Domain

Until tech-inspection.com points here, the site answers at `http://165-245-163-217.sslip.io` (a name that resolves to the server's IP) and sends `X-Robots-Tag: noindex` so search engines keep the Wix site. When the domain owner points the DNS records at `165.245.163.217`:

```bash
ssh root@165.245.163.217 ti domain www.tech-inspection.com --email you@example.com   # certificate, URLs, rebuild
ssh root@165.245.163.217 ti index on                                                  # let search engines in
```

## Server layout

| Path | What |
|---|---|
| `/srv/tech-inspection/repo` | Clone of this repository, fetched over HTTPS |
| `/srv/tech-inspection/releases/<time>-<sha>` | Built releases; `current` links the live one |
| `/srv/tech-inspection/shared/.env` | Settings (owner `app`, mode 600) |
| `/srv/tech-inspection/shared/data` | Uploads and the email outbox, linked into each release as `.data` |
| `/srv/tech-inspection/shared/backups` | Daily `pg_dump` at 03:30 Bogotá, kept 14 days (`ti backup` for one now) |
| `tech-inspection.service` | The app, as user `app`, on 127.0.0.1:3000 |
| `ti-autodeploy.timer`, `ti-backup.timer` | Deploy-on-main and backups |

## New server

On a fresh Ubuntu 24.04 droplet, as root:

```bash
scp -r deploy root@SERVER:/root/ti-deploy
ssh root@SERVER bash /root/ti-deploy/provision.sh        # packages, firewall, database, settings, services
ssh root@SERVER ti deploy --force
ssh root@SERVER systemctl enable --now ti-autodeploy.timer
```

`provision.sh` is safe to run again; it keeps the settings, database and releases. Changes to `ti` reach the server with the next deploy; changes to the systemd units or the Nginx template need `provision.sh` again (the Nginx site is rewritten by `ti domain`).
