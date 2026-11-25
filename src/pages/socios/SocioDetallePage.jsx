import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { mensajeError } from '../../api/client'
import { AccionesMembresia, EstadoMembresia } from '../../components/Membresia'
import { Cargando, ErrorFormulario } from '../../components/ui'
import css from '../../utils/css'
import { formatoFecha, formatoTelefonoMostrar, miles } from '../../utils/format'

const fila = css('display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 0; border-bottom: 1px solid var(--ios-separator);')
const etiqueta = css('font-size: 0.9rem; font-weight: 500; color: var(--ios-text);')

export default function SocioDetallePage() {
  const { id } = useParams()
  const [socio, setSocio] = useState(null)
  const [membresias, setMembresias] = useState([])
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    try {
      const [s, m] = await Promise.all([api.get(`/socios/${id}/`), api.get('/membresias/', { params: { socio: id } })])
      setSocio(s.data)
      setMembresias(m.data.results)
    } catch (e) { setError(mensajeError(e)) }
  }, [id])

  useEffect(() => { cargar() }, [cargar])

  if (error) return <ErrorFormulario mensaje={error} />
  if (!socio) return <Cargando />

  const tieneEnCurso = membresias.some((m) => ['PENDIENTE', 'ACTIVA', 'CONGELADA'].includes(m.estado))

  return (
    <div style={css('max-width: 750px; margin: 0 auto;')}>
      {/* Encabezado con acciones */}
      <div style={css('display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;')}>
        <div>
          <h2 className="ios-title">{socio.nombres} {socio.apellidos}</h2>
          <p className="ios-subtitle">RUT: {socio.rut} — Inscrito el {formatoFecha(socio.fecha_registro)}</p>
        </div>
        <div style={css('display: flex; gap: 0.75rem;')}>
          <Link to="/socios" className="btn-ios-secondary">← Volver</Link>
          <Link to={`/socios/${socio.id}/editar`} className="btn-ios-primary">Editar Ficha</Link>
        </div>
      </div>

      {/* Ficha Agrupada Estilo Ajustes iOS */}
      <div className="ios-card" style={css('margin-bottom: 1.5rem; padding: 0.5rem 1.5rem;')}>
        <div style={css('font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ios-muted); font-weight: 700; padding: 0.85rem 0 0.5rem 0; border-bottom: 1px solid var(--ios-separator);')}>
          Información del Cliente
        </div>
        <div style={fila}>
          <span style={etiqueta}>Estado de Cliente</span>
          {socio.activo ? <span className="ios-badge green">Activo</span> : <span className="ios-badge red">Inactivo</span>}
        </div>
        <div style={fila}>
          <span style={etiqueta}>Teléfono</span>
          <span style={css('font-size: 0.95rem; color: var(--ios-text); font-weight: 600;')}>{formatoTelefonoMostrar(socio.telefono)}</span>
        </div>
        <div style={fila}>
          <span style={etiqueta}>Correo Electrónico</span>
          <span style={css('font-size: 0.95rem; color: var(--ios-subtext);')}>{socio.email || 'No registrado'}</span>
        </div>
        <div style={css('display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 0;')}>
          <span style={etiqueta}>Contacto de Emergencia</span>
          <span style={css('font-size: 0.95rem; color: var(--ios-subtext);')}>{socio.contacto_emergencia || 'Sin información'}</span>
        </div>
      </div>

      {/* Historial de Membresías Contratadas */}
      <div className="ios-card" style={css('padding: 1.5rem;')}>
        <div style={css('display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;')}>
          <h3 style={css('font-size: 1.1rem; font-weight: 700; color: var(--ios-text);')}>Historial de Membresías 📜</h3>
          {socio.activo && !tieneEnCurso && (
            <Link to={`/membresias/nueva?socio=${socio.id}`} className="btn-ios-primary">+ Inscribir en Plan</Link>
          )}
        </div>

        {membresias.length > 0 ? membresias.map((m, i) => (
          <div key={m.id} style={css(`padding: 0.9rem 0; ${i < membresias.length - 1 ? 'border-bottom: 1px solid var(--ios-separator);' : ''}`)}>
            <div style={css('display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem;')}>
              <div>
                <div style={css('font-size: 0.98rem; font-weight: 700; color: var(--ios-text);')}>{m.plan_nombre}</div>
                <div style={css('font-size: 0.82rem; color: var(--ios-muted); margin-top: 0.15rem;')}>
                  {formatoFecha(m.fecha_inicio)} — {formatoFecha(m.fecha_fin)} · ${miles(m.importe_acordado)}
                </div>
              </div>
              <div style={css('flex-shrink: 0;')}><EstadoMembresia m={m} /></div>
            </div>
            <div style={css('display: flex; flex-wrap: wrap; gap: 0.4rem 1rem; align-items: center; margin-top: 0.65rem;')}>
              <AccionesMembresia m={m} onCambio={cargar} conQr />
            </div>
          </div>
        )) : (
          <div style={css('text-align: center; padding: 2rem; background: var(--ios-bg); border-radius: var(--radius-ios-md); color: var(--ios-muted);')}>
            Este socio aún no registra ninguna membresía contratada.
          </div>
        )}
      </div>
    </div>
  )
}
