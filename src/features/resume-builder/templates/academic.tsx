import type { TemplateProps } from "./template-props";
import { ResumePage } from "./resume-page";
import { ContactRow } from "./contact-row";
import { SectionBody, type Look } from "./blocks";
import { orderedSections } from "./shared";

const look: Look = {
  headingClass:
    "mb-2 border-b border-neutral-300 pb-1 text-[0.86em] font-semibold uppercase tracking-[0.2em] text-neutral-700",
  sectionClass: "mb-5 last:mb-0",
  entryGapClass: "space-y-3.5",
  bullet: "dash",
};

export function AcademicTemplate({ data, style, pageRef }: TemplateProps) {
  const forcedStyle = { ...style, fontFamily: "serif" as const };
  const sections = orderedSections(data).filter((s) => s.hasContent);

  return (
    <ResumePage ref={pageRef} style={forcedStyle} className="px-12 py-10">
      <header className="mb-6 border-b-2 border-neutral-800 pb-4">
        <h1 className="text-[2em] font-bold tracking-tight">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="mt-0.5 text-[0.98em] text-neutral-600">{data.personal.title}</p>
        ) : null}
        <ContactRow
          personal={data.personal}
          showIcons={false}
          separator="|"
          className="mt-2 flex flex-wrap items-center text-[0.8em] text-neutral-600"
        />
      </header>

      {sections.map((s) => (
        <SectionBody key={s.kind} kind={s.kind} data={data} look={look} />
      ))}
    </ResumePage>
  );
}
