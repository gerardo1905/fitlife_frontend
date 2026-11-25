const pesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

export const formatoPesos = (v) => (v === null || v === undefined || v === '' ? '—' : pesos.format(Number(v)))

/** 'YYYY-MM-DD' -> 'DD/MM/YYYY' sin pasar por Date (evita desfases de zona horaria). */
export function formatoFecha(iso) {
  if (!iso) return '—'
  const [a, m, d] = String(iso).slice(0, 10).split('-')
  return `${d}/${m}/${a}`
}

export function formatoFechaHora(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })
}

export const formatoHora = (h) => (h ? String(h).slice(0, 5) : '—')

export function hoyISO() {
  const d = new Date()
  const z = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}

/** Suma días a una fecha ISO y devuelve ISO. */
export function sumarDias(iso, dias) {
  const [a, m, d] = iso.split('-').map(Number)
  const f = new Date(a, m - 1, d + dias)
  const z = (n) => String(n).padStart(2, '0')
  return `${f.getFullYear()}-${z(f.getMonth() + 1)}-${z(f.getDate())}`
}

// ======================= MÁSCARAS DE ENTRADA =======================

/** Formatea un RUT mientras se escribe: 123456785 -> 12.345.678-5 */
export function mascaraRut(valor) {
  const limpio = String(valor || '').replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9)
  if (limpio.length <= 1) return limpio
  const cuerpo = limpio.slice(0, -1).replace(/K/g, '')
  const dv = limpio.slice(-1)
  const conPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${conPuntos}-${dv}`
}

/** Valida el dígito verificador (módulo 11) para avisar antes de enviar. */
export function rutValido(valor) {
  const limpio = String(valor || '').replace(/[^0-9kK]/g, '').toUpperCase()
  if (limpio.length < 8 || limpio.length > 9) return false
  const cuerpo = limpio.slice(0, -1)
  if (!/^\d+$/.test(cuerpo)) return false
  let suma = 0
  let mult = 2
  for (let i = cuerpo.length - 1; i >= 0; i -= 1) {
    suma += Number(cuerpo[i]) * mult
    mult = mult === 7 ? 2 : mult + 1
  }
  const resto = 11 - (suma % 11)
  const dv = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto)
  return dv === limpio.slice(-1)
}

/** Teléfono chileno mientras se escribe: 912345678 -> +56 9 1234 5678 */
export function mascaraTelefono(valor) {
  let d = String(valor || '').replace(/\D/g, '')
  if (d.startsWith('56')) d = d.slice(2)
  d = d.slice(0, 9)
  if (!d) return ''
  const partes = [d.slice(0, 1), d.slice(1, 5), d.slice(5, 9)].filter(Boolean)
  return `+56 ${partes.join(' ')}`
}

export const telefonoValido = (valor) => String(valor || '').replace(/\D/g, '').replace(/^56/, '').length === 9

/** Solo letras y espacios; al salir del campo queda con Mayúscula Inicial. */
export const soloLetras = (valor) => String(valor || '').replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]/g, '').replace(/\s{2,}/g, ' ')

export const capitalizar = (valor) =>
  soloLetras(valor).trim().toLowerCase().replace(/(^|[\s'-])(\p{L})/gu, (m, sep, letra) => sep + letra.toUpperCase())

/** Montos en pesos: solo dígitos. */
export const soloDigitos = (valor) => String(valor || '').replace(/\D/g, '')

export function formatoTelefonoMostrar(valor) {
  return valor ? mascaraTelefono(valor) : '—'
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** '2026-11-25' -> '25 de noviembre, 2026' (como el filtro date de Django usado antes) */
export function fechaLarga(iso) {
  if (!iso) return ''
  const [a, m, d] = String(iso).slice(0, 10).split('-')
  return `${Number(d)} de ${MESES[Number(m) - 1]}, ${a}`
}

/** Hora local HH:MM (o HH:MM:SS) de un datetime ISO de la API. */
export function horaDe(iso, conSegundos = false) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: conSegundos ? '2-digit' : undefined, hour12: false })
}

/** 35000 -> '35.000' */
export const miles = (v) => Number(v || 0).toLocaleString('es-CL', { maximumFractionDigits: 0 })
