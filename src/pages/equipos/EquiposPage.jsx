import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FilaVacia, Paginacion } from '../../components/ui'
import { ADMIN, useAuth } from '../../context/AuthContext'
import useLista from '../../hooks/useLista'
import css from '../../utils/css'
import { formatoFecha } from '../../utils/format'

export function EstadoEquipo({ estado }) {
  if (estado === 'DISPONIBLE') return <span className="ios-badge green">Disponible</span>
  if (estado === 'MANTENIMIENTO') return <span className="ios-badge amber">En Mantenimiento</span>
  if (estado === 'FUERA_SERVICIO') return <span className="ios-badge red">Fuera de Servicio</span>
  return <span className="ios-badge red">Dado de Baja</span>
}

export default function EquiposPage() {
  const { tieneRol } = useAuth()
  const esAdmin = tieneRol(ADMIN)
  const [texto, setTexto] = useState('')
  const [query, setQuery] = useState('')
  const lista = useLista('/equipos/', { q: query })

  return (
    <>
      <div className="ios-page-header">
        <div>
          <h2 className="ios-title">Equipamiento 🏋️</h2>
          <p className="ios-subtitle">Máquinas, accesorios e instalaciones del gimnasio.</p>
        </div>
        {esAdmin && <Link to="/equipos/nuevo" className="btn-ios-primary">+ Registrar Equipo</Link>}
      </div>

      {/* Barra de búsqueda estilo iOS */}
      <div className="ios-card" style={css('padding: 1rem 1.25rem; margin-bottom: 1.25rem;')}>
        <form onSubmit={(e) => { e.preventDefault(); setQuery(texto.trim()) }} style={css('display: flex; gap: 0.75rem; align-items: center;')}>
          <div style={css('flex: 1;')}>
            <input type="text" className="ios-input" placeholder="🔍 Buscar por nombre, código o ubicación..." autoFocus
                   value={texto} onChange={(e) => setTexto(e.target.value)} />
          </div>
          {query && <button type="button" className="btn-ios-secondary" onClick={() => { setTexto(''); setQuery('') }}>Limpiar</button>}
          <button type="submit" className="btn-ios-primary">Buscar</button>
        </form>
      </div>

      <div className="ios-table-container">
        <div style={css('overflow-x: auto;')}>
          <table className="ios-table">
            <thead><tr><th>Código</th><th>Nombre</th><th>Ubicación</th><th>Fecha Adquisición</th><th>Estado</th><th style={css('text-align: right;')}>Acciones</th></tr></thead>
            <tbody>
              {lista.datos.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.codigo_unico}</strong></td>
                  <td><Link to={`/equipos/${e.id}`} style={css('color: var(--ios-text); font-weight: 600; text-decoration: none;')}>{e.nombre}</Link></td>
                  <td style={css('color: var(--ios-subtext);')}>{e.ubicacion}</td>
                  <td style={css('color: var(--ios-subtext);')}>{formatoFecha(e.fecha_adquisicion)}</td>
                  <td><EstadoEquipo estado={e.estado} /></td>
                  <td style={css('text-align: right;')}>
                    <Link to={`/equipos/${e.id}`} className="btn-ios-link">Ficha</Link>
                    {esAdmin && <Link to={`/equipos/${e.id}/editar`} className="btn-ios-link" style={css('color: var(--ios-subtext);')}>Editar</Link>}
                  </td>
                </tr>
              ))}
              {!lista.cargando && lista.datos.length === 0 && (
                <FilaVacia columnas={6}>
                  {query ? `No se encontraron equipos que coincidan con "${query}".` : 'No hay equipos registrados. Presione "+ Registrar Equipo" para agregar el primero.'}
                </FilaVacia>
              )}
            </tbody>
          </table>
        </div>
        <Paginacion {...lista} />
      </div>
    </>
  )
}
