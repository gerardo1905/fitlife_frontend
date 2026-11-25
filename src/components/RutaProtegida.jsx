import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SinPermisoPage from '../pages/SinPermisoPage'

/** Bloquea rutas sin sesión o sin el rol requerido (la API vuelve a validar cada permiso). */
export default function RutaProtegida({ roles }) {
  const { usuario, tieneRol } = useAuth()
  const location = useLocation()
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  if (roles && !tieneRol(...roles)) return <SinPermisoPage />
  return <Outlet />
}
