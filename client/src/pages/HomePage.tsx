import { HOME_PAGE_TITLE } from "../data/home";

export function HomePage() {
  return (
    <section className="py-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {HOME_PAGE_TITLE}
      </h1>
    </section>
  );
}
