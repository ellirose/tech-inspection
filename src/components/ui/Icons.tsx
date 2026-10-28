import {
  Buildings,
  Crane,
  Cylinder,
  Database,
  Drop,
  Gauge,
  Gear,
  Magnet,
  Pipe,
  Ruler,
  Waveform,
  Wrench,
} from "@phosphor-icons/react/ssr";
import type { IconProps } from "@phosphor-icons/react";
import type { MethodKey } from "@/content/methods";
import type { ServiceIcon } from "@/content/services";

const serviceIcons: Record<ServiceIcon, React.ComponentType<IconProps>> = {
  pipe: Pipe,
  drill: Gear,
  gauge: Gauge,
  wrench: Wrench,
  cylinder: Cylinder,
  crane: Crane,
  tank: Database,
  buildings: Buildings,
};

const methodIcons: Record<MethodKey, React.ComponentType<IconProps>> = {
  mt: Magnet,
  pt: Drop,
  ut: Waveform,
  vt: Ruler,
};

export function ServiceGlyph({ name, ...props }: IconProps & { name: ServiceIcon }) {
  const Icon = serviceIcons[name];
  return <Icon weight="duotone" {...props} />;
}

export function MethodGlyph({ name, ...props }: IconProps & { name: MethodKey }) {
  const Icon = methodIcons[name];
  return <Icon weight="duotone" {...props} />;
}
