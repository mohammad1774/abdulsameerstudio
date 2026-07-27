import { expect, test } from "@playwright/test";

for (const pageUnderTest of ["/", "/404.html"]) {
  test(`${pageUnderTest} contains only valid local links`, async ({ page, request }) => {
    await page.goto(pageUnderTest);

    const links = await page.locator("a[href]").evaluateAll((elements) =>
      elements.map((element) => ({
        href: element.getAttribute("href"),
        text: element.textContent?.trim(),
      })),
    );

    expect(links.length).toBeGreaterThan(0);

    for (const link of links) {
      expect(link.href, `Empty link on "${link.text}"`).toBeTruthy();

      const url = new URL(link.href, page.url());

      if (url.protocol === "mailto:") {
        expect(url.pathname, `Unexpected email link on "${link.text}"`).toBe(
          "abdulsameerstudio@gmail.com",
        );
        continue;
      }

      if (url.protocol === "tel:") {
        expect(url.pathname, `Unexpected telephone link on "${link.text}"`).toBe("+13432548524");
        continue;
      }

      expect(["http:", "https:"], `Unsupported link protocol on "${link.text}"`).toContain(
        url.protocol,
      );
      expect(url.origin, `External link on "${link.text}"`).toBe(new URL(page.url()).origin);

      if (url.hash && url.pathname === new URL(page.url()).pathname) {
        await expect(page.locator(url.hash), `Missing target for ${link.href}`).toHaveCount(1);
        continue;
      }

      const response = await request.get(url.href);
      expect(response.status(), `Broken link ${link.href}`).toBeLessThan(400);
    }
  });
}

test("browser-delivered assets are local and available", async ({ page, request }) => {
  await page.goto("/");

  const assets = await page
    .locator('script[src], link[rel="stylesheet"][href], link[rel~="icon"][href], img[src]')
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("src") ?? element.getAttribute("href")),
    );

  expect(assets.length).toBeGreaterThan(0);

  for (const asset of assets) {
    const url = new URL(asset, page.url());
    expect(url.origin, `Third-party asset ${asset}`).toBe(new URL(page.url()).origin);

    const response = await request.get(url.href);
    expect(response.ok(), `Unavailable asset ${asset}`).toBe(true);
  }
});
