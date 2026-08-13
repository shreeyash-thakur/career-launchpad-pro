import "./PeachHero.css";
import type { TemplateProps } from "../../template-props";
import { ResumePage } from "../../resume-page";
import { SectionBody, type Look } from "../../blocks";
import { splitSections, ContactList, Portrait } from "../gallery-shared";

const sideLook: Look = {
  headingClass:
    "mb-2 text-[1em] font-bold uppercase tracking-[0.12em] text-[#a04a2e]",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-2",
};

const mainLook: Look = {
  headingClass:
    "mb-2 border-b border-[#e7a487] pb-1 text-[1.05em] font-bold uppercase tracking-[0.08em] text-[#a04a2e]",
  sectionClass: "mb-5 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-3",
};

export function PeachHeroTemplate({ data, style, pageRef }: TemplateProps) {
  const { sidebar, main } = splitSections(
    data,
    new Set(["skills", "languages", "certifications"]),
  );

  return (
    <ResumePage ref={pageRef} style={style} className="tpl-peach p-0">
      <header className="tpl-peach__hero flex items-center gap-6 px-9 py-8">
        <Portrait
          data={data}
          style={style}
          className="size-[8.5em] shrink-0 border-4 border-white"
          fallbackClassName="bg-white/60 text-[#a04a2e]"
        />
        <div className="min-w-0">
          <h1 className="text-[2.2em] font-bold leading-tight text-neutral-900">
            {data.personal.fullName || "Your Name"}
          </h1>
          {data.personal.title ? (
            <p className="mt-1 text-[1em] text-neutral-700">{data.personal.title}</p>
          ) : null}
        </div>
      </header>

      <div className="flex">
        <main className="flex-1 px-8 py-7 text-neutral-800">
          {main.map((s) => (
            <SectionBody key={s.kind} kind={s.kind} data={data} look={mainLook} />
          ))}
        </main>
        <aside className="w-[31%] shrink-0 bg-[#fdf0e8] px-6 py-7 text-neutral-700">
          <h3 className="mb-2 text-[1em] font-bold uppercase tracking-[0.12em] text-[#a04a2e]">
            Contact
          </h3>
          <ContactList
            personal={data.personal}
            className="mb-6 text-[0.8em]"
            iconClassName="text-[#d2764f]"
          />
          {sidebar.map((s) => (
            <SectionBody key={s.kind} kind={s.kind} data={data} look={sideLook} />
          ))}
        </aside>
      </div>
    </ResumePage>
  );
}
