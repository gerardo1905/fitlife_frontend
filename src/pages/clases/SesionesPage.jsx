import { Link } from 'react-router-dom'
import { FilaVacia, Paginacion } from '../../components/ui'
import { ENTRENADOR, useAuth } from '../../context/AuthContext'
import useLista from '../../hooks/useLista'
import css from '../../utils/css'
import { formatoFecha, formatoHora } from '../../utils/format'

export function EstadoSesion({ estado }) {
  if (estado === 'PROGRAMADA') return <span className="ios-badge green">Programada</span>
  if (estado === 'EN_CURSO') return <span className="ios-badge blue">En Curso</span>
  if (estado === 'FINALIZADA') return <span className="ios-badge amber">Finalizada</span>
  return <span className="ios-badge red">Cancelada</span>
}

export default function SesionesPage() {
  const { usuario } = useAuth()
  const esEntrenador = usuario?.rol === ENTRENADOR
  const lista = useLista('/sesiones/')

  return (
    <>
      <div className="ios-page-header">
        <div>
          <h2 className="ios-title">{esEntrenador ? 'Mis Sesiones y Clases 📅' : 'Sesiones de Clase 📅'}</h2>
          <p className="ios-subtitle">
            {esEntrenador ? 'Gestión de clases agendadas, selección de sala y asistencia.' : 'Calendario de clases grupales y reservas de cupos.'}
          </p>
        </div>
        <div style={css('display: flex; gap: 0.75rem;')}>
          <Link to="/actividades" className="btn-ios-secondary">Actividades y Salas</Link>
          <Link to="/clases/nueva" className="btn-ios-primary">+ Programar Clase</Link>
        </div>
      </div>

      <div className="ios-table-container">
        <div style={css('overflow-x: auto;')}>
          <table className="ios-table">
            <thead>
              <tr><th>Actividad</th><th>Fecha y Horario</th><th>Sala</th><th>Entrenador</th><th>Cupos</th><th>Estado</th><th style={css('text-align: right;')}>Acciones</th></tr>
            </thead>
            <tbody>
              {lista.datos.map((s) => (
                <tr key={s.id}>
                  <td><Link to={`/clases/${s.id}`} style={css('color: var(--ios-text); font-weight: 700; text-decoration: none;')}>{s.tipo_clase_nombre}</Link></td>
                  <td>
                    <strong>{formatoFecha(s.fecha)}</strong><br />
                    <span style={css('font-size: 0.825rem; color: var(--ios-subtext);')}>{formatoHora(s.hora_inicio)} - {formatoHora(s.hora_fin)} hrs</span>
                  </td>
                  <td style={css('color: var(--ios-subtext);')}>{s.sala_nombre}</td>
                  <td style={css('color: var(--ios-subtext);')}>{s.entrenador_nombre || <em style={css('color: var(--ios-muted);')}>Por asignar</em>}</td>
                  <td><span className="ios-badge blue">{s.inscritos_confirmados} / {s.cupo_maximo}</span></td>
                  <td><EstadoSesion estado={s.estado} /></td>
                  <td style={css('text-align: right;')}>
                    <Link to={`/clases/${s.id}`} className="btn-ios-link">{esEntrenador ? 'Asistencia / Detalle →' : 'Inscribir / Ver →'}</Link>
                  </td>
                </tr>
              ))}
              {!lista.cargando && lista.datos.length === 0 && <FilaVacia columnas={7}>No existen clases programadas desde hoy en adelante.</FilaVacia>}
            </tbody>
          </table>
        </div>
        <Paginacion {...lista} />
      </div>
    </>
  )
}
