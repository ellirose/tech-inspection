"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { SignOut } from "@phosphor-icons/react/ssr";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/cn";

export function NavLinks({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Panel" className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap rounded-xl px-3.5 py-2.5 text-[0.98rem] font-bold transition",
              active ? "bg-brand-600 text-white dark:bg-neon dark:text-[#071a2e]" : "text-ink-soft hover:bg-surface-2 hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await authClient.signOut();
        router.replace("/admin/login");
        router.refresh();
      }}
      className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold text-ink-soft ring-1 ring-inset ring-line transition hover:bg-surface-2 hover:text-ink"
    >
      <SignOut weight="bold" className="size-4" /> Salir
    </button>
  );
}
