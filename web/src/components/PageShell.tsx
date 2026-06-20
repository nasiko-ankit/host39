import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  eyebrow?: string;
  children: ReactNode;
};

export function PageShell({ title, description, eyebrow, children }: Props) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-fg-weak)]">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-semibold text-[color:var(--color-fg-strong)] leading-tight tracking-[-0.01em]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
