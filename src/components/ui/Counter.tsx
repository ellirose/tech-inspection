"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef, useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

/**
 * Counts up to `value` when scrolled into view. With `since`, the target becomes
 * the years elapsed since that year, computed in the browser so it never goes stale.
 * Each frame writes the number straight into the DOM, so React does not re-render while it counts.
 */
export function Counter({ value, since, prefix = "", suffix = "", duration = 1.6 }: { value: number; since?: number; prefix?: string; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  // Server snapshot uses the fallback; the browser reads the real current year.
  const target = useSyncExternalStore(
    noSubscribe,
    () => (since ? new Date().getFullYear() - since : value),
    () => value,
  );

  useEffect(() => {
    // Update React's own text node, so a later render still finds it in place.
    const text = num.current?.firstChild;
    if (!inView || !text || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const controls = animate(0, target, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => (text.nodeValue = String(Math.round(v))) });
    return () => {
      controls.stop();
      text.nodeValue = String(target);
    };
  }, [inView, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      <span ref={num}>{target}</span>
      {suffix}
    </span>
  );
}
