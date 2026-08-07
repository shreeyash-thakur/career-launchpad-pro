import type { TemplateProps } from "./template-props";
import { ResumePage } from "./resume-page";
import { ContactRow } from "./contact-row";
import { SectionBody, type Look } from "./blocks";
import { orderedSections } from "./shared";

const look: Look = {
  headingClass:
    "mb-1.5 text-[0.78em] font-bold uppercase tracking-[0.14em] text-amber-700 border-b border-amber-200 pb-0.5",
  sectionClass: "mb-4 last:mb-0",
  bullet: "dot",
};

export function AiResearchTemplate({ data, style, pageRef }: TemplateProps) {
  const sections = orderedSections(data).filter((s) => s.hasContent);

  return (
    <ResumePage ref={pageRef} style={style} className="px-10 py-9">
      <header className="mb-6 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 p-5 border border-amber-200/50">
        <h1 className="text-[2em] font-bold leading-tight text-neutral-900">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="mt-0.5 text-[1.05em] font-semibold text-amber-700">
            {data.personal.title}
          </p>
        ) : null}
        <ContactRow
          personal={data.personal}
          className="mt-2.5 flex flex-wrap items-center text-[0.8em] text-neutral-700"
        />
      </header>

      {sections.map((s) => (
        <SectionBody key={s.kind} kind={s.kind} data={data} look={look} />
      ))}
    </ResumePage>
  );
}
