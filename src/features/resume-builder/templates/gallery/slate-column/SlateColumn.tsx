import "./SlateColumn.css";
import type { TemplateProps } from "../../template-props";
import { ResumePage } from "../../resume-page";
import { SectionBody, type Look } from "../../blocks";
import { splitSections, ContactList } from "../gallery-shared";

const sidebarLook: Look = {
  headingClass:
    "mb-2 text-[1.05em] font-extrabold uppercase tracking-[0.06em] text-[#dbe6ef]",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-2",
};

const mainLook: Look = {
  headingClass:
    "mb-2 text-[1.15em] font-extrabold uppercase tracking-[0.05em] text-[#2c4a63]",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-3",
};

export function SlateColumnTemplate({ data, style, pageRef }: TemplateProps) {
  const { sidebar, main } = splitSections(data);

  return (
    <ResumePage ref={pageRef} style={style} className="tpl-slate flex p-0">
      <aside className="w-[33%] shrink-0 bg-[#4a6a80] px-6 py-8 text-white/90">
        <h3 className="mb-2 text-[1.05em] font-extrabold uppercase tracking-[0.06em] text-[#dbe6ef]">
          Contact
        </h3>
        <ContactList
          personal={data.personal}
          className="mb-6 text-[0.82em] text-white/85"
          iconClassName="text-white/70"
        />
        {sidebar.map((s) => (
          <SectionBody key={s.kind} kind={s.kind} data={data} look={sidebarLook} />
        ))}
      </aside>

      <main className="flex-1 bg-[#e9e6df] px-8 py-8 text-[#26384a]">
        <header className="mb-7">
          <h1 className="text-[2.6em] font-extrabold uppercase leading-[0.95] tracking-tight text-[#2c4a63]">
            {data.personal.fullName || "Your Name"}
          </h1>
          {data.personal.title ? (
            <p className="mt-1 text-[0.9em] text-[#546b7d]">{data.personal.title}</p>
          ) : null}
        </header>
        {main.map((s) => (
          <SectionBody key={s.kind} kind={s.kind} data={data} look={mainLook} />
        ))}
      </main>
    </ResumePage>
  );
}
