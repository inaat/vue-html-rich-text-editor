export const formatBytes = (n: number): string =>
  n < 1024
    ? `${n} B`
    : n < 1048576
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / 1048576).toFixed(2)} MB`

export const rgbToHex = (rgb: string): string => {
  if (!rgb) return ''
  if (rgb.startsWith('#')) {
    return rgb.length === 4
      ? '#' + rgb.slice(1).split('').map((c) => c + c).join('')
      : rgb
  }
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!m) return ''
  const hex = (n: string) => (+n).toString(16).padStart(2, '0')
  return '#' + hex(m[1]) + hex(m[2]) + hex(m[3])
}

export const parseLen = (v: string): string => {
  if (!v) return ''
  const t = String(v).trim()
  if (!t) return ''
  return /^\d+(\.\d+)?$/.test(t) ? t + 'px' : t
}
