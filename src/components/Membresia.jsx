import { useState } from 'react'
import { Link } from 'react-router-dom'
import api, { mensajeError } from '../api/client'
import { ADMIN, useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import css from '../utils/css'
import { formatoFecha, hoyISO } from '../utils/format'

/** Igual que templates/membresias/_estado_badge.html */
export function EstadoMembresia({ m }) {
  if (m.estado === 'ACTIVA' && m.fecha_inicio > hoyISO()) {
    return <span className="ios-badge blue">Pagada · inicia {formatoFecha(m.fecha_inicio).slice(0, 5)}</span>
  }
  if (m.estado === 'ACTIVA') return <span className="ios-badge green">Activa</span>
  if (m.estado === 'PENDIENTE') return <span className="ios-badge amber">Pendiente de pago</span>
  if (m.estado === 'CONGELADA') return <span className="ios-badge amber">Congelada</span>
  if (m.estado === 'VENCIDA') return <span className="ios-badge red">Vencida</span>
  return <span className="ios-badge red">Cancelada</span>
}

/**
 * Acciones de una membresía (como en la lista y la ficha del socio originales).
 * conQr: muestra "Ver QR" y "Enviar QR" (solo en la ficha del socio).
 */
export function AccionesMembresia({ m, onCambio, conQr = false }) {
  const { tieneRol } = useAuth()
  const toast = useToast()
  const [ocupado, setOcupado] = useState(false)
  const esAdmin = tieneRol(ADMIN)

  async function ejecutar(fn) {
    setOcupado(true)
    try { await fn(); onCambio?.() } catch (e) { toast.error(mensajeError(e)) } finally { setOcupado(false) }
  }

  const cambiar = (estado, confirmacion) => {
    if (confirmacion && !window.confirm(confirmacion)) return
    ejecutar(async () => {
      const { data } = await api.post(`/membresias/${m.id}/cambiar-estado/`, { estado })
      const nombre = data.socio_nombre
      if (estado === 'CONGELADA') toast.exito(`Membresía de ${nombre} congelada. Los días congelados se le devolverán al reactivarla.`)
      else if (estado === 'ACTIVA') toast.exito(`Membresía de ${nombre} reactivada. Nueva fecha de término: ${data.fecha_fin.split('-').reverse().join('/')}.`)
      else toast.exito(`Membresía de ${nombre} cancelada.`)
    })
  }

  async function verQr() {
    try {
      const { data } = await api.get(`/membresias/${m.id}/qr/`)
      window.open(data.url, '_blank', 'noopener')
    } catch (e) { toast.error(mensajeError(e)) }
  }

  const enviarQr = () => ejecutar(async () => {
    try {
      const { data } = await api.post(`/membresias/${m.id}/enviar-qr/`)
      toast.exito(data.detail)
    } catch (e) {
      if (e.response?.data?.detail) toast.aviso(e.response.data.detail)
      else throw e
    }
  })

  const vigenteOCongelada = m.estado === 'ACTIVA' || m.estado === 'CONGELADA'

  return (
    <>
      {m.estado === 'PENDIENTE' && (
        <Link to={`/membresias/${m.id}/pago`} className="btn-ios-link" style={css('color: #059669;')}>Registrar pago</Link>
      )}
      {conQr && vigenteOCongelada && (
        <>
          <button type="button" className="btn-ios-link" onClick={verQr}>Ver QR</button>
          <button type="button" className="btn-ios-link" onClick={enviarQr} disabled={ocupado}>{m.qr_enviado ? 'Reenviar QR' : 'Enviar QR'}</button>
        </>
      )}
      {m.estado === 'ACTIVA' && (
        <button type="button" className="btn-ios-link" style={css('color: #d97706;')} disabled={ocupado}
                onClick={() => cambiar('CONGELADA', '¿Congelar esta membresía? Los días congelados se devolverán al reactivarla.')}>Congelar</button>
      )}
      {m.estado === 'CONGELADA' && (
        <button type="button" className="btn-ios-link" style={css('color: #2563eb;')} disabled={ocupado} onClick={() => cambiar('ACTIVA')}>Reactivar</button>
      )}
      {(m.estado === 'PENDIENTE' || (esAdmin && vigenteOCongelada)) && (
        <button type="button" className="btn-ios-link" style={css('color: #dc2626;')} disabled={ocupado}
                onClick={() => cambiar('CANCELADA', '¿Cancelar esta membresía? Esta acción no se puede deshacer.')}>Cancelar</button>
      )}
    </>
  )
}
