import Link from "next/link";

type Props = {
  title: string;
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
};

export function SectionHeading({ title, eyebrow, href, linkLabel = "View all" }: Props) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 lg:mb-12">
      <div>
        {eyebrow && <p className="eyebrow text-muted mb-2">{eyebrow}</p>}
        <h2 className="heading-title">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="eyebrow link shrink-0">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
