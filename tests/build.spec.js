import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

const distributionDirectory = path.resolve("dist");

test("production output contains every deployable static file", async () => {
  const expectedFiles = [
    "index.html",
    "404.html",
    "_headers",
    "robots.txt",
    "THIRD_PARTY_NOTICES.txt",
  ];

  await Promise.all(expectedFiles.map((file) => access(path.join(distributionDirectory, file))));

  const assetFiles = await readdir(path.join(distributionDirectory, "assets"));
  expect(assetFiles.some((file) => /-[a-zA-Z0-9_-]{8,}\.(?:css|js)$/.test(file))).toBe(true);
  expect(assetFiles.some((file) => /-[a-zA-Z0-9_-]{8,}\.webp$/.test(file))).toBe(true);
  expect(assetFiles.filter((file) => file.endsWith(".webp"))).toHaveLength(113);

  const distributionFiles = await listFilesRecursively(distributionDirectory);
  const assetStats = await Promise.all(distributionFiles.map((file) => stat(file)));
  const maximumCloudflareAssetSize = 25 * 1024 * 1024;
  const totalAssetBudget = 25 * 1024 * 1024;

  expect(Math.max(...assetStats.map((file) => file.size))).toBeLessThan(maximumCloudflareAssetSize);
  expect(assetStats.reduce((total, file) => total + file.size, 0)).toBeLessThan(totalAssetBudget);
});

async function listFilesRecursively(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listFilesRecursively(entryPath) : [entryPath];
    }),
  );

  return files.flat();
}

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
