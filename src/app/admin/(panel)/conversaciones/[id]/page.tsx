import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { requireUser } from "@/lib/auth/session";
import { getConversation } from "@/lib/chat/admin";
import { chatNotes } from "@/lib/chat/protocol";
import { formatBogota } from "@/components/admin/format";
import { cn } from "@/lib/cn";

export const metadata = { title: "Conversación" };

/** The notes the widget writes for the model (lib/chat/protocol.ts), in Spanish for the team. */
function noteLabel(line: string) {
  const sent = line.match(/stored with reference (TI-[0-9A-Z]+)/);
  if (sent) return `El visitante autorizó el tratamiento de datos y confirmó: solicitud ${sent[1]}.`;
  if (line === chatNotes.leadCard) return "Se mostró el resumen de la solicitud con la autorización de datos y el botón de confirmar.";
  if (line === chatNotes.leadClosed) return "El visitante cerró el resumen sin enviarlo.";
  if (line === chatNotes.contactCard) return "Se mostraron los botones de WhatsApp y teléfono.";
  if (line === chatNotes.platform) return "Se dio el enlace de acceso a TI-QMS.";
  return line.slice(9, -1).trim();
}

/** Notes the widget adds for the model ("[Website: …]") are shown as small grey lines. */
function Text({ text }: { text: string }) {
  return text.split("\n").map((line, i) =>
    line.startsWith("[Website:") ? (
      <span key={i} className="mt-1 block text-xs italic opacity-70">
        Sitio: {noteLabel(line)}
      </span>
    ) : (
      <span key={i} className="block min-h-[1em]">
        {line}
      </span>
    ),
  );
}

export default async function ConversationPage({ params }: PageProps<"/admin/conversaciones/[id]">) {
  await requireUser("leads:read");
  const conversation = await getConversation((await params).id);
  if (!conversation) notFound();
  const c = conversation;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/conversaciones" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-accent">
        <ArrowLeft weight="bold" className="size-4" /> Todas las conversaciones
      </Link>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Conversación</h1>
      <p className="mt-2 text-ink-soft">
        {formatBogota(c.createdAt)} · {c.lang.toUpperCase()}
        {c.page && ` · desde ${c.page}`}
        {c.leadReference && (
          <>
            {" · lead "}
            <Link href={`/admin/leads/${c.leadReference}`} className="font-mono font-bold text-accent">
              {c.leadReference}
            </Link>
          </>
        )}
      </p>
      <p className="mt-1 text-sm text-mute">
        Modelo {c.model} · {c.inputTokens + c.cachedTokens} tokens de entrada ({c.cachedTokens} de caché) · {c.outputTokens} de salida
      </p>

      <ol className="mt-8 space-y-3">
        {c.messages.map((m, i) => (
          <li key={i} className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}>
            <div className={cn("max-w-[85%] break-words rounded-3xl px-4 py-3", m.role === "user" ? "bg-brand-600 text-white" : "bg-surface text-ink ring-1 ring-line")}>
              <Text text={m.text} />
            </div>
            <span className="mt-1 px-2 text-xs text-mute">
              {m.role === "user" ? "Visitante" : "Asistente"} · {formatBogota(new Date(m.at))}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
