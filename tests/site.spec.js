import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const homeSections = ["#services", "#portfolio", "#about", "#testimonials", "#booking"];

test.describe("home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has the expected semantic structure and launch metadata", async ({ page }) => {
    await expect(page.locator('body[data-site="abdul-sameer-studio"]')).toBeVisible();
    await expect(page.locator('body[data-release="portfolio"]')).toBeVisible();
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page).toHaveTitle(/Abdul Sameer Studio/i);

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://abdulsameerstudio.ca/",
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      "https://abdulsameerstudio.ca/",
    );
    await expect(page.locator("img[srcset]")).toHaveCount(6);
    await expect(page.locator("img[srcset][sizes]")).toHaveCount(6);

    const headerHasStableContrast = await page.locator("[data-site-header]").evaluate((header) => {
      const components = window
        .getComputedStyle(header)
        .backgroundColor.match(/[\d.]+/g)
        ?.map(Number);

      return Boolean(
        components &&
        (components.length === 3 || (components.length >= 4 && components[3] >= 0.85)),
      );
    });
    expect(headerHasStableContrast).toBe(true);

    for (const section of homeSections) {
      await expect(page.locator(section)).toHaveCount(1);
      await expect(page.locator(`#primary-navigation a[href="${section}"]`)).toHaveCount(1);
    }

    await expect(page.locator("[data-current-year]").first()).toHaveText(
      String(new Date().getFullYear()),
    );
  });

  test("loads without browser errors, failed assets, or third-party resources", async ({
    page,
  }) => {
    const browserErrors = [];
    const failedResources = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        browserErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400) {
        failedResources.push(`${response.status()} ${response.url()}`);
      }
    });

    const response = await page.goto("/");
    await page.waitForLoadState("networkidle");

    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const viewportHeight = page.viewportSize()?.height ?? 800;
    for (let offset = 0; offset < pageHeight; offset += viewportHeight) {
      await page.evaluate((nextOffset) => window.scrollTo(0, nextOffset), offset);
      await page.waitForTimeout(25);
    }
    await page.waitForFunction(() =>
      [...document.images].every((image) => image.complete && image.naturalWidth > 0),
    );
    await page.evaluate(() => window.scrollTo(0, 0));

    expect(response?.ok()).toBe(true);
    expect(browserErrors).toEqual([]);
    expect(failedResources).toEqual([]);

    const thirdPartyResources = await page.evaluate(() => {
      const currentOrigin = window.location.origin;

      return performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .filter((resource) => {
          const url = new URL(resource, currentOrigin);
          return url.protocol !== "data:" && url.origin !== currentOrigin;
        });
    });

    expect(thirdPartyResources).toEqual([]);
  });

  test("provides working in-page navigation", async ({ page }) => {
    for (const section of homeSections) {
      await page.locator(`#primary-navigation a[href="${section}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${section.slice(1)}$`));
      await expect(page.locator(section)).toBeInViewport();
    }
  });

  test("makes the skip link and keyboard focus clearly usable", async ({ page }) => {
    const skipLink = page.locator('a[href="#main-content"]').first();

    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();

    const focusIsVisible = await skipLink.evaluate((element) => {
      const style = window.getComputedStyle(element);
      const hasOutline = style.outlineStyle !== "none" && style.outlineWidth !== "0px";
      const hasShadow = style.boxShadow !== "none";
      return hasOutline || hasShadow;
    });
    expect(focusIsVisible).toBe(true);

    await page.keyboard.press("Enter");
    await expect(page.locator("main#main-content")).toBeFocused();
  });
});

test.describe("mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens, closes, and does not overflow the viewport", async ({ page }) => {
    await page.goto("/");

    const toggle = page.locator(".nav-toggle");
    const navigation = page.locator("#primary-navigation");

    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(navigation).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(navigation).toHaveAttribute("data-open", "");
    await expect(page.locator("main")).toHaveAttribute("inert", "");
    await expect(navigation.locator("a[href]").first()).toBeFocused();

    const openMenuAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(openMenuAccessibility.violations).toEqual([]);

    await page.keyboard.press("Shift+Tab");
    await expect(toggle).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(navigation.locator("a[href]").last()).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(toggle).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
    await expect(page.locator("main")).not.toHaveAttribute("inert", "");

    await toggle.click();
    await navigation.locator('a[href="#portfolio"]').click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#portfolio")).toBeInViewport();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});

test.describe("portfolio gallery", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#gallery")).toHaveAttribute("aria-busy", "false");
  });

  test("filters all supplied photographs without leaving the page", async ({ page }) => {
    const expectedCategoryCounts = {
      all: 48,
      portrait: 10,
      wedding: 12,
      event: 6,
      newborn: 11,
      corporate: 9,
    };

    for (const [filter, expectedCount] of Object.entries(expectedCategoryCounts)) {
      const filterButton = page.locator(`.gallery-filter[data-filter="${filter}"]`);
      await filterButton.click();

      await expect(filterButton).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(".gallery-item")).toHaveCount(expectedCount);

      const noun = expectedCount === 1 ? "photograph" : "photographs";
      await expect(page.locator("#gallery-status")).toHaveText(`${expectedCount} ${noun} shown`);
    }
  });

  test("reserves the correct layout space for every gallery image", async ({ page }) => {
    const galleryImages = page.locator(".gallery-image");
    await expect(galleryImages).toHaveCount(48);

    const invalidDimensions = await galleryImages.evaluateAll((images) =>
      images
        .map((image) => ({
          source: image.getAttribute("src"),
          width: image.getAttribute("width"),
          height: image.getAttribute("height"),
        }))
        .filter(({ width, height }) => Number(width) <= 0 || Number(height) <= 0),
    );

    expect(invalidDimensions).toEqual([]);

    const misalignedTiles = await page.locator(".gallery-item").evaluateAll((items) =>
      items
        .map((item) => {
          const image = item.querySelector("img");
          return {
            itemHeight: item.getBoundingClientRect().height,
            imageHeight: image?.getBoundingClientRect().height ?? 0,
          };
        })
        .filter(({ itemHeight, imageHeight }) => Math.abs(itemHeight - imageHeight) > 1),
    );

    expect(misalignedTiles).toEqual([]);
  });

  test("opens an accessible keyboard-operated lightbox and restores focus", async ({ page }) => {
    const firstPhoto = page.locator(".gallery-item").first();
    const dialog = page.locator("#lightbox");

    await firstPhoto.click();
    await expect(dialog).toBeVisible();
    await expect(page.locator("[data-lightbox-close]")).toBeFocused();
    await expect(page.locator("[data-lightbox-image]")).toHaveJSProperty("complete", true);
    await expect
      .poll(() => page.locator("[data-lightbox-image]").evaluate((image) => image.naturalWidth))
      .toBeGreaterThan(0);

    const openLightboxAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(openLightboxAccessibility.violations).toEqual([]);

    const firstCaption = await page.locator("[data-lightbox-caption]").textContent();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("[data-lightbox-caption]")).not.toHaveText(firstCaption ?? "");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(firstPhoto).toBeFocused();
  });
});

test.describe("not-found page", () => {
  test("offers a semantic path back home", async ({ page }) => {
    const response = await page.goto("/404.html");

    expect(response?.ok()).toBe(true);
    await expect(page.locator('body[data-page="not-found"]')).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText("This frame is empty.");
    await expect(page.getByRole("link", { name: "Return home" })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  });
});

for (const pageUnderTest of ["/", "/404.html"]) {
  test(`${pageUnderTest} has no detectable WCAG A or AA violations`, async ({ page }) => {
    await page.goto(pageUnderTest);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}
