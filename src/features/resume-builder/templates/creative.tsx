import type { SectionKind } from "../types";
import type { TemplateProps } from "./template-props";
import { ResumePage } from "./resume-page";
import { SectionBody, type Look } from "./blocks";
import { orderedSections, initials } from "./shared";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

const SIDEBAR_KINDS = new Set<SectionKind>(["skills", "languages", "certifications"]);

const sidebarLook: Look = {
  headingClass: "mb-1.5 text-[0.76em] font-bold uppercase tracking-[0.14em] text-white",
  sectionClass: "mb-4 last:mb-0",
  bullet: "none",
};

const mainLook: Look = {
  headingClass:
    "mb-1.5 text-[0.8em] font-bold uppercase tracking-[0.12em] text-[color:var(--resume-accent)]",
  sectionClass: "mb-4 last:mb-0",
  bullet: "dot",
};

export function CreativeTemplate({ data, style, pageRef }: TemplateProps) {
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
      <aside
        className="w-[34%] shrink-0 px-6 py-9 text-white"
        style={{ backgroundColor: "var(--resume-accent)" }}
      >
        {style.showPhoto && data.personal.photo ? (
          <img
            src={data.personal.photo}
            alt=""
            className={
              "mb-4 size-20 object-cover ring-4 ring-white/25 " +
              (style.photoShape === "circle" ? "rounded-full" : "rounded-md")
            }
          />
        ) : (
          <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-white/15 text-[1.4em] font-bold">
            {initials(data.personal.fullName) || "YN"}
          </div>
        )}

        {contactItems.length > 0 ? (
          <div className="mb-6 space-y-1.5 text-[0.78em]">
            {contactItems.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 break-all">
                <item.icon className="size-[1em] shrink-0 opacity-80" />
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

      <main className="flex-1 px-7 py-9">
        <h1 className="text-[1.9em] font-bold leading-tight">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="mt-0.5 mb-5 text-[1em] font-medium text-[color:var(--resume-accent)]">
            {data.personal.title}
          </p>
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
