// Idempotent seed for the catalogue: `npm run db:seed`.
import { config } from "dotenv";
import { sql } from "drizzle-orm";

config({ path: [".env.local", ".env"] });

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=75`;

const categorySeed = [
  { slug: "handbags", name: "Handbags" },
  { slug: "bags", name: "Bags" },
  { slug: "knitwear", name: "Knitwear" },
  { slug: "outerwear", name: "Outerwear" },
  { slug: "watches", name: "Watches" },
  { slug: "ready-to-wear", name: "Ready-to-wear" },
  { slug: "women", name: "Women" },
  { slug: "men", name: "Men" },
  { slug: "accessories", name: "Accessories" },
];

const productSeed = [
  {
    slug: "structured-top-handle-bag",
    name: "Structured Top-Handle Bag",
    category: "handbags",
    priceCents: 185000,
    stockQuantity: 3,
    imageUrl: img("1584917865442-de89df76afd3"),
    imageAlt: "Red leather top-handle bag",
    badge: "New",
    description:
      "A rigid, architectural handbag in smooth calfskin with a polished metal clasp. Carried by the handle or tucked under the arm.",
    details: ["Smooth calfskin leather", "Metal turn-lock closure", "Suede-lined interior", "Made in Italy"],
  },
  {
    slug: "woven-basket-bag",
    name: "Woven Basket Bag",
    category: "handbags",
    priceCents: 129000,
    stockQuantity: 12,
    imageUrl: img("1590874103328-eac38a683ce7"),
    imageAlt: "Orange woven bag with leather handle",
    badge: null,
    description:
      "Hand-woven rattan with a leather top handle and clasp, light enough for everyday wear and structured enough to hold its shape.",
    details: ["Hand-woven rattan", "Leather handle and trim", "Cotton-lined interior", "Made in Italy"],
  },
  {
    slug: "crochet-knit-poncho",
    name: "Crochet Knit Poncho",
    category: "knitwear",
    priceCents: 64000,
    stockQuantity: 8,
    imageUrl: img("1434389677669-e08b4cac3105"),
    imageAlt: "Cream knit poncho on a hanger",
    badge: null,
    description:
      "An open-weave poncho with a soft V neckline and fringed hem, designed to layer over shirts and slip dresses.",
    details: ["Cotton-blend crochet", "Fringed hem", "One size", "Hand wash cold"],
  },
  {
    slug: "black-leather-jacket",
    name: "Black Leather Jacket",
    category: "outerwear",
    priceCents: 240000,
    stockQuantity: 0,
    imageUrl: img("1551028719-00167b16eac5"),
    imageAlt: "Black leather jacket on a hanger",
    badge: "New",
    description:
      "A biker-cut jacket in supple lambskin with an asymmetric zip and a slim, cropped silhouette.",
    details: ["Lambskin leather", "Asymmetric front zip", "Satin lining", "Dry clean only"],
  },
  {
    slug: "classic-leather-watch",
    name: "Classic Leather Watch",
    category: "watches",
    priceCents: 98000,
    stockQuantity: 15,
    imageUrl: img("1524592094714-0f0654e20314"),
    imageAlt: "Minimal watch with a taupe strap",
    badge: null,
    description:
      "A minimal three-hand watch with a clean white dial, rose-gold case and a taupe leather strap.",
    details: ["36 mm stainless steel case", "Sapphire-coated glass", "Quartz movement", "Water resistant to 30 m"],
  },
  {
    slug: "navy-everyday-backpack",
    name: "Navy Everyday Backpack",
    category: "bags",
    priceCents: 72000,
    stockQuantity: 4,
    imageUrl: img("1553062407-98eeb64c6a62"),
    imageAlt: "Navy backpack",
    badge: null,
    description:
      "A streamlined backpack in water-resistant nylon with a padded laptop sleeve and concealed zip pockets.",
    details: ["Water-resistant nylon", "Padded 15 in laptop sleeve", "Adjustable straps", "Interior zip pocket"],
  },
  {
    slug: "essential-sweatshirt",
    name: "Essential Sweatshirt",
    category: "ready-to-wear",
    priceCents: 38000,
    stockQuantity: 24,
    imageUrl: img("1620799140408-edc6dcb6d633"),
    imageAlt: "White crewneck sweatshirt",
    badge: null,
    description:
      "A relaxed crewneck in brushed organic cotton fleece, cut with a dropped shoulder and ribbed trims.",
    details: ["Organic cotton fleece", "Relaxed fit", "Ribbed cuffs and hem", "Machine wash 30°"],
  },
  {
    slug: "sage-cotton-tee",
    name: "Sage Cotton Tee",
    category: "ready-to-wear",
    priceCents: 19000,
    stockQuantity: 40,
    imageUrl: img("1523381210434-271e8be1f52b"),
    imageAlt: "Sage green t-shirts on hangers",
    badge: null,
    description:
      "A heavyweight cotton tee in a muted sage, garment-dyed for a soft, lived-in finish.",
    details: ["Heavyweight cotton jersey", "Garment dyed", "Regular fit", "Machine wash 30°"],
  },
  {
    slug: "floral-wrap-dress",
    name: "Floral Wrap Dress",
    category: "women",
    priceCents: 129000,
    stockQuantity: 9,
    imageUrl: img("1496747611176-843222e1e57c"),
    imageAlt: "Woman in a cream floral wrap dress by the sea",
    badge: "New",
    description:
      "A flowing wrap dress in a lightweight cream crepe with a hand-painted floral print and a self-tie waist.",
    details: ["Printed viscose crepe", "Self-tie wrap waist", "Midi length", "Made in Portugal"],
  },
  {
    slug: "scarlet-flared-dress",
    name: "Scarlet Flared Dress",
    category: "women",
    priceCents: 168000,
    stockQuantity: 2,
    imageUrl: img("1595777457583-95e059d581b8"),
    imageAlt: "Woman in a red flared dress",
    badge: "New",
    description:
      "A fitted bodice and a full circle skirt in fluid red satin, made to move.",
    details: ["Satin-finish crepe", "Fitted bodice, circle skirt", "Concealed back zip", "Dry clean only"],
  },
  {
    slug: "pale-blue-maxi-dress",
    name: "Pale Blue Maxi Dress",
    category: "women",
    priceCents: 142000,
    stockQuantity: 6,
    imageUrl: img("1539008835657-9e8e9680c956"),
    imageAlt: "Woman in a pale blue wrap maxi dress on a beach",
    badge: null,
    description:
      "A long wrap dress in soft pale blue chiffon with a deep V neckline and an open front slit.",
    details: ["Layered chiffon", "Adjustable tie waist", "Floor length", "Hand wash cold"],
  },
  {
    slug: "checked-oversized-blazer",
    name: "Checked Oversized Blazer",
    category: "women",
    priceCents: 118000,
    stockQuantity: 14,
    imageUrl: img("1485968579580-b6d095142e6e"),
    imageAlt: "Woman in a dark green checked blazer on a city street",
    badge: null,
    description:
      "An easy, oversized blazer in a dark checked wool blend, cut long through the body.",
    details: ["Wool-blend check", "Single-breasted", "Fully lined", "Dry clean only"],
  },
  {
    slug: "navy-tailored-suit",
    name: "Navy Tailored Suit",
    category: "men",
    priceCents: 245000,
    stockQuantity: 5,
    imageUrl: img("1617137968427-85924c800a22"),
    imageAlt: "Man in a navy tailored suit and tan leather shoes",
    badge: "New",
    description:
      "A slim two-piece suit in fine navy wool, half-canvassed and cut close without feeling restricted.",
    details: ["Fine wool twill", "Half-canvassed jacket", "Two-piece, slim fit", "Made in Italy"],
  },
  {
    slug: "charcoal-wool-suit",
    name: "Charcoal Wool Suit",
    category: "men",
    priceCents: 232000,
    stockQuantity: 11,
    imageUrl: img("1507679799987-c73779587ccf"),
    imageAlt: "Man in a dark suit with a striped tie",
    badge: null,
    description:
      "A classic single-breasted suit in charcoal wool, tailored for everyday wear in the office and beyond.",
    details: ["Pure wool", "Single-breasted, two buttons", "Fully lined", "Dry clean only"],
  },
  {
    slug: "poplin-dress-shirt-trio",
    name: "Poplin Dress Shirt",
    category: "men",
    priceCents: 24500,
    stockQuantity: 30,
    imageUrl: img("1602810318383-e386cc2a3ccf"),
    imageAlt: "Folded poplin dress shirts in navy, white and burgundy",
    badge: null,
    description:
      "A crisp cotton poplin shirt with a semi-cutaway collar, available in navy, white and burgundy.",
    details: ["Cotton poplin", "Semi-cutaway collar", "Regular fit", "Machine wash 40°"],
  },
  {
    slug: "rust-bomber-jacket",
    name: "Rust Bomber Jacket",
    category: "men",
    priceCents: 89000,
    stockQuantity: 0,
    imageUrl: img("1591047139829-d91aecb6caea"),
    imageAlt: "Rust-coloured bomber jacket held on a hanger",
    badge: null,
    description:
      "A lightweight bomber with ribbed trims and a zip pocket on the sleeve, in a warm rust shade.",
    details: ["Water-repellent shell", "Ribbed collar, cuffs and hem", "Zip sleeve pocket", "Machine wash 30°"],
  },
  {
    slug: "tan-leather-belt",
    name: "Tan Leather Belt",
    category: "accessories",
    priceCents: 22000,
    stockQuantity: 25,
    imageUrl: img("1624222247344-550fb60583dc"),
    imageAlt: "Tan leather belt with a brushed metal buckle",
    badge: null,
    description:
      "A supple full-grain leather belt with a brushed metal pin buckle that ages to a deeper tan.",
    details: ["Full-grain leather", "Brushed metal buckle", "30 mm width", "Made in Spain"],
  },
  {
    slug: "leather-bifold-wallet",
    name: "Leather Bifold Wallet",
    category: "accessories",
    priceCents: 18500,
    stockQuantity: 4,
    imageUrl: img("1627123424574-724758594e93"),
    imageAlt: "Brown leather bifold wallet",
    badge: "New",
    description:
      "A slim bifold in vegetable-tanned leather with six card slots and a full-length note pocket.",
    details: ["Vegetable-tanned leather", "Six card slots", "Note pocket", "Made in Italy"],
  },
  {
    slug: "blush-chain-shoulder-bag",
    name: "Blush Chain Shoulder Bag",
    category: "accessories",
    priceCents: 96000,
    stockQuantity: 7,
    imageUrl: img("1566150905458-1bf1fc113f0d"),
    imageAlt: "Blush pink shoulder bag with a fine chain strap",
    badge: null,
    description:
      "A compact flap bag in blush leather with a contrast stripe and a removable chain strap.",
    details: ["Smooth leather", "Removable chain strap", "Magnetic flap closure", "Made in Italy"],
  },
];

async function main() {
  // Imported after dotenv has populated process.env (src/db/index.ts reads it on load).
  const { db } = await import("./index");
  const { categories, products } = await import("./schema");

  await db
    .insert(categories)
    .values(categorySeed)
    .onConflictDoUpdate({
      target: categories.slug,
      set: { name: sql`excluded.name` },
    });

  const categoryRows = await db.select().from(categories);
  const categoryId = new Map(categoryRows.map((c) => [c.slug, c.id]));

  const rows = productSeed.map(({ category, ...p }) => {
    const id = categoryId.get(category);
    if (id === undefined) throw new Error(`Unknown category: ${category}`);
    return { ...p, categoryId: id };
  });

  await db
    .insert(products)
    .values(rows)
    .onConflictDoUpdate({
      target: products.slug,
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        details: sql`excluded.details`,
        categoryId: sql`excluded.category_id`,
        priceCents: sql`excluded.price_cents`,
        stockQuantity: sql`excluded.stock_quantity`,
        imageUrl: sql`excluded.image_url`,
        imageAlt: sql`excluded.image_alt`,
        badge: sql`excluded.badge`,
        updatedAt: sql`now()`,
      },
    });

  console.log(`Seeded ${categorySeed.length} categories and ${productSeed.length} products.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
