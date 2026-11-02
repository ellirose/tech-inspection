/** Date and time in Colombia, for admin tables. */
export const formatBogota = (d: Date | null | undefined) =>
  d ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" }).format(d) : "—";

/** Account state as shown in the users screens. */
export const accountState = (u: { active: boolean; lockedUntil: Date | null }, now: Date) =>
  !u.active ? "Desactivada" : u.lockedUntil && u.lockedUntil > now ? "Bloqueada" : "Activa";
