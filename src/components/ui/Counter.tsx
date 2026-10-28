"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

/**
 * Counts up to `value` when scrolled into view. With `since`, the target becomes
 * the years elapsed since that year, computed in the browser so it never goes stale.
 */
export function Counter({ value, since, prefix = "", suffix = "", duration = 1.6 }: { value: number; since?: number; prefix?: string; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  // Server snapshot uses the fallback; the browser reads the real current year.
  const target = useSyncExternalStore(
    noSubscribe,
    () => (since ? new Date().getFullYear() - since : value),
    () => value,
  );
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [inView, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}
