import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { mensajeError } from '../../api/client'
import { Cargando, ErrorFormulario, SelectorSocio } from '../../components/ui'
import { ADMIN, RECEPCION, useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import css from '../../utils/css'
import { formatoFecha, formatoFechaHora, formatoHora } from '../../utils/format'

const enlaceSocio = css('color: var(--ios-text); font-weight: 600; text-decoration: none;')

export default function SesionDetallePage() {
  const { id } = useParams()
  const { usuario, tieneRol } = useAuth()
  const toast = useToast()
  const [sesion, setSesion] = useState(null)
  const [todos, setTodos] = useState([])
  const [socio, setSocio] = useState(null)
  const [error, setError] = useState(null)
  const esStaff = tieneRol(ADMIN, RECEPCION)

  const cargar = useCallback(async () => {
    try {
      const [s, i] = await Promise.all([api.get(`/sesiones/${id}/`), api.get(`/sesiones/${id}/inscritos/`)])
      setSesion(s.data)
      setTodos(i.data)
    } catch (e) { setError(mensajeError(e)) }
  }, [id])

  useEffect(() => { cargar() }, [cargar])

  async function inscribir(e) {
    e.preventDefault()
    if (!socio) { toast.error('Seleccione un socio.'); return }
    try {
      const { data } = await api.post('/inscripciones/', { socio, sesion: id })
      if (data.en_espera) {
        const posicion = todos.filter((x) => x.en_espera).length + 1
        toast.info(`Clase completa: ${data.socio_nombre} fue agregado a la LISTA DE ESPERA en la posición N°${posicion}. Se le asignará un cupo automáticamente si alguien cancela su inscripción.`)
      } else {
        toast.exito(`Socio ${data.socio_nombre} inscrito exitosamente en ${sesion.tipo_clase_nombre}.`)
      }
      setSocio(null)
      cargar()
    } catch (err) { toast.error(`Rechazado: ${mensajeError(err)}`) }
  }

  async function accion(fn) {
    try {
      const { data } = await fn()
      if (data?.detail) toast.info(data.detail)
      else if (data?.socio_nombre) toast.exito(`Asistencia de ${data.socio_nombre} actualizada a '${data.asistio ? 'Asistió' : 'Ausente'}'.`)
      cargar()
    } catch (e) { toast.error(mensajeError(e)) }
  }

  if (error) return <ErrorFormulario mensaje={error} />
  if (!sesion) return <Cargando />

  const inscritos = todos.filter((x) => !x.en_espera)
  const listaEspera = todos.filter((x) => x.en_espera)
  const cuposDisponibles = sesion.cupo_maximo - inscritos.length
  const puedeAsistencia = esStaff || sesion.entrenador === usuario.id

  return (
    <div style={css('max-width: 800px; margin: 0 auto;')}>
      <div style={css('display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;')}>
        <div>
          <h2 className="ios-title">{sesion.tipo_clase_nombre}</h2>
          <p className="ios-subtitle">{formatoFecha(sesion.fecha)} — De {formatoHora(sesion.hora_inicio)} a {formatoHora(sesion.hora_fin)} hrs | {sesion.sala_nombre}</p>
        </div>
        <Link to="/clases" className="btn-ios-secondary">← Volver al Calendario</Link>
      </div>

      {/* Indicador de Ocupacion de Cupos */}
      <div className="ios-card" style={css('margin-bottom: 1.5rem; padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center;')}>
        <div>
          <span style={css('font-size: 0.85rem; color: var(--ios-subtext); display: block; font-weight: 600;')}>Estado de Ocupación</span>
          <strong style={css('font-size: 1.2rem; color: var(--ios-text);')}>{inscritos.length} inscritos de {sesion.cupo_maximo} cupos</strong>
        </div>
        <div>
          {cuposDisponibles > 0
            ? <span className="ios-badge green" style={css('font-size: 0.9rem; padding: 0.4rem 0.8rem;')}>🟢 {cuposDisponibles} Cupos Disponibles</span>
            : <span className="ios-badge red" style={css('font-size: 0.9rem; padding: 0.4rem 0.8rem;')}>🔴 Clase Completa</span>}
        </div>
      </div>

      {/* Formulario de Inscripcion (si no hay cupo, inscribe en Lista de Espera) */}
      {sesion.estado === 'PROGRAMADA' && (
        <div className="ios-card" style={css('margin-bottom: 1.5rem; padding: 1.5rem;')}>
          <h3 style={css('font-size: 1rem; font-weight: 700; color: var(--ios-text); margin-bottom: 1rem;')}>
            {cuposDisponibles > 0 ? 'Inscribir Socio a esta Sesión' : 'Agregar Socio a la Lista de Espera'}
          </h3>
          <form onSubmit={inscribir} style={css('display: flex; gap: 0.75rem; align-items: flex-end;')}>
            <div style={css('flex: 1;')}>
              <label style={css('font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 0.35rem;')}>Socio con Membresía Activa</label>
              <SelectorSocio valor={socio} onChange={setSocio} filtros={{ con_membresia_vigente: 'true' }}
                             vacio="No hay socios con membresía activa que coincidan." />
            </div>
            <button type="submit" className="btn-ios-primary">{cuposDisponibles > 0 ? 'Confirmar Cupo' : 'Unirse a Lista de Espera'}</button>
          </form>
        </div>
      )}

      {/* Lista de Socios Inscritos */}
      <div className="ios-card" style={css('padding: 1.5rem;')}>
        <h3 style={css('font-size: 1.1rem; font-weight: 700; color: var(--ios-text); margin-bottom: 1rem;')}>Lista de Asistencia 📝</h3>
        <div className="ios-table-container">
          <table className="ios-table">
            <thead><tr><th>Socio</th><th>RUT</th><th>Fecha Inscripción</th><th>Asistencia</th><th style={css('text-align: right;')}>Acciones</th></tr></thead>
            <tbody>
              {inscritos.map((item) => (
                <tr key={item.id}>
                  <td><Link to={`/socios/${item.socio}`} style={enlaceSocio}>{item.socio_nombre}</Link></td>
                  <td style={css('color: var(--ios-subtext);')}>{item.socio_rut}</td>
                  <td style={css('color: var(--ios-subtext); font-size: 0.85rem;')}>{formatoFechaHora(item.fecha_inscripcion)}</td>
                  <td>{item.asistio ? <span className="ios-badge green">Asistió</span> : <span className="ios-badge amber">Pendiente</span>}</td>
                  <td style={css('text-align: right;')}>
                    {puedeAsistencia && (
                      <button type="button" className="btn-ios-link" style={css('color: var(--ios-blue);')}
                              onClick={() => accion(() => api.post(`/inscripciones/${item.id}/asistencia/`))}>
                        {item.asistio ? 'Marcar Ausente' : 'Marcar Presente'}
                      </button>
                    )}
                    {esStaff && (
                      <button type="button" className="btn-ios-link" style={css('color: var(--ios-red);')}
                              onClick={() => accion(() => api.delete(`/inscripciones/${item.id}/`))}>Liberar Cupo</button>
                    )}
                  </td>
                </tr>
              ))}
              {inscritos.length === 0 && (
                <tr><td colSpan={5} style={css('text-align: center; color: var(--ios-muted); padding: 2rem;')}>Aún no hay socios inscritos en esta clase.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lista de Espera */}
      <div className="ios-card" style={css('padding: 1.5rem; margin-top: 1.5rem;')}>
        <h3 style={css('font-size: 1.1rem; font-weight: 700; color: var(--ios-text); margin-bottom: 1rem;')}>Lista de Espera ⏳ ({listaEspera.length})</h3>
        <div className="ios-table-container">
          <table className="ios-table">
            <thead><tr><th>Posición</th><th>Socio</th><th>RUT</th><th>Fecha de Registro en Espera</th><th style={css('text-align: right;')}>Acciones</th></tr></thead>
            <tbody>
              {listaEspera.map((item, n) => (
                <tr key={item.id}>
                  <td style={css('font-weight: 700; color: var(--ios-blue);')}>#{n + 1}</td>
                  <td><Link to={`/socios/${item.socio}`} style={enlaceSocio}>{item.socio_nombre}</Link></td>
                  <td style={css('color: var(--ios-subtext);')}>{item.socio_rut}</td>
                  <td style={css('color: var(--ios-subtext); font-size: 0.85rem;')}>{formatoFechaHora(item.fecha_inscripcion)}</td>
                  <td style={css('text-align: right;')}>
                    {esStaff && (
                      <button type="button" className="btn-ios-link" style={css('color: var(--ios-red);')}
                              onClick={() => accion(() => api.delete(`/inscripciones/${item.id}/`))}>Quitar de la Espera</button>
                    )}
                  </td>
                </tr>
              ))}
              {listaEspera.length === 0 && (
                <tr><td colSpan={5} style={css('text-align: center; color: var(--ios-muted); padding: 2rem;')}>No hay socios en lista de espera.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
