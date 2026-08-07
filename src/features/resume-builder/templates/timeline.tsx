import type { ResumeData, SectionKind } from "../types";
import type { TemplateProps } from "./template-props";
import { ResumePage } from "./resume-page";
import { ContactRow } from "./contact-row";
import { SectionBody, type Look } from "./blocks";
import { orderedSections, dateRange } from "./shared";

const TIMELINE_KINDS = new Set<SectionKind>(["experience", "education"]);

const plainLook: Look = {
  headingClass:
    "mb-1.5 text-[0.78em] font-bold uppercase tracking-[0.14em] text-[color:var(--resume-accent)]",
  sectionClass: "mb-4 last:mb-0",
  bullet: "dot",
};

function TimelineSection({ data, kind }: { data: ResumeData; kind: "experience" | "education" }) {
  const items = kind === "experience" ? data.experience : data.education;
  if (items.length === 0) return null;
  return (
    <section className="mb-4 last:mb-0">
      <h3 className={plainLook.headingClass}>
        {kind === "experience" ? "Experience" : "Education"}
      </h3>
      <div
        className="relative ml-1.5 space-y-4 border-l-2 pl-5"
        style={{ borderColor: "var(--resume-accent)" }}
      >
        {kind === "experience"
          ? data.experience.map((exp) => (
              <div key={exp.id} className="relative">
                <span
                  className="absolute -left-[1.65rem] top-1 size-2.5 rounded-full"
                  style={{ backgroundColor: "var(--resume-accent)" }}
                />
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-semibold">
                    {exp.role || "Role"}
                    {exp.company ? <span className="font-normal"> · {exp.company}</span> : null}
                  </p>
                  <p className="shrink-0 text-[0.8em] opacity-70">
                    {dateRange(exp.startDate, exp.endDate, exp.current)}
                  </p>
                </div>
                {exp.location ? <p className="text-[0.8em] opacity-60">{exp.location}</p> : null}
                {exp.bullets.filter(Boolean).length > 0 ? (
                  <ul className="mt-1 space-y-0.5">
                    {exp.bullets.filter(Boolean).map((line, i) => (
                      <li key={i} className="flex gap-2 text-[0.9em] leading-snug">
                        <span className="mt-[0.5em] shrink-0 text-[0.5em] opacity-70">●</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))
          : data.education.map((edu) => (
              <div key={edu.id} className="relative">
                <span
                  className="absolute -left-[1.65rem] top-1 size-2.5 rounded-full"
                  style={{ backgroundColor: "var(--resume-accent)" }}
                />
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-semibold">
                    {edu.degree || "Degree"}
                    {edu.field ? <span className="font-normal">, {edu.field}</span> : null}
                  </p>
                  <p className="shrink-0 text-[0.8em] opacity-70">
                    {dateRange(edu.startDate, edu.endDate, false)}
                  </p>
                </div>
                <p className="text-[0.88em] opacity-80">
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

export function TimelineTemplate({ data, style, pageRef }: TemplateProps) {
  const sections = orderedSections(data).filter((s) => s.hasContent);

  return (
    <ResumePage ref={pageRef} style={style} className="px-10 py-9">
      <header className="mb-6">
        <h1 className="text-[2em] font-bold leading-tight">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="mt-0.5 text-[1em] font-medium" style={{ color: "var(--resume-accent)" }}>
            {data.personal.title}
          </p>
        ) : null}
        <ContactRow
          personal={data.personal}
          className="mt-2 flex flex-wrap items-center text-[0.8em] opacity-80"
        />
      </header>

      {sections.map((s) =>
        TIMELINE_KINDS.has(s.kind) ? (
          s.kind === "experience" || s.kind === "education" ? (
            <TimelineSection key={s.kind} data={data} kind={s.kind} />
          ) : null
        ) : (
          <SectionBody key={s.kind} kind={s.kind} data={data} look={plainLook} />
        ),
      )}
    </ResumePage>
  );
}
