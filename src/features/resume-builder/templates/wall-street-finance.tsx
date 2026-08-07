import type { TemplateProps } from "./template-props";
import { ResumePage } from "./resume-page";
import { ContactRow } from "./contact-row";
import { SectionBody, type Look } from "./blocks";
import { orderedSections } from "./shared";

const look: Look = {
  headingClass:
    "mb-1.5 text-[0.8em] font-bold uppercase tracking-[0.12em] text-indigo-950 border-b-2 border-double border-indigo-900 pb-0.5",
  sectionClass: "mb-3.5 last:mb-0",
  entryGapClass: "space-y-2",
  bullet: "dot",
};

export function WallStreetFinanceTemplate({ data, style, pageRef }: TemplateProps) {
  const sections = orderedSections(data).filter((s) => s.hasContent);
  const forcedStyle = { ...style, fontFamily: "serif" as const };

  return (
    <ResumePage ref={pageRef} style={forcedStyle} className="px-10 py-8">
      <header className="mb-5 text-center border-b border-indigo-950 pb-3">
        <h1 className="text-[2.1em] font-extrabold tracking-tight text-indigo-950">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="mt-0.5 text-[0.95em] font-semibold text-indigo-800">
            {data.personal.title}
          </p>
        ) : null}
        <ContactRow
          personal={data.personal}
          separator="  ♦  "
          showIcons={false}
          className="mt-2 flex flex-wrap items-center justify-center gap-x-1 text-[0.8em] text-neutral-700"
        />
      </header>

      {sections.map((s) => (
        <SectionBody key={s.kind} kind={s.kind} data={data} look={look} />
      ))}
    </ResumePage>
  );
}
