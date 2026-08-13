import "./SkyWave.css";
import type { TemplateProps } from "../../template-props";
import { ResumePage } from "../../resume-page";
import { SectionBody, type Look } from "../../blocks";
import { splitSections, ContactList, Portrait } from "../gallery-shared";

const sideLook: Look = {
  headingClass:
    "mb-2 text-[1em] font-bold uppercase tracking-[0.12em] text-white",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-2",
};

const mainLook: Look = {
  headingClass:
    "mb-2 border-b-2 border-[#7fb3d5] pb-1 text-[1.05em] font-bold uppercase tracking-[0.08em] text-[#1f5c85]",
  sectionClass: "mb-5 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-3",
};

export function SkyWaveTemplate({ data, style, pageRef }: TemplateProps) {
  const { sidebar, main } = splitSections(
    data,
    new Set(["skills", "languages", "certifications"]),
  );

  return (
    <ResumePage ref={pageRef} style={style} className="tpl-sky flex p-0">
      <aside className="w-[33%] shrink-0 bg-[#2b7ba8] text-white/85">
        <div className="tpl-sky__cap px-6 pb-7 pt-7">
          <Portrait
            data={data}
            style={style}
            className="mx-auto size-[8em] border-4 border-white/90"
            fallbackClassName="bg-white/25 text-white"
          />
        </div>
        <div className="px-6 pb-8 pt-6">
          <h3 className="mb-2 text-[1em] font-bold uppercase tracking-[0.12em] text-white">
            Contact
          </h3>
          <ContactList
            personal={data.personal}
            className="mb-6 text-[0.8em]"
            iconClassName="text-white/70"
          />
          {sidebar.map((s) => (
            <SectionBody key={s.kind} kind={s.kind} data={data} look={sideLook} />
          ))}
        </div>
      </aside>

      <main className="flex-1">
        <header className="border-b-2 border-[#7fb3d5] px-8 pb-5 pt-8">
          <h1 className="text-[2.2em] font-bold uppercase leading-tight text-[#1f5c85]">
            {data.personal.fullName || "Your Name"}
          </h1>
          {data.personal.title ? (
            <p className="mt-1 text-[0.95em] uppercase tracking-[0.2em] text-neutral-600">
              {data.personal.title}
            </p>
          ) : null}
        </header>
        <div className="px-8 py-7 text-neutral-800">
          {main.map((s) => (
            <SectionBody key={s.kind} kind={s.kind} data={data} look={mainLook} />
          ))}
        </div>
      </main>
    </ResumePage>
  );
}
