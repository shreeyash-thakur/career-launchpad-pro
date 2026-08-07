import type { ExperienceItem, ResumeData } from "../types";
import { makeId } from "../sample-data";
import { moveItem, removeAt, updateAt } from "../utils/array";
import { Field } from "./field";
import { ListItemShell } from "./list-item-shell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";

interface Props {
  data: ResumeData;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
}

function emptyExperience(): ExperienceItem {
  return {
    id: makeId("exp"),
    role: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    bullets: [""],
  };
}

export function ExperienceForm({ data, onChange }: Props) {
  const items = data.experience;

  function update(index: number, patch: Partial<ExperienceItem>) {
    onChange((prev) => ({ ...prev, experience: updateAt(prev.experience, index, patch) }));
  }

  function updateBullet(index: number, bulletIndex: number, value: string) {
    const item = items[index];
    if (!item) return;
    const bullets = item.bullets.map((b, i) => (i === bulletIndex ? value : b));
    update(index, { bullets });
  }

  function addBullet(index: number) {
    const item = items[index];
    if (!item) return;
    update(index, { bullets: [...item.bullets, ""] });
  }

  function removeBullet(index: number, bulletIndex: number) {
    const item = items[index];
    if (!item) return;
    update(index, { bullets: item.bullets.filter((_, i) => i !== bulletIndex) });
  }

  return (
    <div className="space-y-3">
      {items.map((exp, index) => (
        <ListItemShell
          key={exp.id}
          title={exp.role || exp.company || "New role"}
          onRemove={() =>
            onChange((prev) => ({ ...prev, experience: removeAt(prev.experience, index) }))
          }
          onMoveUp={() =>
            onChange((prev) => ({ ...prev, experience: moveItem(prev.experience, index, -1) }))
          }
          onMoveDown={() =>
            onChange((prev) => ({ ...prev, experience: moveItem(prev.experience, index, 1) }))
          }
          canMoveUp={index > 0}
          canMoveDown={index < items.length - 1}
        >
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Role">
              <Input
                value={exp.role}
                onChange={(e) => update(index, { role: e.target.value })}
                placeholder="Software Engineer"
              />
            </Field>
            <Field label="Company">
              <Input
                value={exp.company}
                onChange={(e) => update(index, { company: e.target.value })}
                placeholder="Acme Inc."
              />
            </Field>
            <Field label="Location">
              <Input
                value={exp.location}
                onChange={(e) => update(index, { location: e.target.value })}
                placeholder="Remote"
              />
            </Field>
            <div className="flex items-end gap-2">
              <Field label="Start" className="flex-1">
                <Input
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => update(index, { startDate: e.target.value })}
                />
              </Field>
              <Field label="End" className="flex-1">
                <Input
                  type="month"
                  value={exp.endDate}
                  disabled={exp.current}
                  onChange={(e) => update(index, { endDate: e.target.value })}
                />
              </Field>
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={exp.current}
              onCheckedChange={(v) => update(index, { current: Boolean(v) })}
            />
            I currently work here
          </label>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Highlights</span>
            {exp.bullets.map((bullet, bulletIndex) => (
              <div key={bulletIndex} className="flex gap-1.5">
                <Textarea
                  value={bullet}
                  onChange={(e) => updateBullet(index, bulletIndex, e.target.value)}
                  placeholder="Led a project that increased X by Y%..."
                  className="min-h-9 flex-1 py-1.5 text-sm"
                  rows={1}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 text-muted-foreground"
                  onClick={() => removeBullet(index, bulletIndex)}
                >
                  ×
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => addBullet(index)}
            >
              <Plus className="size-3.5" /> Add highlight
            </Button>
          </div>
        </ListItemShell>
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-full gap-1.5"
        onClick={() =>
          onChange((prev) => ({ ...prev, experience: [...prev.experience, emptyExperience()] }))
        }
      >
        <Plus className="size-4" /> Add experience
      </Button>
    </div>
  );
}
