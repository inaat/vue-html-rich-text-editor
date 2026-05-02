export { default as DocxEditor } from '@/components/DocxEditor.vue'
export { default as Toolbar } from '@/components/toolbar/Toolbar.vue'
export { default as ToolbarRow1 } from '@/components/toolbar/ToolbarRow1.vue'
export { default as ToolbarRow2 } from '@/components/toolbar/ToolbarRow2.vue'
export { default as ToolbarButton } from '@/components/ToolbarButton.vue'
export { default as Icon } from '@/components/Icon.vue'
export { default as Sidebar } from '@/components/sidebar/Sidebar.vue'
export { default as PageSettings } from '@/components/sidebar/PageSettings.vue'
export { default as StylePanel } from '@/components/sidebar/StylePanel.vue'
export { default as DocumentMeta } from '@/components/sidebar/DocumentMeta.vue'
export { default as BubbleToolbar } from '@/components/bubble/BubbleToolbar.vue'
export { default as TableTools } from '@/components/table/TableTools.vue'
export { default as TableOverlay } from '@/components/table/TableOverlay.vue'
export { default as TablePropsPanel } from '@/components/table/TablePropsPanel.vue'
export { default as ImageTools } from '@/components/image/ImageTools.vue'
export { default as EditorPane } from '@/components/EditorPane.vue'

export { useEditor } from '@/composables/useEditor'
export { useEditorContext, provideEditorContext, EDITOR_CONTEXT } from '@/composables/useEditorContext'
export { useSelectionBubble } from '@/composables/useSelectionBubble'
export { useTableTools as useTableToolsComposable } from '@/composables/useTableTools'
export { useTableInteractions } from '@/composables/useTableInteractions'
export { useImageTools as useImageToolsComposable } from '@/composables/useImageTools'
export { useShortcuts } from '@/composables/useShortcuts'

export { SelectionService } from '@/core/SelectionService'
export { HistoryService } from '@/core/HistoryService'
export { ExecCommandEngine } from '@/core/ExecCommandEngine'
export { DraftService } from '@/core/DraftService'
export { PageService } from '@/core/PageService'
export { TableService } from '@/core/TableService'
export { ImageService } from '@/core/ImageService'
export { PaintService } from '@/core/PaintService'
export { ExportService } from '@/core/ExportService'
export { ImportService } from '@/core/ImportService'
export { InsertService, pickFile } from '@/core/InsertService'
export { PopupService } from '@/core/PopupService'
export { DirectionService } from '@/core/DirectionService'
export type { EditorEngine } from '@/core/EditorEngine'
export type { TableAction, TableContext } from '@/core/TableService'
export * from '@/core/Constants'
export * from '@/core/Format'

export { ICONS } from '@/icons/registry'
export type { IconName, IconDef } from '@/icons/registry'

export type {
  EditorApi,
  EditorCommand,
  CommandGroup,
  RichTextEditorProps,
  RichTextEditorEmits,
  PageSettings as PageSettingsType,
  PagePreset,
  DocumentMeta as DocumentMetaType,
  MergeFieldItem,
  MergeFieldCategory
} from '@/types'
export { PAGE_PRESETS, EMPTY_META } from '@/types'

export { RichTextEditorPlugin } from '@/plugin'
export { RichTextEditorPlugin as default } from '@/plugin'
