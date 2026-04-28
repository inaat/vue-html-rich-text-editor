export type PagePreset = 'letter' | 'a4' | 'legal' | 'custom'

export interface PageSettings {
  preset: PagePreset
  w: number
  h: number
  pT: number
  pR: number
  pB: number
  pL: number
}

export const PAGE_PRESETS: Record<Exclude<PagePreset, 'custom'>, Omit<PageSettings, 'preset'>> = {
  letter: { w: 816, h: 1056, pT: 96, pR: 96, pB: 96, pL: 96 },
  a4:     { w: 794, h: 1123, pT: 96, pR: 96, pB: 96, pL: 96 },
  legal:  { w: 816, h: 1344, pT: 96, pR: 96, pB: 96, pL: 96 }
}
