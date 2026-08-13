import "./RosewoodPill.css";
import type { TemplateProps } from "../../template-props";
import { ResumePage } from "../../resume-page";
import { SectionBody, type Look } from "../../blocks";
import { splitSections, ContactList, Portrait } from "../gallery-shared";

const sideLook: Look = {
  headingClass:
    "mb-2 rounded-full bg-[#7c2f3d] px-3 py-1 text-[0.95em] font-bold uppercase tracking-[0.1em] text-white",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-2",
};

const mainLook: Look = {
  headingClass:
    "mb-3 rounded-full bg-[#7c2f3d] px-3 py-1 text-[1em] font-bold uppercase tracking-[0.1em] text-white",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-3",
};

export function RosewoodPillTemplate({ data, style, pageRef }: TemplateProps) {
  const { sidebar, main } = splitSections(
    data,
    new Set(["skills", "languages", "certifications", "education"]),
  );

  return (
    <ResumePage ref={pageRef} style={style} className="tpl-rosewood px-8 py-8">
      <header className="mb-7 flex items-center gap-5 border-b-2 border-[#7c2f3d]/30 pb-5">
        <Portrait
          data={data}
          style={style}
          className="size-[7.5em] shrink-0 border-[3px] border-[#7c2f3d]"
          fallbackClassName="bg-[#7c2f3d]/10 text-[#7c2f3d]"
        />
        <div className="min-w-0">
          <h1 className="text-[2.1em] font-bold uppercase leading-tight text-[#7c2f3d]">
            {data.personal.fullName || "Your Name"}
          </h1>
          {data.personal.title ? (
            <p className="mt-1 text-[0.95em] uppercase tracking-[0.18em] text-neutral-600">
              {data.personal.title}
            </p>
          ) : null}
        </div>
      </header>

      <div className="grid grid-cols-[33%_1fr] gap-7">
        <aside className="text-neutral-700">
          <h3 className="mb-2 rounded-full bg-[#7c2f3d] px-3 py-1 text-[0.95em] font-bold uppercase tracking-[0.1em] text-white">
            Contact
          </h3>
          <ContactList
            personal={data.personal}
            className="mb-6 text-[0.8em]"
            iconClassName="text-[#7c2f3d]"
          />
          {sidebar.map((s) => (
            <SectionBody key={s.kind} kind={s.kind} data={data} look={sideLook} />
          ))}
        </aside>
        <main className="text-neutral-800">
          {main.map((s) => (
            <SectionBody key={s.kind} kind={s.kind} data={data} look={mainLook} />
          ))}
        </main>
      </div>
    </ResumePage>
  );
}
