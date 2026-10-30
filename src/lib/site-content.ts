// Editorial homepage content. Not stored in the database.

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=75`;

export type Collection = {
  slug: string;
  name: string;
  image: string;
  alt: string;
};

export const heroImage = {
  src: img("1483985988355-763728e1935b"),
  alt: "Woman in a burgundy coat holding shopping bags",
};

export const editorialImages = {
  story: {
    src: img("1539109136881-3be0616acf4b"),
    alt: "Model in a pale blue coat in a city square",
  },
  atelier: {
    src: img("1490481651871-ab68de25d43d"),
    alt: "Garments hanging on a rail",
  },
};

export const collections: Collection[] = [
  { slug: "women", name: "Women", image: img("1572804013309-59a88b7e92f1"), alt: "Woman in a red dress" },
  { slug: "men", name: "Men", image: img("1594938298603-c8148c4dae35"), alt: "Man in a blue tailored suit" },
  { slug: "knitwear", name: "Knitwear", image: img("1556905055-8f358a7a47b2"), alt: "Folded knitwear and denim" },
  { slug: "outerwear", name: "Outerwear", image: img("1445205170230-053b83016050"), alt: "Coats on a boutique rail" },
];
