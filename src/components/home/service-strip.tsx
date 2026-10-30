const items = [
  { title: "Complimentary shipping", text: "On every order over $250." },
  { title: "Free returns", text: "Within 30 days of delivery." },
  { title: "Gift wrapping", text: "Presented in our signature packaging." },
];

export function ServiceStrip() {
  return (
    <section className="container-site section">
      <ul className="grid gap-8 border-y border-line py-10 text-center md:grid-cols-3 md:gap-0 md:divide-x md:divide-line">
        {items.map((item) => (
          <li key={item.title} className="px-4">
            <p className="eyebrow mb-2">{item.title}</p>
            <p className="text-muted text-small">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
