import Link from "next/link";
import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { can, roleLabels, isRole } from "@/lib/auth/roles";
import { Logo } from "@/components/ui/Logo";
import { panelSections } from "@/components/admin/nav";
import { NavLinks, SignOutButton } from "@/components/admin/PanelChrome";

// Frame of every signed-in screen. The menu only hides what a role cannot open; each page checks access itself.
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="border-b border-line bg-surface px-4 py-4 lg:sticky lg:top-0 lg:h-svh lg:border-b-0 lg:border-r lg:px-5 lg:py-7">
        <Link href="/admin" className="mb-4 block w-fit lg:mb-8">
          <Logo className="h-10" />
        </Link>
        <Suspense fallback={<div className="h-11 lg:h-80" />}>
          <Menu />
        </Suspense>
      </aside>
      <div className="min-w-0">
        <header className="flex min-h-16 items-center justify-end gap-4 border-b border-line px-4 sm:px-8">
          <Suspense>
            <UserBadge />
          </Suspense>
        </header>
        <main className="px-4 py-8 sm:px-8 lg:py-10">
          <Suspense fallback={<p className="text-mute">Cargando…</p>}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}

async function Menu() {
  const session = await getSession();
  if (!session) return null;
  const items = panelSections.filter((s) => !s.permission || can(session.user.role, s.permission));
  return <NavLinks items={items.map(({ href, label }) => ({ href, label }))} />;
}

async function UserBadge() {
  const session = await getSession();
  if (!session) return null;
  const { name, role } = session.user;
  return (
    <>
      <span className="text-right leading-tight">
        <span className="block font-bold text-ink">{name}</span>
        <span className="block text-sm text-mute">{isRole(role) ? roleLabels[role] : role}</span>
      </span>
      <SignOutButton />
    </>
  );
}
