import "./EmeraldPanel.css";
import type { TemplateProps } from "../../template-props";
import { ResumePage } from "../../resume-page";
import { SectionBody, type Look } from "../../blocks";
import { splitSections, contactItems } from "../gallery-shared";

const mainLook: Look = {
  headingClass:
    "mb-2 text-[1.05em] font-semibold uppercase tracking-[0.06em] text-[#0f7a4f]",
  sectionClass: "mb-5 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-3",
};

const panelLook: Look = {
  headingClass:
    "mb-2 text-[1em] font-semibold uppercase tracking-[0.1em] text-white",
  sectionClass: "mb-5 last:mb-0",
  bullet: "none",
  entryGapClass: "space-y-1.5",
};

export function EmeraldPanelTemplate({ data, style, pageRef }: TemplateProps) {
  const { sidebar, main } = splitSections(
    data,
    new Set(["skills", "languages", "certifications"]),
  );
  const contacts = contactItems(data.personal);

  return (
    <ResumePage ref={pageRef} style={style} className="tpl-emerald flex p-0">
      <main className="flex-1 px-8 py-8">
        <h1 className="text-[2em] font-bold uppercase leading-tight text-neutral-900">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="text-[1em] font-medium text-[#0f7a4f]">{data.personal.title}</p>
        ) : null}
        {contacts.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.8em] text-neutral-600">
            {contacts.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <c.icon className="size-[0.9em] text-[#16a06a]" />
                {c.value}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-6 text-neutral-800">
          {main.map((s) => (
            <SectionBody key={s.kind} kind={s.kind} data={data} look={mainLook} />
          ))}
        </div>
      </main>

      <aside className="w-[33%] shrink-0 bg-[#14663f] px-6 py-8 text-white/90">
        {sidebar.map((s) => (
          <SectionBody key={s.kind} kind={s.kind} data={data} look={panelLook} />
        ))}
        {data.skills.length > 0 ? (
          <section>
            <h3 className="mb-2 text-[1em] font-semibold uppercase tracking-[0.1em] text-white">
              Strengths
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {data.skills
                .flatMap((g) => g.items)
                .slice(0, 8)
                .map((item, i) => (
                  <span
                    key={i}
                    className="rounded-sm border border-white/40 px-2 py-0.5 text-[0.74em]"
                  >
                    {item}
                  </span>
                ))}
            </div>
          </section>
        ) : null}
      </aside>
    </ResumePage>
  );
}
