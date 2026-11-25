import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FilaVacia, Paginacion } from '../../components/ui'
import useLista from '../../hooks/useLista'
import css from '../../utils/css'
import { formatoFecha, formatoTelefonoMostrar } from '../../utils/format'

export default function SociosPage() {
  const [texto, setTexto] = useState('')
  const [query, setQuery] = useState('')
  const lista = useLista('/socios/', { q: query })

  return (
    <>
      <div className="ios-page-header">
        <div>
          <h2 className="ios-title">Socios del Gimnasio 💳</h2>
          <p className="ios-subtitle">Directorio de clientes registrados y consulta de vigencia.</p>
        </div>
        <Link to="/socios/nuevo" className="btn-ios-primary">+ Registrar Socio</Link>
      </div>

      {/* Barra de búsqueda estilo iOS */}
      <div className="ios-card" style={css('padding: 1rem 1.25rem; margin-bottom: 1.25rem;')}>
        <form onSubmit={(e) => { e.preventDefault(); setQuery(texto.trim()) }} style={css('display: flex; gap: 0.75rem; align-items: center;')}>
          <div style={css('flex: 1; position: relative;')}>
            <input type="text" className="ios-input" placeholder="🔍 Buscar socio por RUT, nombres, apellidos o correo..." autoFocus
                   value={texto} onChange={(e) => setTexto(e.target.value)} />
          </div>
          {query && <button type="button" className="btn-ios-secondary" onClick={() => { setTexto(''); setQuery('') }}>Limpiar</button>}
          <button type="submit" className="btn-ios-primary">Buscar</button>
        </form>
      </div>

      {/* Tabla de Socios estilo iOS List */}
      <div className="ios-table-container">
        <div style={css('overflow-x: auto;')}>
          <table className="ios-table">
            <thead>
              <tr><th>RUT</th><th>Nombre Completo</th><th>Contacto</th><th>Fecha Registro</th><th>Estado</th><th style={css('text-align: right;')}>Acciones</th></tr>
            </thead>
            <tbody>
              {lista.datos.map((socio) => (
                <tr key={socio.id}>
                  <td><strong>{socio.rut}</strong></td>
                  <td>
                    <Link to={`/socios/${socio.id}`} style={css('color: var(--ios-text); font-weight: 600; text-decoration: none;')}>
                      {socio.nombres} {socio.apellidos}
                    </Link>
                  </td>
                  <td style={css('color: var(--ios-subtext); font-size: 0.875rem;')}>
                    {formatoTelefonoMostrar(socio.telefono)}
                    {socio.email && <><br /><span style={css('font-size: 0.8rem; color: var(--ios-muted);')}>{socio.email}</span></>}
                  </td>
                  <td style={css('color: var(--ios-subtext);')}>{formatoFecha(socio.fecha_registro)}</td>
                  <td>{socio.activo ? <span className="ios-badge green">Activo</span> : <span className="ios-badge red">Inactivo</span>}</td>
                  <td style={css('text-align: right;')}>
                    <Link to={`/socios/${socio.id}`} className="btn-ios-link">Ficha</Link>
                    <Link to={`/socios/${socio.id}/editar`} className="btn-ios-link" style={css('color: var(--ios-subtext);')}>Editar</Link>
                  </td>
                </tr>
              ))}
              {!lista.cargando && lista.datos.length === 0 && (
                <FilaVacia columnas={6}>
                  {query
                    ? `No se encontraron socios que coincidan con la búsqueda "${query}".`
                    : 'No hay socios registrados en el sistema. Presione "+ Registrar Socio" para agregar el primero.'}
                </FilaVacia>
              )}
              {lista.cargando && <FilaVacia columnas={6}>Cargando…</FilaVacia>}
            </tbody>
          </table>
        </div>
        <Paginacion {...lista} />
      </div>
    </>
  )
}
