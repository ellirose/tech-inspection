import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";

type Variant = "primary" | "neon" | "ghost" | "light" | "whatsapp";

const styles: Record<Variant, { btn: string; dot: string }> = {
  primary: {
    btn: "bg-brand-600 text-white shadow-[0_14px_30px_-12px_rgb(31_55_214/0.75)] hover:bg-brand-500 dark:bg-neon dark:text-[#071a2e] dark:shadow-neon dark:hover:bg-white",
    dot: "bg-white/15 group-hover:bg-lime group-hover:text-[#071a2e] dark:bg-[#071a2e]/10",
  },
  neon: { btn: "bg-neon text-[#071a2e] shadow-neon hover:bg-[#5fd9fa]", dot: "bg-[#071a2e]/10" },
  ghost: { btn: "bg-surface text-ink shadow-soft ring-1 ring-line hover:ring-accent/40", dot: "bg-tint text-accent" },
  light: { btn: "bg-white text-[#071a2e] shadow-soft hover:bg-lime", dot: "bg-[#071a2e]/8" },
  whatsapp: { btn: "bg-whatsapp text-white shadow-[0_14px_30px_-12px_rgb(37_211_102/0.8)] hover:brightness-105", dot: "bg-white/20" },
};

/** Pill action with a round arrow cap; external links get the diagonal arrow. */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  icon?: React.ReactNode;
}) {
  const external = /^(https?:|mailto:|tel:)/.test(href);
  const s = styles[variant];
  const cls = cn(
    "group inline-flex h-14 items-center justify-between gap-4 whitespace-nowrap rounded-full pl-6 pr-2 text-[1.05rem] font-bold tracking-[-0.01em] transition duration-300",
    s.btn,
    className,
  );
  const Arrow = external ? ArrowUpRight : ArrowRight;
  const inner = (
    <>
      <span className="flex items-center gap-2.5">
        {icon}
        {children}
      </span>
      <span className={cn("grid size-10 place-items-center rounded-full transition duration-300 group-hover:translate-x-0.5", s.dot)}>
        <Arrow weight="bold" className="size-[1.1rem]" />
      </span>
    </>
  );
  return external ? (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener" className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
