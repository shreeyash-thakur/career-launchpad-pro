import type { Ref } from "react";
import type { ResumeData, ResumeStyle } from "../types";

export interface TemplateProps {
  data: ResumeData;
  style: ResumeStyle;
  pageRef?: Ref<HTMLDivElement>;
}
