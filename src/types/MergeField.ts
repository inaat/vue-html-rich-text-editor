export interface MergeFieldItem {
  label: string
  value: string
  type?: 'text' | 'image'
}

export interface MergeFieldCategory {
  label: string
  fields: MergeFieldItem[]
}
