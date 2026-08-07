import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";
import type { PersonalInfo } from "../types";

interface ContactRowProps {
  personal: PersonalInfo;
  showIcons?: boolean;
  className?: string;
  separator?: string;
}

export function ContactRow({
  personal,
  showIcons = true,
  className,
  separator = "  ·  ",
}: ContactRowProps) {
  const items: { icon: typeof Mail; value: string }[] = [
    { icon: Mail, value: personal.email },
    { icon: Phone, value: personal.phone },
    { icon: MapPin, value: personal.location },
    { icon: Globe, value: personal.website },
    { icon: Linkedin, value: personal.linkedin },
    { icon: Github, value: personal.github },
  ].filter((item) => item.value.trim());

  if (items.length === 0) return null;

  return (
    <div className={className}>
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          {showIcons ? <item.icon className="size-[0.9em] opacity-70" /> : null}
          <span>{item.value}</span>
          {i < items.length - 1 ? (
            <span className="mx-1.5 opacity-40">{separator.trim() || "·"}</span>
          ) : null}
        </span>
      ))}
    </div>
  );
}
