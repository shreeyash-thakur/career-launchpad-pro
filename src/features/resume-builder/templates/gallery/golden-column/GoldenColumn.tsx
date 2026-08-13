import "./GoldenColumn.css";
import type { TemplateProps } from "../../template-props";
import { ResumePage } from "../../resume-page";
import { SectionBody, type Look } from "../../blocks";
import { splitSections, ContactList } from "../gallery-shared";

const sideLook: Look = {
  headingClass:
    "mb-2 text-[1em] font-bold uppercase tracking-[0.12em] text-[#7a5b12]",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-2",
};

const mainLook: Look = {
  headingClass:
    "mb-2 text-[1.1em] font-bold uppercase tracking-[0.08em] text-neutral-900",
  sectionClass: "mb-5 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-3",
};

export function GoldenColumnTemplate({ data, style, pageRef }: TemplateProps) {
  const { sidebar, main } = splitSections(
    data,
    new Set(["skills", "languages", "certifications", "education"]),
  );

  return (
    <ResumePage ref={pageRef} style={style} className="tpl-golden p-0">
      <header className="border-b-4 border-[#d9a521] px-9 pb-5 pt-8">
        <h1 className="text-[2.3em] font-light uppercase tracking-[0.22em] text-neutral-900">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="mt-1 text-[0.9em] uppercase tracking-[0.3em] text-[#a8801a]">
            {data.personal.title}
          </p>
        ) : null}
      </header>

      <div className="flex">
        <aside className="w-[32%] shrink-0 bg-[#fdf4dd] px-6 py-7 text-neutral-700">
          <h3 className="mb-2 text-[1em] font-bold uppercase tracking-[0.12em] text-[#7a5b12]">
            Details
          </h3>
          <ContactList
            personal={data.personal}
            className="mb-6 text-[0.8em]"
            iconClassName="text-[#c1961f]"
          />
          {sidebar.map((s) => (
            <SectionBody key={s.kind} kind={s.kind} data={data} look={sideLook} />
          ))}
        </aside>
        <main className="flex-1 px-8 py-7 text-neutral-800">
          {main.map((s) => (
            <SectionBody key={s.kind} kind={s.kind} data={data} look={mainLook} />
          ))}
        </main>
      </div>
    </ResumePage>
  );
}
