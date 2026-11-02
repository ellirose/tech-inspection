import { describe, expect, it } from "vitest";
import { normalisePath } from "@/lib/redirects";
import { legacyRedirects } from "@/db/seed/redirects";

describe("normalisePath", () => {
  it("matches encoded, accented, upper-case and trailing-slash forms of the same path", () => {
    const stored = normalisePath("/inspección-de-tanques");
    expect(normalisePath("/inspecci%C3%B3n-de-tanques")).toBe(stored);
    expect(normalisePath("/Inspección-de-Tanques/")).toBe(stored);
    expect(normalisePath("/")).toBe("/");
  });

  it("survives malformed percent-encoding", () => {
    expect(normalisePath("/bad%E0%A4%A")).toBe("/bad%e0%a4%a");
  });
});

describe("legacy Wix redirects", () => {
  it("are unique once normalised and point at localized pages", () => {
    const from = legacyRedirects.map(([f]) => normalisePath(f));
    expect(new Set(from).size).toBe(from.length);
    for (const [, to] of legacyRedirects) expect(to).toMatch(/^\/es(\/|$|#)/);
  });
});
