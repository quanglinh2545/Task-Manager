import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/useAuth'
const container = document.getElementById('app') as HTMLDivElement
const root = createRoot(container)
import './assets/scss/index.scss'
declare global {
  type Nullable<T> = null | T
  interface Window {
    gantt: any
  }
}

root.render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)
