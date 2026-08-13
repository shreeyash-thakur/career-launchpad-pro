import "./MustardManifest.css";
import type { TemplateProps } from "../../template-props";
import { ResumePage } from "../../resume-page";
import { SectionBody, type Look } from "../../blocks";
import { splitSections, contactItems } from "../gallery-shared";

const look: Look = {
  headingClass:
    "tpl-mustard__heading mb-3 text-[1.05em] font-extrabold uppercase tracking-[0.1em] text-neutral-900",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dash",
  entryGapClass: "space-y-3",
};

export function MustardManifestTemplate({ data, style, pageRef }: TemplateProps) {
  const { all } = splitSections(data, new Set());
  const contacts = contactItems(data.personal);

  return (
    <ResumePage ref={pageRef} style={style} className="tpl-mustard px-10 py-9">
      <header className="mb-7">
        <h1 className="text-[2.6em] font-extrabold uppercase leading-[1.02] text-neutral-900">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="mt-2 inline-block bg-[#e8b52a] px-2 py-0.5 text-[0.9em] font-bold uppercase tracking-[0.16em] text-neutral-900">
            {data.personal.title}
          </p>
        ) : null}
        {contacts.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[0.82em] text-neutral-700">
            {contacts.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <c.icon className="size-[0.9em] text-[#b8891a]" />
                {c.value}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <div className="text-neutral-800">
        {all.map((s) => (
          <SectionBody key={s.kind} kind={s.kind} data={data} look={look} />
        ))}
      </div>
    </ResumePage>
  );
}
