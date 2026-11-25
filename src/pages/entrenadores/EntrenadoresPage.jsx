import { Link } from 'react-router-dom'
import { FilaVacia } from '../../components/ui'
import { ADMIN, useAuth } from '../../context/AuthContext'
import useLista from '../../hooks/useLista'
import css from '../../utils/css'

export default function EntrenadoresPage() {
  const { tieneRol } = useAuth()
  const lista = useLista('/entrenadores/')

  return (
    <>
      <div className="ios-page-header">
        <div>
          <h2 className="ios-title">Entrenadores 🏃‍♂️</h2>
          <p className="ios-subtitle">Personal de entrenamiento y sus socios asignados.</p>
        </div>
      </div>
      <div className="ios-table-container">
        <div style={css('overflow-x: auto;')}>
          <table className="ios-table">
            <thead><tr><th>Nombre</th><th>RUT</th><th>Especialidad</th><th>Socios Asignados</th><th style={css('text-align: right;')}>Acciones</th></tr></thead>
            <tbody>
              {lista.datos.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.first_name} {e.last_name}</strong></td>
                  <td style={css('color: var(--ios-subtext);')}>{e.rut}</td>
                  <td>{e.especialidad || <span style={css('color: var(--ios-muted);')}>Sin especificar</span>}</td>
                  <td><span className="ios-badge blue">{e.total_activos} activo{e.total_activos === 1 ? '' : 's'}</span></td>
                  <td style={css('text-align: right;')}>
                    <Link to={`/entrenadores/${e.id}`} className="btn-ios-link">Ver Ficha</Link>
                    {tieneRol(ADMIN) && <Link to={`/entrenadores/${e.id}/editar`} className="btn-ios-link" style={css('color: var(--ios-subtext);')}>Editar</Link>}
                  </td>
                </tr>
              ))}
              {!lista.cargando && lista.datos.length === 0 && (
                <FilaVacia columnas={5}>No hay trabajadores con rol "Entrenador" registrados todavía. Puedes crear uno desde "Trabajadores" y aparecerá aquí automáticamente.</FilaVacia>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
