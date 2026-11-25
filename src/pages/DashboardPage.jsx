import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { mensajeError } from '../api/client'
import { Cargando, ErrorFormulario } from '../components/ui'
import css from '../utils/css'
import { fechaLarga, formatoHora, horaDe, miles } from '../utils/format'

const etiqueta = css('font-size: 0.8rem; font-weight: 700; color: var(--ios-muted); text-transform: uppercase; letter-spacing: 0.05em;')
const filaKpi = css('display: flex; align-items: baseline; justify-content: space-between; margin-top: 0.4rem;')

export default function DashboardPage() {
  const [d, setD] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/dashboard/').then(({ data }) => setD(data)).catch((e) => setError(mensajeError(e)))
  }, [])

  if (error) return <ErrorFormulario mensaje={error} />
  if (!d) return <Cargando />

  return (
    <>
      <div className="ios-page-header">
        <div>
          <h2 className="ios-title">Panel de Control 🏋️‍♂️</h2>
          <p className="ios-subtitle">Resumen operativo y métricas en tiempo real — {fechaLarga(d.hoy)}</p>
        </div>
        <div style={css('display: flex; gap: 0.75rem;')}>
          <Link to="/acceso" className="btn-ios-primary">⚡ Torniquete / Acceso</Link>
        </div>
      </div>

      {/* Tarjetas KPI Estilo iOS */}
      <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;')}>
        <div className="ios-card" style={css('padding: 1.25rem; margin-bottom: 0;')}>
          <span style={etiqueta}>Aforo Actual</span>
          <div style={filaKpi}>
            <span style={css('font-size: 2rem; font-weight: 800; color: var(--ios-blue);')}>{d.aforo_actual}</span>
            <span className="ios-badge blue">En gimnasio</span>
          </div>
        </div>
        <div className="ios-card" style={css('padding: 1.25rem; margin-bottom: 0;')}>
          <span style={etiqueta}>Socios Activos</span>
          <div style={filaKpi}>
            <span style={css('font-size: 2rem; font-weight: 800; color: var(--ios-text);')}>{d.total_socios_activos}</span>
            <span className="ios-badge green">Registrados</span>
          </div>
        </div>
        <div className="ios-card" style={css('padding: 1.25rem; margin-bottom: 0;')}>
          <span style={etiqueta}>Membresías Vigentes</span>
          <div style={filaKpi}>
            <span style={css('font-size: 2rem; font-weight: 800; color: var(--ios-text);')}>{d.membresias_activas}</span>
            <span className="ios-badge green">Al día</span>
          </div>
        </div>
        <div className="ios-card" style={css('padding: 1.25rem; margin-bottom: 0;')}>
          <span style={etiqueta}>Ingresos de Hoy</span>
          <div style={filaKpi}>
            <span style={css('font-size: 1.6rem; font-weight: 800; color: #166534;')}>${miles(d.ingresos_hoy)}</span>
            <span className="ios-badge green">Caja</span>
          </div>
        </div>
      </div>

      {/* Tablas de Actividad Reciente y Clases del Día */}
      <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem;')}>
        <div className="ios-card" style={css('padding: 1.5rem;')}>
          <div style={css('display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;')}>
            <h3 style={css('font-size: 1.1rem; font-weight: 700; color: var(--ios-text);')}>Clases del Día 📅</h3>
            <Link to="/clases" className="btn-ios-link">Ver todas →</Link>
          </div>
          <div className="ios-table-container">
            <table className="ios-table">
              <thead><tr><th>Actividad</th><th>Horario</th><th>Sala</th><th>Cupos</th></tr></thead>
              <tbody>
                {d.clases_hoy.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.tipo_clase_nombre}</strong></td>
                    <td style={css('color: var(--ios-subtext);')}>{formatoHora(c.hora_inicio)} hrs</td>
                    <td style={css('color: var(--ios-subtext);')}>{c.sala_nombre}</td>
                    <td><span className="ios-badge blue">{c.inscritos_confirmados}/{c.cupo_maximo}</span></td>
                  </tr>
                ))}
                {d.clases_hoy.length === 0 && (
                  <tr><td colSpan={4} style={css('text-align: center; color: var(--ios-muted); padding: 1.5rem;')}>No hay clases agendadas para hoy.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="ios-card" style={css('padding: 1.5rem;')}>
          <div style={css('display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;')}>
            <h3 style={css('font-size: 1.1rem; font-weight: 700; color: var(--ios-text);')}>Accesos Recientes ⚡</h3>
            <Link to="/acceso" className="btn-ios-link">Ir a Torniquete →</Link>
          </div>
          <div className="ios-table-container">
            <table className="ios-table">
              <thead><tr><th>Socio</th><th>Hora</th><th>Estado</th></tr></thead>
              <tbody>
                {d.ultimos_accesos.map((a) => (
                  <tr key={a.id}>
                    <td><strong>{a.socio_nombre}</strong></td>
                    <td style={css('color: var(--ios-subtext);')}>{horaDe(a.fecha_hora_ingreso, true)}</td>
                    <td>{a.permitido ? <span className="ios-badge green">Permitido</span> : <span className="ios-badge red">Rechazado</span>}</td>
                  </tr>
                ))}
                {d.ultimos_accesos.length === 0 && (
                  <tr><td colSpan={3} style={css('text-align: center; color: var(--ios-muted); padding: 1.5rem;')}>Sin registro de accesos hoy.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
