import type { TemplateProps } from "./template-props";
import { ResumePage } from "./resume-page";
import { ContactRow } from "./contact-row";
import { SectionBody, type Look } from "./blocks";
import { orderedSections } from "./shared";

const look: Look = {
  headingClass: "mb-1 text-[0.76em] font-bold uppercase tracking-[0.1em] text-neutral-800",
  sectionClass: "mb-3 last:mb-0",
  entryGapClass: "space-y-2",
  bullet: "dash",
  rule: false,
};

export function CompactAtsTemplate({ data, style, pageRef }: TemplateProps) {
  const sections = orderedSections(data).filter((s) => s.hasContent);
  const forcedStyle = { ...style, fontFamily: "sans" as const };

  return (
    <ResumePage ref={pageRef} style={forcedStyle} className="px-9 py-8">
      <header className="mb-4 border-b border-neutral-300 pb-3">
        <h1 className="text-[1.7em] font-bold leading-tight">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="text-[0.92em] text-neutral-600">{data.personal.title}</p>
        ) : null}
        <ContactRow
          personal={data.personal}
          showIcons={false}
          separator="|"
          className="mt-1.5 flex flex-wrap items-center text-[0.78em] text-neutral-600"
        />
      </header>

      {sections.map((s) => (
        <SectionBody key={s.kind} kind={s.kind} data={data} look={look} />
      ))}
    </ResumePage>
  );
}
