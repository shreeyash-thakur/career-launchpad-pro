import "./SteelArc.css";
import type { TemplateProps } from "../../template-props";
import { ResumePage } from "../../resume-page";
import { SectionBody, type Look } from "../../blocks";
import { splitSections, ContactList, Portrait } from "../gallery-shared";

const sideLook: Look = {
  headingClass:
    "mb-2 border-b border-white/40 pb-1 text-[1em] font-semibold uppercase tracking-[0.12em] text-white",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-2",
};

const mainLook: Look = {
  headingClass:
    "mb-2 border-b-2 border-[#2f4f6f] pb-1 text-[1.05em] font-bold uppercase tracking-[0.1em] text-[#2f4f6f]",
  sectionClass: "mb-5 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-3",
};

export function SteelArcTemplate({ data, style, pageRef }: TemplateProps) {
  const { sidebar, main } = splitSections(
    data,
    new Set(["skills", "languages", "certifications", "education"]),
  );

  return (
    <ResumePage ref={pageRef} style={style} className="tpl-steel flex p-0">
      <aside className="relative w-[34%] shrink-0 bg-[#2f4f6f] px-6 pb-8 pt-7 text-white/85">
        <Portrait
          data={data}
          style={style}
          className="mx-auto mb-6 size-[8.5em] border-[3px] border-white/80"
          fallbackClassName="bg-white/15 text-white"
        />
        <h3 className="mb-2 border-b border-white/40 pb-1 text-[1em] font-semibold uppercase tracking-[0.12em] text-white">
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
      </aside>

      <main className="flex-1">
        <header className="tpl-steel__arc px-8 pb-6 pt-8">
          <h1 className="text-[2.1em] font-bold uppercase leading-tight text-white">
            {data.personal.fullName || "Your Name"}
          </h1>
          {data.personal.title ? (
            <p className="mt-1 text-[0.95em] uppercase tracking-[0.2em] text-white/85">
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
