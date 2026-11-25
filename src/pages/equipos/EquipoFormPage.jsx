import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { erroresCampos, mensajeError } from '../../api/client'
import { Campo, ErrorFormulario } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import css from '../../utils/css'
import { hoyISO } from '../../utils/format'

const ESTADOS = [['DISPONIBLE', 'Disponible'], ['MANTENIMIENTO', 'En Mantenimiento'], ['FUERA_SERVICIO', 'Fuera de Servicio'], ['BAJA', 'Dado de Baja']]

export default function EquipoFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [eq, setEq] = useState({ codigo_unico: '', nombre: '', ubicacion: '', fecha_adquisicion: '', estado: 'DISPONIBLE' })
  const [nombreOriginal, setNombreOriginal] = useState('')
  const [errores, setErrores] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    api.get(`/equipos/${id}/`).then(({ data }) => { setEq(data); setNombreOriginal(data.nombre) }).catch((e) => setError(mensajeError(e)))
  }, [id])

  const poner = (k, v) => { setEq((x) => ({ ...x, [k]: v })); setErrores((e) => ({ ...e, [k]: undefined })) }

  async function enviar(e) {
    e.preventDefault()
    const locales = {}
    if (!eq.codigo_unico.trim()) locales.codigo_unico = 'Ingrese el código.'
    if (!eq.nombre.trim()) locales.nombre = 'Ingrese el nombre.'
    if (!eq.ubicacion.trim()) locales.ubicacion = 'Ingrese la ubicación.'
    if (!eq.fecha_adquisicion) locales.fecha_adquisicion = 'Ingrese la fecha.'
    else if (eq.fecha_adquisicion > hoyISO()) locales.fecha_adquisicion = 'La fecha de adquisición no puede ser futura.'
    if (Object.keys(locales).length) { setErrores(locales); return }
    const cuerpo = { codigo_unico: eq.codigo_unico.trim(), nombre: eq.nombre.trim(), ubicacion: eq.ubicacion.trim(),
                     fecha_adquisicion: eq.fecha_adquisicion, estado: eq.estado }
    try {
      const { data } = id ? await api.put(`/equipos/${id}/`, cuerpo) : await api.post('/equipos/', cuerpo)
      toast.exito(id ? `Equipo '${data.nombre}' actualizado correctamente.` : `Equipo '${data.nombre}' registrado correctamente.`)
      navigate(`/equipos/${data.id}`)
    } catch (err) {
      setErrores(erroresCampos(err))
      if (err.response?.status !== 400) setError(mensajeError(err))
    }
  }

  return (
    <div style={css('max-width: 640px; margin: 0 auto;')}>
      <div style={css('margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;')}>
        <div>
          <h2 className="ios-title">{id ? `Editar Equipo: ${nombreOriginal}` : 'Registrar Nuevo Equipo'}</h2>
          <p className="ios-subtitle">Datos del equipo o accesorio del gimnasio.</p>
        </div>
        <Link to="/equipos" className="btn-ios-secondary">← Volver</Link>
      </div>
      <form onSubmit={enviar} className="ios-form" noValidate>
        <ErrorFormulario mensaje={error} />
        <div className="ios-card" style={css('padding: 1.5rem; margin-bottom: 1.5rem;')}>
          <div className="form-grid">
            <Campo label="Código de Equipo" htmlFor="id_codigo_unico" error={errores.codigo_unico}>
              <input type="text" id="id_codigo_unico" className="ios-input" placeholder="Ej: MAQ-001" maxLength={20}
                     value={eq.codigo_unico} onChange={(e) => poner('codigo_unico', e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))} />
            </Campo>
            <Campo label="Nombre de la Máquina / Accesorio" htmlFor="id_nombre" error={errores.nombre}>
              <input type="text" id="id_nombre" className="ios-input" placeholder="Ej: Cinta de Trote Technogym" maxLength={100}
                     value={eq.nombre} onChange={(e) => poner('nombre', e.target.value)} />
            </Campo>
          </div>
          <div className="form-grid">
            <Campo label="Ubicación en el Gimnasio" htmlFor="id_ubicacion" error={errores.ubicacion}>
              <input type="text" id="id_ubicacion" className="ios-input" placeholder="Ej: Sala de Cardio" maxLength={100}
                     value={eq.ubicacion} onChange={(e) => poner('ubicacion', e.target.value)} />
            </Campo>
            <Campo label="Fecha de Adquisición" htmlFor="id_fecha_adquisicion" error={errores.fecha_adquisicion}>
              <input type="date" id="id_fecha_adquisicion" className="ios-input" max={hoyISO()}
                     value={eq.fecha_adquisicion} onChange={(e) => poner('fecha_adquisicion', e.target.value)} />
            </Campo>
          </div>
          <Campo label="Estado Actual" htmlFor="id_estado" error={errores.estado}>
            <select id="id_estado" className="ios-input" value={eq.estado} onChange={(e) => poner('estado', e.target.value)}>
              {ESTADOS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </Campo>
        </div>
        <div style={css('display: flex; justify-content: flex-end; gap: 1rem;')}>
          <Link to="/equipos" className="btn-ios-secondary">Cancelar</Link>
          <button type="submit" className="btn-ios-primary" style={css('padding-left: 2rem; padding-right: 2rem;')}>Guardar Equipo</button>
        </div>
      </form>
    </div>
  )
}
