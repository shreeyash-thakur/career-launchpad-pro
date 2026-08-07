import type { ResumeData, ResumeStyle } from "../types";
import { ResumePage } from "./resume-page";
import { ContactRow } from "./contact-row";
import { SectionBody, type Look } from "./blocks";
import { orderedSections } from "./shared";

const look: Look = {
  headingClass:
    "mb-2 text-center text-[0.85em] font-semibold uppercase tracking-[0.3em] text-neutral-800",
  sectionClass: "mb-5 last:mb-0",
  bullet: "dash",
  rule: false,
};

export function ExecutiveTemplate({ data, style }: { data: ResumeData; style: ResumeStyle }) {
  const sections = orderedSections(data).filter((s) => s.hasContent);
  const forcedStyle: ResumeStyle = { ...style, fontFamily: "serif" };

  return (
    <ResumePage style={forcedStyle} className="px-12 py-10">
      <header className="mb-6 text-center">
        <h1 className="text-[2.15em] font-semibold tracking-tight">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="mt-1 text-[1em] italic text-neutral-600">{data.personal.title}</p>
        ) : null}
        <div
          className="mx-auto mt-3 h-px w-24"
          style={{ backgroundColor: "var(--resume-accent)" }}
        />
        <ContactRow
          personal={data.personal}
          showIcons={false}
          separator="|"
          className="mt-3 flex flex-wrap items-center justify-center text-[0.8em] text-neutral-600"
        />
      </header>

      {sections.map((s) => (
        <SectionBody key={s.kind} kind={s.kind} data={data} look={look} />
      ))}
    </ResumePage>
  );
}
