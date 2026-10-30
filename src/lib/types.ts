export type Product = {
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
