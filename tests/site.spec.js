import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const homeSections = ["#work", "#services", "#about", "#contact"];

test.describe("home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has the expected semantic structure and launch metadata", async ({ page }) => {
    await expect(page.locator('body[data-site="abdul-sameer-studio"]')).toBeVisible();
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("footer")).toBeVisible();
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

    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();

    await toggle.click();
    await navigation.locator('a[href="#work"]').click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#work")).toBeInViewport();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(hasHorizontalOverflow).toBe(false);
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
