import { computed, ref } from 'vue'

const isRouteLoading = ref(false)
const routeLoadingText = ref('正在切换工作台')
let showTimer = null
let hideTimer = null
let loadingToken = 0

export const startRouteLoading = (text = '正在切换工作台') => {
  loadingToken += 1
  const token = loadingToken
  routeLoadingText.value = text
  if (hideTimer) window.clearTimeout(hideTimer)
  if (showTimer) window.clearTimeout(showTimer)

  showTimer = window.setTimeout(() => {
    if (token === loadingToken) isRouteLoading.value = true
  }, 420)
}

export const finishRouteLoading = () => {
  loadingToken += 1
  if (showTimer) window.clearTimeout(showTimer)
  hideTimer = window.setTimeout(() => {
    isRouteLoading.value = false
  }, 80)
}

export const useRouteLoading = () => ({
  isRouteLoading: computed(() => isRouteLoading.value),
  routeLoadingText: computed(() => routeLoadingText.value)
})

