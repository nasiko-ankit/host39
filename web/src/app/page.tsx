import Link from "next/link";

const SAMPLE_CARD = {
  name: "Moon Bakery Orders Agent",
  description: "Place and track orders at Moon Bakery.",
  url: "https://moonbakery-orders.aws.example.com",
  version: "1.0",
  capabilities: { streaming: false, pushNotifications: false },
  authentication: { schemes: ["Bearer"] },
  skills: [
    { name: "placeOrder", description: "Place a new bakery order" },
    { name: "trackOrder", description: "Track an existing order status" },
  ],
  provider: { organization: "Moon Bakery", url: "https://moonbakery.com" },
  _meta: {
    identifier: "urn:ai:domain:moonbakery.com:agent:orders",
    publicUrl: "https://agentcards.host39.org/moonbakery.com/orders.json",
    hostedBy: "host39.org",
  },
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[color:var(--color-fg-weak)]">
            Agent Card Hosting
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-[-0.01em] text-[color:var(--color-fg-strong)] sm:text-5xl">
            host your agents
            <br />
            <span className="text-[color:var(--color-fg-weak)]">at predictable URLs</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
            host39 is a third-party A2A agent card host. Register your identity, create agent cards,
            and publish them at stable public URLs — no server required.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-[var(--radius-control)] bg-[color:var(--color-primary)] px-5 text-sm font-medium text-white shadow-[var(--shadow-sm)] transition hover:bg-[color:var(--color-primary-hover)]"
            >
              Get started free
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 text-sm font-medium text-[color:var(--color-fg-default)] transition hover:bg-[color:var(--color-surface-2)] hover:border-[color:var(--color-border-strong)]"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-fg-weak)]">
          How it works
        </p>
        <h2 className="mb-8 text-2xl font-semibold tracking-[-0.01em] text-[color:var(--color-fg-strong)] sm:text-3xl">
          Three steps to publish your agent
        </h2>

        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Register",
              desc: "Create an account with your email or a domain identity (for businesses). Domain users get URLs like /moonbakery.com/orders.json.",
            },
            {
              step: "02",
              title: "Create a card",
              desc: "Fill in your agent name, runtime URL, capabilities, authentication, and skills using our guided form.",
            },
            {
              step: "03",
              title: "Share the URL",
              desc: "Your card is live at a stable public URL. Register it with the NANDA Index so resolvers can find your agent by identity.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-card-hover)] hover:border-[color:var(--color-border-strong)]"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-primary-soft)] text-xs font-semibold text-[color:var(--color-primary-deep)]">
                {item.step}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-[color:var(--color-fg-strong)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* URL patterns */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-fg-weak)]">
          URL patterns
        </p>
        <h2 className="mb-8 text-2xl font-semibold tracking-[-0.01em] text-[color:var(--color-fg-strong)] sm:text-3xl">
          Predictable, stable, public
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-primary-soft)] p-6 shadow-[var(--shadow-card)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-primary-deep)]">Business / Domain</p>
            <code className="mt-3 block rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 font-mono text-sm text-[color:var(--color-primary-deep)]">
              /moonbakery.com/orders.json
            </code>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
              Register with a domain identity to get clean, branded URLs for your business agents.
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-accent-soft)] p-6 shadow-[var(--shadow-card)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-accent)]">Personal / Email</p>
            <code className="mt-3 block rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 font-mono text-sm text-[color:var(--color-accent)]">
              /personal/john@hotmail.com/card.json
            </code>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
              Register with your email for personal agent cards — great for developers and individuals.
            </p>
          </div>
        </div>
      </section>

      {/* Sample agent card */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-fg-weak)]">
          A2A Agent Card format
        </p>
        <h2 className="mb-8 text-2xl font-semibold tracking-[-0.01em] text-[color:var(--color-fg-strong)] sm:text-3xl">
          Standard JSON, served instantly
        </h2>

        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-code-bg)] p-6 shadow-[var(--shadow-card)]">
          <pre className="font-mono text-sm leading-6 text-[color:var(--color-code-fg)]">
            {JSON.stringify(SAMPLE_CARD, null, 2)}
          </pre>
        </div>
      </section>
    </>
  );
}
