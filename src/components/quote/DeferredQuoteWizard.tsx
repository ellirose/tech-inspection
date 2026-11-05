"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentProps } from "react";

const QuoteWizard = dynamic(() => import("./QuoteWizard").then((m) => m.QuoteWizard), {
  ssr: false,
  loading: () => <div className="min-h-[34rem] rounded-[2.5rem] bg-surface/60 ring-1 ring-line" />,
});

/**
 * The quote form for pages where it sits far down (the home page): its code loads and runs only when
 * the visitor scrolls near it, or follows a link to it, instead of during the page's start-up.
 */
export function DeferredQuoteWizard(props: ComponentProps<typeof QuoteWizard>) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // A link to #cotizar scrolls here, which also brings it into view.
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true), { rootMargin: "1200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref}>{show ? <QuoteWizard {...props} /> : <div className="min-h-[34rem] rounded-[2.5rem] bg-surface/60 ring-1 ring-line" />}</div>;
}
