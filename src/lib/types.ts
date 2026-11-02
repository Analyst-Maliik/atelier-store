export type Product = {
  /** Database id: used to reference the product from order lines. */
  id: number;
  slug: string;
  name: string;
  description: string;
  details: string[];
  category: { slug: string; name: string };
  /** Price in cents. */
  priceCents: number;
  /** Units available. 0 means sold out. */
  stock: number;
  image: string;
  imageAlt: string;
  badge: string | null;
};
