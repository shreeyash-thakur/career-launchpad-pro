import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ResumeData, SectionKind } from "../types";
import { moveItem } from "../utils/array";
import { isSectionHidden, sectionHasContent, sectionLabel } from "../templates/shared";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Eye, EyeOff, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  data: ResumeData;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
}

export function SectionOrderForm({ data, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function toggleHidden(kind: SectionKind) {
    onChange((prev) => {
      const hidden = prev.hiddenSections ?? [];
      const nextHidden = hidden.includes(kind)
        ? hidden.filter((k) => k !== kind)
        : [...hidden, kind];
      return { ...prev, hiddenSections: nextHidden };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onChange((prev) => {
      const fromIndex = prev.sectionOrder.indexOf(active.id as SectionKind);
      const toIndex = prev.sectionOrder.indexOf(over.id as SectionKind);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const next = [...prev.sectionOrder];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved as SectionKind);
      return { ...prev, sectionOrder: next };
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Drag to reorder, or use the arrows. The header and contact info always stay on top. Hide a
        section to remove it from the résumé without losing its content — unhide any time.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={data.sectionOrder} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {data.sectionOrder.map((kind, index) => (
              <SortableRow
                key={kind}
                kind={kind}
                label={sectionLabel(data, kind)}
                hasContent={sectionHasContent(data, kind)}
                hidden={isSectionHidden(data, kind)}
                onToggleHidden={() => toggleHidden(kind)}
                onMoveUp={() =>
                  onChange((prev) => ({
                    ...prev,
                    sectionOrder: moveItem(prev.sectionOrder, index, -1),
                  }))
                }
                onMoveDown={() =>
                  onChange((prev) => ({
                    ...prev,
                    sectionOrder: moveItem(prev.sectionOrder, index, 1),
                  }))
                }
                canMoveUp={index > 0}
                canMoveDown={index < data.sectionOrder.length - 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableRow({
  kind,
  label,
  hasContent,
  hidden,
  onToggleHidden,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  kind: SectionKind;
  label: string;
  hasContent: boolean;
  hidden: boolean;
  onToggleHidden: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: kind,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg border border-border bg-card/60 px-3 py-2",
        !hasContent && "opacity-50",
        hidden && "opacity-60",
        isDragging && "z-10 shadow-md",
      )}
    >
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
          aria-label={`Drag to reorder ${label}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" />
        </button>
        <span className={cn("truncate font-medium", hidden && "line-through")}>{label}</span>
        {!hasContent ? (
          <span className="shrink-0 text-[0.7rem] text-muted-foreground">empty</span>
        ) : null}
        {hidden ? (
          <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
            Hidden
          </span>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onToggleHidden}
          aria-label={hidden ? `Show ${label}` : `Hide ${label}`}
          aria-pressed={hidden}
        >
          {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={!canMoveUp}
          onClick={onMoveUp}
          aria-label="Move up"
        >
          <ChevronUp className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={!canMoveDown}
          onClick={onMoveDown}
          aria-label="Move down"
        >
          <ChevronDown className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}