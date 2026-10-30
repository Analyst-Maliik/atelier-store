import Image from "next/image";
import Link from "next/link";
import { editorialImages } from "@/lib/site-content";

export function EditorialSplit() {
  const { story } = editorialImages;
  return (
    <section className="grid bg-surface md:grid-cols-2">
      <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[40rem]">
        <Image
          src={story.src}
          alt={story.alt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center px-gutter py-section md:px-gutter-md lg:px-24">
        <p className="eyebrow text-muted mb-4">The Edit</p>
        <h2 className="heading-display max-w-md">Layers made for city weather</h2>
        <p className="text-muted mt-6 max-w-md">
          Soft tailoring, light wools and long coats in a restrained palette, designed to
          move from morning commutes to evenings out.
        </p>
        <Link href="/collections/outerwear" className="btn btn-outline mt-10 self-start">
          Discover the edit
        </Link>
      </div>
    </section>
  );
}
