import axios from 'axios'

/**
 * Cliente HTTP único para hablar con la API (vía API Gateway en AWS).
 * - Agrega el token JWT de acceso en cada solicitud.
 * - Si el token venció (401), pide uno nuevo con el refresh token UNA vez
 *   y reintenta; si eso falla, cierra la sesión.
 *
 * Los tokens se guardan en sessionStorage: se borran al cerrar la pestaña
 * y no se envían automáticamente como las cookies (sin riesgo de CSRF).
 */
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')

const CLAVE_ACCESS = 'fitlife_access'
const CLAVE_REFRESH = 'fitlife_refresh'
const CLAVE_USUARIO = 'fitlife_usuario'

export const sesion = {
  get access() { return sessionStorage.getItem(CLAVE_ACCESS) },
  get refresh() { return sessionStorage.getItem(CLAVE_REFRESH) },
  get usuario() {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_USUARIO)) } catch { return null }
  },
  guardar({ access, refresh, usuario }) {
    if (access) sessionStorage.setItem(CLAVE_ACCESS, access)
    if (refresh) sessionStorage.setItem(CLAVE_REFRESH, refresh)
    if (usuario) sessionStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario))
  },
  limpiar() {
    sessionStorage.removeItem(CLAVE_ACCESS)
    sessionStorage.removeItem(CLAVE_REFRESH)
    sessionStorage.removeItem(CLAVE_USUARIO)
  },
}

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

api.interceptors.request.use((config) => {
  if (sesion.access) config.headers.Authorization = `Bearer ${sesion.access}`
  return config
})

let refrescando = null
let alExpirarSesion = () => {}
export const onSesionExpirada = (fn) => { alExpirarSesion = fn }

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    const esAuth = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/refresh')
    if (error.response?.status === 401 && !original._reintento && !esAuth && sesion.refresh) {
      original._reintento = true
      try {
        refrescando = refrescando || axios.post(`${API_URL}/auth/refresh/`, { refresh: sesion.refresh })
        const { data } = await refrescando
        sesion.guardar(data) // con ROTATE_REFRESH_TOKENS llega también un refresh nuevo
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch (e) {
        sesion.limpiar()
        alExpirarSesion()
        return Promise.reject(e)
      } finally {
        refrescando = null
      }
    }
    return Promise.reject(error)
  },
)

/** Convierte cualquier error de la API en un texto legible para mostrar. */
export function mensajeError(error) {
  const r = error?.response
  if (!r) return 'No se pudo conectar con el servidor. Revise su conexión.'
  if (r.status === 429) return 'Demasiadas solicitudes. Espere unos segundos e intente de nuevo.'
  const d = r.data
  if (typeof d === 'string') return `Error ${r.status}`
  if (d?.detail) return d.detail
  if (d?.non_field_errors) return d.non_field_errors.join(' ')
  if (d && typeof d === 'object') {
    const [campo, msgs] = Object.entries(d)[0] || []
    if (campo) return `${campo}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`
  }
  return `Error ${r.status}`
}

/** Errores por campo de un 400 de DRF: { campo: 'mensaje' } */
export function erroresCampos(error) {
  const d = error?.response?.status === 400 ? error.response.data : null
  if (!d || typeof d !== 'object') return {}
  const salida = {}
  for (const [k, v] of Object.entries(d)) salida[k] = Array.isArray(v) ? v.join(' ') : String(v)
  return salida
}

export default api
