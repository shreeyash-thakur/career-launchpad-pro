import type { ReactNode } from "react";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";
import type { PersonalInfo, ResumeStyle, SectionKind } from "../../types";
import { orderedSections, initials } from "../shared";
import type { ResumeData } from "../../types";

export const SIDEBAR_KINDS = new Set<SectionKind>(["skills", "languages", "certifications"]);

/** Splits the user's ordered sections into a sidebar group and a main group. */
export function splitSections(data: ResumeData, sidebarKinds: Set<SectionKind> = SIDEBAR_KINDS) {
  const all = orderedSections(data).filter((s) => s.hasContent);
  return {
    all,
    sidebar: all.filter((s) => sidebarKinds.has(s.kind)),
    main: all.filter((s) => !sidebarKinds.has(s.kind)),
  };
}

export interface ContactItem {
  icon: typeof Mail;
  value: string;
}

export function contactItems(personal: PersonalInfo): ContactItem[] {
  return [
    { icon: Phone, value: personal.phone },
    { icon: Mail, value: personal.email },
    { icon: MapPin, value: personal.location },
    { icon: Globe, value: personal.website },
    { icon: Linkedin, value: personal.linkedin },
    { icon: Github, value: personal.github },
  ].filter((item) => item.value.trim());
}

/** Vertical icon + text contact list, used by most sidebar layouts. */
export function ContactList({
  personal,
  className,
  iconClassName,
  gapClass = "space-y-1.5",
}: {
  personal: PersonalInfo;
  className?: string;
  iconClassName?: string;
  gapClass?: string;
}) {
  const items = contactItems(personal);
  if (items.length === 0) return null;
  return (
    <div className={`${gapClass} ${className ?? ""}`}>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 break-words">
          <item.icon className={`mt-[0.15em] size-[1em] shrink-0 ${iconClassName ?? ""}`} />
          <span className="min-w-0 break-words">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Photo (when the user enabled it and uploaded one) with an initials fallback,
 * so templates designed around a portrait never collapse.
 */
export function Portrait({
  data,
  style,
  className,
  fallbackClassName,
  shape = "circle",
}: {
  data: ResumeData;
  style: ResumeStyle;
  className?: string;
  fallbackClassName?: string;
  shape?: "circle" | "square";
}) {
  const radius = shape === "circle" ? "rounded-full" : "rounded-md";
  if (style.showPhoto && data.personal.photo) {
    return (
      <img
        src={data.personal.photo}
        alt={data.personal.fullName || "Portrait"}
        className={`object-cover ${radius} ${className ?? ""}`}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center font-semibold ${radius} ${className ?? ""} ${
        fallbackClassName ?? "bg-current/10"
      }`}
    >
      <span className="text-[1.6em] tracking-wide">{initials(data.personal.fullName) || "YN"}</span>
    </div>
  );
}

/** Simple flat list of skill labels across every skill group. */
export function flatSkills(data: ResumeData): string[] {
  return data.skills.flatMap((group) => group.items).filter(Boolean);
}

export function SectionShell({
  title,
  children,
  className,
  headingClassName,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  headingClassName?: string;
}) {
  return (
    <section className={className}>
      <h3 className={headingClassName}>{title}</h3>
      {children}
    </section>
  );
}
