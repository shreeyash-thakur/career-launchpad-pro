import "./BronzeLicense.css";
import type { TemplateProps } from "../../template-props";
import { ResumePage } from "../../resume-page";
import { SectionBody, type Look } from "../../blocks";
import { splitSections, contactItems, Portrait } from "../gallery-shared";

const look: Look = {
  headingClass:
    "mb-3 text-[1.05em] font-semibold uppercase tracking-[0.16em] text-neutral-800",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-3",
};

export function BronzeLicenseTemplate({ data, style, pageRef }: TemplateProps) {
  const { sidebar, main } = splitSections(
    data,
    new Set(["skills", "education", "certifications", "languages"]),
  );
  const contacts = contactItems(data.personal);

  return (
    <ResumePage ref={pageRef} style={style} className="tpl-bronze px-9 py-8">
      <header className="flex items-center gap-6">
        <Portrait
          data={data}
          style={style}
          shape="square"
          className="size-[8em] shrink-0 rounded-lg"
          fallbackClassName="bg-[#b07d2b]/15 text-[#8a5f1c]"
        />
        <div className="min-w-0">
          <h1 className="text-[2.3em] font-extrabold uppercase leading-[1.05] text-[#a9761f]">
            {data.personal.fullName || "Your Name"}
          </h1>
          {data.personal.title ? (
            <p className="mt-1 text-[0.95em] font-semibold uppercase tracking-[0.24em] text-neutral-700">
              {data.personal.title}
            </p>
          ) : null}
        </div>
      </header>

      {contacts.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-1.5 text-[0.86em] text-neutral-700">
          {contacts.map((c, i) => (
            <div key={i} className="flex items-center gap-2 break-words">
              <span className="flex size-[1.5em] shrink-0 items-center justify-center rounded-full bg-[#a9761f] text-white">
                <c.icon className="size-[0.85em]" />
              </span>
              <span className="min-w-0 break-words">{c.value}</span>
            </div>
          ))}
        </div>
      ) : null}

      {data.summary.trim() ? (
        <p className="mt-5 border-t border-[#a9761f]/35 pt-4 text-[0.92em] leading-relaxed text-neutral-700">
          {data.summary}
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-[1fr_38%] gap-7 border-t border-[#a9761f]/35 pt-6">
        <main className="border-r border-[#a9761f]/35 pr-7">
          {main
            .filter((s) => s.kind !== "summary")
            .map((s) => (
              <SectionBody key={s.kind} kind={s.kind} data={data} look={look} />
            ))}
        </main>
        <aside>
          {sidebar.map((s) => (
            <SectionBody key={s.kind} kind={s.kind} data={data} look={look} />
          ))}
        </aside>
      </div>
    </ResumePage>
  );
}
