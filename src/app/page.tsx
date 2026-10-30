import { AtelierBanner } from "@/components/home/atelier-banner";
import { CollectionGrid } from "@/components/home/collection-grid";
import { EditorialSplit } from "@/components/home/editorial-split";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Hero } from "@/components/home/hero";
import { ServiceStrip } from "@/components/home/service-strip";

export default function Home() {
  return (
    <>
      <Hero />
      <CollectionGrid />
      <FeaturedProducts />
      <EditorialSplit />
      <AtelierBanner />
      <ServiceStrip />
    </>
  );
}
