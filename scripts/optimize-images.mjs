import { mkdir, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultSource = path.join(projectRoot, "website-20260727T172328Z-1-001", "website");
const sourceRoot = path.resolve(process.argv[2] ?? defaultSource);
const outputRoot = path.join(projectRoot, "src", "assets", "photos");
const temporaryRoot = path.join(projectRoot, "src", "assets", ".photos-optimized");

const featuredPhotos = [
  { source: "hero.jpg", output: "hero.webp", widths: [960, 1600, 2400] },
  { source: "wedding.jpg", output: "wedding.webp", widths: [720, 1200, 1800] },
  { source: "portrait2.jpg", output: "portrait.webp", widths: [720, 1200, 1800] },
  { source: "newborn.jpg", output: "newborn.webp", widths: [720, 1200, 1800] },
  { source: "corporate.jpg", output: "corporate.webp", widths: [720, 1200, 1800] },
  { source: "about.jpg", output: "about.webp", widths: [720, 1200] },
];

const galleryCategories = ["corporate", "events", "newborn", "portrait", "weddings"];
const expectedGalleryFiles = 48;
const expectedFeaturedFiles = featuredPhotos.reduce(
  (total, photo) => total + photo.widths.length,
  0,
);
const expectedWebpFiles = expectedFeaturedFiles + expectedGalleryFiles * 2;
const sourceStats = await stat(sourceRoot).catch(() => null);

if (!sourceStats?.isDirectory()) {
  throw new Error(
    `Photo source directory was not found: ${sourceRoot}\n` +
      "Pass the extracted website directory as the first argument.",
  );
}

await rm(temporaryRoot, { recursive: true, force: true });
await mkdir(path.join(temporaryRoot, "featured"), { recursive: true });
await mkdir(path.join(temporaryRoot, "gallery"), { recursive: true });

let sourceBytes = 0;
let outputBytes = 0;
let outputFiles = 0;
let galleryFiles = 0;
const galleryDimensions = {};
const galleryIdentities = new Set();

async function renderWebp(source, destination, resize, quality, countSource = true) {
  if (countSource) {
    const sourceFileStats = await stat(source);
    sourceBytes += sourceFileStats.size;
  }

  await mkdir(path.dirname(destination), { recursive: true });
  const outputMetadata = await sharp(source)
    .rotate()
    .resize({
      ...resize,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      effort: 6,
      quality,
      smartSubsample: true,
    })
    .toFile(destination);

  const outputFileStats = await stat(destination);
  outputBytes += outputFileStats.size;
  outputFiles += 1;

  if (outputFileStats.size > 10 * 1024 * 1024) {
    throw new Error(`Optimized asset is unexpectedly large: ${destination}`);
  }

  return {
    width: outputMetadata.width,
    height: outputMetadata.height,
  };
}

for (const photo of featuredPhotos) {
  const parsedOutput = path.parse(photo.output);

  for (const [index, width] of photo.widths.entries()) {
    const isLargest = index === photo.widths.length - 1;
    const outputName = isLargest
      ? photo.output
      : `${parsedOutput.name}-${width}${parsedOutput.ext}`;

    await renderWebp(
      path.join(sourceRoot, photo.source),
      path.join(temporaryRoot, "featured", outputName),
      { width },
      isLargest ? 84 : 82,
      index === 0,
    );
  }
}

for (const category of galleryCategories) {
  const categoryRoot = path.join(sourceRoot, category);
  const entries = await readdir(categoryRoot, { withFileTypes: true });
  const photos = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        !entry.name.endsWith(":Zone.Identifier") &&
        /\.(?:jpe?g)$/i.test(entry.name),
    )
    .sort((left, right) => left.name.localeCompare(right.name));

  for (const photo of photos) {
    const source = path.join(categoryRoot, photo.name);
    const basename = path.parse(photo.name).name;
    const destinationDirectory = path.join(temporaryRoot, "gallery", category);
    const identity = `${category}/${basename.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

    if (galleryIdentities.has(identity)) {
      throw new Error(`Duplicate gallery identity would overwrite an asset: ${identity}`);
    }
    galleryIdentities.add(identity);

    await renderWebp(
      source,
      path.join(destinationDirectory, `${basename}-thumb.webp`),
      { width: 760, height: 1100 },
      78,
    );
    const dimensions = await renderWebp(
      source,
      path.join(destinationDirectory, `${basename}-full.webp`),
      { width: 2200, height: 2200 },
      84,
      false,
    );

    galleryDimensions[`${category}/${basename}`] = [dimensions.width, dimensions.height];
    galleryFiles += 1;
  }
}

if (galleryFiles !== expectedGalleryFiles || outputFiles !== expectedWebpFiles) {
  throw new Error(
    `Expected ${expectedGalleryFiles} gallery sources and ${expectedWebpFiles} WebP outputs, ` +
      `but found ${galleryFiles} sources and created ${outputFiles} outputs.`,
  );
}

await writeFile(
  path.join(temporaryRoot, "gallery-manifest.json"),
  `${JSON.stringify(galleryDimensions, null, 2)}\n`,
  "utf8",
);

await rm(outputRoot, { recursive: true, force: true });
await rename(temporaryRoot, outputRoot);

const sourceMiB = sourceBytes / 1024 / 1024;
const outputMiB = outputBytes / 1024 / 1024;
const reduction = 100 - (outputBytes / sourceBytes) * 100;

console.log(
  `Created ${outputFiles} stripped WebP assets: ` +
    `${sourceMiB.toFixed(1)} MiB → ${outputMiB.toFixed(1)} MiB ` +
    `(${reduction.toFixed(1)}% smaller).`,
);
