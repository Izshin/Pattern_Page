export interface TensionRange {
  min: number;
  max: number;
  x: number;
  y: number;
}

export interface SizeRange {
  min: number;
  max: number;
}

export interface PatternDefaults {
  "slider-tension": TensionRange;
  "slider-size": SizeRange;
  "width-cm": number;
  "height-cm": number;
  "motif-width-stitches": number;
  "motif-height-rows": number;
  "cast-on": number;
  "ribbing-height-cm": number;
  "ribbing-width-stitches": number;
  "before-motif-stitches": number;
}

export interface Pattern {
  filename?: string;
  defaults: PatternDefaults;
  content: string;
}
