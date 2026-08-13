import "./SageChevron.css";
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
    "tpl-sage__heading mb-2 text-[1.05em] font-bold uppercase tracking-[0.14em] text-[#3f6560]",
  sectionClass: "mb-5 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-3",
};

export function SageChevronTemplate({ data, style, pageRef }: TemplateProps) {
  const { sidebar, main } = splitSections(data, new Set(["summary", "languages"]));

  return (
    <ResumePage ref={pageRef} style={style} className="tpl-sage flex p-0">
      <aside className="w-[35%] shrink-0 bg-[#7ba49d] text-white/90">
        <div className="bg-[#efd6cb] px-6 pb-8 pt-7">
          <Portrait
            data={data}
            style={style}
            className="mx-auto size-[9em] border-4 border-white"
            fallbackClassName="bg-white/70 text-[#3f6560]"
          />
        </div>
        <div className="px-6 py-7">
          {sidebar.map((s) => (
            <SectionBody key={s.kind} kind={s.kind} data={data} look={sideLook} />
          ))}
          <h3 className="mb-2 text-[1.05em] font-semibold uppercase tracking-[0.12em] text-white">
            Contact Me
          </h3>
          <ContactList
            personal={data.personal}
            className="text-[0.8em] text-white/85"
            iconClassName="text-white/70"
          />
        </div>
      </aside>

      <main className="flex-1">
        <header className="bg-[#efd6cb] px-8 py-10">
          <h1 className="text-[2.1em] font-bold uppercase tracking-[0.06em] text-neutral-900">
            {data.personal.fullName || "Your Name"}
          </h1>
          {data.personal.title ? (
            <p className="mt-1 text-[1em] italic text-neutral-600">{data.personal.title}</p>
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
