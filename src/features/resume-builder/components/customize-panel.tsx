import type { ResumeStyle } from "../types";
import { ACCENT_PRESETS } from "../sample-data";
import { Field } from "./field";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

interface Props {
  style: ResumeStyle;
  onChange: (updater: (prev: ResumeStyle) => ResumeStyle) => void;
}

export function CustomizePanel({ style, onChange }: Props) {
  function set<K extends keyof ResumeStyle>(key: K, value: ResumeStyle[K]) {
    onChange((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-5">
      <Field label="Accent color">
        <div className="flex flex-wrap items-center gap-2">
          {ACCENT_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => set("accentColor", color)}
              className={cn(
                "size-7 rounded-full border-2 transition-transform hover:scale-110",
                style.accentColor.toLowerCase() === color.toLowerCase()
                  ? "border-foreground"
                  : "border-transparent",
              )}
              style={{ backgroundColor: color }}
              aria-label={color}
            />
          ))}
          <label className="relative size-7 shrink-0 cursor-pointer overflow-hidden rounded-full border border-dashed border-muted-foreground/40">
            <input
              type="color"
              value={style.accentColor}
              onChange={(e) => set("accentColor", e.target.value)}
              className="absolute -left-1 -top-1 size-9 cursor-pointer"
            />
          </label>
        </div>
      </Field>

      <Field label="Font family">
        <Select
          value={style.fontFamily}
          onValueChange={(v) => set("fontFamily", v as ResumeStyle["fontFamily"])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sans">Sans (DM Sans)</SelectItem>
            <SelectItem value="serif">Serif (Lora)</SelectItem>
            <SelectItem value="mono">Monospace (JetBrains Mono)</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label={`Text size — ${Math.round(style.fontScale * 100)}%`}>
        <Slider
          min={0.85}
          max={1.15}
          step={0.01}
          value={[style.fontScale]}
          onValueChange={([v]) => v !== undefined && set("fontScale", v)}
        />
      </Field>

      <Field label={`Line spacing — ${style.lineHeight.toFixed(2)}`}>
        <Slider
          min={1.15}
          max={1.6}
          step={0.01}
          value={[style.lineHeight]}
          onValueChange={([v]) => v !== undefined && set("lineHeight", v)}
        />
      </Field>

      <Field label="Page size">
        <ToggleGroup
          type="single"
          value={style.pageSize}
          onValueChange={(v) => v && set("pageSize", v as ResumeStyle["pageSize"])}
          className="justify-start"
        >
          <ToggleGroupItem value="letter" className="px-3 text-xs">
            US Letter
          </ToggleGroupItem>
          <ToggleGroupItem value="a4" className="px-3 text-xs">
            A4
          </ToggleGroupItem>
        </ToggleGroup>
      </Field>

      <Field label="Header alignment" hint="Applies to templates that support it (Minimal).">
        <ToggleGroup
          type="single"
          value={style.headerLayout}
          onValueChange={(v) => v && set("headerLayout", v as ResumeStyle["headerLayout"])}
          className="justify-start"
        >
          <ToggleGroupItem value="left" className="px-3 text-xs">
            Left
          </ToggleGroupItem>
          <ToggleGroupItem value="center" className="px-3 text-xs">
            Center
          </ToggleGroupItem>
        </ToggleGroup>
      </Field>

      <div className="flex items-center justify-between rounded-lg border border-border bg-card/60 px-3 py-2.5">
        <div>
          <p className="text-sm font-medium">Show profile photo</p>
          <p className="text-xs text-muted-foreground">
            Supported by Modern and Creative templates.
          </p>
        </div>
        <Switch checked={style.showPhoto} onCheckedChange={(v) => set("showPhoto", v)} />
      </div>

      {style.showPhoto ? (
        <Field label="Photo shape">
          <ToggleGroup
            type="single"
            value={style.photoShape}
            onValueChange={(v) => v && set("photoShape", v as ResumeStyle["photoShape"])}
            className="justify-start"
          >
            <ToggleGroupItem value="circle" className="px-3 text-xs">
              Circle
            </ToggleGroupItem>
            <ToggleGroupItem value="square" className="px-3 text-xs">
              Square
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>
      ) : null}
    </div>
  );
}
