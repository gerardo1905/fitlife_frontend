import useLista from '../../hooks/useLista'
import css from '../../utils/css'
import { formatoFecha, formatoTelefonoMostrar } from '../../utils/format'

const separador = (i, total) => (i < total - 1 ? 'border-bottom: 1px solid var(--ios-separator);' : '')

export default function MisSociosPage() {
  const lista = useLista('/asignaciones/')
  const activas = lista.datos.filter((a) => a.activa)
  const historial = lista.datos.filter((a) => !a.activa)

  return (
    <>
      <div className="ios-page-header">
        <div>
          <h2 className="ios-title">Mis Socios Asignados 🏃‍♂️</h2>
          <p className="ios-subtitle">Socios que tienes a cargo actualmente.</p>
        </div>
      </div>
      <div className="ios-card">
        {activas.length ? activas.map((a, i) => (
          <div key={a.id} style={css(`display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; ${separador(i, activas.length)}`)}>
            <div>
              <div style={css('font-weight: 600;')}>{a.socio_nombre}</div>
              <div style={css('font-size: 0.82rem; color: var(--ios-muted);')}>
                Desde {formatoFecha(a.fecha_inicio)}{a.socio_telefono && ` · ${formatoTelefonoMostrar(a.socio_telefono)}`}
              </div>
            </div>
            <span className="ios-badge green">Activo</span>
          </div>
        )) : (
          <p style={css('color: var(--ios-muted); text-align: center; padding: 1.5rem 0;')}>
            {lista.cargando ? 'Cargando…' : 'No tienes socios asignados actualmente.'}
          </p>
        )}
      </div>
      {historial.length > 0 && (
        <div className="ios-card">
          <h3 style={css('font-size: 1.05rem; font-weight: 700; color: var(--ios-text); margin-bottom: 1rem;')}>Historial</h3>
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
