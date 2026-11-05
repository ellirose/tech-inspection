// CSV of the leads matching the inbox filters. Exports carry personal data, so each one is logged.
import type { NextRequest } from "next/server";
import { audit, requestIp } from "@/lib/audit";
import { authorize } from "@/lib/auth/session";
import { exportLeads, parseLeadFilters } from "@/lib/leads/admin";
import { leadsToCsv } from "@/lib/leads/csv";

export async function GET(request: NextRequest) {
  let user;
  try {
    user = await authorize("leads:read");
  } catch {
    return new Response("No autorizado", { status: 403 });
  }
  const filters = parseLeadFilters(Object.fromEntries(request.nextUrl.searchParams));
  const leads = await exportLeads({ ...filters, pagina: undefined });
  await audit({
    userId: user.id,
    action: "leads_exported",
    entity: "lead",
    diff: { count: leads.length, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) },
    ip: requestIp(request.headers),
  });
  const stamp = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
  // Semicolons: the team opens it in Excel with Colombian settings, which splits columns on ";".
  return new Response(leadsToCsv(leads, ";"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
