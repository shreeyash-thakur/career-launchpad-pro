import type { SectionKind } from "../types";
import type { TemplateProps } from "./template-props";
import { ResumePage } from "./resume-page";
import { ContactRow } from "./contact-row";
import { SectionBody, type Look } from "./blocks";
import { orderedSections } from "./shared";

const look: Look = {
  headingClass:
    "mb-2 text-[0.8em] font-bold uppercase tracking-[0.12em] text-[color:var(--resume-accent)]",
  sectionClass: "mb-4 last:mb-0",
  bullet: "dot",
};

const NON_SKILLS: SectionKind[] = [
  "summary",
  "experience",
  "education",
  "projects",
  "certifications",
  "languages",
];

export function StartupTemplate({ data, style, pageRef }: TemplateProps) {
  const sections = orderedSections(data).filter(
    (s) => s.hasContent && (NON_SKILLS.includes(s.kind) || s.kind.startsWith("custom:")),
  );
  const showSkillChips = data.skills.length > 0;

  return (
    <ResumePage ref={pageRef} style={style} className="p-0">
      <header
        className="px-10 py-8 text-white"
        style={{
          backgroundImage:
            "linear-gradient(135deg, var(--resume-accent), color-mix(in srgb, var(--resume-accent) 55%, #111827))",
        }}
      >
        <h1 className="text-[2.15em] font-bold leading-tight">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="mt-0.5 text-[1em] text-white/90">{data.personal.title}</p>
        ) : null}
        <ContactRow
          personal={data.personal}
          showIcons={false}
          separator="/"
          className="mt-3 flex flex-wrap items-center gap-x-1 text-[0.8em] text-white/85"
        />
      </header>

      <div className="px-10 py-7">
        {showSkillChips ? (
          <div className="mb-5">
            <h3 className={look.headingClass}>Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {data.skills
                .flatMap((g) => g.items)
                .map((skill, i) => (
                  <span
                    key={i}
                    className="rounded-full px-2.5 py-0.5 text-[0.78em] font-medium"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--resume-accent) 12%, white)",
                      color: "var(--resume-accent)",
                    }}
                  >
                    {skill}
                  </span>
                ))}
            </div>
          </div>
        ) : null}

        {sections.map((s) => (
          <SectionBody
            key={s.kind}
            kind={s.kind}
            data={data}
            look={look}
            bulletOverride={style.bulletStyle}
            dividerOverride={style.sectionDividers}
          />
        ))}
      </div>
    </ResumePage>
  );
}
