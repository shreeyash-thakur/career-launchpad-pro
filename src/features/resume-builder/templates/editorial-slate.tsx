import type { TemplateProps } from "./template-props";
import { ResumePage } from "./resume-page";
import { ContactRow } from "./contact-row";
import { SectionBody, type Look } from "./blocks";
import { orderedSections } from "./shared";

const look: Look = {
  headingClass:
    "mb-2 text-[0.85em] font-serif font-bold tracking-wide text-slate-800 border-b-2 border-slate-700 pb-0.5",
  sectionClass: "mb-5 last:mb-0",
  entryGapClass: "space-y-3.5",
  bullet: "dot",
};

export function EditorialSlateTemplate({ data, style, pageRef }: TemplateProps) {
  const sections = orderedSections(data).filter((s) => s.hasContent);
  const forcedStyle = { ...style, fontFamily: "serif" as const };

  return (
    <ResumePage ref={pageRef} style={forcedStyle} className="px-12 py-10">
      <header className="mb-7 text-center border-b border-slate-200 pb-5">
        <h1 className="text-[2.4em] font-serif font-normal tracking-tight text-slate-900 leading-none">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="mt-1 text-[1em] font-serif italic text-slate-600">{data.personal.title}</p>
        ) : null}
        <ContactRow
          personal={data.personal}
          separator=" — "
          showIcons={false}
          className="mt-3 flex flex-wrap items-center justify-center gap-x-2 text-[0.8em] text-slate-500 font-sans"
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
