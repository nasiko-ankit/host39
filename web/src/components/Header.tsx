"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getAuthToken, parseJwtPayload, clearAuthToken, isTokenExpired } from "@/lib/auth";

export function Header() {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token || isTokenExpired(token)) {
      setEmail(null);
      return;
    }
    const payload = parseJwtPayload(token);
    setEmail(payload?.email ?? null);
  }, [pathname]);

  function closeMobileMenu() {
    if (detailsRef.current) detailsRef.current.open = false;
  }

  function signOut() {
    clearAuthToken();
    setEmail(null);
    router.push("/");
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  const initial = email ? email.charAt(0).toUpperCase() : "?";

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-8 w-10 shrink-0 items-center justify-center rounded-[var(--radius-card)] bg-[color:var(--color-primary-deep)] text-[11px] font-semibold tracking-wide text-white">
            H39
          </span>
          <span className="mx-1 hidden h-6 border-l border-[color:var(--color-border)] sm:block" />
          <span className="hidden min-w-0 flex-col sm:flex">
            <span className="truncate text-base font-semibold text-[color:var(--color-fg-strong)] leading-tight">
              host39
            </span>
            <span className="truncate text-xs text-[color:var(--color-fg-weak)] leading-tight">
              A2A agent card hosting
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-6 lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[color:var(--color-fg-default)] transition-colors hover:text-[color:var(--color-primary)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          {email ? (
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-primary-soft)] text-xs font-semibold text-[color:var(--color-primary-deep)]">
                {initial}
              </span>
              <Link
                href="/dashboard"
                className="max-w-[180px] truncate text-sm text-[color:var(--color-fg-default)] transition-colors hover:text-[color:var(--color-primary)]"
              >
                {email}
              </Link>
              <button
                onClick={signOut}
                className="text-xs text-[color:var(--color-fg-weak)] transition-colors hover:text-[color:var(--color-fg-default)]"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-[var(--radius-control)] bg-[color:var(--color-primary)] px-4 text-sm font-medium text-white transition hover:bg-[color:var(--color-primary-hover)]"
            >
              Sign in
            </Link>
          )}
        </div>

        <details ref={detailsRef} className="relative ml-auto lg:hidden">
          <summary className="cursor-pointer list-none rounded-[var(--radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-fg-default)]">
            Menu
          </summary>
          <div className="absolute right-0 mt-2 w-56 rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-2 shadow-[var(--shadow-card)]">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className="block rounded-[var(--radius-control)] px-3 py-2 text-sm text-[color:var(--color-fg-default)] transition-colors hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-primary)]"
              >
                {item.label}
              </Link>
            ))}
            {email ? (
              <button
                onClick={() => { closeMobileMenu(); signOut(); }}
                className="block w-full rounded-[var(--radius-control)] px-3 py-2 text-left text-sm text-[color:var(--color-fg-weak)] hover:bg-[color:var(--color-surface-2)]"
              >
                Sign out ({email})
              </button>
            ) : (
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="block rounded-[var(--radius-control)] px-3 py-2 text-sm text-[color:var(--color-fg-default)] hover:bg-[color:var(--color-surface-2)]"
              >
                Sign in
              </Link>
            )}
          </div>
        </details>
      </div>
    </header>
  );
}
