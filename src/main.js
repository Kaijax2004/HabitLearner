import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useThemeStore } from './stores/theme'
import { showAPIConnectionStatus } from './utils/apiTest'
import { runFullTest } from './utils/registrationTest'
import './styles/main.css'
import './styles/enhanced-ui.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化主题
const themeStore = useThemeStore()
themeStore.initTheme()

// 测试API连接（仅在开发环境）
if (import.meta.env.DEV) {
  showAPIConnectionStatus()
}

app.mount('#app')
