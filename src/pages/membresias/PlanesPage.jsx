import { Link } from 'react-router-dom'
import { FilaVacia } from '../../components/ui'
import { ADMIN, useAuth } from '../../context/AuthContext'
import useLista from '../../hooks/useLista'
import css from '../../utils/css'
import { miles } from '../../utils/format'

export default function PlanesPage() {
  const { tieneRol } = useAuth()
  const esAdmin = tieneRol(ADMIN)
  const lista = useLista('/planes/')

  return (
    <>
      <div className="ios-page-header">
        <div>
          <h2 className="ios-title">Planes del Gimnasio 🏋️‍♂️</h2>
          <p className="ios-subtitle">Modalidades y tarifas disponibles para contratación.</p>
        </div>
        {esAdmin && <Link to="/planes/nuevo" className="btn-ios-primary">+ Crear Nuevo Plan</Link>}
      </div>

      <div className="ios-table-container">
        <div style={css('overflow-x: auto;')}>
          <table className="ios-table">
            <thead>
              <tr>
                <th>Nombre del Plan</th><th>Duración</th><th>Precio ($ CLP)</th><th>Descripción</th><th>Disponibilidad</th>
                {esAdmin && <th style={css('text-align: right;')}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {lista.datos.map((plan) => (
                <tr key={plan.id}>
                  <td><strong>{plan.nombre}</strong></td>
                  <td style={css('color: var(--ios-subtext);')}>{plan.duracion_dias} Días</td>
                  <td style={css('font-weight: 700; color: var(--ios-text);')}>${miles(plan.precio)}</td>
                  <td style={css('color: var(--ios-subtext); font-size: 0.85rem;')}>{plan.descripcion || 'Sin descripción'}</td>
                  <td>{plan.activo ? <span className="ios-badge green">Disponible</span> : <span className="ios-badge red">Desactivado</span>}</td>
                  {esAdmin && <td style={css('text-align: right;')}><Link to={`/planes/${plan.id}/editar`} className="btn-ios-link">Editar</Link></td>}
                </tr>
              ))}
              {!lista.cargando && lista.datos.length === 0 && (
                <FilaVacia columnas={6}>No existen planes registrados. Presione "+ Crear Nuevo Plan" para agregar la primera tarifa.</FilaVacia>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
