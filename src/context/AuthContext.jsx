import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { sesion, onSesionExpirada } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(sesion.usuario)
  const navigate = useNavigate()

  useEffect(() => {
    onSesionExpirada(() => {
      setUsuario(null)
      navigate('/login', { replace: true, state: { expirada: true } })
    })
  }, [navigate])

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password })
    sesion.guardar(data)
    setUsuario(data.usuario)
    return data.usuario
  }, [])

  const logout = useCallback(async () => {
    try {
      // Invalida el refresh token en el servidor (lista negra).
      if (sesion.refresh) await api.post('/auth/logout/', { refresh: sesion.refresh })
    } catch {
      /* aunque falle, la sesión local se cierra igual */
    }
    sesion.limpiar()
    setUsuario(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const actualizarUsuario = useCallback((datos) => {
    const nuevo = { ...sesion.usuario, ...datos }
    sesion.guardar({ usuario: nuevo })
    setUsuario(nuevo)
  }, [])

  const tieneRol = useCallback(
    (...roles) => !!usuario && (usuario.is_superuser || roles.includes(usuario.rol)),
    [usuario],
  )

  return (
    <AuthContext.Provider value={{ usuario, login, logout, tieneRol, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export const ADMIN = 'ADMINISTRADOR'
export const RECEPCION = 'RECEPCIONISTA'
export const ENTRENADOR = 'ENTRENADOR'
