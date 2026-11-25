import { Link } from 'react-router-dom'
import { ADMIN, useAuth } from '../../context/AuthContext'
import useLista from '../../hooks/useLista'
import css from '../../utils/css'

export default function ActividadesPage() {
  const { tieneRol } = useAuth()
  const esAdmin = tieneRol(ADMIN)
  const actividades = useLista('/tipos-clase/')
  const salas = useLista('/salas/')

  return (
    <>
      <div className="ios-page-header">
        <div>
          <h2 className="ios-title">Actividades y Salas 🧘‍♀️</h2>
          <p className="ios-subtitle">Catálogo de clases grupales y espacios físicos del gimnasio.</p>
        </div>
        {esAdmin && (
          <div style={css('display: flex; gap: 0.75rem;')}>
            <Link to="/salas/nueva" className="btn-ios-primary">+ Nueva Sala</Link>
            <Link to="/actividades/nueva" className="btn-ios-primary">+ Nueva Actividad</Link>
          </div>
        )}
      </div>

      {/* Sección 1: Tipos de Clase */}
      <div className="ios-card" style={css('margin-bottom: 1.5rem; padding: 1.5rem;')}>
        <h3 style={css('font-size: 1.1rem; font-weight: 700; color: var(--ios-text); margin-bottom: 1rem;')}>Tipos de Clase</h3>
        <div className="ios-table-container">
          <table className="ios-table">
            <thead><tr><th>Actividad</th><th>Duración</th><th>Descripción</th><th>Estado</th></tr></thead>
            <tbody>
              {actividades.datos.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.nombre}</strong></td>
                  <td style={css('color: var(--ios-subtext);')}>{a.duracion_minutos} Minutos</td>
                  <td style={css('color: var(--ios-subtext); font-size: 0.85rem;')}>{a.descripcion || 'Sin descripción'}</td>
                  <td>{a.activa ? <span className="ios-badge green">Activa</span> : <span className="ios-badge red">Inactiva</span>}</td>
                </tr>
              ))}
              {!actividades.cargando && actividades.datos.length === 0 && (
                <tr><td colSpan={4} style={css('text-align: center; color: var(--ios-muted); padding: 1.5rem;')}>No hay actividades creadas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección 2: Salas de Entrenamiento */}
      <div className="ios-card" style={css('padding: 1.5rem;')}>
        <h3 style={css('font-size: 1.1rem; font-weight: 700; color: var(--ios-text); margin-bottom: 1rem;')}>Salas e Instalaciones</h3>
        <div className="ios-table-container">
          <table className="ios-table">
            <thead><tr><th>Nombre de Sala</th><th>Ubicación</th><th>Capacidad Máxima</th><th>Estado</th></tr></thead>
            <tbody>
              {salas.datos.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.nombre}</strong></td>
                  <td style={css('color: var(--ios-subtext);')}>{s.ubicacion}</td>
                  <td style={css('font-weight: 600;')}>{s.capacidad_maxima} Personas</td>
                  <td>{s.activa ? <span className="ios-badge green">Disponible</span> : <span className="ios-badge red">Fuera de servicio</span>}</td>
                </tr>
              ))}
              {!salas.cargando && salas.datos.length === 0 && (
                <tr><td colSpan={4} style={css('text-align: center; color: var(--ios-muted); padding: 1.5rem;')}>No hay salas registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
