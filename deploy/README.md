# Deploying

The site runs on one DigitalOcean droplet (Ubuntu 24.04, 165.245.163.217): Nginx in front, the Next.js app (pages, API and admin) under systemd, and PostgreSQL 16 on the same machine. Code goes to the server straight from a developer's folder; Git is not involved. On the server, everything is driven by one command, `ti` (this folder's [`ti`](ti) script).

## Deploy

From `code/web`, on a machine that can SSH to the server as root:

```bash
npm run deploy -- "what changed"
```

[`deploy.sh`](deploy.sh) packs the folder as it is on disk (without `node_modules`, `.next`, `.git`, `.env*` files or `.data`), streams it over SSH, and the server builds it as a new release: `npm ci`, `db:migrate`, `db:seed` (does nothing once content exists), `next build`, then the switch and a health check against `/api/health`, which must report the new release. If the build or the health check fails, the live site stays as it was. About two minutes in all; the upload is about 60 MB.

The SSH target is `ti-vps` (an alias on the machine that set this up); elsewhere use `TI_HOST=root@165.245.163.217 npm run deploy`.

On the server:

```bash
ssh root@165.245.163.217 ti status        # what is live, health, recent deploys
ssh root@165.245.163.217 ti releases      # the five kept releases
ssh root@165.245.163.217 ti rollback      # back to the previous release
ssh root@165.245.163.217 ti logs 200      # app log
ssh root@165.245.163.217 ti help          # every command
```

Migrations run before the switch, while the previous release is still serving, so a migration must not break the code that is live (add columns and tables; rename or drop in a later release). Each step is logged in `/srv/tech-inspection/shared/deploy.log`.

## Settings

Settings live in `/srv/tech-inspection/shared/.env` (the names are in [`.env.example`](../.env.example)); the file never leaves the server, and the upload never carries local `.env*` files.

```bash
ssh root@165.245.163.217 ti env                                   # list, secrets masked
ssh root@165.245.163.217 ti set RESEND_API_KEY=re_xxx LEAD_NOTIFY_TO=ventas@tech-inspection.com
ssh root@165.245.163.217 ti restart                               # run-time settings
ssh root@165.245.163.217 ti rebuild                               # build-time ones: NEXT_PUBLIC_*, OPENAI_API_KEY
```

## Domain and HTTPS

Until tech-inspection.com points here, the site answers at `http://165-245-163-217.sslip.io` (a name that resolves to the server's IP) and sends `X-Robots-Tag: noindex`, so search engines keep the Wix site. `ti domain` gets a Let's Encrypt certificate for a name, switches the site's URLs to it and rebuilds:

```bash
ssh root@165.245.163.217 ti domain 165-245-163-217.sslip.io                          # HTTPS on the temporary name
ssh root@165.245.163.217 ti domain www.tech-inspection.com --email you@example.com  # once the DNS points here
ssh root@165.245.163.217 ti index on                                                # then let search engines in
```

## Admin accounts

Email is not sent until `RESEND_API_KEY` is set, so the invite link is printed instead:

```bash
ssh root@165.245.163.217 ti admin-invite --email ana@tech-inspection.com --name "Ana Ruiz" --role super_admin
```

## Server layout

| Path | What |
|---|---|
| `/srv/tech-inspection/releases/<UTC time>` | Uploaded and built releases (five kept); `current` links the live one |
| `/srv/tech-inspection/shared/.env` | Settings (owner `app`, mode 600) |
| `/srv/tech-inspection/shared/data` | Uploads and the email outbox, linked into each release as `.data` |
| `/srv/tech-inspection/shared/backups` | Daily `pg_dump` and uploads archive at 03:30 Bogotá, kept 14 days, and copied to Spaces when `DO_SPACES_*` is set (kept 30 days there) |
| `tech-inspection.service` | The app, as user `app`, on 127.0.0.1:3000 (only Nginx is reachable from outside) |
| `ti-backup.timer` | The daily backup |
| `ti-watchdog.timer` | Health check every 5 minutes; two failures in a row restart the app; warns in `deploy.log` when the disk is 90% full |

## Runbook

| Task | How |
|---|---|
| Deploy, roll back | `npm run deploy -- "note"` from `code/web`; `ti rollback` |
| Restart | `ti restart` |
| Back up now | `ti backup`; list with `ti backups` |
| Restore a backup | `ti restore db-YYYYMMDD-HHMM.dump --yes`: takes a safety dump first, stops the app, restores, starts it. Uploads: `tar -xzf uploads-….tgz -C /srv/tech-inspection/shared/data`. A copy from Spaces: download it to `shared/backups/` first. Test a restore once a month |
| Renew HTTPS | Automatic (certbot's timer). Check with `certbot renew --dry-run` |
| Rotate secrets | `AUTH_SECRET`: `ti set AUTH_SECRET=$(openssl rand -base64 32)` then `ti restart` (signs everyone out). Database password: `sudo -u postgres psql -c "alter role techinspection password '…'"`, then `ti set DATABASE_URL=postgres://techinspection:…@127.0.0.1:5432/techinspection` and `ti restart`. API keys (OpenAI, Resend, Turnstile, Spaces): create the new key at the provider, `ti set`, `ti rebuild` for `OPENAI_API_KEY` and `NEXT_PUBLIC_*`, otherwise `ti restart`, then revoke the old key |
| See problems | `ti status`; `ti logs 200`; `grep WARNING /srv/tech-inspection/shared/deploy.log` |
| Monthly | `apt update && apt upgrade`, `npm audit` in `code/web`, disk space (`ti status`), a test restore |
| Uptime alerts | The watchdog restarts the app but sends no alert: add an external monitor (e.g. UptimeRobot) on `/api/health` once the domain is live |

## New server

On a fresh Ubuntu 24.04 droplet, as root:

```bash
scp -r deploy root@SERVER:/root/ti-deploy
ssh root@SERVER bash /root/ti-deploy/provision.sh   # packages, firewall, database, settings, services
TI_HOST=root@SERVER npm run deploy                  # from code/web
```

`provision.sh` is safe to run again; it keeps the settings, database and releases. Changes to `ti` and to the backup and watchdog units reach the server with the next deploy; changes to `tech-inspection.service` or the Nginx template need `provision.sh` again (the Nginx site is rewritten by `ti domain`).
