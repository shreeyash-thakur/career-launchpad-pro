import "./BronzeBars.css";
import type { TemplateProps } from "../../template-props";
import { ResumePage } from "../../resume-page";
import { SectionBody, type Look } from "../../blocks";
import { splitSections, ContactList, flatSkills } from "../gallery-shared";

const sideLook: Look = {
  headingClass:
    "mb-2 text-[1em] font-bold uppercase tracking-[0.12em] text-white",
  sectionClass: "mb-6 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-2",
};

const mainLook: Look = {
  headingClass:
    "mb-2 text-[1.05em] font-bold uppercase tracking-[0.1em] text-[#8b5e34]",
  sectionClass: "mb-5 last:mb-0",
  bullet: "dot",
  entryGapClass: "space-y-3",
};

export function BronzeBarsTemplate({ data, style, pageRef }: TemplateProps) {
  const { sidebar, main } = splitSections(
    data,
    new Set(["education", "languages", "certifications"]),
  );
  const skills = flatSkills(data).slice(0, 7);

  return (
    <ResumePage ref={pageRef} style={style} className="tpl-bronzebars flex p-0">
      <aside className="w-[33%] shrink-0 bg-[#8b5e34] px-6 py-8 text-white/85">
        <h1 className="text-[1.8em] font-bold uppercase leading-tight text-white">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="mb-6 mt-1 text-[0.85em] uppercase tracking-[0.18em] text-white/80">
            {data.personal.title}
          </p>
        ) : (
          <div className="mb-6" />
        )}
        <ContactList
          personal={data.personal}
          className="mb-6 text-[0.8em]"
          iconClassName="text-white/70"
        />
        {skills.length > 0 ? (
          <section className="mb-6">
            <h3 className="mb-2 text-[1em] font-bold uppercase tracking-[0.12em] text-white">
              Skill Level
            </h3>
            <div className="space-y-2">
              {skills.map((skill, i) => (
                <div key={i}>
                  <p className="text-[0.8em]">{skill}</p>
                  <div className="mt-0.5 h-[0.4em] w-full rounded-full bg-white/25">
                    <div
                      className="h-full rounded-full bg-white/80"
                      style={{ width: `${92 - i * 7}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
        {sidebar.map((s) => (
          <SectionBody key={s.kind} kind={s.kind} data={data} look={sideLook} />
        ))}
      </aside>

      <main className="flex-1 px-8 py-8 text-neutral-800">
        {main.map((s) => (
          <SectionBody key={s.kind} kind={s.kind} data={data} look={mainLook} />
        ))}
      </main>
    </ResumePage>
  );
}
