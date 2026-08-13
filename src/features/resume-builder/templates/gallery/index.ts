import type { ComponentType } from "react";
import type { TemplateMeta } from "../../types";
import type { TemplateProps } from "../template-props";

import { BlushPortraitTemplate } from "./blush-portrait/BlushPortrait";
import { meta as blushPortraitMeta } from "./blush-portrait/metadata";
import { ArtisticScholarTemplate } from "./artistic-scholar/ArtisticScholar";
import { meta as artisticScholarMeta } from "./artistic-scholar/metadata";
import { HighlightNoteTemplate } from "./highlight-note/HighlightNote";
import { meta as highlightNoteMeta } from "./highlight-note/metadata";
import { SlateColumnTemplate } from "./slate-column/SlateColumn";
import { meta as slateColumnMeta } from "./slate-column/metadata";
import { CrimsonBannerTemplate } from "./crimson-banner/CrimsonBanner";
import { meta as crimsonBannerMeta } from "./crimson-banner/metadata";
import { CharcoalProfileTemplate } from "./charcoal-profile/CharcoalProfile";
import { meta as charcoalProfileMeta } from "./charcoal-profile/metadata";
import { BronzeLicenseTemplate } from "./bronze-license/BronzeLicense";
import { meta as bronzeLicenseMeta } from "./bronze-license/metadata";
import { AmberSplitTemplate } from "./amber-split/AmberSplit";
import { meta as amberSplitMeta } from "./amber-split/metadata";
import { PaperClassicTemplate } from "./paper-classic/PaperClassic";
import { meta as paperClassicMeta } from "./paper-classic/metadata";
import { OliveWaveTemplate } from "./olive-wave/OliveWave";
import { meta as oliveWaveMeta } from "./olive-wave/metadata";
import { EmeraldPanelTemplate } from "./emerald-panel/EmeraldPanel";
import { meta as emeraldPanelMeta } from "./emerald-panel/metadata";
import { SageChevronTemplate } from "./sage-chevron/SageChevron";
import { meta as sageChevronMeta } from "./sage-chevron/metadata";
import { SteelArcTemplate } from "./steel-arc/SteelArc";
import { meta as steelArcMeta } from "./steel-arc/metadata";
import { GoldenColumnTemplate } from "./golden-column/GoldenColumn";
import { meta as goldenColumnMeta } from "./golden-column/metadata";
import { PeachHeroTemplate } from "./peach-hero/PeachHero";
import { meta as peachHeroMeta } from "./peach-hero/metadata";
import { BronzeBarsTemplate } from "./bronze-bars/BronzeBars";
import { meta as bronzeBarsMeta } from "./bronze-bars/metadata";
import { MustardManifestTemplate } from "./mustard-manifest/MustardManifest";
import { meta as mustardManifestMeta } from "./mustard-manifest/metadata";
import { RosewoodPillTemplate } from "./rosewood-pill/RosewoodPill";
import { meta as rosewoodPillMeta } from "./rosewood-pill/metadata";
import { SkyWaveTemplate } from "./sky-wave/SkyWave";
import { meta as skyWaveMeta } from "./sky-wave/metadata";

/**
 * Templates recreated from the design gallery. Each entry pairs the metadata
 * declared next to its component with the component itself, so the main
 * registry only has to spread this array.
 */
export const GALLERY_TEMPLATES: (TemplateMeta & {
  Component: ComponentType<TemplateProps>;
})[] = [
  { ...blushPortraitMeta, Component: BlushPortraitTemplate },
  { ...artisticScholarMeta, Component: ArtisticScholarTemplate },
  { ...highlightNoteMeta, Component: HighlightNoteTemplate },
  { ...slateColumnMeta, Component: SlateColumnTemplate },
  { ...crimsonBannerMeta, Component: CrimsonBannerTemplate },
  { ...charcoalProfileMeta, Component: CharcoalProfileTemplate },
  { ...bronzeLicenseMeta, Component: BronzeLicenseTemplate },
  { ...amberSplitMeta, Component: AmberSplitTemplate },
  { ...paperClassicMeta, Component: PaperClassicTemplate },
  { ...oliveWaveMeta, Component: OliveWaveTemplate },
  { ...emeraldPanelMeta, Component: EmeraldPanelTemplate },
  { ...sageChevronMeta, Component: SageChevronTemplate },
  { ...steelArcMeta, Component: SteelArcTemplate },
  { ...goldenColumnMeta, Component: GoldenColumnTemplate },
  { ...peachHeroMeta, Component: PeachHeroTemplate },
  { ...bronzeBarsMeta, Component: BronzeBarsTemplate },
  { ...mustardManifestMeta, Component: MustardManifestTemplate },
  { ...rosewoodPillMeta, Component: RosewoodPillTemplate },
  { ...skyWaveMeta, Component: SkyWaveTemplate },
];
