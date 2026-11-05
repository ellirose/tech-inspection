/**
 * QA/QC quality assurance is a business line of its own, separate from NDT inspection and the methods,
 * with its own logo (client presentation, Nov 2026). Its pages carry both logos in the header.
 * Kept apart from services.ts so client components can import it without the service data.
 */
export const QAQC_SLUG = "aseguramiento-calidad";

export const isQaqcPath = (pathname: string, lang: string) => pathname.startsWith(`/${lang}/servicios/${QAQC_SLUG}`);
