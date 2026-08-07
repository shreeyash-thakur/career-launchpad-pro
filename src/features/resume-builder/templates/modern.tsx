import type { ResumeData, ResumeStyle } from "../types";
import { ResumePage } from "./resume-page";
import { ContactRow } from "./contact-row";
import { SectionBody, type Look } from "./blocks";
import { orderedSections, initials } from "./shared";

const look: Look = {
  headingClass:
    "mb-1.5 text-[0.78em] font-bold uppercase tracking-[0.14em]" +
    " text-[color:var(--resume-accent)]",
  sectionClass: "mb-4 last:mb-0",
  bullet: "dot",
  rule: true,
};

export function ModernTemplate({ data, style }: { data: ResumeData; style: ResumeStyle }) {
  const sections = orderedSections(data).filter((s) => s.hasContent);
  return (
    <ResumePage style={style} className="px-10 py-9">
      <header className="mb-6 flex items-center gap-4">
        {style.showPhoto && data.personal.photo ? (
          <img
            src={data.personal.photo}
            alt=""
            className={
              "size-16 shrink-0 object-cover " +
              (style.photoShape === "circle" ? "rounded-full" : "rounded-md")
            }
          />
        ) : null}
        <div>
          <h1
            className="font-display text-[2.1em] font-bold leading-tight"
            style={{ fontFamily: "var(--resume-font)" }}
          >
            {data.personal.fullName || "Your Name"}
          </h1>
          {data.personal.title ? (
            <p className="mt-0.5 text-[1.05em] font-medium text-[color:var(--resume-accent)]">
              {data.personal.title}
            </p>
          ) : null}
          <ContactRow
            personal={data.personal}
            className="mt-2 flex flex-wrap items-center text-[0.82em] opacity-80"
          />
        </div>
      </header>

      {sections.map((s) => (
        <SectionBody key={s.kind} kind={s.kind} data={data} look={look} />
      ))}

      {!data.personal.fullName && sections.length === 0 ? (
        <EmptyHint initials={initials(data.personal.fullName)} />
      ) : null}
    </ResumePage>
  );
}

function EmptyHint({ initials: _i }: { initials: string }) {
  return (
    <p className="mt-10 text-center text-sm text-neutral-400">
      Fill in the form on the left — your résumé builds itself here.
    </p>
  );
}
