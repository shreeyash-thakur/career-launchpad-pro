import type { SectionKind } from "../types";
import type { TemplateProps } from "./template-props";
import { ResumePage } from "./resume-page";
import { SectionBody, type Look } from "./blocks";
import { orderedSections } from "./shared";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

const SIDEBAR_KINDS = new Set<SectionKind>(["skills", "projects", "certifications"]);

const sidebarLook: Look = {
  headingClass:
    "mb-1.5 text-[0.76em] font-bold uppercase tracking-[0.14em] text-sky-400 border-b border-sky-400/30 pb-0.5",
  sectionClass: "mb-4 last:mb-0",
  bullet: "dash",
};

const mainLook: Look = {
  headingClass:
    "mb-1.5 text-[0.8em] font-bold uppercase tracking-[0.12em] text-sky-700 border-b border-slate-200 pb-0.5",
  sectionClass: "mb-4 last:mb-0",
  bullet: "dot",
};

export function ReactDeveloperTemplate({ data, style, pageRef }: TemplateProps) {
  const all = orderedSections(data).filter((s) => s.hasContent);
  const sidebarSections = all.filter((s) => SIDEBAR_KINDS.has(s.kind));
  const mainSections = all.filter((s) => !SIDEBAR_KINDS.has(s.kind));

  const contactItems = [
    { icon: Mail, value: data.personal.email },
    { icon: Phone, value: data.personal.phone },
    { icon: MapPin, value: data.personal.location },
    { icon: Globe, value: data.personal.website },
    { icon: Linkedin, value: data.personal.linkedin },
    { icon: Github, value: data.personal.github },
  ].filter((i) => i.value.trim());

  return (
    <ResumePage ref={pageRef} style={style} className="flex p-0">
      <aside className="w-[35%] shrink-0 bg-slate-900 px-6 py-8 text-slate-100">
        <div className="mb-6">
          <h1 className="text-[1.6em] font-bold leading-tight text-white">
            {data.personal.fullName || "Your Name"}
          </h1>
          {data.personal.title ? (
            <p className="mt-1 text-[0.88em] font-medium text-sky-400">{data.personal.title}</p>
          ) : null}
        </div>

        {contactItems.length > 0 ? (
          <div className="mb-6 space-y-1.5 text-[0.76em] text-slate-300">
            {contactItems.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 break-all">
                <item.icon className="size-[1em] shrink-0 text-sky-400" />
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        ) : null}

        {sidebarSections.map((s) => (
          <SectionBody
            key={s.kind}
            kind={s.kind}
            data={data}
            look={sidebarLook}
            bulletOverride={style.bulletStyle}
            dividerOverride={style.sectionDividers}
          />
        ))}
      </aside>

      <main className="flex-1 px-8 py-8">
        {mainSections.map((s) => (
          <SectionBody
            key={s.kind}
            kind={s.kind}
            data={data}
            look={mainLook}
            bulletOverride={style.bulletStyle}
            dividerOverride={style.sectionDividers}
          />
        ))}
      </main>
    </ResumePage>
  );
}
