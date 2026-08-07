import type { TemplateProps } from "./template-props";
import { ResumePage } from "./resume-page";
import { ContactRow } from "./contact-row";
import { SectionBody, type Look } from "./blocks";
import { orderedSections } from "./shared";
import { cn } from "@/lib/utils";

const look: Look = {
  headingClass: "mb-2 text-[0.8em] font-semibold uppercase tracking-[0.2em] text-neutral-500",
  sectionClass: "mb-5 last:mb-0",
  bullet: "dash",
  rule: false,
};

export function MinimalTemplate({ data, style, pageRef }: TemplateProps) {
  const sections = orderedSections(data).filter((s) => s.hasContent);
  const centered = style.headerLayout === "center";

  return (
    <ResumePage ref={pageRef} style={style} className="px-11 py-10">
      <header className={cn("mb-7", centered && "text-center")}>
        <h1 className="text-[2em] font-semibold tracking-tight">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="mt-0.5 text-[1em] tracking-wide text-neutral-500">{data.personal.title}</p>
        ) : null}
        <ContactRow
          personal={data.personal}
          showIcons={false}
          separator="/"
          className={cn(
            "mt-3 flex flex-wrap items-center text-[0.78em] uppercase tracking-wider text-neutral-500",
            centered && "justify-center",
          )}
        />
        <div className="mt-5 h-px w-full bg-neutral-200" />
      </header>

      {sections.map((s) => (
        <SectionBody key={s.kind} kind={s.kind} data={data} look={look} />
      ))}
    </ResumePage>
  );
}
