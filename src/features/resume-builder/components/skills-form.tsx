import type { ResumeData, SkillGroup } from "../types";
import { makeId } from "../sample-data";
import { moveItem, removeAt, updateAt } from "../utils/array";
import { Field } from "./field";
import { ListItemShell } from "./list-item-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AiButton } from "@/components/ui/ai-button";
import { Plus } from "lucide-react";
import { suggestSkills } from "@/lib/ai-service";

interface Props {
  data: ResumeData;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
}

function emptyGroup(): SkillGroup {
  return { id: makeId("skl"), category: "", items: [] };
}

export function SkillsForm({ data, onChange }: Props) {
  const items = data.skills;

  function update(index: number, patch: Partial<SkillGroup>) {
    onChange((prev) => ({ ...prev, skills: updateAt(prev.skills, index, patch) }));
  }

  return (
    <div className="space-y-3">
      {items.map((group, index) => (
        <ListItemShell
          key={group.id}
          title={group.category || "New skill group"}
          onRemove={() => onChange((prev) => ({ ...prev, skills: removeAt(prev.skills, index) }))}
          onMoveUp={() =>
            onChange((prev) => ({ ...prev, skills: moveItem(prev.skills, index, -1) }))
          }
          onMoveDown={() =>
            onChange((prev) => ({ ...prev, skills: moveItem(prev.skills, index, 1) }))
          }
          canMoveUp={index > 0}
          canMoveDown={index < items.length - 1}
        >
          <Field label="Category name" hint="Leave blank for a single flat skills list.">
            <Input
              value={group.category}
              onChange={(e) => update(index, { category: e.target.value })}
              placeholder="Languages, Tools, Frameworks..."
            />
          </Field>
          <Field label="Skills" hint="Comma separated">
            <Input
              value={group.items.join(", ")}
              onChange={(e) =>
                update(index, {
                  items: e.target.value.split(",").map((s) => s.trimStart()),
                })
              }
              onBlur={(e) =>
                update(index, {
                  items: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="React, TypeScript, Node.js"
            />
          </Field>
        </ListItemShell>
      ))}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => onChange((prev) => ({ ...prev, skills: [...prev.skills, emptyGroup()] }))}
        >
          <Plus className="size-4" /> Add skill group
        </Button>
        <AiButton
          variant="outline"
          onClick={async () => {
            const existingSkills = data.skills.flatMap((g) => g.items);
            const suggestions = await suggestSkills({
              title: data.personal.title,
              existingSkills,
            });
            if (!suggestions.length) return;
            // If there's already a group, append to the first one; otherwise create one
            onChange((prev) => {
              const skills = [...prev.skills];
              if (skills.length === 0) {
                skills.push({ id: makeId("skl"), category: "Skills", items: suggestions });
              } else {
                const first = skills[0]!;
                const merged = [...new Set([...first.items, ...suggestions])];
                skills[0] = { ...first, items: merged };
              }
              return { ...prev, skills };
            });
          }}
        >
          Suggest skills
        </AiButton>
      </div>
    </div>
  );
}