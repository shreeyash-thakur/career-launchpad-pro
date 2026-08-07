import type { CustomEntry, CustomSection, ResumeData } from "../types";
import { makeId } from "../sample-data";
import { removeAt, updateAt } from "../utils/array";
import { Field } from "./field";
import { ListItemShell } from "./list-item-shell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  data: ResumeData;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
}

function emptyEntry(): CustomEntry {
  return { id: makeId("entry"), heading: "", subheading: "", date: "", description: "" };
}

function emptySection(): CustomSection {
  return { id: makeId("section"), title: "New section", entries: [emptyEntry()] };
}

export function CustomSectionsForm({ data, onChange }: Props) {
  const sections = data.customSections;

  function updateSection(index: number, patch: Partial<CustomSection>) {
    onChange((prev) => ({ ...prev, customSections: updateAt(prev.customSections, index, patch) }));
  }

  function updateEntry(sectionIndex: number, entryIndex: number, patch: Partial<CustomEntry>) {
    const section = sections[sectionIndex];
    if (!section) return;
    updateSection(sectionIndex, { entries: updateAt(section.entries, entryIndex, patch) });
  }

  function addSection() {
    onChange((prev) => {
      const section = emptySection();
      return {
        ...prev,
        customSections: [...prev.customSections, section],
        sectionOrder: [...prev.sectionOrder, `custom:${section.id}`],
      };
    });
  }

  function removeSection(index: number) {
    onChange((prev) => {
      const section = prev.customSections[index];
      return {
        ...prev,
        customSections: removeAt(prev.customSections, index),
        sectionOrder: section
          ? prev.sectionOrder.filter((k) => k !== `custom:${section.id}`)
          : prev.sectionOrder,
      };
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Add sections like Publications, Awards, Volunteering, or Interests. Each one shows up in the
        section order list so you can position it anywhere in the résumé.
      </p>
      {sections.map((section, sectionIndex) => (
        <ListItemShell
          key={section.id}
          title={section.title || "Custom section"}
          onRemove={() => removeSection(sectionIndex)}
        >
          <Field label="Section title">
            <Input
              value={section.title}
              onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
              placeholder="Awards"
            />
          </Field>

          <div className="space-y-2">
            {section.entries.map((entry, entryIndex) => (
              <div key={entry.id} className="space-y-2 rounded-lg border border-border/70 p-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={entry.heading}
                    onChange={(e) =>
                      updateEntry(sectionIndex, entryIndex, { heading: e.target.value })
                    }
                    placeholder="Title"
                  />
                  <Input
                    value={entry.subheading}
                    onChange={(e) =>
                      updateEntry(sectionIndex, entryIndex, { subheading: e.target.value })
                    }
                    placeholder="Organization (optional)"
                  />
                </div>
                <Input
                  value={entry.date}
                  onChange={(e) => updateEntry(sectionIndex, entryIndex, { date: e.target.value })}
                  placeholder="Date (optional)"
                />
                <Textarea
                  value={entry.description}
                  onChange={(e) =>
                    updateEntry(sectionIndex, entryIndex, { description: e.target.value })
                  }
                  placeholder="Description (optional)"
                  className="min-h-14"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs text-destructive hover:text-destructive"
                  onClick={() =>
                    updateSection(sectionIndex, { entries: removeAt(section.entries, entryIndex) })
                  }
                >
                  <Trash2 className="size-3.5" /> Remove entry
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-xs"
              onClick={() =>
                updateSection(sectionIndex, { entries: [...section.entries, emptyEntry()] })
              }
            >
              <Plus className="size-3.5" /> Add entry
            </Button>
          </div>
        </ListItemShell>
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-full gap-1.5"
        onClick={addSection}
      >
        <Plus className="size-4" /> Add custom section
      </Button>
    </div>
  );
}
