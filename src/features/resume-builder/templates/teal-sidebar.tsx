import type { SectionKind } from "../types";
import type { TemplateProps } from "./template-props";
import { ResumePage } from "./resume-page";
import { SectionBody, type Look } from "./blocks";
import { orderedSections, initials } from "./shared";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

const SIDEBAR_KINDS = new Set<SectionKind>(["skills", "languages", "certifications"]);

const sidebarLook: Look = {
  headingClass:
    "mb-1.5 text-[0.76em] font-bold uppercase tracking-[0.14em] text-teal-900 border-b border-teal-200 pb-0.5",
  sectionClass: "mb-4 last:mb-0",
  bullet: "none",
};

const mainLook: Look = {
  headingClass:
    "mb-1.5 text-[0.8em] font-bold uppercase tracking-[0.12em] text-teal-800 border-b border-teal-100 pb-0.5",
  sectionClass: "mb-4 last:mb-0",
  bullet: "dot",
};

export function TealSidebarTemplate({ data, style, pageRef }: TemplateProps) {
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
      <aside className="w-[34%] shrink-0 bg-teal-50/80 px-6 py-9 text-slate-800 border-r border-teal-100">
        <div className="mb-5 flex items-center gap-3">
          {style.showPhoto && data.personal.photo ? (
            <img
              src={data.personal.photo}
              alt=""
              className="size-16 object-cover rounded-full ring-2 ring-teal-500/30"
            />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-full bg-teal-600 text-white font-bold text-lg shadow-sm">
              {initials(data.personal.fullName) || "YN"}
            </div>
          )}
        </div>

        {contactItems.length > 0 ? (
          <div className="mb-6 space-y-1.5 text-[0.78em] text-slate-600">
            {contactItems.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 break-all">
                <item.icon className="size-[1em] shrink-0 text-teal-600" />
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

      <main className="flex-1 px-8 py-9">
        <h1 className="text-[2em] font-bold leading-tight text-slate-900">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="mt-0.5 mb-5 text-[1em] font-medium text-teal-700">{data.personal.title}</p>
        ) : (
          <div className="mb-5" />
        )}

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
