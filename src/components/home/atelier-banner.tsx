import Image from "next/image";
import Link from "next/link";
import { editorialImages } from "@/lib/site-content";

export function AtelierBanner() {
  const { atelier } = editorialImages;
  return (
    <section className="relative isolate mt-section flex min-h-[28rem] items-center text-canvas lg:mt-section-lg lg:min-h-[36rem]">
      <Image
        src={atelier.src}
        alt={atelier.alt}
        fill
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-black/35" />
      <div className="container-site">
        <p className="eyebrow mb-4">Craftsmanship</p>
        <h2 className="heading-display max-w-xl">Made slowly, worn for years</h2>
        <Link href="/about" className="btn btn-light mt-8">
          Our story
        </Link>
      </div>
    </section>
  );
}
