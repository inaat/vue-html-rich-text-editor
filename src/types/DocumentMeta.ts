export interface DocumentMeta {
  file: string
  size: string
  blocks: string
  images: string
  zipMedia: string
  unsupported: string
  recovered: string
  api: string
}

export const EMPTY_META: DocumentMeta = {
  file: '—',
  size: '—',
  blocks: '—',
  images: '—',
  zipMedia: '—',
  unsupported: '—',
  recovered: '—',
  api: '—'
}
