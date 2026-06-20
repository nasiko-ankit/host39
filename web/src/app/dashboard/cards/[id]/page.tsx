"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ApiError, getCard, getMe, updateCard, deleteCard, getPublicUrl } from "@/lib/api";
import type { AgentCard, Me } from "@/lib/api";
import { clearAuthToken } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

// ── Shared primitives (token-bound) ───────────────────────────────────────────

const cardClass =
  "rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-card)]";

const inputClass =
  "w-full h-10 rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 text-sm text-[color:var(--color-fg-default)] outline-none transition focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary-soft)]";

const textareaClass =
  "w-full rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-sm text-[color:var(--color-fg-default)] outline-none transition focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary-soft)] resize-none";

const primaryBtnClass =
  "inline-flex h-10 items-center rounded-[var(--radius-control)] bg-[color:var(--color-primary)] px-5 text-sm font-medium text-white transition hover:bg-[color:var(--color-primary-hover)] disabled:opacity-60";

const secondaryBtnClass =
  "inline-flex h-10 items-center rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 text-sm font-medium text-[color:var(--color-fg-default)] transition hover:bg-[color:var(--color-surface-2)]";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-fg-weak)]">
      {children}
    </p>
  );
}

export default function EditCardPage() {
  useRequireAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [me, setMe] = useState<Me | null>(null);
  const [card, setCard] = useState<AgentCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Form state
  const [slug, setSlug] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [runtimeUrl, setRuntimeUrl] = useState("");
  const [providerName, setProviderName] = useState("");
  const [providerUrl, setProviderUrl] = useState("");
  const [version, setVersion] = useState("1.0");
  const [streaming, setStreaming] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [authScheme, setAuthScheme] = useState("none");
  const [skillsJson, setSkillsJson] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getMe(), getCard(id)])
      .then(([meData, cardData]) => {
        if (cancelled) return;
        setMe(meData);
        setCard(cardData);
        // Populate form
        setSlug(cardData.slug);
        setDisplayName(cardData.display_name);
        setDescription(cardData.description ?? "");
        setRuntimeUrl(cardData.runtime_url ?? "");
        setProviderName(cardData.provider_name ?? "");
        setProviderUrl(cardData.provider_url ?? "");
        setVersion(cardData.version ?? "1.0");
        setStreaming(cardData.capabilities.streaming ?? false);
        setPushNotifications(cardData.capabilities.pushNotifications ?? false);
        const schemes = cardData.authentication.schemes ?? ["none"];
        setAuthScheme(schemes[0] ?? "none");
        setSkillsJson(cardData.skills.length > 0 ? JSON.stringify(cardData.skills, null, 2) : "");
        setStatus(cardData.status);
        setIsPublic(cardData.is_public);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          clearAuthToken();
          router.replace("/login");
        } else if (err instanceof ApiError && err.status === 404) {
          router.replace("/dashboard");
        } else {
          setError("Could not load card.");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id, router]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    let skills: unknown[] = [];
    if (skillsJson.trim()) {
      try {
        const parsed = JSON.parse(skillsJson);
        if (!Array.isArray(parsed)) {
          setError("Skills must be a JSON array");
          setSaving(false);
          return;
        }
        skills = parsed;
      } catch {
        setError("Invalid JSON in skills field");
        setSaving(false);
        return;
      }
    }

    try {
      const updated = await updateCard(id, {
        slug,
        display_name:  displayName,
        description:   description || undefined,
        runtime_url:   runtimeUrl || undefined,
        version:       version || "1.0",
        capabilities:  { streaming, pushNotifications },
        authentication: { schemes: [authScheme] },
        skills,
        provider_name: providerName || undefined,
        provider_url:  providerUrl || undefined,
        status,
        is_public:     isPublic,
      });
      setCard(updated);
      setSuccess("Card updated successfully.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to update card.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteCard(id);
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to delete card.");
      }
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <PageShell title="Edit card" description="Loading…">
        <div className={`${cardClass} p-6 text-sm text-[color:var(--color-fg-weak)]`}>
          Loading…
        </div>
      </PageShell>
    );
  }

  if (!card || !me) {
    return (
      <PageShell title="Edit card" description="">
        <div className="rounded-[var(--radius-card)] border border-[color:var(--color-danger-soft)] bg-[color:var(--color-danger-soft)] p-4 text-[color:var(--color-danger)]">
          {error ?? "Card not found."}
        </div>
      </PageShell>
    );
  }

  const publicUrl = getPublicUrl(
    me.identity_type,
    me.identity_type === "domain" ? (me.domain ?? me.email) : me.email,
    slug || card.slug,
    me.handle
  );

  return (
    <PageShell
      title={`Edit: ${card.display_name}`}
      description="Update your agent card details."
    >
      <div className="max-w-lg space-y-6">
        {/* Public URL banner */}
        {isPublic ? (
          <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-primary-soft)] p-5 shadow-[var(--shadow-card)]">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-primary-deep)]">
              Public URL
            </p>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate font-mono text-sm text-[color:var(--color-primary-deep)]">
                {publicUrl}
              </code>
              <button
                onClick={() => copyUrl(publicUrl)}
                className="shrink-0 rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-xs text-[color:var(--color-fg-default)] hover:bg-[color:var(--color-surface-2)]"
              >
                {copiedUrl ? "Copied!" : "Copy"}
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-xs text-[color:var(--color-fg-default)] hover:bg-[color:var(--color-surface-2)]"
              >
                Open
              </a>
            </div>
          </div>
        ) : (
          <div className="rounded-[var(--radius-card)] border border-[color:var(--color-warning-soft)] bg-[color:var(--color-warning-soft)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-warning)]">Private</p>
            <p className="mt-1 text-sm text-[color:var(--color-warning)]">This card is not publicly accessible. Enable &ldquo;Public&rdquo; below to publish it.</p>
          </div>
        )}

        {/* Edit form */}
        <form onSubmit={onSave} className={`${cardClass} space-y-5 p-6`}>

          {/* Basic */}
          <div>
            <h2 className="mb-4 text-sm font-semibold text-[color:var(--color-fg-strong)]">Basic info</h2>
            <div className="space-y-4">
              <div>
                <FieldLabel>Slug *</FieldLabel>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  required
                  pattern="^[a-z0-9][a-z0-9-]*$"
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <FieldLabel>Display name *</FieldLabel>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={textareaClass}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[color:var(--color-border)]" />

          {/* Runtime */}
          <div>
            <h2 className="mb-4 text-sm font-semibold text-[color:var(--color-fg-strong)]">Runtime</h2>
            <div className="space-y-4">
              <div>
                <FieldLabel>Runtime URL</FieldLabel>
                <input
                  type="url"
                  value={runtimeUrl}
                  onChange={(e) => setRuntimeUrl(e.target.value)}
                  className={`${inputClass} font-mono`}
                  placeholder="https://my-agent.example.com"
                />
              </div>
              <div>
                <FieldLabel>Provider name</FieldLabel>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <FieldLabel>Provider URL</FieldLabel>
                <input
                  type="url"
                  value={providerUrl}
                  onChange={(e) => setProviderUrl(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <FieldLabel>Version</FieldLabel>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className={`${inputClass} w-32 font-mono`}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[color:var(--color-border)]" />

          {/* Capabilities */}
          <div>
            <h2 className="mb-4 text-sm font-semibold text-[color:var(--color-fg-strong)]">Capabilities & Auth</h2>
            <div className="space-y-4">
              <div className="rounded-[var(--radius-control)] border border-[color:var(--color-border)] p-4 space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="accent-[color:var(--color-primary)]"
                  />
                  <div>
                    <span className="text-sm text-[color:var(--color-fg-default)]">Public</span>
                    <p className="text-xs text-[color:var(--color-fg-weak)]">Accessible at the public URL. Uncheck to make private.</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={streaming}
                    onChange={(e) => setStreaming(e.target.checked)}
                    className="accent-[color:var(--color-primary)]"
                  />
                  <span className="text-sm text-[color:var(--color-fg-default)]">Streaming</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    className="accent-[color:var(--color-primary)]"
                  />
                  <span className="text-sm text-[color:var(--color-fg-default)]">Push notifications</span>
                </label>
              </div>

              <div>
                <FieldLabel>Authentication scheme</FieldLabel>
                <select
                  value={authScheme}
                  onChange={(e) => setAuthScheme(e.target.value)}
                  className={inputClass}
                >
                  <option value="none">None</option>
                  <option value="Bearer">Bearer token</option>
                  <option value="OAuth2">OAuth 2.0</option>
                  <option value="ApiKey">API Key</option>
                </select>
              </div>

              <div>
                <FieldLabel>Skills (JSON array)</FieldLabel>
                <textarea
                  value={skillsJson}
                  onChange={(e) => setSkillsJson(e.target.value)}
                  rows={7}
                  className={`${textareaClass} font-mono text-xs`}
                  placeholder='[{"name": "mySkill", "description": "What it does"}]'
                />
              </div>

              <div>
                <FieldLabel>Status</FieldLabel>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                  className={inputClass}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-[var(--radius-control)] border border-[color:var(--color-danger-soft)] bg-[color:var(--color-danger-soft)] px-4 py-2.5 text-sm text-[color:var(--color-danger)]">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-[var(--radius-control)] border border-[color:var(--color-success-soft)] bg-[color:var(--color-success-soft)] px-4 py-2.5 text-sm text-[color:var(--color-success)]">
              {success}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className={secondaryBtnClass}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={primaryBtnClass}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>

        {/* Delete zone */}
        <div className="rounded-[var(--radius-card)] border border-[color:var(--color-danger)] bg-[color:var(--color-danger-soft)] p-5">
          <h3 className="text-sm font-semibold text-[color:var(--color-danger)]">Danger zone</h3>
          <p className="mt-1 text-sm text-[color:var(--color-danger)]/85">
            Permanently delete this agent card. This action cannot be undone.
          </p>
          <div className="mt-4">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex h-10 items-center rounded-[var(--radius-control)] border border-[color:var(--color-danger)] bg-[color:var(--color-surface)] px-4 text-sm font-medium text-[color:var(--color-danger)] hover:bg-[color:var(--color-danger-soft)]"
              >
                Delete card
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium text-[color:var(--color-danger)]">Are you sure?</p>
                <button
                  onClick={onDelete}
                  disabled={deleting}
                  className="inline-flex h-10 items-center rounded-[var(--radius-control)] bg-[color:var(--color-danger)] px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                >
                  {deleting ? "Deleting…" : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className={secondaryBtnClass}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
