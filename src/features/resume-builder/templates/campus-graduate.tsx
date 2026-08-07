import type { TemplateProps } from "./template-props";
import { ResumePage } from "./resume-page";
import { ContactRow } from "./contact-row";
import { SectionBody, type Look } from "./blocks";
import { orderedSections } from "./shared";

const look: Look = {
  headingClass:
    "mb-1.5 text-[0.8em] font-bold uppercase tracking-[0.12em] text-blue-700 border-b border-blue-200 pb-0.5",
  sectionClass: "mb-4 last:mb-0",
  bullet: "dot",
};

export function CampusGraduateTemplate({ data, style, pageRef }: TemplateProps) {
  const sections = orderedSections(data).filter((s) => s.hasContent);

  return (
    <ResumePage ref={pageRef} style={style} className="px-10 py-9">
      <header className="mb-6 text-center bg-blue-50/60 rounded-xl p-5 border border-blue-100">
        <h1 className="text-[2.1em] font-bold leading-tight text-blue-950">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="mt-0.5 text-[1em] font-semibold text-blue-700">
            {data.personal.title}
          </p>
        ) : null}
        <ContactRow
          personal={data.personal}
          separator=" · "
          className="mt-2.5 flex flex-wrap items-center justify-center text-[0.8em] text-blue-900/80"
        />
      </header>

      {sections.map((s) => (
        <SectionBody key={s.kind} kind={s.kind} data={data} look={look} />
      ))}
    </ResumePage>
  );
}
