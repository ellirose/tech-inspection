// Sends the team notification and the requester's confirmation for a stored lead, and records each
// outcome on the lead's history so the admin inbox can show what went out. Runs after the response.
import "server-only";
import { getMethods, getServices, getSite } from "@/lib/data/content";
import { sendEmail } from "@/lib/email";
import { confirmationEmail, teamEmail, type EmailContext } from "./emails";
import { addLeadEvent, type Lead } from "./service";

export async function notifyLead(lead: Lead) {
  const [site, services, methods] = await Promise.all([getSite(), getServices(), getMethods()]);
  const ctx: EmailContext = {
    serviceNames: Object.fromEntries(services.map((s) => [s.slug, s.name])),
    methodNames: Object.fromEntries(methods.map((m) => [m.key, m.name])),
    company: site.company,
  };

  // Recipients set in the admin (Configuración) win over the environment default.
  const team = site.notifyTo?.length
    ? site.notifyTo
    : (process.env.LEAD_NOTIFY_TO ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
  const jobs: [type: string, run: () => ReturnType<typeof sendEmail>][] = [];
  if (team.length) jobs.push(["team", () => sendEmail(teamEmail(lead, ctx, team))]);
  else console.warn("[leads] no notification recipients (Configuración or LEAD_NOTIFY_TO); none sent for", lead.reference);
  const { email } = lead;
  if (email) jobs.push(["confirmation", () => sendEmail(confirmationEmail({ ...lead, email }, ctx))]);

  for (const [type, run] of jobs) {
    try {
      const result = await run();
      await addLeadEvent(lead.id, `email_${type}`, result);
    } catch (error) {
      // Keep the provider's reason but mask any address it echoes back.
      const message = (error as Error).message.replace(/[^\s"'<>]+@[^\s"'<>]+/g, "[email]").slice(0, 300);
      console.error(`[leads] ${type} email failed for`, lead.reference, message);
      await addLeadEvent(lead.id, `email_${type}_failed`, message).catch(() => {});
    }
  }
}
