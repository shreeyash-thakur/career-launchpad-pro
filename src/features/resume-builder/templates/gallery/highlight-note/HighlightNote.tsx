import "./HighlightNote.css";
import type { TemplateProps } from "../../template-props";
import { ResumePage } from "../../resume-page";
import { SectionBody, type Look } from "../../blocks";
import { splitSections, contactItems } from "../gallery-shared";

const look: Look = {
  headingClass:
    "tpl-note__heading mb-2 inline-block text-[1.15em] font-bold text-neutral-900",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dash",
  entryGapClass: "space-y-2",
};

export function HighlightNoteTemplate({ data, style, pageRef }: TemplateProps) {
  const { all } = splitSections(data, new Set());
  const contacts = contactItems(data.personal);

  return (
    <ResumePage ref={pageRef} style={style} className="tpl-note flex p-0">
      <div className="w-[1.6em] shrink-0 bg-[#ffe27a]" />
      <div className="flex-1 px-10 py-10">
        <h1 className="tpl-note__name mb-5 inline-block text-[2.3em] font-extrabold leading-tight text-neutral-900">
          {data.personal.fullName || "Your Name"}
        </h1>

        <div className="mb-8 space-y-1 text-[0.92em] text-neutral-700">
          {data.personal.title ? (
            <p>
              <span className="font-bold text-neutral-900">Role: </span>
              {data.personal.title}
            </p>
          ) : null}
          {contacts.length > 0 ? (
            <p className="break-words">
              <span className="font-bold text-neutral-900">Contacts: </span>
              {contacts.map((c) => c.value).join("  ·  ")}
            </p>
          ) : null}
        </div>

        {all.map((s) => (
          <SectionBody key={s.kind} kind={s.kind} data={data} look={look} />
        ))}
      </div>
    </ResumePage>
  );
}
