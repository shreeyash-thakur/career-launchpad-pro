import type { ResumeData, ResumeStyle } from "../types";
import { getTemplate } from "../templates";
import { PAGE_DIMENSIONS } from "../templates/resume-page";
import { useContainerWidth } from "../hooks/use-container-width";

interface Props {
  data: ResumeData;
  style: ResumeStyle;
}

export function ResumePreview({ data, style }: Props) {
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const dims = PAGE_DIMENSIONS[style.pageSize];
  const padding = 32;
  const scale = width > 0 ? Math.min((width - padding) / dims.width, 1) : 1;
  const template = getTemplate(style.templateId);

  return (
    <div ref={ref} className="flex justify-center py-6">
      <div
        className="preview-scale-wrapper origin-top transition-transform duration-150"
        style={{ transform: `scale(${scale})`, width: dims.width }}
      >
        <template.Component data={data} style={style} />
      </div>
    </div>
  );
}
