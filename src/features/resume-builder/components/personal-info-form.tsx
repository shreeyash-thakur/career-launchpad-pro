import { useRef } from "react";
import type { ResumeData } from "../types";
import { Field } from "./field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AiButton } from "@/components/ui/ai-button";
import { ImagePlus, X } from "lucide-react";
import { generateSummary } from "@/lib/ai-service";

interface Props {
  data: ResumeData;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
  showPhoto: boolean;
}

export function PersonalInfoForm({ data, onChange, showPhoto }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function setPersonal<K extends keyof ResumeData["personal"]>(
    key: K,
    value: ResumeData["personal"][K],
  ) {
    onChange((prev) => ({ ...prev, personal: { ...prev.personal, [key]: value } }));
  }

  function onPhotoPick(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPersonal("photo", String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-4">
      {showPhoto ? (
        <div className="flex items-center gap-3">
          {data.personal.photo ? (
            <div className="relative">
              <img src={data.personal.photo} alt="" className="size-16 rounded-full object-cover" />
              <button
                type="button"
                onClick={() => setPersonal("photo", "")}
                className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                aria-label="Remove photo"
              >
                <X className="size-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex size-16 items-center justify-center rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground hover:border-primary hover:text-primary"
            >
              <ImagePlus className="size-5" />
            </button>
          )}
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Profile photo</p>
            <p>Optional. Used by templates with a photo slot.</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPhotoPick(e.target.files?.[0])}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Full name" className="col-span-2">
          <Input
            value={data.personal.fullName}
            onChange={(e) => setPersonal("fullName", e.target.value)}
            placeholder="Jordan Lee"
          />
        </Field>
        <Field label="Job title" className="col-span-2">
          <Input
            value={data.personal.title}
            onChange={(e) => setPersonal("title", e.target.value)}
            placeholder="Senior Software Engineer"
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={data.personal.email}
            onChange={(e) => setPersonal("email", e.target.value)}
            placeholder="you@email.com"
          />
        </Field>
        <Field label="Phone">
          <Input
            value={data.personal.phone}
            onChange={(e) => setPersonal("phone", e.target.value)}
            placeholder="+1 555 123 4567"
          />
        </Field>
        <Field label="Location">
          <Input
            value={data.personal.location}
            onChange={(e) => setPersonal("location", e.target.value)}
            placeholder="San Francisco, CA"
          />
        </Field>
        <Field label="Website">
          <Input
            value={data.personal.website}
            onChange={(e) => setPersonal("website", e.target.value)}
            placeholder="yoursite.com"
          />
        </Field>
        <Field label="LinkedIn">
          <Input
            value={data.personal.linkedin}
            onChange={(e) => setPersonal("linkedin", e.target.value)}
            placeholder="linkedin.com/in/you"
          />
        </Field>
        <Field label="GitHub">
          <Input
            value={data.personal.github}
            onChange={(e) => setPersonal("github", e.target.value)}
            placeholder="github.com/you"
          />
        </Field>
      </div>

      <Field
        label="Professional summary"
        hint="2–4 sentences. Lead with your role and your strongest, most relevant result."
      >
        <Textarea
          value={data.summary}
          onChange={(e) => onChange((prev) => ({ ...prev, summary: e.target.value }))}
          placeholder="Product-minded engineer with 5 years building consumer-facing web apps..."
          className="min-h-24"
        />
      </Field>
      <AiButton
        onClick={async () => {
          const topSkills = data.skills.flatMap((g) => g.items).slice(0, 6);
          const recentExp = data.experience[0];
          const summary = await generateSummary({
            fullName: data.personal.fullName,
            title: data.personal.title,
            topSkills,
            recentRole: recentExp?.role ?? "",
            recentCompany: recentExp?.company ?? "",
          });
          onChange((prev) => ({ ...prev, summary }));
        }}
      >
        Write summary with AI
      </AiButton>
    </div>
  );
}