import type { Permission } from "@/lib/auth/roles";

/** Panel sections in menu order, with the permission each one requires. */
export const panelSections: { href: string; label: string; permission?: Permission }[] = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/leads", label: "Leads", permission: "leads:read" },
  { href: "/admin/contenido", label: "Contenido", permission: "content:read" },
  { href: "/admin/medios", label: "Medios", permission: "content:read" },
  { href: "/admin/usuarios", label: "Usuarios", permission: "users:manage" },
  { href: "/admin/configuracion", label: "Configuración", permission: "settings:manage" },
  { href: "/admin/redirecciones", label: "Redirecciones", permission: "settings:manage" },
  { href: "/admin/historial", label: "Historial", permission: "audit:read" },
  { href: "/admin/seguridad", label: "Seguridad" },
];
