import type { ReactNode } from "react";
import type { ResumeData, SectionKind } from "../types";
import type { BulletStyle, DividerStyle } from "../types";
import { dateRange } from "./shared";

export interface Look {
  /** classes for the little heading above each section, e.g. "EXPERIENCE" */
  headingClass: string;
  /** classes applied to the wrapping <section> */
  sectionClass?: string;
  /** gap between entries within a section */
  entryGapClass?: string;
  /** bullet marker style */
  bullet?: "dot" | "dash" | "none";
  /** show a rule under the section heading */
  rule?: boolean;
}

function resolveBullet(look: Look, override: BulletStyle | undefined): Look["bullet"] {
  if (override && override !== "template") return override;
  return look.bullet;
}

function resolveRule(look: Look, override: DividerStyle | undefined): boolean | undefined {
  if (override === "on") return true;
  if (override === "off") return false;
  return look.rule;
}

function Bullets({ items, bullet = "dot" }: { items: string[]; bullet?: Look["bullet"] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-1 space-y-0.5">
      {items.map((line, i) => (
        <li key={i} className="flex gap-2 text-[0.92em] leading-snug text-current/90">
          <span className="mt-[0.5em] shrink-0 text-[0.5em] opacity-70">
            {bullet === "none" ? "" : bullet === "dash" ? "—" : "●"}
          </span>
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function Heading({
  children,
  look,
  rule,
}: {
  children: ReactNode;
  look: Look;
  rule?: boolean | undefined;
}) {
  return (
    <h3 className={look.headingClass}>
      {children}
      {rule ? <span className="mt-1 block h-px w-full bg-current/15" /> : null}
    </h3>
  );
}

export function SectionBody({
  kind,
  data,
  look,
  bulletOverride,
  dividerOverride,
}: {
  kind: SectionKind;
  data: ResumeData;
  look: Look;
  /** Global bullet-style override from the Design panel; falls back to the template's own default. */
  bulletOverride?: BulletStyle | undefined;
  /** Global section-divider override from the Design panel; falls back to the template's own default. */
  dividerOverride?: DividerStyle | undefined;
}) {
  const entryGap = look.entryGapClass ?? "space-y-3";
  const bullet = resolveBullet(look, bulletOverride);
  const rule = resolveRule(look, dividerOverride);

  if (kind === "summary") {
    if (!data.summary.trim()) return null;
    return (
      <section className={look.sectionClass}>
        <Heading look={look} rule={rule}>
          Summary
        </Heading>
        <p className="text-[0.95em] leading-relaxed">{data.summary}</p>
      </section>
    );
  }

  if (kind === "experience") {
    if (data.experience.length === 0) return null;
    return (
      <section className={look.sectionClass}>
        <Heading look={look} rule={rule}>
          Experience
        </Heading>
        <div className={entryGap}>
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-semibold">
                  {exp.role || "Role"}
                  {exp.company ? <span className="font-normal"> · {exp.company}</span> : null}
                </p>
                <p className="shrink-0 text-[0.82em] opacity-70">
                  {dateRange(exp.startDate, exp.endDate, exp.current)}
                </p>
              </div>
              {exp.location ? <p className="text-[0.82em] opacity-60">{exp.location}</p> : null}
              <Bullets items={exp.bullets.filter(Boolean)} bullet={bullet} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (kind === "education") {
    if (data.education.length === 0) return null;
    return (
      <section className={look.sectionClass}>
        <Heading look={look} rule={rule}>
          Education
        </Heading>
        <div className={entryGap}>
          {data.education.map((edu) => (
            <div key={edu.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-semibold">
                  {edu.degree || "Degree"}
                  {edu.field ? <span className="font-normal">, {edu.field}</span> : null}
                </p>
                <p className="shrink-0 text-[0.82em] opacity-70">
                  {dateRange(edu.startDate, edu.endDate, false)}
                </p>
              </div>
              <p className="text-[0.9em] opacity-80">
                {edu.school}
                {edu.gpa ? ` · GPA ${edu.gpa}` : ""}
              </p>
              {edu.details ? (
                <p className="mt-0.5 text-[0.85em] opacity-70">{edu.details}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (kind === "skills") {
    if (data.skills.length === 0) return null;
    return (
      <section className={look.sectionClass}>
        <Heading look={look} rule={rule}>
          Skills
        </Heading>
        <div className="space-y-1.5">
          {data.skills.map((group) => (
            <p key={group.id} className="text-[0.9em] leading-relaxed">
              {group.category ? <span className="font-semibold">{group.category}: </span> : null}
              <span className="opacity-85">{group.items.join(" · ")}</span>
            </p>
          ))}
        </div>
      </section>
    );
  }

  if (kind === "projects") {
    if (data.projects.length === 0) return null;
    return (
      <section className={look.sectionClass}>
        <Heading look={look} rule={rule}>
          Projects
        </Heading>
        <div className={entryGap}>
          {data.projects.map((proj) => (
            <div key={proj.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-semibold">{proj.name || "Project"}</p>
                {proj.link ? <p className="shrink-0 text-[0.8em] opacity-60">{proj.link}</p> : null}
              </div>
              {proj.description ? (
                <p className="text-[0.9em] leading-snug opacity-85">{proj.description}</p>
              ) : null}
              {proj.tech.length > 0 ? (
                <p className="mt-0.5 text-[0.8em] opacity-60">{proj.tech.join(" · ")}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (kind === "certifications") {
    if (data.certifications.length === 0) return null;
    return (
      <section className={look.sectionClass}>
        <Heading look={look} rule={rule}>
          Certifications
        </Heading>
        <div className="space-y-1">
          {data.certifications.map((cert) => (
            <div
              key={cert.id}
              className="flex flex-wrap items-baseline justify-between gap-x-3 text-[0.9em]"
            >
              <p>
                <span className="font-semibold">{cert.name}</span>
                {cert.issuer ? <span className="opacity-70"> — {cert.issuer}</span> : null}
              </p>
              <p className="shrink-0 text-[0.8em] opacity-60">{cert.date}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (kind === "languages") {
    if (data.languages.length === 0) return null;
    return (
      <section className={look.sectionClass}>
        <Heading look={look} rule={rule}>
          Languages
        </Heading>
        <p className="text-[0.9em] leading-relaxed opacity-85">
          {data.languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`).join(" · ")}
        </p>
      </section>
    );
  }

  if (kind.startsWith("custom:")) {
    const id = kind.slice("custom:".length);
    const section = data.customSections.find((s) => s.id === id);
    if (!section || section.entries.length === 0) return null;
    return (
      <section className={look.sectionClass}>
        <Heading look={look} rule={rule}>
          {section.title || "Custom section"}
        </Heading>
        <div className={entryGap}>
          {section.entries.map((entry) => (
            <div key={entry.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-semibold">
                  {entry.heading}
                  {entry.subheading ? (
                    <span className="font-normal"> · {entry.subheading}</span>
                  ) : null}
                </p>
                {entry.date ? (
                  <p className="shrink-0 text-[0.82em] opacity-70">{entry.date}</p>
                ) : null}
              </div>
              {entry.description ? (
                <p className="text-[0.9em] leading-snug opacity-85">{entry.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return null;
}
