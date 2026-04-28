import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'
import type { ImageService } from '../core/ImageService'

export interface ImageToolsState {
  visible: boolean
  toolsTop: number
  toolsLeft: number
  enterTopY: number
  enterBottomY: number
  enterX: number
  sizeLabel: string
  active: HTMLElement | null
}

interface ResizeState {
  img: HTMLImageElement
  wrap: HTMLElement
  corner: string
  startX: number
  startY: number
  startW: number
  startH: number
  ratio: number
}

export function useImageTools(
  root: Ref<HTMLElement | null>,
  service: () => ImageService | null,
  onChange?: () => void
) {
  const state = ref<ImageToolsState>({
    visible: false, toolsTop: 0, toolsLeft: 0,
    enterTopY: 0, enterBottomY: 0, enterX: 0,
    sizeLabel: '100%', active: null
  })
  let toolsSize = { w: 320, h: 36 }
  let resizeState: ResizeState | null = null

  function setToolsSize(w: number, h: number) { toolsSize = { w, h } }

  function refreshLabel() {
    const wrap = state.value.active
    if (!wrap) return
    const img = wrap.querySelector('img') as HTMLImageElement | null
    if (img && img.naturalWidth) {
      const w = img.getBoundingClientRect().width
      state.value.sizeLabel = ((w / img.naturalWidth) * 100).toFixed(2) + '%'
    } else {
      state.value.sizeLabel = '100%'
    }
  }

  function position() {
    const wrap = state.value.active
    if (!wrap || !document.contains(wrap)) { deselect(); return }
    const r = wrap.getBoundingClientRect()
    const gap = 8
    let top = r.bottom + gap
    if (top + toolsSize.h > window.innerHeight - 4) top = Math.max(4, r.top - toolsSize.h - gap)
    let left = r.left + (r.width - toolsSize.w) / 2
    left = Math.max(8, Math.min(left, window.innerWidth - toolsSize.w - 8))
    const ew = 28, eh = 28
    const eLeft = r.left + (r.width - ew) / 2
    state.value = {
      ...state.value,
      visible: true,
      toolsTop: window.scrollY + top,
      toolsLeft: window.scrollX + left,
      enterTopY: window.scrollY + r.top - eh / 2,
      enterBottomY: window.scrollY + r.bottom - eh / 2,
      enterX: window.scrollX + eLeft
    }
  }

  function selectWrap(wrap: HTMLElement) {
    const prev = state.value.active
    if (prev && prev !== wrap) prev.classList.remove('is-selected')
    state.value.active = wrap
    wrap.classList.add('is-selected')
    refreshLabel()
    position()
  }

  function deselect() {
    const prev = state.value.active
    if (prev) prev.classList.remove('is-selected')
    state.value = { ...state.value, visible: false, active: null }
  }

  function onEditorClick(e: MouseEvent) {
    const target = e.target as HTMLElement
    const wrap = target.closest('.img-handle-wrap') as HTMLElement | null
    if (wrap) { selectWrap(wrap); return }
    if (!target.closest('.img-handle')) deselect()
  }

  function onDocMousedown(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.closest('.image-tools, .image-enter, .img-handle-wrap')) return
    deselect()
  }

  function onEditorPointerDown(e: PointerEvent) {
    const handle = (e.target as HTMLElement).closest('.img-handle') as HTMLElement | null
    if (!handle) return
    const wrap = handle.parentElement as HTMLElement | null
    const img = wrap?.querySelector('img') as HTMLImageElement | null
    if (!wrap || !img) return
    e.preventDefault()
    e.stopPropagation()
    const r = img.getBoundingClientRect()
    resizeState = {
      img, wrap,
      corner: handle.dataset.corner ?? 'br',
      startX: e.clientX,
      startY: e.clientY,
      startW: r.width,
      startH: r.height,
      ratio: r.width / Math.max(r.height, 1)
    }
    try { handle.setPointerCapture(e.pointerId) } catch {}
    document.body.classList.add('cur-img-resize')
  }

  function onPointerMove(e: PointerEvent) {
    if (!resizeState) return
    const { img, corner, startX, startY, startW, startH, ratio } = resizeState
    let dx = e.clientX - startX
    let dy = e.clientY - startY
    if (corner === 'tl' || corner === 'bl') dx = -dx
    if (corner === 'tl' || corner === 'tr') dy = -dy
    let newW = Math.max(20, startW + dx)
    let newH = Math.max(20, startH + dy)
    if (!e.shiftKey) {
      if (Math.abs(dx) >= Math.abs(dy)) newH = newW / ratio
      else newW = newH * ratio
    }
    img.style.width = Math.round(newW) + 'px'
    img.style.height = 'auto'
    refreshLabel()
    position()
  }

  function onPointerUp() {
    if (!resizeState) return
    resizeState = null
    document.body.classList.remove('cur-img-resize')
    onChange?.()
  }

  onMounted(() => {
    const ed = root.value
    if (ed) {
      ed.addEventListener('click', onEditorClick)
      ed.addEventListener('pointerdown', onEditorPointerDown)
    }
    document.addEventListener('mousedown', onDocMousedown)
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
    document.addEventListener('pointercancel', onPointerUp)
    window.addEventListener('scroll', position, true)
    window.addEventListener('resize', position)
  })
  onBeforeUnmount(() => {
    const ed = root.value
    if (ed) {
      ed.removeEventListener('click', onEditorClick)
      ed.removeEventListener('pointerdown', onEditorPointerDown)
    }
    document.removeEventListener('mousedown', onDocMousedown)
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
    document.removeEventListener('pointercancel', onPointerUp)
    window.removeEventListener('scroll', position, true)
    window.removeEventListener('resize', position)
  })

  return { state, deselect, position, refreshLabel, setToolsSize, selectWrap, service }
}
