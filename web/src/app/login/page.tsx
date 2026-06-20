"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ApiError, registerUser, loginUser } from "@/lib/api";
import { setAuthToken, getAuthToken, isTokenExpired } from "@/lib/auth";

type Mode = "login" | "register";
type IdentityType = "email" | "domain";

const inputClass =
  "w-full h-10 rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 text-sm text-[color:var(--color-fg-default)] outline-none transition focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary-soft)]";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [identityType, setIdentityType] = useState<IdentityType>("email");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    const token = getAuthToken();
    if (token && !isTokenExpired(token)) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let token: string;
      if (mode === "register") {
        token = await registerUser({
          email,
          password,
          handle,
          display_name: displayName || undefined,
          identity_type: identityType,
          domain: identityType === "domain" ? domain : undefined,
        });
      } else {
        token = await loginUser(email, password);
      }

      setAuthToken(token);
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title={mode === "login" ? "Sign in" : "Create account"}
      description="Manage your A2A agent cards on host39."
    >
      <div className="mx-auto max-w-md space-y-5">
        {reason === "session_expired" && (
          <p className="rounded-[var(--radius-control)] border border-[color:var(--color-warning-soft)] bg-[color:var(--color-warning-soft)] px-4 py-2.5 text-sm text-[color:var(--color-warning)]">
            Your session expired. Please sign in again.
          </p>
        )}

        <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
          {/* Mode toggle */}
          <div className="mb-5 flex rounded-[var(--radius-control)] border border-[color:var(--color-border)] p-1 text-sm">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); }}
              className={`flex-1 rounded-[var(--radius-control)] py-1.5 font-medium transition ${
                mode === "login"
                  ? "bg-[color:var(--color-primary)] text-white"
                  : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg-default)]"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(null); }}
              className={`flex-1 rounded-[var(--radius-control)] py-1.5 font-medium transition ${
                mode === "register"
                  ? "bg-[color:var(--color-primary)] text-white"
                  : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg-default)]"
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "register" && (
              <>
                <input
                  type="text"
                  placeholder="Display name (optional)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={inputClass}
                />
                <div>
                  <input
                    type="text"
                    placeholder="Username (e.g. ankit)"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    required={mode === "register"}
                    minLength={2}
                    maxLength={32}
                    pattern="^[a-z0-9][a-z0-9-]{1,31}$"
                    className={`${inputClass} font-mono`}
                  />
                  {handle && (
                    <p className="mt-1 font-mono text-xs text-[color:var(--color-fg-muted)]">
                      Your cards will be at /personal/<span className="font-medium text-[color:var(--color-fg-default)]">{handle}</span>/slug.json
                    </p>
                  )}
                </div>

                {/* Identity type */}
                <div className="rounded-[var(--radius-control)] border border-[color:var(--color-border)] p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-fg-weak)]">
                    Identity type
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <label
                      className={`flex flex-1 cursor-pointer items-center gap-2 rounded-[var(--radius-control)] border px-3 py-2 transition ${
                        identityType === "email"
                          ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)]"
                          : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:bg-[color:var(--color-surface-2)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="identity_type"
                        value="email"
                        checked={identityType === "email"}
                        onChange={() => setIdentityType("email")}
                        className="accent-[color:var(--color-accent)]"
                      />
                      <span className="text-sm text-[color:var(--color-fg-default)]">Personal (email)</span>
                    </label>
                    <label
                      className={`flex flex-1 cursor-pointer items-center gap-2 rounded-[var(--radius-control)] border px-3 py-2 transition ${
                        identityType === "domain"
                          ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary-soft)]"
                          : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:bg-[color:var(--color-surface-2)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="identity_type"
                        value="domain"
                        checked={identityType === "domain"}
                        onChange={() => setIdentityType("domain")}
                        className="accent-[color:var(--color-primary)]"
                      />
                      <span className="text-sm text-[color:var(--color-fg-default)]">Business (domain)</span>
                    </label>
                  </div>

                  {identityType === "domain" && (
                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="yourdomain.com"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        required={identityType === "domain"}
                        pattern="^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                        className={`${inputClass} font-mono`}
                      />
                      <p className="mt-1.5 font-mono text-xs text-[color:var(--color-fg-muted)]">
                        Your cards will be at /{domain || "yourdomain.com"}/slug.json
                      </p>
                    </div>
                  )}

                  {identityType === "email" && (
                    <p className="mt-2 font-mono text-xs text-[color:var(--color-fg-muted)]">
                      Your cards will be at /personal/{handle || "username"}/slug.json
                    </p>
                  )}
                </div>
              </>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className={inputClass}
            />

            {error && (
              <p className="rounded-[var(--radius-control)] border border-[color:var(--color-danger-soft)] bg-[color:var(--color-danger-soft)] px-4 py-2.5 text-sm text-[color:var(--color-danger)]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 w-full items-center justify-center rounded-[var(--radius-control)] bg-[color:var(--color-primary)] px-4 text-sm font-medium text-white transition hover:bg-[color:var(--color-primary-hover)] disabled:opacity-60"
            >
              {loading ? "…" : mode === "register" ? "Create account" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-[color:var(--color-fg-weak)]">Loading…</p>
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}
