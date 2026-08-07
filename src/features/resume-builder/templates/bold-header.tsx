import type { TemplateProps } from "./template-props";
import { ResumePage } from "./resume-page";
import { ContactRow } from "./contact-row";
import { SectionBody, type Look } from "./blocks";
import { orderedSections, initials } from "./shared";

const look: Look = {
  headingClass:
    "mb-2 text-[0.8em] font-bold uppercase tracking-[0.14em] text-[color:var(--resume-accent)]",
  sectionClass: "mb-4 last:mb-0",
  bullet: "dot",
  rule: true,
};

export function BoldHeaderTemplate({ data, style, pageRef }: TemplateProps) {
  const sections = orderedSections(data).filter((s) => s.hasContent);

  return (
    <ResumePage ref={pageRef} style={style} className="p-0">
      <header
        className="flex items-center gap-5 px-10 py-8 text-white"
        style={{ backgroundColor: "var(--resume-accent)" }}
      >
        {style.showPhoto && data.personal.photo ? (
          <img
            src={data.personal.photo}
            alt=""
            className={
              "size-20 shrink-0 object-cover ring-4 ring-white/25 " +
              (style.photoShape === "circle" ? "rounded-full" : "rounded-md")
            }
          />
        ) : (
          <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-white/15 text-[1.4em] font-bold">
            {initials(data.personal.fullName) || "YN"}
          </div>
        )}
        <div>
          <h1 className="text-[2.1em] font-bold leading-tight">
            {data.personal.fullName || "Your Name"}
          </h1>
          {data.personal.title ? (
            <p className="mt-0.5 text-[1em] text-white/85">{data.personal.title}</p>
          ) : null}
          <ContactRow
            personal={data.personal}
            showIcons={false}
            separator="•"
            className="mt-2 flex flex-wrap items-center text-[0.8em] text-white/80"
          />
        </div>
      </header>

      <div className="px-10 py-8">
        {sections.map((s) => (
          <SectionBody key={s.kind} kind={s.kind} data={data} look={look} />
        ))}
      </div>
    </ResumePage>
  );
}
