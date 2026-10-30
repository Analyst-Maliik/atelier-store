import Image from "next/image";
import Link from "next/link";
import { heroImage } from "@/lib/site-content";

export function Hero() {
  return (
    <section className="relative isolate flex h-[calc(100svh-7.5rem)] min-h-[34rem] max-h-[60rem] items-end text-canvas">
      <Image
        src={heroImage.src}
        alt={heroImage.alt}
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-[50%_25%]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      <div className="container-site pb-12 lg:pb-20">
        <p className="eyebrow mb-4">Autumn / Winter Collection</p>
        <h1 className="heading-display max-w-2xl">
          Quiet confidence, cut for the season
        </h1>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/collections/women" className="btn btn-light">
            Shop women
          </Link>
          <Link href="/collections/men" className="btn btn-light">
            Shop men
          </Link>
        </div>
      </div>
    </section>
  );
}
