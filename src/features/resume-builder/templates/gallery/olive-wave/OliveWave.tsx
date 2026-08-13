import "./OliveWave.css";
import type { TemplateProps } from "../../template-props";
import { ResumePage } from "../../resume-page";
import { SectionBody, type Look } from "../../blocks";
import { splitSections, ContactList } from "../gallery-shared";

const sideLook: Look = {
  headingClass:
    "tpl-olive__heading mb-2 text-[1.05em] font-semibold uppercase tracking-[0.04em] text-[#3f3f1c]",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-2",
};

const mainLook: Look = {
  headingClass:
    "tpl-olive__heading mb-3 text-[1.2em] font-semibold uppercase tracking-[0.04em] text-[#4b4b1f]",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-4",
};

export function OliveWaveTemplate({ data, style, pageRef }: TemplateProps) {
  const { sidebar, main } = splitSections(
    data,
    new Set(["skills", "education", "languages", "certifications"]),
  );

  return (
    <ResumePage ref={pageRef} style={style} className="tpl-olive flex flex-col p-0">
      <header className="bg-[#6b6b16] px-8 pb-6 pt-7 text-white">
        <h1 className="text-[2.1em] font-semibold leading-tight">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="mt-1 text-[0.85em] font-bold">{data.personal.title}</p>
        ) : null}
        {data.summary.trim() ? (
          <p className="mt-2 max-w-[52em] text-[0.78em] leading-snug text-white/90">
            {data.summary}
          </p>
        ) : null}
      </header>
      <div className="tpl-olive__wave" />

      <div className="flex flex-1">
        <aside className="w-[30%] shrink-0 bg-[#c8cc94] px-6 py-6 text-[#3f3f1c]">
          <h3 className="tpl-olive__heading mb-2 text-[1.05em] font-semibold uppercase tracking-[0.04em] text-[#3f3f1c]">
            Contact
          </h3>
          <ContactList
            personal={data.personal}
            className="mb-6 text-[0.8em]"
            iconClassName="text-[#6b6b16]"
          />
          {sidebar.map((s) => (
            <SectionBody key={s.kind} kind={s.kind} data={data} look={sideLook} />
          ))}
        </aside>
        <main className="flex-1 px-8 py-6 text-neutral-800">
          {main
            .filter((s) => s.kind !== "summary")
            .map((s) => (
              <SectionBody key={s.kind} kind={s.kind} data={data} look={mainLook} />
            ))}
        </main>
      </div>
    </ResumePage>
  );
}
