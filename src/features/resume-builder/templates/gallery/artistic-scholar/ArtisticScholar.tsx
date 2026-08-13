import "./ArtisticScholar.css";
import type { TemplateProps } from "../../template-props";
import { ResumePage } from "../../resume-page";
import { SectionBody, type Look } from "../../blocks";
import { splitSections, ContactList, Portrait } from "../gallery-shared";

const cardLook: Look = {
  headingClass: "sr-only",
  sectionClass: "",
  bullet: "dot",
  entryGapClass: "space-y-2.5",
};

function Highlighted({ children }: { children: string }) {
  return (
    <h3 className="tpl-artistic__heading mb-2 inline-block text-[1.05em] font-extrabold uppercase tracking-wide text-neutral-900">
      {children}
    </h3>
  );
}

const SECTION_TITLES: Record<string, string> = {
  summary: "Hello!",
  education: "Education",
  experience: "Experience",
  skills: "Relevant Coursework",
  projects: "Projects",
  certifications: "Achievement",
  languages: "Languages",
};

export function ArtisticScholarTemplate({ data, style, pageRef }: TemplateProps) {
  const { all } = splitSections(data);
  const left = all.filter((s) => s.kind === "education" || s.kind === "skills");
  const right = all.filter((s) => s.kind !== "education" && s.kind !== "skills");

  return (
    <ResumePage ref={pageRef} style={style} className="tpl-artistic px-8 py-8">
      <div className="grid grid-cols-[38%_1fr] gap-6">
        <div>
          <div className="tpl-artistic__polaroid mb-6 bg-white p-3 pb-5 shadow-md">
            <Portrait
              data={data}
              style={style}
              shape="square"
              className="h-[13em] w-full rounded-none"
              fallbackClassName="bg-neutral-200 text-neutral-600"
            />
            <p className="mt-3 text-center text-[1.25em] font-extrabold uppercase tracking-tight text-neutral-900">
              {data.personal.fullName || "Your Name"}
            </p>
            {data.personal.title ? (
              <p className="text-center text-[0.85em] font-medium text-neutral-500">
                {data.personal.title}
              </p>
            ) : null}
          </div>

          {left.map((s) => (
            <div key={s.kind} className="mb-6">
              <Highlighted>{SECTION_TITLES[s.kind] ?? "Details"}</Highlighted>
              <div className="rounded-sm border border-neutral-400 p-3">
                <SectionBody kind={s.kind} data={data} look={cardLook} />
              </div>
            </div>
          ))}

          <Highlighted>Contact Me</Highlighted>
          <div className="rounded-sm border border-neutral-400 p-3">
            <ContactList
              personal={data.personal}
              className="text-[0.85em] text-neutral-700"
              iconClassName="text-neutral-900"
            />
          </div>
        </div>

        <div>
          {right.map((s) => (
            <div key={s.kind} className="mb-6 last:mb-0">
              <Highlighted>{SECTION_TITLES[s.kind] ?? "Details"}</Highlighted>
              <div className="rounded-sm border border-neutral-400 p-3">
                <SectionBody kind={s.kind} data={data} look={cardLook} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ResumePage>
  );
}
