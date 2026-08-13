import "./AmberSplit.css";
import type { TemplateProps } from "../../template-props";
import { ResumePage } from "../../resume-page";
import { SectionBody, type Look } from "../../blocks";
import { splitSections, contactItems } from "../gallery-shared";

const mainLook: Look = {
  headingClass:
    "mb-2 text-[1.1em] font-bold uppercase tracking-[0.06em] text-neutral-900",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-3",
};

const railLook: Look = {
  headingClass:
    "mb-2 border-b-2 border-[#f5c518] pb-1 text-[1.05em] font-bold uppercase tracking-[0.06em] text-neutral-900",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-2",
};

export function AmberSplitTemplate({ data, style, pageRef }: TemplateProps) {
  const { sidebar, main } = splitSections(
    data,
    new Set(["summary", "skills", "languages", "certifications"]),
  );
  const contacts = contactItems(data.personal);

  return (
    <ResumePage ref={pageRef} style={style} className="tpl-amber flex p-0">
      <div className="w-[62%] shrink-0 bg-[#f5c518] px-8 py-9 text-neutral-900">
        <h1 className="text-[2.4em] font-extrabold uppercase leading-[1.05]">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="mb-7 mt-1 text-[1.1em] font-light">{data.personal.title}</p>
        ) : (
          <div className="mb-7" />
        )}
        {main.map((s) => (
          <SectionBody key={s.kind} kind={s.kind} data={data} look={mainLook} />
        ))}
      </div>

      <aside className="flex-1 bg-white px-7 py-9 text-neutral-800">
        {sidebar.map((s) => (
          <SectionBody key={s.kind} kind={s.kind} data={data} look={railLook} />
        ))}
        {contacts.length > 0 ? (
          <section className="mb-6">
            <h3 className="mb-2 border-b-2 border-[#f5c518] pb-1 text-[1.05em] font-bold uppercase tracking-[0.06em] text-neutral-900">
              Contact
            </h3>
            <div className="space-y-1 text-[0.88em]">
              {contacts.map((c, i) => (
                <p key={i} className="break-words">
                  {c.value}
                </p>
              ))}
            </div>
          </section>
        ) : null}
      </aside>
    </ResumePage>
  );
}
