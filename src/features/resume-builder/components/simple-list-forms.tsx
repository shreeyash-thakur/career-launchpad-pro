import type { CertificationItem, LanguageItem, ResumeData } from "../types";
import { makeId } from "../sample-data";
import { removeAt, updateAt } from "../utils/array";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  data: ResumeData;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
}

function emptyCert(): CertificationItem {
  return { id: makeId("cert"), name: "", issuer: "", date: "" };
}

export function CertificationsForm({ data, onChange }: Props) {
  const items = data.certifications;
  function update(index: number, patch: Partial<CertificationItem>) {
    onChange((prev) => ({ ...prev, certifications: updateAt(prev.certifications, index, patch) }));
  }
  return (
    <div className="space-y-2">
      {items.map((cert, index) => (
        <div
          key={cert.id}
          className="flex items-end gap-1.5 rounded-lg border border-border bg-card/60 p-2.5"
        >
          <div className="grid flex-1 grid-cols-2 gap-1.5 sm:grid-cols-3">
            <Input
              value={cert.name}
              onChange={(e) => update(index, { name: e.target.value })}
              placeholder="Certification name"
              className="col-span-2 sm:col-span-1"
            />
            <Input
              value={cert.issuer}
              onChange={(e) => update(index, { issuer: e.target.value })}
              placeholder="Issuer"
            />
            <Input
              value={cert.date}
              onChange={(e) => update(index, { date: e.target.value })}
              placeholder="Year"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 text-destructive hover:text-destructive"
            onClick={() =>
              onChange((prev) => ({
                ...prev,
                certifications: removeAt(prev.certifications, index),
              }))
            }
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-full gap-1.5"
        onClick={() =>
          onChange((prev) => ({ ...prev, certifications: [...prev.certifications, emptyCert()] }))
        }
      >
        <Plus className="size-4" /> Add certification
      </Button>
    </div>
  );
}

function emptyLanguage(): LanguageItem {
  return { id: makeId("lang"), name: "", level: "" };
}

export function LanguagesForm({ data, onChange }: Props) {
  const items = data.languages;
  function update(index: number, patch: Partial<LanguageItem>) {
    onChange((prev) => ({ ...prev, languages: updateAt(prev.languages, index, patch) }));
  }
  return (
    <div className="space-y-2">
      {items.map((lang, index) => (
        <div
          key={lang.id}
          className="flex items-end gap-1.5 rounded-lg border border-border bg-card/60 p-2.5"
        >
          <div className="grid flex-1 grid-cols-2 gap-1.5">
            <Input
              value={lang.name}
              onChange={(e) => update(index, { name: e.target.value })}
              placeholder="Language"
            />
            <Input
              value={lang.level}
              onChange={(e) => update(index, { level: e.target.value })}
              placeholder="Fluent, Native, B2..."
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 text-destructive hover:text-destructive"
            onClick={() =>
              onChange((prev) => ({ ...prev, languages: removeAt(prev.languages, index) }))
            }
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-full gap-1.5"
        onClick={() =>
          onChange((prev) => ({ ...prev, languages: [...prev.languages, emptyLanguage()] }))
        }
      >
        <Plus className="size-4" /> Add language
      </Button>
    </div>
  );
}
