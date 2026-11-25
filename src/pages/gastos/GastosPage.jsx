import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { FilaVacia, Paginacion } from '../../components/ui'
import useLista from '../../hooks/useLista'
import css from '../../utils/css'
import { formatoFecha, miles } from '../../utils/format'

export default function GastosPage() {
  const [categoria, setCategoria] = useState('')
  const [categorias, setCategorias] = useState([])
  const lista = useLista('/gastos/', { categoria })

  useEffect(() => {
    api.get('/categorias-gasto/').then(({ data }) => setCategorias(data.results)).catch(() => {})
  }, [])

  return (
    <>
      <div className="ios-page-header">
        <div>
          <h2 className="ios-title">Gastos del Gimnasio 💸</h2>
          <p className="ios-subtitle">Registro de egresos y costos operativos.</p>
        </div>
        <div style={css('display: flex; gap: 0.75rem;')}>
          <Link to="/gastos/categorias" className="btn-ios-secondary">Categorías</Link>
          <Link to="/gastos/nuevo" className="btn-ios-primary">+ Registrar Gasto</Link>
        </div>
      </div>

      {/* Total y filtro por categoría */}
      <div className="ios-card" style={css('padding: 1.25rem 1.5rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;')}>
        <div>
          <span style={css('font-size: 0.8rem; font-weight: 700; color: var(--ios-muted); text-transform: uppercase; letter-spacing: 0.05em;')}>
            Total {categoria && '(filtrado)'}
          </span>
          <div style={css('font-size: 1.6rem; font-weight: 800; color: var(--ios-text);')}>${miles(lista.extra.total_importe)}</div>
        </div>
        <div style={css('display: flex; gap: 0.75rem; align-items: center;')}>
          <select className="ios-input" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          {categoria && <button type="button" className="btn-ios-secondary" onClick={() => setCategoria('')}>Limpiar</button>}
        </div>
      </div>

      <div className="ios-table-container">
        <div style={css('overflow-x: auto;')}>
          <table className="ios-table">
            <thead><tr><th>Fecha</th><th>Categoría</th><th>Concepto</th><th>Comprobante</th><th>Registrado por</th><th style={css('text-align: right;')}>Importe</th></tr></thead>
            <tbody>
              {lista.datos.map((g) => (
                <tr key={g.id}>
                  <td style={css('color: var(--ios-subtext);')}>{formatoFecha(g.fecha)}</td>
                  <td><span className="ios-badge blue">{g.categoria_nombre}</span></td>
                  <td><strong>{g.concepto}</strong></td>
                  <td style={css('color: var(--ios-subtext); font-size: 0.85rem;')}>{g.comprobante || '—'}</td>
                  <td style={css('color: var(--ios-subtext); font-size: 0.85rem;')}>{g.usuario_responsable_nombre}</td>
                  <td style={css('text-align: right; font-weight: 700;')}>${miles(g.importe)}</td>
                </tr>
              ))}
              {!lista.cargando && lista.datos.length === 0 && (
                <FilaVacia columnas={6}>
                  {categorias.length
                    ? 'No hay gastos registrados todavía. Presione "+ Registrar Gasto" para agregar el primero.'
                    : 'Primero debes crear una categoría desde "Categorías" antes de poder registrar un gasto.'}
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
