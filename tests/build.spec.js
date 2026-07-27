import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

const distributionDirectory = path.resolve("dist");

test("production output contains every deployable static file", async () => {
  const expectedFiles = ["index.html", "404.html", "_headers", "robots.txt"];

  await Promise.all(expectedFiles.map((file) => access(path.join(distributionDirectory, file))));

  const assetFiles = await readdir(path.join(distributionDirectory, "assets"));
  expect(assetFiles.some((file) => /-[a-zA-Z0-9_-]{8,}\.(?:css|js)$/.test(file))).toBe(true);
});

test("production headers protect and temporarily de-index every page", async () => {
  const headers = await readFile(path.join(distributionDirectory, "_headers"), "utf8");

  expect(headers).toContain("Content-Security-Policy:");
  expect(headers).toContain("X-Content-Type-Options:");
  expect(headers).toContain("X-Frame-Options:");
  expect(headers).toContain("Referrer-Policy:");
  expect(headers).toContain("Permissions-Policy:");
  expect(headers).toContain("X-Robots-Tag:");
});

test("robots policy lets crawlers observe the noindex response header", async () => {
  const robots = await readFile(path.join(distributionDirectory, "robots.txt"), "utf8");

  expect(robots).toMatch(/^User-agent:\s*\*/im);
  expect(robots).toMatch(/^Allow:\s*\/$/im);
});
