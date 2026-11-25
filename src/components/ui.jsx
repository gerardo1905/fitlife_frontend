import { useEffect, useRef, useState } from 'react'
import api from '../api/client'
import css from '../utils/css'

/** <div class="form-group"> con label y field-error, como en las plantillas originales. */
export function Campo({ label, htmlFor, error, ayuda, children, style }) {
  return (
    <div className="form-group" style={style}>
      {label && <label htmlFor={htmlFor}>{label}</label>}
      {children}
      {error ? <span className="field-error">{error}</span> : ayuda ? <span className="form-hint">{ayuda}</span> : null}
    </div>
  )
}

/** Título de bloque dentro de un formulario ("1. Identificación Oficial"). */
export function TituloBloque({ children }) {
  return (
    <div style={css('font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ios-muted); font-weight: 700; margin-bottom: 1rem;')}>
      {children}
    </div>
  )
}

export function ErrorFormulario({ mensaje }) {
  if (!mensaje) return null
  return (
    <div className="ios-card" style={css('background: var(--ios-red-bg); border-color: #fecaca; color: #b91c1c; margin-bottom: 1.25rem; padding: 1rem;')}>
      {mensaje}
    </div>
  )
}

export function Cargando() {
  return <div style={css('text-align: center; color: var(--ios-muted); padding: 2.5rem;')}>Cargando…</div>
}

/** Fila "vacía" de tabla igual que el {% empty %} de las plantillas. */
export function FilaVacia({ columnas, children }) {
  return (
    <tr>
      <td colSpan={columnas} style={css('text-align: center; color: var(--ios-muted); padding: 2.5rem;')}>{children}</td>
    </tr>
  )
}

export function Paginacion({ pagina, setPagina, hayMas, total }) {
  if (pagina === 1 && !hayMas) return null
  return (
    <div style={css('display: flex; justify-content: space-between; align-items: center; padding: 0.9rem 1.25rem; border-top: 1px solid var(--ios-separator); color: var(--ios-subtext); font-size: 0.875rem;')}>
      <span>{total} registros</span>
      <div style={css('display: flex; gap: 0.5rem; align-items: center;')}>
        <button className="btn-ios-secondary" disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>← Anterior</button>
        <span>Página {pagina}</span>
        <button className="btn-ios-secondary" disabled={!hayMas} onClick={() => setPagina(pagina + 1)}>Siguiente →</button>
      </div>
    </div>
  )
}

/** Modal flotante de confirmación (mismo componente "ios-modal" del sistema original). */
export function ModalConfirmacion({ abierto, icono, titulo, children, textoConfirmar, onConfirmar, onCerrar, ocupado }) {
  return (
    <div className={`ios-modal-backdrop ${abierto ? 'active' : ''}`} onMouseDown={onCerrar}>
      <div className="ios-modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="ios-modal-icon">{icono}</div>
        <h3 className="ios-modal-title">{titulo}</h3>
        <p className="ios-modal-body">{children}</p>
        <div className="ios-modal-actions">
          <button type="button" className="btn-ios-secondary" onClick={onCerrar}>Revisar</button>
          <button type="button" className="btn-ios-primary" onClick={onConfirmar} disabled={ocupado}>{textoConfirmar}</button>
        </div>
      </div>
    </div>
  )
}

/**
 * Selector de socio con buscador: al hacer clic muestra la lista de socios
 * disponibles y la filtra mientras se escribe (nombre o RUT).
 */
export function SelectorSocio({ id, valor, onChange, error, filtros = { activo: 'true' }, vacio }) {
  const [texto, setTexto] = useState('')
  const [opciones, setOpciones] = useState([])
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [seleccionado, setSeleccionado] = useState(null)
  const contenedor = useRef(null)
  const claveFiltros = JSON.stringify(filtros)

  useEffect(() => {
    if (valor && (!seleccionado || seleccionado.id !== Number(valor))) {
      api.get(`/socios/${valor}/`).then(({ data }) => setSeleccionado(data)).catch(() => {})
    }
    if (!valor) setSeleccionado(null)
  }, [valor]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!abierto) return undefined
    setCargando(true)
    const t = setTimeout(() => {
      api.get('/socios/', { params: { ...JSON.parse(claveFiltros), q: texto.trim() || undefined } })
        .then(({ data }) => setOpciones(data.results || data))
        .catch(() => setOpciones([]))
        .finally(() => setCargando(false))
    }, texto ? 250 : 0)
    return () => clearTimeout(t)
  }, [texto, abierto, claveFiltros])

  useEffect(() => {
    const fuera = (e) => contenedor.current && !contenedor.current.contains(e.target) && setAbierto(false)
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [])

  if (seleccionado) {
    return (
      <div className="ios-input" style={css('display: flex; justify-content: space-between; align-items: center; background: var(--ios-blue-light); border-color: var(--ios-blue);')}>
        <span><strong>{seleccionado.nombres} {seleccionado.apellidos}</strong> — RUT: {seleccionado.rut}</span>
        <button type="button" className="btn-ios-link" onClick={() => { onChange(null); setTexto('') }}>Cambiar</button>
      </div>
    )
  }

  return (
    <div style={css('position: relative;')} ref={contenedor}>
      <input id={id} type="text" className={`ios-input ${error ? 'con-error' : ''}`} value={texto} autoComplete="off"
             placeholder="🔍 Haga clic para ver la lista o escriba nombre / RUT..."
             onFocus={() => setAbierto(true)} onChange={(e) => { setTexto(e.target.value); setAbierto(true) }} />
      {abierto && (
        <ul className="ios-dropdown">
          {cargando && opciones.length === 0 && <li style={css('padding: 0.7rem 1rem; color: var(--ios-muted);')}>Buscando...</li>}
          {!cargando && opciones.length === 0 && (
            <li style={css('padding: 0.7rem 1rem; color: var(--ios-muted);')}>{vacio || 'No hay socios que coincidan.'}</li>
          )}
          {opciones.map((s) => (
            <li key={s.id}>
              <button type="button" onClick={() => { setSeleccionado(s); onChange(s.id); setAbierto(false) }}>
                <strong>{s.nombres} {s.apellidos}</strong>
                <span style={css('color: var(--ios-muted);')}>{s.rut}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
