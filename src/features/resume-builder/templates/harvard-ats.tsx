import type { TemplateProps } from "./template-props";
import { ResumePage } from "./resume-page";
import { ContactRow } from "./contact-row";
import { SectionBody, type Look } from "./blocks";
import { orderedSections } from "./shared";

const look: Look = {
  headingClass:
    "mb-1.5 text-[0.82em] font-bold uppercase tracking-[0.1em] border-b border-neutral-300 pb-0.5 text-neutral-900",
  sectionClass: "mb-4 last:mb-0",
  bullet: "dot",
};

export function HarvardAtsTemplate({ data, style, pageRef }: TemplateProps) {
  const sections = orderedSections(data).filter((s) => s.hasContent);
  const forcedStyle = { ...style, fontFamily: "serif" as const };

  return (
    <ResumePage ref={pageRef} style={forcedStyle} className="px-10 py-9">
      <header className="mb-6 text-center">
        <h1 className="text-[2.2em] font-bold tracking-tight text-neutral-900">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="mt-0.5 text-[1em] font-medium text-neutral-700">{data.personal.title}</p>
        ) : null}
        <ContactRow
          personal={data.personal}
          separator=" | "
          showIcons={false}
          className="mt-2 flex flex-wrap items-center justify-center gap-x-2 text-[0.82em] text-neutral-600"
        />
      </header>

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
