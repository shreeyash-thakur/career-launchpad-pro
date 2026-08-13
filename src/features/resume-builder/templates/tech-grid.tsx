import type { SectionKind } from "../types";
import type { TemplateProps } from "./template-props";
import { ResumePage } from "./resume-page";
import { ContactRow } from "./contact-row";
import { SectionBody, type Look } from "./blocks";
import { orderedSections } from "./shared";

const look: Look = {
  headingClass:
    "mb-2 flex items-center gap-2 text-[0.8em] font-bold uppercase tracking-[0.1em] text-neutral-800 before:h-3 before:w-1 before:rounded-full before:content-[''] before:bg-[color:var(--resume-accent)]",
  sectionClass: "mb-4 last:mb-0",
  bullet: "dash",
};

const SKIP: SectionKind = "skills";

export function TechGridTemplate({ data, style, pageRef }: TemplateProps) {
  const sections = orderedSections(data).filter((s) => s.hasContent && s.kind !== SKIP);

  return (
    <ResumePage ref={pageRef} style={style} className="px-9 py-9">
      <header className="mb-5 border-b-2 pb-4" style={{ borderColor: "var(--resume-accent)" }}>
        <h1 className="text-[1.9em] font-bold leading-tight">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="mt-0.5 text-[0.98em] font-medium" style={{ color: "var(--resume-accent)" }}>
            {data.personal.title}
          </p>
        ) : null}
        <ContactRow
          personal={data.personal}
          className="mt-2 flex flex-wrap items-center text-[0.78em] text-neutral-600"
        />
      </header>

      {data.skills.length > 0 ? (
        <section className="mb-4">
          <h3 className={look.headingClass}>Skills</h3>
          <div className="space-y-2">
            {data.skills.map((group) => (
              <div key={group.id}>
                {group.category ? (
                  <p className="mb-1 text-[0.78em] font-semibold text-neutral-500">
                    {group.category}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item, i) => (
                    <span
                      key={i}
                      className="rounded-md border px-2 py-0.5 text-[0.78em]"
                      style={{
                        borderColor: "color-mix(in srgb, var(--resume-accent) 35%, transparent)",
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
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
    </ResumePage>
  );
}
