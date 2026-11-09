const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const baseURL = process.env.TEST_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/repl/tools/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const count = async value => assert.equal(await page.locator("#cartCount").textContent(), String(value));
  const total = async value => assert.equal(await page.locator(".summary-row.total strong").textContent(), `${value} KWD`);
  const menu = async () => page.locator('.nav-link[data-page="menu"]').click();
  const closeCart = async () => page.locator("#cartClose").click();
  try {
    await page.goto(baseURL, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".featured-card");
    assert.equal(await page.locator(".featured-card").count(), 3);
    await page.waitForFunction(() => document.querySelector("video").readyState >= 2);
    assert.deepEqual(await page.locator("video").evaluate(video => [video.videoWidth, video.videoHeight, video.muted, video.loop]), [1280, 720, true, true]);
    await page.locator("#heroVideoToggle").click();
    assert.equal(await page.locator("video").evaluate(video => video.paused), true);
    await page.locator("#heroVideoToggle").click();

    await page.locator('[data-featured-product="coffee-latte"] [data-serving="Hot"]').click();
    await page.locator('[data-featured-product="coffee-latte"] [data-add-cart]').click();
    assert.match(await page.locator(".cart-item p").textContent(), /Hot/);
    await page.locator('[data-quantity="1"]').click();
    await count(2);
    await total("2.500");
    await closeCart();
    await menu();
    await page.locator('#productGrid [data-product="coffee-latte"] [data-serving="Iced"]').click();
    await page.locator('#productGrid [data-product="coffee-latte"] [data-add-cart]').click();
    assert.equal(await page.locator(".cart-item").count(), 2);
    await total("3.750");
    await closeCart();
    await page.locator('#productGrid [data-product="water"] [data-add-cart]').click();
    await total("4.000");
    await count(4);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("#cartToggle").click();
    await count(4);
    await total("4.000");
    await page.locator('[data-remove="coffee-latte|Hot"]').click();
    await count(2);
    await total("1.500");
    await page.locator('[data-key="coffee-latte|Iced"][data-quantity="-1"]').click();
    await count(1);
    await total("0.250");
    await closeCart();

    for (const language of ["en", "ar"]) {
      if (language === "ar") await page.locator("#languageToggle").click();
      assert.equal(await page.locator("html").getAttribute("dir"), language === "ar" ? "rtl" : "ltr");
      for (const id of ["coffee-latte", "americano"]) {
        await page.locator(`#productGrid [data-details="${id}"]`).click();
        assert.equal(await page.locator("#modalDescription").isHidden(), true);
        await page.locator("#modalClose").click();
      }
      await page.locator('#productGrid [data-details="matcha"]').click();
      assert.match(await page.locator("#modalDescription").textContent(), language === "ar" ? /حليب اللوز/ : /Almond Milk/);
      await page.locator("#modalClose").click();
    }
    assert.deepEqual(await page.locator("#productGrid .calorie-display").evaluateAll(nodes => nodes.map(node => Number(node.getAttribute("aria-valuenow")))), [39, 50, 57, 0, 0]);
    await page.locator("#productSearch").fill("أمريكانو");
    assert.equal(await page.locator("#productGrid .product-card").count(), 1);
    await page.locator("#productSearch").fill("");
    await page.locator("#cartToggle").click();
    await page.locator("#checkoutButton").click();
    assert.match(await page.locator(".order-confirmation").textContent(), /لم يتم إرسال أي طلب حقيقي/);
    await count(0);
    assert.equal(await page.evaluate(() => localStorage.getItem("mahsoub-cart")), "[]");
    await page.locator("#confirmationDone").click();
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => showPage("home"));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `Home overflow at ${width}`);
      await page.evaluate(() => showPage("menu"));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `Menu overflow at ${width}`);
      await page.locator("#themeToggle").click();
    }
    await page.evaluate(() => localStorage.setItem("mahsoub-cart", JSON.stringify([null, {id:"water", serving:"Hot", quantity:1}])));
    await page.reload({ waitUntil: "domcontentloaded" });
    await count(0);
    await context.close();

    const reduced = await browser.newContext({ reducedMotion: "reduce" });
    const reducedPage = await reduced.newPage();
    await reducedPage.goto(baseURL, { waitUntil: "domcontentloaded" });
    await reducedPage.waitForSelector(".featured-card");
    assert.equal(await reducedPage.locator("video").isHidden(), true);
    assert.equal(await reducedPage.locator("video source").getAttribute("src"), null);
    assert.equal(await reducedPage.locator(".hero-fallback").isVisible(), true);
    assert.deepEqual(errors, []);
    console.log("PASS: video, featured drinks, serving variants, cart quantities/removal/totals/persistence, local checkout, bilingual ingredient preservation, calorie values, Arabic search, responsive layouts, themes, invalid saved cart, reduced motion.");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
