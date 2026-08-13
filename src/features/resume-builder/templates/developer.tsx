import type { ResumeStyle } from "../types";
import type { TemplateProps } from "./template-props";
import { ResumePage } from "./resume-page";
import { ContactRow } from "./contact-row";
import { SectionBody, type Look } from "./blocks";
import { orderedSections } from "./shared";

const look: Look = {
  headingClass: "mb-1.5 text-[0.8em] font-bold text-[color:var(--resume-accent)]",
  sectionClass: "mb-4 last:mb-0",
  bullet: "dash",
  rule: false,
};

export function DeveloperTemplate({ data, style, pageRef }: TemplateProps) {
  const sections = orderedSections(data).filter((s) => s.hasContent);
  const forcedStyle: ResumeStyle = { ...style, fontFamily: "mono" };

  return (
    <ResumePage ref={pageRef} style={forcedStyle} className="px-9 py-9">
      <header className="mb-6">
        <p className="text-[0.75em] tracking-wide opacity-50">{"// resume.json"}</p>
        <h1 className="mt-1 text-[1.7em] font-bold leading-tight">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="text-[0.95em] text-[color:var(--resume-accent)]">{data.personal.title}</p>
        ) : null}
        <ContactRow
          personal={data.personal}
          showIcons={false}
          separator=" "
          className="mt-2 flex flex-wrap items-center gap-x-1 text-[0.72em] opacity-70"
        />
        <div className="mt-4 h-px w-full bg-neutral-200" />
      </header>

      {sections.map((s) => (
        <SectionBody
          key={s.kind}
          kind={s.kind}
          data={data}
          look={{ ...look, headingClass: `${look.headingClass} before:content-['//_']` }}
          bulletOverride={style.bulletStyle}
          dividerOverride={style.sectionDividers}
        />
      ))}
    </ResumePage>
  );
}
