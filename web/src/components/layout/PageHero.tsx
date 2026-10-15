type PageHeroProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
};

export function PageHero({ title, subtitle, eyebrow }: PageHeroProps) {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="container-page py-14 sm:py-20">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
          ) : null}
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl">{title}</h1>
          {subtitle ? <p className="mt-4 text-lg text-slate-600">{subtitle}</p> : null}
        </div>
      </div>
    </section>
  );
}
