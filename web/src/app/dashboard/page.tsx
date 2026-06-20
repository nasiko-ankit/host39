"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ApiError, getMe, listCards, getPublicUrl } from "@/lib/api";
import type { Me, AgentCard } from "@/lib/api";
import { clearAuthToken } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const cardClass =
  "rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-card)]";

export default function DashboardPage() {
  useRequireAuth();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [cards, setCards] = useState<AgentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getMe(), listCards()])
      .then(([meData, cardsData]) => {
        if (cancelled) return;
        setMe(meData);
        setCards(cardsData);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          clearAuthToken();
          router.replace("/login");
        } else {
          setError("Could not load your data. Please try again.");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [router]);

  function signOut() {
    clearAuthToken();
    router.replace("/");
  }

  async function copyUrl(url: string, cardId: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(cardId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <PageShell title="Dashboard" description="Loading your agent cards…">
        <div className={`${cardClass} p-6 text-sm text-[color:var(--color-fg-weak)]`}>
          Loading…
        </div>
      </PageShell>
    );
  }

  if (error || !me) {
    return (
      <PageShell title="Dashboard" description="">
        <div className="rounded-[var(--radius-card)] border border-[color:var(--color-danger-soft)] bg-[color:var(--color-danger-soft)] p-4 text-[color:var(--color-danger)]">
          {error ?? "Something went wrong."}
        </div>
      </PageShell>
    );
  }

  const isDomain = me.identity_type === "domain";
  const identityPillClass = isDomain
    ? "bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-deep)]"
    : "bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]";

  return (
    <PageShell
      title="Dashboard"
      description={`Signed in as ${me.email}`}
    >
      <div className="space-y-6">
        {/* Profile card */}
        <div className={`${cardClass} flex items-center justify-between p-5`}>
          <div>
            <p className="font-semibold text-[color:var(--color-fg-strong)]">{me.display_name ?? me.email}</p>
            <p className="text-sm text-[color:var(--color-fg-muted)]">{me.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[color:var(--color-surface-2)] px-2.5 py-0.5 font-mono text-xs text-[color:var(--color-fg-muted)]">
                @{me.handle}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${identityPillClass}`}>
                {isDomain ? `Business · ${me.domain}` : "Personal"}
              </span>
            </div>
          </div>
          <button
            onClick={signOut}
            className="inline-flex h-9 items-center rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 text-sm font-medium text-[color:var(--color-fg-default)] hover:bg-[color:var(--color-surface-2)]"
          >
            Sign out
          </button>
        </div>

        {/* Agent cards */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-fg-weak)]">
              Agent Cards
            </h2>
            <Link
              href="/dashboard/cards/new"
              className="inline-flex h-9 items-center rounded-[var(--radius-control)] bg-[color:var(--color-primary)] px-4 text-sm font-medium text-white transition hover:bg-[color:var(--color-primary-hover)]"
            >
              + New card
            </Link>
          </div>

          {cards.length === 0 ? (
            <div className={`${cardClass} p-8 text-center`}>
              <p className="text-sm text-[color:var(--color-fg-muted)]">
                You have no agent cards yet.
              </p>
              <Link
                href="/dashboard/cards/new"
                className="mt-4 inline-flex h-10 items-center rounded-[var(--radius-control)] bg-[color:var(--color-primary)] px-5 text-sm font-medium text-white transition hover:bg-[color:var(--color-primary-hover)]"
              >
                Create your first card
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cards.map((card) => {
                const publicUrl = getPublicUrl(
                  me.identity_type,
                  me.identity_type === "domain" ? (me.domain ?? me.email) : me.email,
                  card.slug,
                  me.handle
                );

                const statusClass =
                  card.status === "active"
                    ? "bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]"
                    : "bg-[color:var(--color-surface-2)] text-[color:var(--color-fg-weak)]";

                return (
                  <div
                    key={card.id}
                    className={`${cardClass} p-5 transition hover:border-[color:var(--color-border-strong)] hover:shadow-[var(--shadow-card-hover)]`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-[color:var(--color-fg-strong)]">{card.display_name}</p>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusClass}`}>
                            {card.status}
                          </span>
                          {!card.is_public && (
                            <span className="rounded-full bg-[color:var(--color-warning-soft)] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[color:var(--color-warning)]">
                              Private
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-mono text-xs text-[color:var(--color-fg-weak)]">/{card.slug}</p>
                        {card.description && (
                          <p className="mt-1 text-sm text-[color:var(--color-fg-muted)] line-clamp-1">{card.description}</p>
                        )}

                        {/* Public URL */}
                        <div className="mt-3 flex items-center gap-2">
                          <code className="min-w-0 flex-1 truncate rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-1.5 font-mono text-xs text-[color:var(--color-fg-muted)]">
                            {publicUrl}
                          </code>
                          <button
                            onClick={() => copyUrl(publicUrl, card.id)}
                            className="shrink-0 rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-xs text-[color:var(--color-fg-default)] hover:bg-[color:var(--color-surface-2)]"
                          >
                            {copiedId === card.id ? "Copied!" : "Copy"}
                          </button>
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/cards/${card.id}`}
                        className="shrink-0 rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-sm text-[color:var(--color-fg-default)] hover:bg-[color:var(--color-surface-2)]"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
