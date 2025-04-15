import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { 
  Lazyload,
  PullRefresh,
  Loading,
  Toast,
  Icon,
  Button 
} from 'vant'
import 'vant/lib/index.css'

const app = createApp(App)
app.use(router)
app.use(Lazyload)
app.use(PullRefresh)
app.use(Loading)
app.use(Toast)
app.use(Icon)
app.use(Button)

app.mount('#app')
