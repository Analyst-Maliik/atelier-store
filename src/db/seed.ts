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
