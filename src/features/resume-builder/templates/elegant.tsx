import type { SectionKind } from "../types";
import type { TemplateProps } from "./template-props";
import { ResumePage } from "./resume-page";
import { SectionBody, type Look } from "./blocks";
import { orderedSections, initials } from "./shared";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

const SIDEBAR_KINDS = new Set<SectionKind>(["skills", "languages", "certifications", "education"]);

const sidebarLook: Look = {
  headingClass: "mb-1.5 text-[0.75em] font-semibold uppercase tracking-[0.14em]",
  sectionClass: "mb-4 last:mb-0",
  bullet: "none",
};

const mainLook: Look = {
  headingClass:
    "mb-2 text-[0.82em] font-semibold uppercase tracking-[0.12em] text-[color:var(--resume-accent)]",
  sectionClass: "mb-4 last:mb-0",
  bullet: "dot",
};

export function ElegantTemplate({ data, style, pageRef }: TemplateProps) {
  const forcedStyle = { ...style, fontFamily: "serif" as const };
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
    <ResumePage ref={pageRef} style={forcedStyle} className="flex p-0">
      <aside className="w-[32%] shrink-0 bg-[#f4f1ec] px-6 py-9 text-neutral-800">
        {style.showPhoto && data.personal.photo ? (
          <img
            src={data.personal.photo}
            alt=""
            className={
              "mb-5 size-24 object-cover " +
              (style.photoShape === "circle" ? "rounded-full" : "rounded-md")
            }
          />
        ) : (
          <div
            className="mb-5 flex size-24 items-center justify-center rounded-full text-[1.5em] font-semibold"
            style={{
              backgroundColor: "color-mix(in srgb, var(--resume-accent) 18%, white)",
              color: "var(--resume-accent)",
            }}
          >
            {initials(data.personal.fullName) || "YN"}
          </div>
        )}

        {contactItems.length > 0 ? (
          <div className="mb-6 space-y-1.5 text-[0.76em]">
            {contactItems.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 break-all text-neutral-600">
                <item.icon
                  className="size-[1em] shrink-0"
                  style={{ color: "var(--resume-accent)" }}
                />
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
        <h1 className="text-[2em] font-semibold leading-tight">
          {data.personal.fullName || "Your Name"}
        </h1>
        {data.personal.title ? (
          <p className="mt-1 mb-6 text-[1em] italic text-neutral-500">{data.personal.title}</p>
        ) : (
          <div className="mb-6" />
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
