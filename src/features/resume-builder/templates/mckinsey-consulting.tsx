import type { TemplateProps } from "./template-props";
import { ResumePage } from "./resume-page";
import { ContactRow } from "./contact-row";
import { SectionBody, type Look } from "./blocks";
import { orderedSections } from "./shared";

const look: Look = {
  headingClass:
    "mb-1.5 text-[0.78em] font-bold uppercase tracking-[0.14em] text-slate-800 border-b border-slate-300 pb-0.5",
  sectionClass: "mb-3.5 last:mb-0",
  entryGapClass: "space-y-2.5",
  bullet: "dash",
};

export function MckinseyConsultingTemplate({ data, style, pageRef }: TemplateProps) {
  const sections = orderedSections(data).filter((s) => s.hasContent);
  const forcedStyle = { ...style, fontFamily: "sans" as const };

  return (
    <ResumePage ref={pageRef} style={forcedStyle} className="px-9 py-8">
      <header className="mb-5 flex flex-wrap items-baseline justify-between border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-[2em] font-bold text-slate-900 leading-tight">
            {data.personal.fullName || "Your Name"}
          </h1>
        {data.personal.title ? (
            <p className="text-[0.95em] font-medium text-slate-600">{data.personal.title}</p>
          ) : null}
        </div>
        <ContactRow
          personal={data.personal}
          separator=" · "
          showIcons={false}
          className="flex flex-wrap items-center justify-end text-[0.78em] text-slate-600 max-w-[50%]"
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
