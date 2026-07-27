# Abdul Sameer Studio

A responsive, accessible photography website for Abdul Sameer Studio, built
with semantic HTML, locally compiled CSS, and vanilla JavaScript. It is deployed to
[Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
at [abdulsameerstudio.ca](https://abdulsameerstudio.ca).

The demo is intentionally excluded from search indexing until the final business
content is ready. It has no form, CMS, database, analytics, cookies, or
third-party browser request. Fonts and portfolio photographs are self-hosted.

`robots.txt` allows crawlers to fetch the demo so they can observe the
`X-Robots-Tag` header and HTML robots metadata that enforce `noindex`. Blocking
crawling in `robots.txt` could prevent those directives from being seen and
leave a URL-only search result.

## Architecture

- Vite builds the root `index.html` and `404.html` into `dist/` and fingerprints
  JavaScript and CSS under `dist/assets/`.
- `src/` contains the local styles, JavaScript, self-hosted fonts, and optimized
  photo derivatives.
- Tailwind and PostCSS run only during the local/CI build. No Tailwind CDN or
  runtime dependency is delivered to visitors.
- `public/` contains static files copied unchanged into `dist/`, including
  `robots.txt`, the favicon, and Cloudflare's `_headers` configuration.
- `tests/` contains browser, link, and accessibility coverage.
- `wrangler.jsonc` deploys `dist/` directly as Workers Static Assets. There is no
  Worker script and this project does not use Cloudflare Pages.
- GitHub Actions builds and tests once, uploads the tested `dist/` artifact, and
  deploys that exact artifact from `main`.

## Local development

Node.js 24 LTS and npm are required. With `nvm` installed:

```bash
nvm install
nvm use
npm ci
npm exec -- playwright install chromium
npm run dev
```

Vite prints the local URL. Use `Ctrl+C` to stop the server.
On a fresh Linux workstation, use
`npm exec -- playwright install --with-deps chromium` if the required browser
system libraries are not already installed.

| Command                     | Purpose                                                |
| --------------------------- | ------------------------------------------------------ |
| `npm run dev`               | Start the Vite development server                      |
| `npm run build`             | Create the production `dist/` output                   |
| `npm run preview`           | Preview the built site locally                         |
| `npm run format`            | Format supported source files                          |
| `npm run format:check`      | Verify formatting without changing files               |
| `npm run lint`              | Run HTML, CSS, and JavaScript static analysis          |
| `npm run images:optimize`   | Rebuild stripped WebP derivatives from local originals |
| `npm run test`              | Run the Playwright browser test suite                  |
| `npm run check`             | Run every quality gate, including the production build |
| `npm run deploy:cloudflare` | Deploy `dist/` with the pinned Wrangler version        |
| `npm run verify:deployment` | Smoke-test the production domain                       |

Before opening a pull request, run:

```bash
npm ci
npm exec -- playwright install chromium
npm run check
```

## Photo asset workflow

The full-resolution source photographs are intentionally excluded from Git.
They are much larger than a website needs, may contain camera metadata, and
should not become permanent objects in a public repository.

The default local source directory is
`website-20260727T172328Z-1-001/website`. To rebuild the web assets from that
folder:

```bash
npm run images:optimize
```

To use another extracted source directory:

```bash
npm run images:optimize -- /absolute/path/to/website
```

The optimizer auto-orients each JPEG, strips EXIF and embedded profiles, and
creates:

- responsive WebP variants for the six featured hero, service, and about photographs;
- a 760-pixel thumbnail and a 2200-pixel lightbox image for each of the 48
  portfolio photographs.

Only the generated files under `src/assets/photos/` are committed. Vite gives
them content-hashed production names, and the build tests enforce Cloudflare's
25 MiB per-file limit plus a 25 MiB total asset budget.

Before publishing new photographs—especially photographs of children—confirm
that the studio has the necessary copyright, model, and parental permissions.
The locally bundled font notices are documented in
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## Credential setup

Production deployment needs two Cloudflare values. Store them only in the
GitHub `production` environment:

| Name                    | GitHub setting       | Value                                                                                                                                    |
| ----------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Environment secret   | Account-owned token with **Account > Workers Scripts > Edit** plus **Zone > Workers Routes > Read** restricted to `abdulsameerstudio.ca` |
| `CLOUDFLARE_ACCOUNT_ID` | Environment variable | The 32-character ID of the Cloudflare account that owns the zone                                                                         |

`GITHUB_TOKEN` is supplied automatically by GitHub Actions. Do not create a
GitHub personal access token for the workflow. Do not use a Cloudflare Global
API Key, API email, Zone ID, or DNS credential.

### 1. Sign in to GitHub locally

Check the current session with `gh auth status`. If it is missing or expired,
use browser authentication:

```bash
gh auth login -h github.com -p https --web --scopes "repo,workflow"
```

Never paste the resulting credential into an issue, commit, chat, or repository
file.

### 2. Copy the Cloudflare Account ID

In Cloudflare, open **Account Home**, use the menu at the end of the account row,
and select **Copy account ID**. It is also shown under **Workers & Pages >
Account details**. See Cloudflare's
[account ID instructions](https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/).

### 3. Create the deployment token

An account-owned token is preferred because it is a durable CI service identity.
Creating one requires Cloudflare Super Administrator access.

1. Open **Manage Account > Account API Tokens > Create Token**.
2. Name it `github-actions-abdulsameerstudio`.
3. Add **Account > Workers Scripts > Edit**. Cloudflare's API documentation
   calls the same permission `Workers Scripts Write`.
4. Add a separate **Zone > Workers Routes > Read** policy for only
   `abdulsameerstudio.ca`. Wrangler reads the existing routes as a conflict
   check before attaching the custom domain; write access is not required.
5. Restrict the account policy to only the account containing
   `abdulsameerstudio.ca`.
6. Set an expiry one year from creation and schedule rotation before that date.
7. Review the summary, create the token, and copy it once.

These two permissions cover static-asset upload, Wrangler's read-only route
check, and custom-domain attachment. Do not add DNS, Workers Routes Write, KV,
R2, Tail, SSL, Rulesets, or account-administration access. Cloudflare documents
the permissions for
[asset upload](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/assets/subresources/upload/methods/create/),
[listing routes](https://developers.cloudflare.com/api/resources/workers/subresources/routes/methods/list/),
and
[custom-domain attachment](https://developers.cloudflare.com/api/resources/workers/subresources/domains/methods/update/).

If an account-owned token cannot be created, use a user API token with the same
two permissions and account/zone restrictions.

### 4. Configure the GitHub production environment

In `mohammad1774/abdulsameerstudio`, open **Settings > Environments**, create an
environment named `production`, and:

1. Restrict deployment branches to `main`.
2. Add `CLOUDFLARE_ACCOUNT_ID` under **Environment variables**.
3. Add `CLOUDFLARE_API_TOKEN` under **Environment secrets**.

Paste the token directly into GitHub's secret field. Do not put it in `.env`,
`.dev.vars`, shell history, workflow YAML, repository settings variables,
artifacts, or logs.

## One-time Cloudflare domain configuration

These dashboard changes deliberately stay outside CI so the deployment token
does not need DNS or Rules permissions.

### Confirm the zone and HTTPS

1. In Cloudflare, open the `abdulsameerstudio.ca` zone and confirm its status is
   **Active**. Its registrar nameservers already point to Cloudflare; do not
   replace them.
2. Open **SSL/TLS > Overview** and ensure the encryption mode is not **Off**.
3. Open **SSL/TLS > Edge Certificates** and enable **Always Use HTTPS**.

Do not enable HSTS preload for this initial demo. Cloudflare's
[Always Use HTTPS setting](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/always-use-https/)
will handle HTTP-to-HTTPS redirects at the edge.

The first successful `wrangler deploy` attaches the apex hostname as a Workers
Custom Domain and provisions its DNS record and certificate. Do not create a
separate apex placeholder record.

### Redirect `www` to the apex domain

Workers Custom Domains match exact hostnames, so `www` needs a proxied DNS record
before Cloudflare can apply a redirect:

1. Open **DNS > Records > Add record**.
2. Set **Type** to `AAAA`, **Name** to `www`, **IPv6 address** to `100::`, **Proxy
   status** to **Proxied**, and **TTL** to **Auto**.
3. Open **Rules > Overview > Create rule > Redirect Rule**.
4. Name the rule `www-to-apex`.
5. Choose **Wildcard pattern** and enter:
   - Request URL: `https://www.abdulsameerstudio.ca/*`
   - Target URL: `https://abdulsameerstudio.ca/${1}`
   - Status code: `301`
   - Preserve query string: **Enabled**
6. Select **Deploy**.

The placeholder address is intentionally non-routable; Cloudflare answers the
proxied request and applies the rule. This setup follows Cloudflare's
[Custom Domain redirect guidance](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/#redirect-between-www-and-root-domain).

## Deployment

Pull requests run quality checks but cannot access production secrets or deploy.
A push to `main` deploys only after the `quality` job succeeds. The production
job downloads the already-tested `dist/` artifact, deploys it using the
lockfile-pinned Wrangler CLI, and runs retrying smoke tests against the public
domain. Production deployments use non-cancelling concurrency. If either
required Cloudflare value is missing, the production job fails before it
downloads or deploys anything.

After the first `quality` check exists, protect `main` with a repository ruleset:

- Require pull requests and the up-to-date `Quality` status check.
- Require conversation resolution and linear history.
- Block force pushes and branch deletion.
- Keep required approvals at zero while there is one maintainer.

For an authorized manual deployment, authenticate Wrangler with its browser
flow, then build, deploy, and verify:

```bash
npm ci
npm exec -- wrangler login
npm run check
npm run deploy:cloudflare
npm run verify:deployment
```

The verifier defaults to `https://abdulsameerstudio.ca`. Its retry behavior can
be adjusted with `DEPLOYMENT_VERIFY_ATTEMPTS`,
`DEPLOYMENT_VERIFY_DELAY_MS`, and `DEPLOYMENT_VERIFY_TIMEOUT_MS`.

## Rollback

A Cloudflare Worker version includes its static assets and configuration, so a
rollback restores the full prior website release.

From **Workers & Pages > abdulsameerstudio > Deployments**, open the menu for the
last known-good version and select **Rollback**. Or, from an authenticated local
checkout, use the pinned Wrangler CLI:

```bash
npm exec -- wrangler rollback
```

With no version ID, Wrangler selects the version before the latest release. To
choose a known version explicitly:

```bash
npm exec -- wrangler rollback <VERSION_ID> --message "Restore last known-good release"
npm run verify:deployment
```

A rollback takes effect immediately across every attached route and domain. It
does not change the local repository, so follow it by fixing or reverting the
faulty commit on `main`. See Cloudflare's
[rollback documentation](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/).

## Enabling search indexing later

When the final content is approved, update the complete indexing configuration
in one pull request: remove `X-Robots-Tag` from `public/_headers`, replace the
robots `noindex` metadata in both HTML pages, and add a sitemap reference to the
already crawl-allowing `public/robots.txt`. Until then, the header and metadata
controls should remain consistent.

This repository is public but intentionally has no open-source license.
