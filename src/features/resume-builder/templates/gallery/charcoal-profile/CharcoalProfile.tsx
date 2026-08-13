import "./CharcoalProfile.css";
import type { TemplateProps } from "../../template-props";
import { ResumePage } from "../../resume-page";
import { SectionBody, type Look } from "../../blocks";
import { splitSections, ContactList, Portrait } from "../gallery-shared";

const sideLook: Look = {
  headingClass:
    "mb-2 text-[1.05em] font-semibold uppercase tracking-[0.12em] text-white",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-2",
};

const mainLook: Look = {
  headingClass:
    "mb-2 text-[1.1em] font-semibold uppercase tracking-[0.06em] text-neutral-900",
  sectionClass: "mb-5 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-3",
};

export function CharcoalProfileTemplate({ data, style, pageRef }: TemplateProps) {
  const { sidebar, main } = splitSections(
    data,
    new Set(["education", "certifications", "languages"]),
  );

  return (
    <ResumePage ref={pageRef} style={style} className="tpl-charcoal flex p-0">
      <aside className="w-[32%] shrink-0 bg-[#3d3d3d] text-white/85">
        <div className="bg-[#f0cdb7] px-6 py-7">
          <Portrait
            data={data}
            style={style}
            className="mx-auto size-[8.5em] border-4 border-white"
            fallbackClassName="bg-white/60 text-[#3d3d3d]"
          />
        </div>
        <div className="px-6 py-7">
          <ContactList
            personal={data.personal}
            className="mb-7 text-center text-[0.8em] text-white/80"
            iconClassName="text-white/60"
          />
          {sidebar.map((s) => (
            <SectionBody key={s.kind} kind={s.kind} data={data} look={sideLook} />
          ))}
        </div>
      </aside>

      <main className="flex-1">
        <header className="bg-[#f0cdb7] px-8 py-7">
          <h1 className="text-[2.1em] font-normal uppercase tracking-[0.06em] text-neutral-900">
            {data.personal.fullName || "Your Name"}
          </h1>
          {data.personal.title ? (
            <p className="mt-1 text-[0.95em] text-neutral-700">{data.personal.title}</p>
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
