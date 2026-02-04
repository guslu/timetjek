import '../css/app.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setUnauthorizedHandler } from '@/api/client'
import { clearAuthState } from '@/composables/useAuth'

const app = createApp(App)
app.use(router)

setUnauthorizedHandler(() => {
  clearAuthState()
  router.replace({ name: 'login' })
})

app.mount('#app')
