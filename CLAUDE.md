# Portfolio: lucasrgpedersen.com

Personal portfolio site. Astro 4 + the
[Astro Sphere](https://github.com/markhorn-dev/astro-sphere) template
(cloned, not `npm create`). Keep its minimal dark aesthetic.

## Build & deploy

- npm only. `package-lock.json` is the single lockfile. Do NOT add a
  pnpm/yarn lockfile; Cloudflare auto-detects the package manager from
  lockfiles and a stale pnpm lock once broke CI with old pinned versions.
- `npm run build` runs `astro check && astro build`; TypeScript errors fail
  the build. Always verify by exit code, not by skimming output.
- Deployed as a Cloudflare **Worker** with static assets (`wrangler.jsonc`
  serves `./dist`), not classic Pages. `output: "static"`, no server adapter.
- CI: every push to `main` triggers a Cloudflare build. The result is
  reported as a GitHub check-run ("Workers Builds: portfolio").
- After every push to `main`, poll that check-run until it finishes and
  confirm success (do not leave a deploy unverified):
  `gh api repos/LucasLista/portfolio/commits/<sha>/check-runs`.

## Writing style

- No em-dashes (—) anywhere in site content, code comments, or docs. Use a
  comma, colon, semicolon, or period instead.

## Content model (src/content/)

- `projects/`: one folder per project, `index.mdx`. Schema in
  `src/content/config.ts`: title, summary, date, tags, draft?, demoUrl?,
  repoUrl?. Image/PDF assets live in `public/projects/<slug>/`.
- The centroid-estimation project MDX has a marked TODO where a future
  interactive demo component will be imported; the demo is deliberately
  deferred.
- `blog/hello-world` is a `draft: true` placeholder that must stay until a
  real post exists: an empty collection breaks `astro check` on CI (git
  doesn't track empty dirs, so no generated types, so `unknown`).
- Drafts must be filtered in every `getStaticPaths` (already patched in
  blog and projects slug pages); the upstream template builds draft pages
  whose prev/next navigation then crashes.
- Site identity, socials, and nav live in `src/consts.ts`. The Bluesky icon
  was added manually to `public/social.svg`.

## TODOs

- Custom domain `lucasrgpedersen.com` not yet attached to the Worker.
- Stock favicon + `public/open-graph.jpg` still from the template.
- No `src/pages/404.astro`; misses fall back to a plain Cloudflare 404.
