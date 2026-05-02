import { inject, ref } from 'vue'
import { LOCALE_KEY, en } from '@/core/Locale'

const _fallback = ref(en)

export function useLocale() {
  return inject(LOCALE_KEY, _fallback)
}
