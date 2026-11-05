import { ldScript } from "@/lib/jsonld";

/** Structured data for search engines (lib/jsonld.ts builds it). Renders nothing when given null. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] | null }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldScript(data) }} />;
}
