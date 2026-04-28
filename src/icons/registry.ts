export interface IconDef {
  viewBox: string
  paths: Array<{ d: string; fill?: string; stroke?: string; transform?: string }>
}

const STROKE = 'currentColor'

const stroke = (d: string, transform?: string): IconDef['paths'][number] => ({
  d, fill: 'none', stroke: STROKE, ...(transform ? { transform } : {})
})
const fill = (d: string): IconDef['paths'][number] => ({ d, fill: 'currentColor' })

export const ICONS: Record<string, IconDef> = {
  source:        { viewBox: '0 0 24 24', paths: [fill('M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4Zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4Z')] },
  heading:       { viewBox: '0 0 24 24', paths: [fill('M5 4h2v7h6V4h2v16h-2v-7H7v7H5V4Zm12 4h3v12h-2v-9.5l-1 .6V8Z')] },
  'word-import': { viewBox: '0 0 24 24', paths: [stroke('M3 3h14v18H3z'), fill('M5 16 L7 6 L9 12 L11 6 L13 16 H5Z'), stroke('M14 12 L21 12 M18 9 L21 12 L18 15')] },
  'word-export': { viewBox: '0 0 24 24', paths: [stroke('M7 3h14v18H7z'), fill('M9 16 L11 6 L13 12 L15 6 L17 16 H9Z'), stroke('M10 12 L3 12 M6 9 L3 12 L6 15')] },
  pdf:           { viewBox: '0 0 24 24', paths: [stroke('M3 3h18v18H3z'), fill('M5.5 16 H7 V14 H8 a1.5 1.5 0 0 0 0 -3 H5.5 V16Zm.5-4h1.5a.5.5 0 0 1 0 1H6v-1Zm4 4 H12.5 a2 2 0 0 0 2 -2 V13.5 a2 2 0 0 0 -2 -2 H10 V16Zm1 -3.5H12.5 a1 1 0 0 1 1 1V14a1 1 0 0 1 -1 1H11v-2.5Zm5 3.5h1v-1.5h1.5v-1H17V12.5h2v-1H16V16Z')] },
  preview:       { viewBox: '0 0 24 24', paths: [stroke('M14 4 H20 V10 M20 4 L13 11 M18 14 V19 a1 1 0 0 1 -1 1 H5 a1 1 0 0 1 -1 -1 V7 a1 1 0 0 1 1 -1 H10')] },
  form:          { viewBox: '0 0 24 24', paths: [stroke('M4 3h16v18H4z M7 8 H17 M7 12 H17 M7 16 H13')] },
  highlight:     { viewBox: '0 0 24 24', paths: [fill('M5 19h14v2H5z'), stroke('M9 14 L13 10 L17 14 L13 18 Z M11 12 L18 5 L20 7 L13 14')] },
  link:          { viewBox: '0 0 24 24', paths: [stroke('M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1m-2 9a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1')] },
  image:         { viewBox: '0 0 24 24', paths: [stroke('M3 4h18v16H3z'), fill('M8.5 9.5a1.5 1.5 0 1 1 -3 0 1.5 1.5 0 0 1 3 0Z'), stroke('M21 17 L15 11 L5 20')] },
  file:          { viewBox: '0 0 24 24', paths: [stroke('M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z')] },
  table:         { viewBox: '0 0 24 24', paths: [stroke('M3 4h18v16H3z M3 10 H21 M3 16 H21 M9 4 V20 M15 4 V20')] },
  quote:         { viewBox: '0 0 24 24', paths: [fill('M7 7h4v6H7c0 2 1 3 3 3v2c-3 0-5-2-5-5V7Zm8 0h4v6h-4c0 2 1 3 3 3v2c-3 0-5-2-5-5V7Z')] },
  video:         { viewBox: '0 0 24 24', paths: [stroke('M2 5h20v14H2z'), fill('M10 9 L15 12 L10 15 Z')] },
  embed:         { viewBox: '0 0 24 24', paths: [stroke('M9 8 L4 12 L9 16 M15 8 L20 12 L15 16')] },
  pagebreak:     { viewBox: '0 0 24 24', paths: [stroke('M5 4 H19 M5 8 H19 M3 12 H21 M5 16 H19 M5 20 H19'), { d: 'M12 12 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0', fill: '#fff', stroke: STROKE }] },
  hr:            { viewBox: '0 0 24 24', paths: [stroke('M3 12 H21')] },
  symbol:        { viewBox: '0 0 24 24', paths: [fill('M12 4a6 6 0 0 1 5 9.3L19 18h-5v-2h2.5l-.6-2H8.1l-.6 2H10v2H5l2-4.7A6 6 0 0 1 12 4Zm0 2a4 4 0 0 0-4 4 4 4 0 0 0 1 2.6h6A4 4 0 0 0 16 10a4 4 0 0 0-4-4Z')] },
  math:          { viewBox: '0 0 24 24', paths: [stroke('M3 13 L7 18 L13 4 L21 4')] },
  bold:          { viewBox: '0 0 24 24', paths: [fill('M7 5h6.5a3.75 3.75 0 0 1 2.4 6.62A4 4 0 0 1 14 19H7V5Zm2.5 2v3.5h3.6a1.75 1.75 0 1 0 0-3.5H9.5Zm0 5.5V17h4a2 2 0 0 0 0-4.5h-4Z')] },
  italic:        { viewBox: '0 0 24 24', paths: [fill('M10 5h8v2h-2.5l-3 10H15v2H7v-2h2.5l3-10H10V5Z')] },
  underline:     { viewBox: '0 0 24 24', paths: [fill('M7 5h2v7a3 3 0 0 0 6 0V5h2v7a5 5 0 0 1-10 0V5ZM6 19h12v2H6v-2Z')] },
  strikethrough: { viewBox: '0 0 24 24', paths: [fill('M3 11h18v2H3v-2Zm6.5-4a2.5 2.5 0 0 1 2.5-2.5h2.5a3.5 3.5 0 0 1 3.5 3.5h-2a1.5 1.5 0 0 0-1.5-1.5H12A.5.5 0 0 0 11.5 7v.5h-2V7Zm5 7H17v.5a3.5 3.5 0 0 1-3.5 3.5H11A3 3 0 0 1 8 15h2a1 1 0 0 0 1 1h2.5a1.5 1.5 0 0 0 1-2.5Z')] },
  superscript:   { viewBox: '0 0 24 24', paths: [fill('M5 6h2.5l3 4 3-4H16l-4 5.5L16.5 18H14l-3.5-4.7L7 18H4.5l4.7-6.5L5 6Zm14 1h3v.5h-2v.5h2v.5h-2v.5h2V10h-3V7Z')] },
  subscript:     { viewBox: '0 0 24 24', paths: [fill('M5 4h2.5l3 4 3-4H16l-4 5.5L16.5 16H14l-3.5-4.7L7 16H4.5l4.7-6.5L5 4Zm14 13h3v.5h-2v.5h2v.5h-2v.5h2V20h-3V17Z')] },
  code:          { viewBox: '0 0 24 24', paths: [stroke('M9 8 L4 12 L9 16 M15 8 L20 12 L15 16')] },
  'remove-format': { viewBox: '0 0 24 24', paths: [stroke('M5 5h14M9 5l-3 14M14 19l1-4'), stroke('M14 14l6 6M20 14l-6 6')] },
  paint:         { viewBox: '0 0 24 24', paths: [stroke('M4 4 H20 V8 H4 Z M6 8 V11 H18 V8 M11 11 V15 H13 V20 H11 Z')] },
  outdent:       { viewBox: '0 0 24 24', paths: [stroke('M3 5h18M3 9h10M3 13h10M3 17h18M21 8 L17 12 L21 16')] },
  indent:        { viewBox: '0 0 24 24', paths: [stroke('M3 5h18M11 9h10M11 13h10M3 17h18M3 8 L7 12 L3 16')] },
  undo:          { viewBox: '0 0 24 24', paths: [stroke('M9 14 L4 9 L9 4 M4 9 H14 a6 6 0 0 1 0 12 H10')] },
  redo:          { viewBox: '0 0 24 24', paths: [stroke('M15 14 L20 9 L15 4 M20 9 H10 a6 6 0 0 0 0 12 H14')] }
}

export type IconName = keyof typeof ICONS
