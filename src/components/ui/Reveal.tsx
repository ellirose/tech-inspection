import { Children, cloneElement, isValidElement, type CSSProperties, type HTMLAttributes, type ReactElement } from "react";
import { cn } from "@/lib/cn";

// Scroll-in entrances without JavaScript per element: these render plain markup with `data-reveal`, and
// one small script in the layout (revealScript below) marks each element `data-shown` the first time it
// scrolls into view. The motion itself is CSS (globals.css, "Reveal"), so nothing here hydrates.

type DivProps = HTMLAttributes<HTMLDivElement> & { style?: CSSProperties };
const vars = (v: Record<string, string | number>) => v as CSSProperties;

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({ delay = 0, y = 28, className, style, children, ...rest }: DivProps & { delay?: number; y?: number }) {
  return (
    <div data-reveal="" className={cn("reveal", className)} style={{ ...vars({ "--reveal-delay": `${delay}s`, "--reveal-y": `${y}px` }), ...style }} {...rest}>
      {children}
    </div>
  );
}

/** Staggers its direct <RevealItem> children. */
export function RevealGroup({ children, stagger = 0.08, className, style, ...rest }: DivProps & { stagger?: number }) {
  let n = 0;
  const items = Children.map(children, (child) =>
    isValidElement(child) && child.type === RevealItem ? cloneElement(child as ReactElement<{ index?: number }>, { index: n++ }) : child,
  );
  return (
    <div data-reveal="" className={cn("reveal-group", className)} style={{ ...vars({ "--reveal-stagger": `${stagger}s` }), ...style }} {...rest}>
      {items}
    </div>
  );
}

export function RevealItem({ index = 0, className, style, children, ...rest }: DivProps & { index?: number }) {
  return (
    <div className={cn("reveal-item", className)} style={{ ...vars({ "--reveal-i": index }), ...style }} {...rest}>
      {children}
    </div>
  );
}

/**
 * Inline script for the layout: watches every `[data-reveal]` element (also those added later by
 * client navigation or streaming) and marks it shown once it enters the lower part of the screen, or if it
 * is already above it. Without IntersectionObserver everything is shown.
 */
export const revealScript = `(()=>{var s="[data-reveal]:not([data-shown])",show=function(e){e.setAttribute("data-shown","")};if(!("IntersectionObserver"in window)){document.querySelectorAll(s).forEach(show);return}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting||e.boundingClientRect.top<0){show(e.target);io.unobserve(e.target)}})},{rootMargin:"0px 0px -10% 0px"});var scan=function(){document.querySelectorAll(s).forEach(function(e){if(!e.__rv){e.__rv=1;io.observe(e)}})};scan();new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true})})();`;
