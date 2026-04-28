export const BLOCK_TAGS = /^(P|H[1-6]|LI|TD|TH|BLOCKQUOTE|PRE|DIV)$/
export const STYLE_TARGET_TAGS = /^(TD|TH|TABLE|TR|P|H[1-6]|LI|UL|OL|BLOCKQUOTE|IMG|DIV|SPAN|A|HR|PRE)$/
export const RTL_RE = /[֐-׿؀-ۿݐ-ݿࠀ-ࣿﭐ-﷿ﹰ-﻿]/
export const RTL_RE_G = new RegExp(RTL_RE.source, 'g')

export const STORAGE_KEY = 'docx-editor-draft-v1'
export const PAGE_KEY = 'docx-editor-page-v1'
export const LH_KEY = 'docx-editor-line-height-v1'

export const HISTORY_MAX = 100
