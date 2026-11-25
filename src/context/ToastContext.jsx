import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Equivalente a los "messages" de Django del sistema original: se muestran
 * arriba del contenido (alert-toast) y se cierran con la ×. Al navegar a otra
 * página desaparecen los mensajes antiguos, igual que en Django.
 */
const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [mensajes, setMensajes] = useState([])
  const location = useLocation()

  useEffect(() => {
    const limite = Date.now() - 1500
    setMensajes((m) => m.filter((x) => x.creado > limite))
  }, [location.pathname])

  const agregar = useCallback((texto, tipo) => {
    setMensajes((m) => [...m, { id: Date.now() + Math.random(), texto, tipo, creado: Date.now() }])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const cerrar = (id) => setMensajes((m) => m.filter((x) => x.id !== id))

  const toast = {
    exito: (t) => agregar(t, 'success'),
    error: (t) => agregar(t, 'error'),
    info: (t) => agregar(t, 'info'),
    aviso: (t) => agregar(t, 'warning'),
  }

  return (
    <ToastContext.Provider value={{ ...toast, mensajes, cerrar }}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

export function Mensajes() {
  const { mensajes, cerrar } = useToast()
  if (!mensajes.length) return null
  return (
    <div className="messages-wrapper">
      {mensajes.map((m) => (
        <div key={m.id} className={`alert-toast ${m.tipo}`}>
          <span>{m.texto}</span>
          <button className="toast-close-btn" onClick={() => cerrar(m.id)}>&times;</button>
        </div>
      ))}
    </div>
  )
}
