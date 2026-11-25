import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { mensajeError } from '../../api/client'
import { Cargando, ErrorFormulario, SelectorSocio } from '../../components/ui'
import { ADMIN, useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import css from '../../utils/css'
import { formatoFecha, formatoTelefonoMostrar } from '../../utils/format'

const titulo = css('font-size: 1.05rem; font-weight: 700; color: var(--ios-text); margin-bottom: 1rem;')
const separador = (i, total) => (i < total - 1 ? 'border-bottom: 1px solid var(--ios-separator);' : '')

export default function EntrenadorDetallePage() {
  const { id } = useParams()
  const { tieneRol } = useAuth()
  const toast = useToast()
  const [entrenador, setEntrenador] = useState(null)
  const [asignaciones, setAsignaciones] = useState([])
  const [socio, setSocio] = useState(null)
  const [errorSocio, setErrorSocio] = useState(null)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    try {
      const [e, a] = await Promise.all([api.get(`/entrenadores/${id}/`), api.get('/asignaciones/', { params: { entrenador: id } })])
      setEntrenador(e.data)
      setAsignaciones(a.data.results)
    } catch (err) { setError(mensajeError(err)) }
  }, [id])

  useEffect(() => { cargar() }, [cargar])

  async function asignar(e) {
    e.preventDefault()
    if (!socio) { setErrorSocio('Seleccione un socio.'); return }
    try {
      const { data } = await api.post('/asignaciones/', { socio, entrenador: id })
      toast.exito(`${data.socio_nombre} fue asignado(a) a ${data.entrenador_nombre}.`)
      setSocio(null); setErrorSocio(null)
      cargar()
    } catch (err) { setErrorSocio(mensajeError(err)) }
  }

  async function finalizar(a) {
    if (!window.confirm(`¿Finalizar la asignación de ${a.socio_nombre}?`)) return
    try {
      await api.post(`/asignaciones/${a.id}/finalizar/`)
      toast.info(`Asignación de ${a.socio_nombre} finalizada.`)
      cargar()
    } catch (err) { toast.error(mensajeError(err)) }
  }

  if (error) return <ErrorFormulario mensaje={error} />
  if (!entrenador) return <Cargando />
  const activas = asignaciones.filter((a) => a.activa)
  const historial = asignaciones.filter((a) => !a.activa)

  return (
    <>
      <div className="ios-page-header">
        <div>
          <h2 className="ios-title">{entrenador.first_name} {entrenador.last_name} 🏃‍♂️</h2>
          <p className="ios-subtitle">{entrenador.especialidad || 'Sin especialidad registrada'} · RUT {entrenador.rut}</p>
        </div>
        <div style={css('display: flex; gap: 0.75rem;')}>
          {tieneRol(ADMIN) && <Link to={`/entrenadores/${entrenador.id}/editar`} className="btn-ios-secondary">Editar Especialidad</Link>}
          <Link to="/entrenadores" className="btn-ios-secondary">← Volver</Link>
        </div>
      </div>

      {/* Datos del entrenador */}
      <div className="ios-card">
        <div style={css('display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid var(--ios-separator);')}>
          <span style={css('color: var(--ios-subtext);')}>Correo</span>
          <span style={css('font-weight: 600;')}>{entrenador.email || '—'}</span>
        </div>
        <div style={css('display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0;')}>
          <span style={css('color: var(--ios-subtext);')}>Teléfono</span>
          <span style={css('font-weight: 600;')}>{formatoTelefonoMostrar(entrenador.telefono)}</span>
        </div>
      </div>

      {/* Asignar nuevo socio */}
      <div className="ios-card">
        <h3 style={titulo}>Asignar Socio</h3>
        <form onSubmit={asignar} style={css('display: flex; gap: 0.75rem; align-items: flex-start;')}>
          <div style={css('flex: 1;')}>
            <SelectorSocio valor={socio} onChange={(v) => { setSocio(v); setErrorSocio(null) }} error={errorSocio} filtros={{ activo: 'true' }} />
            {errorSocio && <span className="field-error">{errorSocio}</span>}
          </div>
          <button type="submit" className="btn-ios-primary">+ Asignar</button>
        </form>
      </div>

      {/* Asignaciones activas */}
      <div className="ios-card">
        <h3 style={titulo}>Socios Asignados Actualmente</h3>
        {activas.length ? activas.map((a, i) => (
          <div key={a.id} style={css(`display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; ${separador(i, activas.length)}`)}>
            <div>
              <div style={css('font-weight: 600;')}>{a.socio_nombre}</div>
              <div style={css('font-size: 0.82rem; color: var(--ios-muted);')}>Desde {formatoFecha(a.fecha_inicio)}</div>
            </div>
            <button type="button" className="btn-ios-link" style={css('color: var(--ios-red);')} onClick={() => finalizar(a)}>Finalizar</button>
          </div>
        )) : (
          <p style={css('color: var(--ios-muted); text-align: center; padding: 1.5rem 0;')}>Este entrenador no tiene socios asignados actualmente.</p>
        )}
      </div>

      {/* Historial */}
      {historial.length > 0 && (
        <div className="ios-card">
          <h3 style={titulo}>Historial de Asignaciones</h3>
          {historial.map((a, i) => (
            <div key={a.id} style={css(`display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; ${separador(i, historial.length)}`)}>
              <div style={css('color: var(--ios-subtext);')}>{a.socio_nombre}</div>
              <div style={css('font-size: 0.82rem; color: var(--ios-muted);')}>{formatoFecha(a.fecha_inicio)} — {formatoFecha(a.fecha_fin)}</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
