import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { erroresCampos, mensajeError } from '../../api/client'
import { Campo, Cargando, ErrorFormulario } from '../../components/ui'
import { ADMIN, useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import css from '../../utils/css'
import { formatoFecha, hoyISO, miles, soloDigitos } from '../../utils/format'
import { EstadoEquipo } from './EquiposPage'

const VACIO = { fecha_programada: hoyISO(), fecha_realizada: '', costo: '0', trabajo_realizado: '' }

export default function EquipoDetallePage() {
  const { id } = useParams()
  const { tieneRol } = useAuth()
  const toast = useToast()
  const [equipo, setEquipo] = useState(null)
  const [mantenimientos, setMantenimientos] = useState([])
  const [f, setF] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    try {
      const [e, m] = await Promise.all([api.get(`/equipos/${id}/`), api.get('/mantenimientos/', { params: { equipo: id } })])
      setEquipo(e.data)
      setMantenimientos(m.data.results)
    } catch (err) { setError(mensajeError(err)) }
  }, [id])

  useEffect(() => { cargar() }, [cargar])

  const poner = (k, v) => { setF((x) => ({ ...x, [k]: v })); setErrores((e) => ({ ...e, [k]: undefined })) }

  async function registrar(e) {
    e.preventDefault()
    const locales = {}
    if (!f.fecha_programada) locales.fecha_programada = 'Ingrese la fecha programada.'
    if (f.fecha_realizada && f.fecha_realizada > hoyISO()) locales.fecha_realizada = 'La fecha de ejecución no puede ser futura.'
    if (f.costo === '') locales.costo = 'Ingrese el costo (0 si no tuvo costo).'
    if (Object.keys(locales).length) { setErrores(locales); return }
    try {
      await api.post('/mantenimientos/', {
        equipo: id, fecha_programada: f.fecha_programada, fecha_realizada: f.fecha_realizada || null,
        costo: f.costo, trabajo_realizado: f.trabajo_realizado.trim() || null,
      })
      toast.exito(`Mantención registrada para '${equipo.nombre}'.`)
      setF(VACIO)
      cargar()
    } catch (err) { setErrores(erroresCampos(err)); if (err.response?.status !== 400) toast.error(mensajeError(err)) }
  }

  if (error) return <ErrorFormulario mensaje={error} />
  if (!equipo) return <Cargando />

  return (
    <>
      <div className="ios-page-header">
        <div>
          <h2 className="ios-title">{equipo.nombre} 🏋️</h2>
          <p className="ios-subtitle">Código {equipo.codigo_unico} · {equipo.ubicacion}</p>
        </div>
        <div style={css('display: flex; gap: 0.75rem;')}>
          {tieneRol(ADMIN) && <Link to={`/equipos/${equipo.id}/editar`} className="btn-ios-secondary">Editar</Link>}
          <Link to="/equipos" className="btn-ios-secondary">← Volver</Link>
        </div>
      </div>

      {/* Datos del equipo */}
      <div className="ios-card">
        <div style={css('display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid var(--ios-separator);')}>
          <span style={css('color: var(--ios-subtext);')}>Fecha de Adquisición</span>
          <span style={css('font-weight: 600;')}>{formatoFecha(equipo.fecha_adquisicion)}</span>
        </div>
        <div style={css('display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0;')}>
          <span style={css('color: var(--ios-subtext);')}>Estado</span>
          <EstadoEquipo estado={equipo.estado} />
        </div>
      </div>

      {/* Registrar mantención */}
      <div className="ios-card">
        <h3 style={css('font-size: 1.05rem; font-weight: 700; color: var(--ios-text); margin-bottom: 1rem;')}>Registrar Mantención</h3>
        <form onSubmit={registrar} className="ios-form" noValidate>
          <div className="form-grid">
            <Campo label="Fecha Programada" htmlFor="id_fecha_programada" error={errores.fecha_programada}>
              <input type="date" id="id_fecha_programada" className="ios-input" value={f.fecha_programada} onChange={(e) => poner('fecha_programada', e.target.value)} />
            </Campo>
            <Campo label="Fecha de Ejecución (Opcional)" htmlFor="id_fecha_realizada" error={errores.fecha_realizada}>
              <input type="date" id="id_fecha_realizada" className="ios-input" max={hoyISO()} value={f.fecha_realizada} onChange={(e) => poner('fecha_realizada', e.target.value)} />
            </Campo>
            <Campo label="Costo ($)" htmlFor="id_costo" error={errores.costo}>
              <input type="text" id="id_costo" className="ios-input" placeholder="Ej: 25000" inputMode="numeric" maxLength={8}
                     value={f.costo} onChange={(e) => poner('costo', soloDigitos(e.target.value))} />
            </Campo>
          </div>
          <Campo label="Trabajo Realizado" htmlFor="id_trabajo_realizado" error={errores.trabajo_realizado}>
            <textarea id="id_trabajo_realizado" className="ios-input" rows={2} maxLength={500} placeholder="Ej: Cambio de correa y lubricación de motor."
                      value={f.trabajo_realizado} onChange={(e) => poner('trabajo_realizado', e.target.value)} />
          </Campo>
          <div style={css('display: flex; justify-content: flex-end;')}>
            <button type="submit" className="btn-ios-primary">+ Registrar Mantención</button>
          </div>
        </form>
      </div>

      {/* Historial */}
      <div className="ios-card">
        <h3 style={css('font-size: 1.05rem; font-weight: 700; color: var(--ios-text); margin-bottom: 1rem;')}>Historial de Mantenciones</h3>
        {mantenimientos.length ? mantenimientos.map((m, i) => (
          <div key={m.id} style={css(`padding: 0.75rem 0; ${i < mantenimientos.length - 1 ? 'border-bottom: 1px solid var(--ios-separator);' : ''}`)}>
            <div style={css('display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem;')}>
              <div>
                <div style={css('font-weight: 600;')}>
                  {formatoFecha(m.fecha_programada)}{m.fecha_realizada && ` → Ejecutada el ${formatoFecha(m.fecha_realizada)}`}
                </div>
                {m.trabajo_realizado && <div style={css('font-size: 0.85rem; color: var(--ios-subtext); margin-top: 0.2rem;')}>{m.trabajo_realizado}</div>}
                <div style={css('font-size: 0.8rem; color: var(--ios-muted); margin-top: 0.2rem;')}>Registrado por {m.usuario_responsable_nombre}</div>
              </div>
              <div style={css('font-weight: 700; color: var(--ios-text); flex-shrink: 0;')}>${miles(m.costo)}</div>
            </div>
          </div>
        )) : (
          <p style={css('color: var(--ios-muted); text-align: center; padding: 1.5rem 0;')}>Este equipo no tiene mantenciones registradas.</p>
        )}
      </div>
    </>
  )
}
