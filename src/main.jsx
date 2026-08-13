import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.css'
import './tokens.css'
import './index.css'
import App from './App.jsx'
import { ResultSharePage } from './components/result/ResultSharePage.jsx'

const path = window.location.pathname.replace(/\/+$/, '') || '/'
const Page = path === '/result' ? ResultSharePage : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
