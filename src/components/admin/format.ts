/** Date and time in Colombia, for admin tables. */
export const formatBogota = (d: Date | null | undefined) =>
  d ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" }).format(d) : "—";
