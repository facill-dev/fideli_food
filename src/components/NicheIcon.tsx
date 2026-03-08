import {
  Cake,
  Beef,
  Pizza,
  UtensilsCrossed,
  Coffee,
  IceCreamCone,
  Croissant,
  Cherry,
  Fish,
  Store,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

const NICHE_ICONS: Record<string, ComponentType<LucideProps>> = {
  Cake,
  Beef,
  Pizza,
  UtensilsCrossed,
  Coffee,
  IceCreamCone,
  Croissant,
  Cherry,
  Fish,
  Store,
};

interface NicheIconProps extends LucideProps {
  name?: string;
}

export function NicheIcon({ name, ...props }: NicheIconProps) {
  const Icon = (name && NICHE_ICONS[name]) || Store;
  return <Icon {...props} />;
}
