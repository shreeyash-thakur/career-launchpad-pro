import type { EducationItem, ResumeData } from "../types";
import { makeId } from "../sample-data";
import { moveItem, removeAt, updateAt } from "../utils/array";
import { Field } from "./field";
import { ListItemShell } from "./list-item-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  data: ResumeData;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
}

function emptyEducation(): EducationItem {
  return {
    id: makeId("edu"),
    school: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    gpa: "",
    details: "",
  };
}

export function EducationForm({ data, onChange }: Props) {
  const items = data.education;

  function update(index: number, patch: Partial<EducationItem>) {
    onChange((prev) => ({ ...prev, education: updateAt(prev.education, index, patch) }));
  }

  return (
    <div className="space-y-3">
      {items.map((edu, index) => (
        <ListItemShell
          key={edu.id}
          title={edu.school || edu.degree || "New school"}
          onRemove={() =>
            onChange((prev) => ({ ...prev, education: removeAt(prev.education, index) }))
          }
          onMoveUp={() =>
            onChange((prev) => ({ ...prev, education: moveItem(prev.education, index, -1) }))
          }
          onMoveDown={() =>
            onChange((prev) => ({ ...prev, education: moveItem(prev.education, index, 1) }))
          }
          canMoveUp={index > 0}
          canMoveDown={index < items.length - 1}
        >
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="School" className="col-span-2">
              <Input
                value={edu.school}
                onChange={(e) => update(index, { school: e.target.value })}
                placeholder="State University"
              />
            </Field>
            <Field label="Degree">
              <Input
                value={edu.degree}
                onChange={(e) => update(index, { degree: e.target.value })}
                placeholder="B.S."
              />
            </Field>
            <Field label="Field of study">
              <Input
                value={edu.field}
                onChange={(e) => update(index, { field: e.target.value })}
                placeholder="Computer Science"
              />
            </Field>
            <Field label="Start">
              <Input
                value={edu.startDate}
                onChange={(e) => update(index, { startDate: e.target.value })}
                placeholder="2016"
              />
            </Field>
            <Field label="End">
              <Input
                value={edu.endDate}
                onChange={(e) => update(index, { endDate: e.target.value })}
                placeholder="2020"
              />
            </Field>
            <Field label="GPA (optional)">
              <Input
                value={edu.gpa}
                onChange={(e) => update(index, { gpa: e.target.value })}
                placeholder="3.8"
              />
            </Field>
            <Field label="Details (optional)">
              <Input
                value={edu.details}
                onChange={(e) => update(index, { details: e.target.value })}
                placeholder="Dean's list, honors thesis..."
              />
            </Field>
          </div>
        </ListItemShell>
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-full gap-1.5"
        onClick={() =>
          onChange((prev) => ({ ...prev, education: [...prev.education, emptyEducation()] }))
        }
      >
        <Plus className="size-4" /> Add education
      </Button>
    </div>
  );
}
