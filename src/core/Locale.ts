import type { InjectionKey, Ref } from 'vue'

export interface Labels {
  // Toolbar Row 1
  undo: string
  redo: string
  insertMergeField: string
  chooseMergeField: string
  importFromWord: string
  exportToWord: string
  exportToPdf: string
  print: string
  paintFormat: string
  caseChange: string
  findAndReplace: string
  selectAll: string
  spellcheckOn: string
  spellcheckOff: string
  highlightColor: string
  insertLink: string
  insertFootnote: string
  insertBookmark: string
  insertImage: string
  fileManager: string
  insertTable: string
  blockQuote: string
  insertMedia: string
  embedHtml: string
  insertHtmlElement: string
  insertCodeBlock: string
  pageBreak: string
  horizontalLine: string
  insertEmoji: string
  specialChars: string
  mathEquation: string
  toggleSource: string
  zoomOut: string
  zoomIn: string
  enterFullscreen: string
  exitFullscreen: string
  uploadFromComputer: string
  insertViaUrl: string
  upperCase: string
  lowerCase: string
  titleCase: string
  sentenceCase: string
  toggleCase: string
  customField: string
  paintFormatActive: string
  formatApplied: string
  spellcheckOnMsg: string
  spellcheckOffMsg: string
  // Toolbar Row 2
  paragraph: string
  heading1: string
  heading2: string
  heading3: string
  heading4: string
  heading5: string
  heading6: string
  blockQuoteOption: string
  codeBlockOption: string
  stylesPlaceholder: string
  defaultStyle: string
  redHeading: string
  blueHeading: string
  infoBox: string
  warningBox: string
  bold: string
  italic: string
  underline: string
  strikethrough: string
  basicStyles: string
  removeFormat: string
  textAlignment: string
  lineHeightBtn: string
  templatesPlaceholder: string
  templateSignature: string
  templateProjections: string
  templateBalance: string
  templateLetterhead: string
  tableOfContents: string
  bulletedList: string
  numberedList: string
  multiLevelList: string
  todoList: string
  decreaseIndent: string
  increaseIndent: string
  fontSizeLabel: string
  fontFamilyLabel: string
  fontColorLabel: string
  highlightLabel: string
  italicLabel: string
  underlineLabel: string
  strikethroughLabel: string
  inlineCodeLabel: string
  superscriptLabel: string
  subscriptLabel: string
  alignLeft: string
  alignCenter: string
  alignRight: string
  justify: string
  leftToRight: string
  rightToLeft: string
  bulletDisc: string
  bulletCircle: string
  bulletSquare: string
  // MenuBar
  appTitle: string
  menuFile: string
  menuEdit: string
  menuView: string
  menuInsert: string
  menuFormat: string
  menuHelp: string
  fileNew: string
  fileImport: string
  fileExportWord: string
  fileExportPdf: string
  filePreview: string
  editUndo: string
  editRedo: string
  editCut: string
  editCopy: string
  editPaste: string
  editFind: string
  editSelectAll: string
  viewSource: string
  viewPreview: string
  insertImageMenu: string
  insertFileAttachment: string
  insertTableMenu: string
  insertLinkMenu: string
  insertBookmarkMenu: string
  insertFootnoteMenu: string
  insertVideoMenu: string
  insertEmbedMenu: string
  insertBlockQuoteMenu: string
  insertCodeBlockMenu: string
  insertPageBreakMenu: string
  insertHruleMenu: string
  insertSpecialCharMenu: string
  insertEmojiMenu: string
  insertMathMenu: string
  insertMergeFieldMenu: string
  insertTocMenu: string
  formatBold: string
  formatItalic: string
  formatUnderline: string
  formatStrikethrough: string
  formatParagraph: string
  formatH1: string
  formatH2: string
  formatH3: string
  formatH4: string
  formatAlignLeft: string
  formatAlignCenter: string
  formatAlignRight: string
  formatJustify: string
  formatClearFormatting: string
  helpAbout: string
  confirmClear: string
  promptVideo: string
  promptEmbed: string
  promptSpecialChar: string
  promptMath: string
  promptMergeField: string
  promptBookmark: string
  promptEmoji: string
  aboutText: string
  // StylePanel
  docDirection: string
  selectedElement: string
  ltr: string
  rtl: string
  setLtrOnElement: string
  setRtlOnElement: string
  insertChildEl: string
  deleteElement: string
  clickIntoEditor: string
  sizeSection: string
  paddingSection: string
  marginSection: string
  borderSection: string
  colorSection: string
  allPropsSection: string
  clearInlineStyles: string
  filterPropsPlaceholder: string
  showEveryProp: string
  widthLabel: string
  heightLabel: string
  lineHeightLabel: string
  fontSizePanelLabel: string
  addChildBtn: string
  // Statusbar
  statusReady: string
  statusWords: string
  statusChars: string
  statusPage: string
  statusPages: string
  // PageSettings
  presetLabel: string
  presetLetter: string
  presetA4: string
  presetLegal: string
  presetCustom: string
  widthPx: string
  heightPx: string
  marginTop: string
  marginRight: string
  marginBottom: string
  marginLeft: string
  lineHeightDoc: string
  resetToLetter: string
  // Sidebar section titles
  sidebarPage: string
  sidebarStyle: string
  sidebarDocument: string
}

export const en: Labels = {
  undo: 'Undo (Ctrl+Z)',
  redo: 'Redo (Ctrl+Y)',
  insertMergeField: 'Insert merge field',
  chooseMergeField: 'Choose merge field',
  importFromWord: 'Import from Word / HTML',
  exportToWord: 'Export to Word',
  exportToPdf: 'Export to PDF',
  print: 'Print',
  paintFormat: 'Paint formatting (Ctrl+Alt+C)',
  caseChange: 'Case change (Shift+F3)',
  findAndReplace: 'Find and replace (Ctrl+F)',
  selectAll: 'Select all (Ctrl+A)',
  spellcheckOn: 'Spellcheck (on)',
  spellcheckOff: 'Spellcheck (off)',
  highlightColor: 'Highlight color',
  insertLink: 'Link (Ctrl+K)',
  insertFootnote: 'Insert footnote',
  insertBookmark: 'Bookmark',
  insertImage: 'Insert image',
  fileManager: 'File manager',
  insertTable: 'Insert table',
  blockQuote: 'Block quote',
  insertMedia: 'Insert video / media',
  embedHtml: 'Embed HTML',
  insertHtmlElement: 'Insert HTML element',
  insertCodeBlock: 'Insert code block',
  pageBreak: 'Page break',
  horizontalLine: 'Horizontal line',
  insertEmoji: 'Emoji',
  specialChars: 'Special characters',
  mathEquation: 'Math equation',
  toggleSource: 'Toggle HTML source',
  zoomOut: 'Zoom out',
  zoomIn: 'Zoom in',
  enterFullscreen: 'Enter fullscreen',
  exitFullscreen: 'Exit fullscreen',
  uploadFromComputer: 'Upload from computer',
  insertViaUrl: 'Insert via URL',
  upperCase: 'UPPER CASE',
  lowerCase: 'lower case',
  titleCase: 'Title Case',
  sentenceCase: 'Sentence case',
  toggleCase: 'tOGGLE cASE',
  customField: 'Custom field…',
  paintFormatActive: 'Format painter active — select text to apply',
  formatApplied: 'Format applied',
  spellcheckOnMsg: 'Spellcheck on',
  spellcheckOffMsg: 'Spellcheck off',
  paragraph: 'Paragraph',
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  heading4: 'Heading 4',
  heading5: 'Heading 5',
  heading6: 'Heading 6',
  blockQuoteOption: 'Block Quote',
  codeBlockOption: 'Code Block',
  stylesPlaceholder: 'Styles',
  defaultStyle: 'Default Style',
  redHeading: 'Red Heading',
  blueHeading: 'Blue Heading',
  infoBox: 'Info Box',
  warningBox: 'Warning Box',
  bold: 'Bold (Ctrl+B)',
  italic: 'Italic (Ctrl+I)',
  underline: 'Underline (Ctrl+U)',
  strikethrough: 'Strikethrough (Ctrl+Shift+X)',
  basicStyles: 'Basic styles',
  removeFormat: 'Remove Format',
  textAlignment: 'Text alignment',
  lineHeightBtn: 'Line height',
  templatesPlaceholder: 'Templates',
  templateSignature: 'Signature',
  templateProjections: 'Projections Table',
  templateBalance: 'Balance Sheet',
  templateLetterhead: 'Letterhead',
  tableOfContents: 'Table of contents',
  bulletedList: 'Bulleted list',
  numberedList: 'Numbered list',
  multiLevelList: 'Multi-level list',
  todoList: 'To-do list',
  decreaseIndent: 'Decrease indent',
  increaseIndent: 'Increase indent',
  fontSizeLabel: 'Font Size',
  fontFamilyLabel: 'Font Family',
  fontColorLabel: 'Font Color',
  highlightLabel: 'Highlight',
  italicLabel: 'Italic',
  underlineLabel: 'Underline',
  strikethroughLabel: 'Strikethrough',
  inlineCodeLabel: 'Inline Code',
  superscriptLabel: 'Superscript',
  subscriptLabel: 'Subscript',
  alignLeft: 'Align Left',
  alignCenter: 'Align Center',
  alignRight: 'Align Right',
  justify: 'Justify',
  leftToRight: 'Left to Right',
  rightToLeft: 'Right to Left',
  bulletDisc: 'Disc',
  bulletCircle: 'Circle',
  bulletSquare: 'Square',
  appTitle: 'Document Editor',
  menuFile: 'File',
  menuEdit: 'Edit',
  menuView: 'View',
  menuInsert: 'Insert',
  menuFormat: 'Format',
  menuHelp: 'Help',
  fileNew: 'New (clear document)',
  fileImport: 'Import from Word / HTML…',
  fileExportWord: 'Export to Word',
  fileExportPdf: 'Export to PDF',
  filePreview: 'Preview in new tab',
  editUndo: 'Undo',
  editRedo: 'Redo',
  editCut: 'Cut',
  editCopy: 'Copy',
  editPaste: 'Paste',
  editFind: 'Find and replace…',
  editSelectAll: 'Select all',
  viewSource: 'Toggle source code (HTML)',
  viewPreview: 'Preview in new tab',
  insertImageMenu: 'Image…',
  insertFileAttachment: 'File attachment…',
  insertTableMenu: 'Table…',
  insertLinkMenu: 'Link…',
  insertBookmarkMenu: 'Bookmark…',
  insertFootnoteMenu: 'Footnote',
  insertVideoMenu: 'Video / media…',
  insertEmbedMenu: 'Embed HTML…',
  insertBlockQuoteMenu: 'Block quote',
  insertCodeBlockMenu: 'Code block',
  insertPageBreakMenu: 'Page break',
  insertHruleMenu: 'Horizontal line',
  insertSpecialCharMenu: 'Special character…',
  insertEmojiMenu: 'Emoji…',
  insertMathMenu: 'Math equation…',
  insertMergeFieldMenu: 'Merge field…',
  insertTocMenu: 'Table of contents',
  formatBold: 'Bold',
  formatItalic: 'Italic',
  formatUnderline: 'Underline',
  formatStrikethrough: 'Strikethrough',
  formatParagraph: 'Paragraph',
  formatH1: 'Heading 1',
  formatH2: 'Heading 2',
  formatH3: 'Heading 3',
  formatH4: 'Heading 4',
  formatAlignLeft: 'Align left',
  formatAlignCenter: 'Align center',
  formatAlignRight: 'Align right',
  formatJustify: 'Justify',
  formatClearFormatting: 'Clear formatting',
  helpAbout: 'About / Keyboard shortcuts',
  confirmClear: 'Clear the document?',
  promptVideo: 'Video URL (YouTube/Vimeo or .mp4):',
  promptEmbed: 'Paste HTML to embed:',
  promptSpecialChar: 'Special character (e.g. © ™ ° ± × ÷ Ω π ∞):',
  promptMath: 'Math (LaTeX), wrapped as \\(...\\):',
  promptMergeField: 'Merge field name (e.g. customer.name):',
  promptBookmark: 'Bookmark name:',
  promptEmoji: 'Emoji:',
  aboutText: 'Vue HTML Rich Text Editor\n\nKeyboard shortcuts:\n  Ctrl+B  Bold\n  Ctrl+I  Italic\n  Ctrl+U  Underline\n  Ctrl+Z  Undo\n  Ctrl+Y  Redo\n  Ctrl+K  Insert link\n  Ctrl+F  Find / Replace',
  docDirection: 'Document:',
  selectedElement: 'Selected:',
  ltr: 'LTR',
  rtl: 'RTL',
  setLtrOnElement: 'Set LTR on element',
  setRtlOnElement: 'Set RTL on element',
  insertChildEl: 'Insert child element',
  deleteElement: 'Delete this element',
  clickIntoEditor: '— click into editor —',
  sizeSection: 'Size',
  paddingSection: 'Padding',
  marginSection: 'Margin',
  borderSection: 'Border',
  colorSection: 'Color',
  allPropsSection: 'All properties',
  clearInlineStyles: 'Clear inline styles',
  filterPropsPlaceholder: 'filter (e.g. flex, grid, font…)',
  showEveryProp: 'show every property',
  widthLabel: 'W',
  heightLabel: 'H',
  lineHeightLabel: 'Line-height',
  fontSizePanelLabel: 'Font size',
  addChildBtn: '＋child',
  statusReady: 'Ready',
  statusWords: 'Words',
  statusChars: 'Characters',
  statusPage: 'page',
  statusPages: 'pages',
  presetLabel: 'Preset',
  presetLetter: 'Letter (816 × 1056 px)',
  presetA4: 'A4 (794 × 1123 px)',
  presetLegal: 'Legal (816 × 1344 px)',
  presetCustom: 'Custom',
  widthPx: 'Width',
  heightPx: 'Height',
  marginTop: 'Top',
  marginRight: 'Right',
  marginBottom: 'Bottom',
  marginLeft: 'Left',
  lineHeightDoc: 'Line-height (whole document)',
  resetToLetter: 'Reset to Letter / 1in margins',
  sidebarPage: 'Page',
  sidebarStyle: 'Style',
  sidebarDocument: 'Document',
}

export const ar: Labels = {
  undo: 'تراجع (Ctrl+Z)',
  redo: 'إعادة (Ctrl+Y)',
  insertMergeField: 'إدراج حقل دمج',
  chooseMergeField: 'اختيار حقل دمج',
  importFromWord: 'استيراد من Word / HTML',
  exportToWord: 'تصدير إلى Word',
  exportToPdf: 'تصدير إلى PDF',
  print: 'طباعة',
  paintFormat: 'نسخ التنسيق (Ctrl+Alt+C)',
  caseChange: 'تغيير الحالة (Shift+F3)',
  findAndReplace: 'بحث واستبدال (Ctrl+F)',
  selectAll: 'تحديد الكل (Ctrl+A)',
  spellcheckOn: 'التدقيق الإملائي (مفعّل)',
  spellcheckOff: 'التدقيق الإملائي (معطّل)',
  highlightColor: 'لون التمييز',
  insertLink: 'رابط (Ctrl+K)',
  insertFootnote: 'إدراج حاشية سفلية',
  insertBookmark: 'إشارة مرجعية',
  insertImage: 'إدراج صورة',
  fileManager: 'مدير الملفات',
  insertTable: 'إدراج جدول',
  blockQuote: 'اقتباس',
  insertMedia: 'إدراج فيديو / وسائط',
  embedHtml: 'تضمين HTML',
  insertHtmlElement: 'إدراج عنصر HTML',
  insertCodeBlock: 'إدراج كتلة كود',
  pageBreak: 'فاصل الصفحة',
  horizontalLine: 'خط أفقي',
  insertEmoji: 'إيموجي',
  specialChars: 'رموز خاصة',
  mathEquation: 'معادلة رياضية',
  toggleSource: 'عرض مصدر HTML',
  zoomOut: 'تصغير',
  zoomIn: 'تكبير',
  enterFullscreen: 'ملء الشاشة',
  exitFullscreen: 'الخروج من ملء الشاشة',
  uploadFromComputer: 'تحميل من الجهاز',
  insertViaUrl: 'إدراج عبر رابط',
  upperCase: 'أحرف كبيرة',
  lowerCase: 'أحرف صغيرة',
  titleCase: 'حالة العنوان',
  sentenceCase: 'حالة الجملة',
  toggleCase: 'عكس الحالة',
  customField: 'حقل مخصص…',
  paintFormatActive: 'نسخ التنسيق نشط — حدد النص للتطبيق',
  formatApplied: 'تم تطبيق التنسيق',
  spellcheckOnMsg: 'تم تفعيل التدقيق الإملائي',
  spellcheckOffMsg: 'تم تعطيل التدقيق الإملائي',
  paragraph: 'فقرة',
  heading1: 'عنوان 1',
  heading2: 'عنوان 2',
  heading3: 'عنوان 3',
  heading4: 'عنوان 4',
  heading5: 'عنوان 5',
  heading6: 'عنوان 6',
  blockQuoteOption: 'اقتباس',
  codeBlockOption: 'كتلة كود',
  stylesPlaceholder: 'الأنماط',
  defaultStyle: 'النمط الافتراضي',
  redHeading: 'عنوان أحمر',
  blueHeading: 'عنوان أزرق',
  infoBox: 'مربع معلومات',
  warningBox: 'مربع تحذير',
  bold: 'غامق (Ctrl+B)',
  italic: 'مائل (Ctrl+I)',
  underline: 'تسطير (Ctrl+U)',
  strikethrough: 'شطب (Ctrl+Shift+X)',
  basicStyles: 'أنماط أساسية',
  removeFormat: 'إزالة التنسيق',
  textAlignment: 'محاذاة النص',
  lineHeightBtn: 'تباعد الأسطر',
  templatesPlaceholder: 'القوالب',
  templateSignature: 'توقيع',
  templateProjections: 'جدول التوقعات',
  templateBalance: 'الميزانية العمومية',
  templateLetterhead: 'ترويسة الشركة',
  tableOfContents: 'جدول المحتويات',
  bulletedList: 'قائمة نقطية',
  numberedList: 'قائمة مرقمة',
  multiLevelList: 'قائمة متعددة المستويات',
  todoList: 'قائمة المهام',
  decreaseIndent: 'تقليل المسافة البادئة',
  increaseIndent: 'زيادة المسافة البادئة',
  fontSizeLabel: 'حجم الخط',
  fontFamilyLabel: 'نوع الخط',
  fontColorLabel: 'لون الخط',
  highlightLabel: 'تمييز',
  italicLabel: 'مائل',
  underlineLabel: 'تسطير',
  strikethroughLabel: 'شطب',
  inlineCodeLabel: 'كود مضمّن',
  superscriptLabel: 'مرتفع',
  subscriptLabel: 'منخفض',
  alignLeft: 'محاذاة لليسار',
  alignCenter: 'توسيط',
  alignRight: 'محاذاة لليمين',
  justify: 'ضبط',
  leftToRight: 'من اليسار إلى اليمين',
  rightToLeft: 'من اليمين إلى اليسار',
  bulletDisc: 'دائرة مصمتة',
  bulletCircle: 'دائرة فارغة',
  bulletSquare: 'مربع',
  appTitle: 'محرر المستندات',
  menuFile: 'ملف',
  menuEdit: 'تحرير',
  menuView: 'عرض',
  menuInsert: 'إدراج',
  menuFormat: 'تنسيق',
  menuHelp: 'مساعدة',
  fileNew: 'جديد (مسح المستند)',
  fileImport: 'استيراد من Word / HTML…',
  fileExportWord: 'تصدير إلى Word',
  fileExportPdf: 'تصدير إلى PDF',
  filePreview: 'معاينة في نافذة جديدة',
  editUndo: 'تراجع',
  editRedo: 'إعادة',
  editCut: 'قص',
  editCopy: 'نسخ',
  editPaste: 'لصق',
  editFind: 'بحث واستبدال…',
  editSelectAll: 'تحديد الكل',
  viewSource: 'عرض مصدر HTML',
  viewPreview: 'معاينة في نافذة جديدة',
  insertImageMenu: 'صورة…',
  insertFileAttachment: 'مرفق ملف…',
  insertTableMenu: 'جدول…',
  insertLinkMenu: 'رابط…',
  insertBookmarkMenu: 'إشارة مرجعية…',
  insertFootnoteMenu: 'حاشية سفلية',
  insertVideoMenu: 'فيديو / وسائط…',
  insertEmbedMenu: 'تضمين HTML…',
  insertBlockQuoteMenu: 'اقتباس',
  insertCodeBlockMenu: 'كتلة كود',
  insertPageBreakMenu: 'فاصل الصفحة',
  insertHruleMenu: 'خط أفقي',
  insertSpecialCharMenu: 'رمز خاص…',
  insertEmojiMenu: 'إيموجي…',
  insertMathMenu: 'معادلة رياضية…',
  insertMergeFieldMenu: 'حقل دمج…',
  insertTocMenu: 'جدول المحتويات',
  formatBold: 'غامق',
  formatItalic: 'مائل',
  formatUnderline: 'تسطير',
  formatStrikethrough: 'شطب',
  formatParagraph: 'فقرة',
  formatH1: 'عنوان 1',
  formatH2: 'عنوان 2',
  formatH3: 'عنوان 3',
  formatH4: 'عنوان 4',
  formatAlignLeft: 'محاذاة لليسار',
  formatAlignCenter: 'توسيط',
  formatAlignRight: 'محاذاة لليمين',
  formatJustify: 'ضبط',
  formatClearFormatting: 'مسح التنسيق',
  helpAbout: 'حول البرنامج / اختصارات لوحة المفاتيح',
  confirmClear: 'هل تريد مسح المستند؟',
  promptVideo: 'رابط الفيديو (YouTube/Vimeo أو .mp4):',
  promptEmbed: 'الصق HTML للتضمين:',
  promptSpecialChar: 'رمز خاص (مثال: © ™ ° ± × ÷ Ω π ∞):',
  promptMath: 'معادلة رياضية (LaTeX)، تُحاط بـ \\(...\\):',
  promptMergeField: 'اسم حقل الدمج (مثال: customer.name):',
  promptBookmark: 'اسم الإشارة المرجعية:',
  promptEmoji: 'إيموجي:',
  aboutText: 'محرر HTML النصي\n\nاختصارات لوحة المفاتيح:\n  Ctrl+B  غامق\n  Ctrl+I  مائل\n  Ctrl+U  تسطير\n  Ctrl+Z  تراجع\n  Ctrl+Y  إعادة\n  Ctrl+K  إدراج رابط\n  Ctrl+F  بحث / استبدال',
  docDirection: 'المستند:',
  selectedElement: 'المحدد:',
  ltr: 'يسار → يمين',
  rtl: 'يمين → يسار',
  setLtrOnElement: 'تعيين LTR على العنصر',
  setRtlOnElement: 'تعيين RTL على العنصر',
  insertChildEl: 'إدراج عنصر فرعي',
  deleteElement: 'حذف هذا العنصر',
  clickIntoEditor: '— انقر داخل المحرر —',
  sizeSection: 'الحجم',
  paddingSection: 'الحشو',
  marginSection: 'الهامش',
  borderSection: 'الحدود',
  colorSection: 'اللون',
  allPropsSection: 'جميع الخصائص',
  clearInlineStyles: 'مسح الأنماط المضمّنة',
  filterPropsPlaceholder: 'تصفية (مثال: flex, grid, font…)',
  showEveryProp: 'عرض جميع الخصائص',
  widthLabel: 'ع',
  heightLabel: 'ط',
  lineHeightLabel: 'تباعد الأسطر',
  fontSizePanelLabel: 'حجم الخط',
  addChildBtn: '＋فرعي',
  statusReady: 'جاهز',
  statusWords: 'الكلمات',
  statusChars: 'الأحرف',
  statusPage: 'صفحة',
  statusPages: 'صفحات',
  presetLabel: 'الإعداد المسبق',
  presetLetter: 'Letter (816 × 1056 بكسل)',
  presetA4: 'A4 (794 × 1123 بكسل)',
  presetLegal: 'Legal (816 × 1344 بكسل)',
  presetCustom: 'مخصص',
  widthPx: 'العرض',
  heightPx: 'الارتفاع',
  marginTop: 'أعلى',
  marginRight: 'يمين',
  marginBottom: 'أسفل',
  marginLeft: 'يسار',
  lineHeightDoc: 'تباعد الأسطر (المستند كاملاً)',
  resetToLetter: 'إعادة ضبط: Letter / هوامش 1 بوصة',
  sidebarPage: 'الصفحة',
  sidebarStyle: 'الأنماط',
  sidebarDocument: 'المستند',
}

const BUILT_IN: Record<string, Labels> = { en, ar }

export const LOCALE_KEY: InjectionKey<Ref<Labels>> = Symbol('rte-locale')

export function resolveLabels(lang?: string, custom?: Partial<Labels>): Labels {
  const base = (lang && BUILT_IN[lang]) ? BUILT_IN[lang] : en
  if (!custom) return base
  return { ...base, ...custom }
}
