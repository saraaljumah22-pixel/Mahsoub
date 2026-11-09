const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const appPath = path.join(root, "app.js");
const appSource = fs.readFileSync(appPath, "utf8");
const productsDeclaration = appSource.match(/const PRODUCTS\s*=\s*(\[[\s\S]*?\n\]);/);

assert.ok(productsDeclaration, "Could not find the PRODUCTS array in app.js");

// app.js keeps this array as a literal, so evaluate only the captured data expression.
const products = JSON.parse(JSON.stringify(vm.runInNewContext(productsDeclaration[1])));

// Approved product facts are taken from the supplied MAHSOUB catalog.
// The catalog does not specify categories or image paths; those assertions
// protect the site's existing menu taxonomy and product image assets.
const expectedProducts = [
  {
    id: "matcha",
    name: "Matcha",
    ar: "ماتشا",
    category: "matcha",
    price: 1.5,
    calories: 39,
    carbs: 12,
    fat: 2.2,
    protein: 1,
    ingredients: ["Matcha", "Erythritol", "Almond Milk"],
    arIngredients: ["ماتشا", "إريثريتول", "حليب اللوز"],
    servings: ["Hot", "Iced"],
    image: "attached_assets/generated_images/matcha.jpg",
  },
  {
    id: "chocolate-milk",
    name: "Chocolate Milk",
    ar: "حليب كاكاو",
    category: "chocolate",
    price: 1,
    calories: 50,
    carbs: 4.8,
    fat: 0.9,
    protein: 4,
    ingredients: ["Skimmed Milk", "Organic Cocoa Powder"],
    arIngredients: ["حليب خالي الدسم", "مسحوق كاكاو عضوي"],
    servings: ["Hot", "Iced"],
    image: "attached_assets/generated_images/chocolate-milk.jpg",
  },
  {
    id: "coffee-latte",
    name: "Coffee Latte",
    ar: "كوفي لاتيه",
    category: "coffee",
    price: 1.25,
    calories: 57,
    carbs: 10,
    fat: 1,
    protein: 2,
    // The supplied catalog omits these; preserve the incoming menu values without inferring new ones.
    ingredients: ["Low-fat Milk", "Espresso Shot", "Zero-Calorie Caramel Syrup", "Stevia", "Erythritol"],
    arIngredients: ["حليب قليل الدسم", "شوت إسبريسو", "سيرب كراميل خالي من السعرات", "ستيفيا", "إريثريتول"],
    servings: ["Hot", "Iced"],
    image: "attached_assets/generated_images/coffee-latte.jpg",
  },
  {
    id: "americano",
    name: "Americano",
    ar: "أمريكانو",
    category: "coffee",
    price: 1,
    calories: 0,
    carbs: 0,
    fat: 0,
    protein: 0,
    // The supplied catalog omits these; preserve the incoming menu values without inferring new ones.
    ingredients: ["Espresso Shot", "Water", "Ice"],
    arIngredients: ["شوت إسبريسو", "ماء", "ثلج"],
    servings: ["Hot", "Iced"],
    image: "attached_assets/generated_images/americano.jpg",
  },
  {
    id: "water",
    name: "Water",
    ar: "ماء",
    category: "water",
    price: 0.25,
    calories: 0,
    carbs: 0,
    fat: 0,
    protein: 0,
    ingredients: ["Regular bottled water"],
    // The catalog names bottled water in English; this preserves the existing Arabic label.
    arIngredients: ["ماء عادي معبأ"],
    servings: [],
    water: true,
    image: "attached_assets/generated_images/water.jpg",
  },
];

assert.equal(products.length, expectedProducts.length, "The catalog must contain exactly five products");
assert.deepEqual(
  products.map(product => product.id),
  expectedProducts.map(product => product.id),
  "Products must remain in the approved order: Matcha, Chocolate Milk, Coffee Latte, Americano, Water",
);

const bestsellerDeclaration = appSource.match(/const BESTSELLER_IDS\s*=\s*(\[[^\]]*\]);/);
assert.ok(bestsellerDeclaration, "Could not find the BESTSELLER_IDS array in app.js");
const bestsellerIds = JSON.parse(bestsellerDeclaration[1]);
assert.deepEqual(
  bestsellerIds,
  expectedProducts.slice(0, 4).map(product => product.id),
  "The bestseller row must preserve the approved relative drink order",
);

for (const [index, expected] of expectedProducts.entries()) {
  const actual = products[index];
  const fields = [
    "id", "name", "ar", "category", "price", "calories", "carbs", "fat",
    "protein", "ingredients", "arIngredients", "servings", "water", "image",
  ];
  const actualDetails = Object.fromEntries(fields.map(field => [field, actual[field]]));
  const expectedDetails = Object.fromEntries(fields.map(field => [field, expected[field]]));

  assert.deepEqual(actualDetails, expectedDetails, `Approved menu details changed for ${expected.name}`);
  assert.ok(
    fs.existsSync(path.join(root, expected.image)),
    `Product image is missing for ${expected.name}: ${expected.image}`,
  );
}

console.log(
  "PASS: five products, approved order and catalog facts, serving options, ingredient data, categories, and existing product images.",
);
