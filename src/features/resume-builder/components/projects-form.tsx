import type { ProjectItem, ResumeData } from "../types";
import { makeId } from "../sample-data";
import { moveItem, removeAt, updateAt } from "../utils/array";
import { Field } from "./field";
import { ListItemShell } from "./list-item-shell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AiButton } from "@/components/ui/ai-button";
import { Plus } from "lucide-react";
import { generateProjectDescription } from "@/lib/ai-service";

interface Props {
  data: ResumeData;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
}

function emptyProject(): ProjectItem {
  return { id: makeId("prj"), name: "", description: "", tech: [], link: "" };
}

export function ProjectsForm({ data, onChange }: Props) {
  const items = data.projects;

  function update(index: number, patch: Partial<ProjectItem>) {
    onChange((prev) => ({ ...prev, projects: updateAt(prev.projects, index, patch) }));
  }

  return (
    <div className="space-y-3">
      {items.map((proj, index) => (
        <ListItemShell
          key={proj.id}
          title={proj.name || "New project"}
          onRemove={() =>
            onChange((prev) => ({ ...prev, projects: removeAt(prev.projects, index) }))
          }
          onMoveUp={() =>
            onChange((prev) => ({ ...prev, projects: moveItem(prev.projects, index, -1) }))
          }
          onMoveDown={() =>
            onChange((prev) => ({ ...prev, projects: moveItem(prev.projects, index, 1) }))
          }
          canMoveUp={index > 0}
          canMoveDown={index < items.length - 1}
        >
          <Field label="Project name">
            <Input
              value={proj.name}
              onChange={(e) => update(index, { name: e.target.value })}
              placeholder="Internal analytics dashboard"
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={proj.description}
              onChange={(e) => update(index, { description: e.target.value })}
              placeholder="What it does and the impact it had"
              className="min-h-16"
            />
            <AiButton
              size="xs"
              className="mt-1"
              onClick={async () => {
                const description = await generateProjectDescription({
                  name: proj.name,
                  tech: proj.tech.filter(Boolean),
                  existingDescription: proj.description,
                });
                update(index, { description });
              }}
            >
              Write description with AI
            </AiButton>
          </Field>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Tech (comma separated)">
              <Input
                value={proj.tech.join(", ")}
                onChange={(e) =>
                  update(index, { tech: e.target.value.split(",").map((s) => s.trimStart()) })
                }
                onBlur={(e) =>
                  update(index, {
                    tech: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="React, Postgres"
              />
            </Field>
            <Field label="Link (optional)">
              <Input
                value={proj.link}
                onChange={(e) => update(index, { link: e.target.value })}
                placeholder="github.com/you/project"
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
          onChange((prev) => ({ ...prev, projects: [...prev.projects, emptyProject()] }))
        }
      >
        <Plus className="size-4" /> Add project
      </Button>
    </div>
  );
}