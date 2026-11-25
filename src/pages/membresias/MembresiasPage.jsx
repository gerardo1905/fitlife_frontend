import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AccionesMembresia, EstadoMembresia } from '../../components/Membresia'
import { FilaVacia, Paginacion } from '../../components/ui'
import useLista from '../../hooks/useLista'
import css from '../../utils/css'
import { formatoFecha, miles } from '../../utils/format'

const ESTADOS = [
  ['PENDIENTE', '🟠 Pendiente de pago'], ['ACTIVA', '🟢 Activa'], ['VENCIDA', '🔴 Vencida'],
  ['CONGELADA', '🟡 Congelada'], ['CANCELADA', '⚪ Cancelada'],
]

export default function MembresiasPage() {
  const [params, setParams] = useSearchParams()
  const estado = params.get('estado') || ''
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const lista = useLista('/membresias/', { estado, q: busqueda })

  return (
    <>
      <div className="ios-page-header">
        <div>
          <h2 className="ios-title">Membresías del Gimnasio 📋</h2>
          <p className="ios-subtitle">Seguimiento de estados de vigencia (Pendiente, Activa, Congelada, Vencida, Cancelada).</p>
        </div>
        <Link to="/membresias/nueva" className="btn-ios-primary">+ Registrar Membresía</Link>
      </div>

      {/* Filtros estilo iOS */}
      <div className="ios-card" style={css('padding: 1rem 1.25rem; margin-bottom: 1.25rem;')}>
        <form onSubmit={(e) => { e.preventDefault(); setBusqueda(texto.trim()) }} style={css('display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;')}>
          <div style={css('flex: 1; min-width: 240px;')}>
            <input type="text" className="ios-input" placeholder="🔍 Buscar por RUT o nombre de socio..." value={texto} onChange={(e) => setTexto(e.target.value)} />
          </div>
          <select className="ios-input" style={css('width: auto;')} value={estado} onChange={(e) => setParams(e.target.value ? { estado: e.target.value } : {})}>
            <option value="">Todos los Estados</option>
            {ESTADOS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
          <button type="submit" className="btn-ios-primary">Filtrar</button>
          {(estado || busqueda) && (
            <button type="button" className="btn-ios-secondary" onClick={() => { setParams({}); setTexto(''); setBusqueda('') }}>Limpiar</button>
          )}
        </form>
      </div>

      {/* Tabla de Membresías */}
      <div className="ios-table-container">
        <div style={css('overflow-x: auto;')}>
          <table className="ios-table">
            <thead>
              <tr><th>Socio Titular</th><th>Plan Contratado</th><th>Inicio</th><th>Término</th><th>Importe</th><th>Estado</th><th style={css('text-align: right;')}>Acciones</th></tr>
            </thead>
            <tbody>
              {lista.datos.map((m) => (
                <tr key={m.id}>
                  <td>
                    <Link to={`/socios/${m.socio}`} style={css('color: var(--ios-text); font-weight: 600; text-decoration: none;')}>{m.socio_nombre}</Link>
                    <br /><span style={css('font-size: 0.8rem; color: var(--ios-muted);')}>RUT: {m.socio_rut}</span>
                  </td>
                  <td><strong>{m.plan_nombre}</strong></td>
                  <td style={css('color: var(--ios-subtext);')}>{formatoFecha(m.fecha_inicio)}</td>
                  <td style={css('color: var(--ios-subtext);')}>{formatoFecha(m.fecha_fin)}</td>
                  <td style={css('font-weight: 600; color: var(--ios-text);')}>${miles(m.importe_acordado)}</td>
                  <td><EstadoMembresia m={m} /></td>
                  <td style={css('text-align: right;')}><AccionesMembresia m={m} onCambio={lista.recargar} /></td>
                </tr>
              ))}
              {!lista.cargando && lista.datos.length === 0 && (
                <FilaVacia columnas={7}>No existen membresías que coincidan con los criterios de filtro seleccionados.</FilaVacia>
              )}
            </tbody>
          </table>
        </div>
        <Paginacion {...lista} />
      </div>
    </>
  )
}
