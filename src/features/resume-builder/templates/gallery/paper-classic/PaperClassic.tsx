import "./PaperClassic.css";
import type { TemplateProps } from "../../template-props";
import { ResumePage } from "../../resume-page";
import { SectionBody, type Look } from "../../blocks";
import { splitSections, contactItems, Portrait } from "../gallery-shared";

const look: Look = {
  headingClass:
    "mb-2 text-[1.35em] font-bold text-neutral-900",
  sectionClass: "mb-5 border-t border-[#f0c92e] pt-3 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-3",
};

export function PaperClassicTemplate({ data, style, pageRef }: TemplateProps) {
  const { all } = splitSections(data, new Set());
  const contacts = contactItems(data.personal);

  return (
    <ResumePage ref={pageRef} style={style} className="tpl-paper px-10 pb-10 pt-0">
      <div className="tpl-paper__swoosh mb-7" />
      <header className="mb-7 flex items-center gap-5">
        <Portrait
          data={data}
          style={style}
          className="size-[6.5em] shrink-0"
          fallbackClassName="bg-neutral-200 text-neutral-600"
        />
        <div className="min-w-0">
          <h1 className="text-[1.9em] font-bold uppercase tracking-[0.05em] text-neutral-900">
            {data.personal.fullName || "Your Name"}
          </h1>
          {data.personal.title ? (
            <p className="text-[0.9em] text-neutral-600">{data.personal.title}</p>
          ) : null}
          {contacts.length > 0 ? (
            <div className="mt-1 space-y-0.5 text-[0.78em] text-neutral-600">
              {contacts.map((c, i) => (
                <p key={i} className="break-words underline decoration-neutral-300">
                  {c.value}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      {all.map((s) => (
        <SectionBody key={s.kind} kind={s.kind} data={data} look={look} />
      ))}
    </ResumePage>
  );
}
