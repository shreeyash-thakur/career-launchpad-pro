import "./BlushPortrait.css";
import type { TemplateProps } from "../../template-props";
import { ResumePage } from "../../resume-page";
import { SectionBody, type Look } from "../../blocks";
import { splitSections, ContactList, Portrait } from "../gallery-shared";

const sidebarLook: Look = {
  headingClass:
    "mb-2 border-b border-[#c8a79b] pb-1 text-[0.8em] font-semibold uppercase tracking-[0.16em] text-[#7d5a4d]",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-2.5",
};

const mainLook: Look = {
  headingClass:
    "mb-3 rounded-[2px] bg-[#c9a49a] px-3 py-1.5 text-[0.8em] font-semibold uppercase tracking-[0.18em] text-white",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-3",
};

export function BlushPortraitTemplate({ data, style, pageRef }: TemplateProps) {
  const { sidebar, main } = splitSections(data);

  return (
    <ResumePage ref={pageRef} style={style} className="tpl-blush flex p-0">
      <aside className="w-[34%] shrink-0 bg-[#f6efe9] px-7 py-8">
        <Portrait
          data={data}
          style={style}
          className="mx-auto mb-8 size-[9.5em] border-4 border-white shadow-sm"
          fallbackClassName="bg-[#c9a49a] text-white"
        />
        <div className="mb-6">
          <h3 className="mb-2 border-b border-[#c8a79b] pb-1 text-[0.8em] font-semibold uppercase tracking-[0.16em] text-[#7d5a4d]">
            Contact
          </h3>
          <ContactList
            personal={data.personal}
            className="text-[0.85em] text-[#5c4a43]"
            iconClassName="text-[#a9776a]"
          />
        </div>
        {sidebar.map((s) => (
          <SectionBody key={s.kind} kind={s.kind} data={data} look={sidebarLook} />
        ))}
      </aside>

      <main className="flex-1 bg-[#f3ded7] px-8 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-[2.1em] font-light uppercase tracking-[0.22em] text-[#6f5045]">
            {data.personal.fullName || "Your Name"}
          </h1>
          {data.personal.title ? (
            <p className="mt-2 text-[0.85em] uppercase tracking-[0.3em] text-[#8f7166]">
              {data.personal.title}
            </p>
          ) : null}
        </header>
        <div className="text-[#4a3a34]">
          {main.map((s) => (
            <SectionBody key={s.kind} kind={s.kind} data={data} look={mainLook} />
          ))}
        </div>
      </main>
    </ResumePage>
  );
}
