import "./CrimsonBanner.css";
import type { TemplateProps } from "../../template-props";
import { ResumePage } from "../../resume-page";
import { SectionBody, type Look } from "../../blocks";
import { splitSections, ContactList, Portrait } from "../gallery-shared";

const sideLook: Look = {
  headingClass:
    "mb-2 border-b-2 border-[#c0392b]/40 pb-1 text-[1.05em] font-bold uppercase tracking-[0.08em] text-[#a32b1e]",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-2",
};

const mainLook: Look = {
  headingClass:
    "mb-3 border-b-2 border-[#c0392b]/40 pb-1 text-[1.05em] font-bold uppercase tracking-[0.08em] text-[#a32b1e]",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-4",
};

export function CrimsonBannerTemplate({ data, style, pageRef }: TemplateProps) {
  const { sidebar, main } = splitSections(
    data,
    new Set(["skills", "languages", "certifications", "education"]),
  );

  return (
    <ResumePage ref={pageRef} style={style} className="tpl-crimson flex flex-col p-0">
      <header className="tpl-crimson__banner flex items-center justify-between gap-6 px-9 py-8">
        <div className="min-w-0">
          <h1 className="text-[2.5em] font-extrabold uppercase leading-[1.02] text-white">
            {data.personal.fullName || "Your Name"}
          </h1>
          {data.personal.title ? (
            <p className="mt-3 border-y border-white/50 py-2 text-[1.05em] font-light text-white/95">
              {data.personal.title}
            </p>
          ) : null}
        </div>
        <Portrait
          data={data}
          style={style}
          className="size-[9em] shrink-0 border-4 border-white/90"
          fallbackClassName="bg-white/20 text-white"
        />
      </header>

      <div className="grid flex-1 grid-cols-[36%_1fr] gap-8 bg-[#f6f4f2] px-9 py-8">
        <aside>
          <h3 className="mb-2 border-b-2 border-[#c0392b]/40 pb-1 text-[1.05em] font-bold uppercase tracking-[0.08em] text-[#a32b1e]">
            Contact
          </h3>
          <ContactList
            personal={data.personal}
            className="mb-6 text-[0.88em] text-neutral-700"
            iconClassName="text-[#c0392b]"
          />
          {sidebar.map((s) => (
            <SectionBody key={s.kind} kind={s.kind} data={data} look={sideLook} />
          ))}
        </aside>
        <main>
          {main.map((s) => (
            <SectionBody key={s.kind} kind={s.kind} data={data} look={mainLook} />
          ))}
        </main>
      </div>

      <div className="tpl-crimson__banner h-6 w-full" />
    </ResumePage>
  );
}
