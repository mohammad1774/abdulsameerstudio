const DEFAULT_SITE_URL = "https://abdulsameerstudio.ca/";
const SITE_MARKER = /data-site=["']abdul-sameer-studio["']/i;
const NOT_FOUND_MARKER = /data-page=["']not-found["']/i;

const attempts = readPositiveInteger("DEPLOYMENT_VERIFY_ATTEMPTS", 20);
const delayMs = readPositiveInteger("DEPLOYMENT_VERIFY_DELAY_MS", 6000);
const timeoutMs = readPositiveInteger("DEPLOYMENT_VERIFY_TIMEOUT_MS", 15000);
const siteUrl = readSiteUrl();

const checks = [
  ["apex page, security headers, and immutable asset", checkHome],
  ["custom 404 page", checkNotFound],
  ["robots crawl and noindex policy", checkRobots],
  ["HTTP to HTTPS redirect", checkHttpsRedirect],
  ["www to apex redirect", checkWwwRedirect],
];

let lastError;

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    const results = await Promise.allSettled(
      checks.map(async ([name, check]) => {
        await check();
        return name;
      }),
    );
    const failures = results
      .map((result, index) =>
        result.status === "rejected" ? `${checks[index][0]}: ${errorMessage(result.reason)}` : null,
      )
      .filter(Boolean);

    if (failures.length > 0) {
      throw new Error(failures.join("; "));
    }

    console.log(`Production verification passed for ${siteUrl.origin}:`);
    for (const [name] of checks) {
      console.log(`  ✓ ${name}`);
    }
    process.exitCode = 0;
    lastError = undefined;
    break;
  } catch (error) {
    lastError = error;
    if (attempt === attempts) {
      break;
    }

    console.warn(`Verification attempt ${attempt}/${attempts} failed: ${errorMessage(error)}`);
    console.warn(`Retrying in ${delayMs} ms…`);
    await sleep(delayMs);
  }
}

if (lastError) {
  console.error(
    `Production verification failed after ${attempts} attempts: ${errorMessage(lastError)}`,
  );
  process.exitCode = 1;
}

async function checkHome() {
  const response = await request(siteUrl);
  assert(response.status === 200, `${siteUrl.href} returned ${response.status}, expected 200`);

  const html = await response.text();
  assert(SITE_MARKER.test(html), "home page marker is missing");
  assert(hasNoindexMeta(html), "home page robots meta does not include noindex");

  assertHeaderIncludes(response, "x-frame-options", "deny");
  assertHeaderIncludes(response, "x-content-type-options", "nosniff");
  assertHeaderIncludes(response, "referrer-policy", "strict-origin-when-cross-origin");
  assertHeaderIncludes(response, "permissions-policy", "camera=()");
  assertHeaderIncludes(response, "x-robots-tag", "noindex");

  const contentSecurityPolicy = requiredHeader(response, "content-security-policy").toLowerCase();
  for (const directive of [
    "default-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'none'",
    "upgrade-insecure-requests",
  ]) {
    assert(
      contentSecurityPolicy.includes(directive),
      `content-security-policy is missing "${directive}"`,
    );
  }

  const assetPath = findFingerprintedAsset(html);
  const assetUrl = new URL(assetPath, siteUrl);
  const assetResponse = await request(assetUrl);
  assert(
    assetResponse.status === 200,
    `${assetUrl.href} returned ${assetResponse.status}, expected 200`,
  );
  assertHeaderIncludes(assetResponse, "cache-control", "max-age=31536000");
  assertHeaderIncludes(assetResponse, "cache-control", "immutable");
}

async function checkNotFound() {
  const notFoundUrl = new URL(`/__deployment-smoke-test__/missing-${Date.now()}`, siteUrl);
  const response = await request(notFoundUrl);
  assert(response.status === 404, `${notFoundUrl.href} returned ${response.status}, expected 404`);

  const html = await response.text();
  assert(NOT_FOUND_MARKER.test(html), "custom 404 page marker is missing");
  assert(hasNoindexMeta(html), "404 page robots meta does not include noindex");
  assertHeaderIncludes(response, "x-robots-tag", "noindex");
}

async function checkRobots() {
  const robotsUrl = new URL("/robots.txt", siteUrl);
  const response = await request(robotsUrl);
  assert(response.status === 200, `${robotsUrl.href} returned ${response.status}, expected 200`);

  const body = await response.text();
  assert(/^\s*user-agent:\s*\*\s*$/im.test(body), "robots.txt does not target all crawlers");
  assert(
    /^\s*allow:\s*\/\s*$/im.test(body),
    "robots.txt does not allow crawlers to observe the noindex directives",
  );
}

async function checkHttpsRedirect() {
  const requestUrl = new URL("/__deployment-smoke-test__/http?source=deployment", siteUrl);
  requestUrl.protocol = "http:";

  const response = await request(requestUrl, "manual");
  assert(
    isRedirect(response.status),
    `${requestUrl.href} returned ${response.status}, expected a redirect`,
  );

  const location = redirectLocation(response, requestUrl);
  const expected = new URL(requestUrl);
  expected.protocol = "https:";
  assert(
    location.href === expected.href,
    `HTTP redirect target is ${location.href}, expected ${expected.href}`,
  );
}

async function checkWwwRedirect() {
  const requestUrl = new URL(
    "/__deployment-smoke-test__/www/path?source=deployment&value=one%20two",
    siteUrl,
  );
  requestUrl.hostname = `www.${siteUrl.hostname}`;

  const response = await request(requestUrl, "manual");
  assert(response.status === 301, `${requestUrl.href} returned ${response.status}, expected 301`);

  const location = redirectLocation(response, requestUrl);
  const expected = new URL(requestUrl);
  expected.hostname = siteUrl.hostname;
  assert(
    location.href === expected.href,
    `www redirect target is ${location.href}, expected ${expected.href}`,
  );
}

async function request(url, redirect = "follow") {
  return fetch(url, {
    headers: {
      "User-Agent": "abdulsameerstudio-deployment-verifier/1.0",
    },
    redirect,
    signal: AbortSignal.timeout(timeoutMs),
  });
}

function readSiteUrl() {
  const value = process.env.DEPLOYMENT_URL ?? DEFAULT_SITE_URL;
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`DEPLOYMENT_URL is not a valid URL: ${value}`);
  }

  assert(url.protocol === "https:", "DEPLOYMENT_URL must use HTTPS");
  assert(!url.username && !url.password, "DEPLOYMENT_URL cannot contain credentials");
  assert(
    url.pathname === "/" && !url.search && !url.hash,
    "DEPLOYMENT_URL must be an origin URL without a path, query, or fragment",
  );
  assert(!url.hostname.startsWith("www."), "DEPLOYMENT_URL must use the apex hostname");
  return url;
}

function readPositiveInteger(name, fallback) {
  const rawValue = process.env[name];
  if (rawValue === undefined) {
    return fallback;
  }

  const value = Number(rawValue);
  assert(Number.isSafeInteger(value) && value > 0, `${name} must be a positive integer`);
  return value;
}

function findFingerprintedAsset(html) {
  const attributePattern = /(?:href|src)=["'](\/assets\/[^"'?#]+(?:\?[^"']*)?)["']/gi;
  const candidates = [...html.matchAll(attributePattern)].map((match) => match[1]);
  const assetPath = candidates.find((candidate) =>
    /\/assets\/[^/]+-[a-z0-9_-]{6,}\.[a-z0-9]+(?:\?|$)/i.test(candidate),
  );

  assert(assetPath, "home page does not reference a fingerprinted Vite asset");
  return assetPath;
}

function hasNoindexMeta(html) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  return metaTags.some(
    (tag) =>
      /\bname=["']robots["']/i.test(tag) && /\bcontent=["'][^"']*\bnoindex\b[^"']*["']/i.test(tag),
  );
}

function requiredHeader(response, name) {
  const value = response.headers.get(name);
  assert(value, `response is missing the ${name} header`);
  return value;
}

function assertHeaderIncludes(response, name, expectedValue) {
  const value = requiredHeader(response, name);
  assert(
    value.toLowerCase().includes(expectedValue.toLowerCase()),
    `${name} is "${value}", expected it to include "${expectedValue}"`,
  );
}

function redirectLocation(response, requestUrl) {
  const value = requiredHeader(response, "location");
  return new URL(value, requestUrl);
}

function isRedirect(status) {
  return [301, 302, 307, 308].includes(status);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
