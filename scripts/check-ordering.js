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
    assert.deepEqual(await page.locator("video").evaluate(video => [video.autoplay, video.controls, video.playsInline]), [true, false, true]);
    await page.waitForFunction(() => !document.querySelector("video").paused);
    assert.equal(await page.locator("#heroVideoToggle,.hero-caption,#bestsellerGrid,.bestsellers-section").count(), 0);
    assert.deepEqual(await page.locator(".featured-card").evaluateAll(cards => cards.map(card => card.dataset.featuredProduct)), ["matcha", "chocolate-milk", "coffee-latte"]);
    const confirmed = {
      matcha: {en:["Matcha","Erythritol","Almond Milk"],ar:["ماتشا","إريثريتول","حليب اللوز"]},
      "chocolate-milk": {en:["Skimmed Milk","Organic Cocoa Powder"],ar:["حليب خالي الدسم","مسحوق كاكاو عضوي"]},
      "coffee-latte": {en:["Low-fat Milk","Espresso Shot","Zero-Calorie Caramel Syrup","Stevia","Erythritol"],ar:["حليب قليل الدسم","شوت إسبريسو","سيرب كراميل خالي من السعرات","ستيفيا","إريثريتول"]},
      americano: {en:["Espresso Shot","Water","Ice"],ar:["شوت إسبريسو","ماء","ثلج"]}
    };
    assert.deepEqual(await page.evaluate(() => PRODUCTS.map(({id,price,calories,carbs,fat,protein}) => ({id,price,calories,carbs,fat,protein}))), [
      {id:"matcha",price:1.5,calories:39,carbs:12,fat:2.2,protein:1},
      {id:"chocolate-milk",price:1,calories:50,carbs:4.8,fat:0.9,protein:4},
      {id:"coffee-latte",price:1.25,calories:57,carbs:10,fat:1,protein:2},
      {id:"americano",price:1,calories:0,carbs:0,fat:0,protein:0},
      {id:"water",price:.25,calories:0,carbs:0,fat:0,protein:0}
    ]);

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
      for (const [id, ingredients] of Object.entries(confirmed)) {
        await page.locator(`#productGrid [data-details="${id}"]`).click();
        const expected=ingredients[language].join(language==="ar"?"، ":", ");
        assert.equal(await page.locator("#modalDescription .ingredient-list").textContent(), expected);
        assert.equal(await page.locator(`#productGrid [data-product="${id}"] .ingredient-list`).textContent(), expected);
        await page.locator("#modalClose").click();
      }
    }
    assert.deepEqual(await page.locator("#productGrid .calorie-display").evaluateAll(nodes => nodes.map(node => Number(node.getAttribute("aria-valuenow")))), [39, 50, 57, 0, 0]);
    await page.locator("#productSearch").fill("أمريكانو");
    assert.equal(await page.locator("#productGrid .product-card").count(), 1);
    await page.locator("#productSearch").fill("");
    await page.locator("#productSearch").fill("no-matching-drink");
    assert.equal(await page.locator("#emptyState").isVisible(), true);
    assert.ok((await page.locator("#emptyState").boundingBox()).height < 100);
    assert.equal(await page.locator(".empty-state,.empty-mark").count(), 0);
    await page.locator("#clearFilters").click();
    await page.locator("#cartToggle").click();
    await page.locator("#checkoutButton").click();
    assert.equal(await page.locator("#authOverlay").isVisible(), true);
    assert.equal(await page.locator("#authTitle").textContent(), "تسجيل الدخول");
    assert.match(await page.locator("#authStatus").textContent(), /سجّلوا الدخول/);
    await count(1);
    assert.notEqual(await page.evaluate(() => localStorage.getItem("mahsoub-cart")), "[]");
    await page.locator("#authClose").click();
    await page.locator('[data-remove="water|none"]').click();
    await count(0);
    await closeCart();
    await page.locator("#accountToggle").click();
    assert.equal(await page.locator("#authForm").isVisible(), true);
    await page.locator("#authModeToggle").click();
    assert.equal(await page.locator("#authTitle").textContent(), "إنشاء حساب");
    await page.locator("#authClose").click();
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ["light","dark"]) {
        await page.evaluate(theme => { document.documentElement.dataset.theme=theme; }, theme);
        for (const locale of ["en","ar"]) {
          await page.evaluate(locale => setLanguage(locale), locale);
          for (const route of ["home","menu","about","contact"]) {
            await page.evaluate(route => showPage(route), route);
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `${route} overflow at ${width}/${theme}/${locale}`);
          }
        }
      }
    }
    await page.setViewportSize({width:1440,height:1000});
    const footerCenters=await page.locator(".footer-inner > *").evaluateAll(items => items.map(item => {const r=item.getBoundingClientRect();return r.top+r.height/2;}));
    assert.ok(Math.max(...footerCenters)-Math.min(...footerCenters)<5, "Desktop footer must align in one row");
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
    console.log("PASS: autoplay control-free video, database catalog reads, exact bilingual ingredients, unchanged prices/nutrition, account and signup UI, unauthenticated checkout protection, cart quantities/removal/totals/persistence, search, responsive pages/themes/languages, invalid saved cart, reduced motion.");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
