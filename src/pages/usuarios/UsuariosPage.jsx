import { Link } from 'react-router-dom'
import { FilaVacia, Paginacion } from '../../components/ui'
import useLista from '../../hooks/useLista'
import css from '../../utils/css'

export default function UsuariosPage() {
  const lista = useLista('/usuarios/')
  return (
    <>
      <div className="ios-page-header">
        <div>
          <h2 className="ios-title">Personal del Gimnasio 👥</h2>
          <p className="ios-subtitle">Cuentas activas y permisos de acceso para trabajadores.</p>
        </div>
        <Link to="/trabajadores/nuevo" className="btn-ios-primary">+ Registrar Trabajador</Link>
      </div>
      <div className="ios-table-container">
        <div style={css('overflow-x: auto;')}>
          <table className="ios-table">
            <thead><tr><th>Usuario</th><th>RUT</th><th>Nombre Completo</th><th>Correo</th><th>Rol</th><th>Estado</th><th style={css('text-align: right;')}>Acciones</th></tr></thead>
            <tbody>
              {lista.datos.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.username}</strong></td>
                  <td style={css('color: var(--ios-subtext);')}>{u.rut}</td>
                  <td>{u.first_name} {u.last_name}</td>
                  <td style={css('color: var(--ios-subtext);')}>{u.email}</td>
                  <td><span className="ios-badge blue">{u.rol_display}</span></td>
                  <td>{u.is_active ? <span className="ios-badge green">Activo</span> : <span className="ios-badge red">Inactivo</span>}</td>
                  <td style={css('text-align: right;')}>
                    <Link to={`/trabajadores/${u.id}/editar`} className="btn-ios-link">Editar</Link>
                    <Link to={`/trabajadores/${u.id}/password`} className="btn-ios-link" style={css('color: var(--ios-subtext);')}>Contraseña</Link>
                  </td>
                </tr>
              ))}
              {!lista.cargando && lista.datos.length === 0 && <FilaVacia columnas={7}>No hay trabajadores registrados en la plataforma.</FilaVacia>}
            </tbody>
          </table>
        </div>
        <Paginacion {...lista} />
      </div>
    </>
  )
}
