import React from 'react'
import ReactDOM from 'react-dom/client'
import { useEffect, useState } from 'react'
import App from './App'
import KioskPrototype from './KioskPrototype'
import './index.css'

function Root() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const on = () => { setHash(window.location.hash); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash.startsWith('#/kiosk') ? <KioskPrototype /> : <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
