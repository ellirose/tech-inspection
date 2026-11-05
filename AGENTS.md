<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Deploying

Production is one DigitalOcean server (165.245.163.217) driven by the `ti` command; see `deploy/README.md`. Deploys do not go through Git.

- To deploy, run `npm run deploy -- "what changed"` from `code/web`: it uploads the folder as it is on disk and the server builds it and switches to it (the live site is kept if the build or health check fails).
- On the server: `ssh root@165.245.163.217 ti status | ti releases | ti rollback | ti logs`.
- Settings live only on the server (`ti env`, `ti set KEY=VALUE`, then `ti restart` or `ti rebuild`); never put secrets in the code.
