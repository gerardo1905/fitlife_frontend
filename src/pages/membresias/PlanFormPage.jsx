import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { erroresCampos, mensajeError } from '../../api/client'
import { Campo, ErrorFormulario } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import css from '../../utils/css'
import { soloDigitos } from '../../utils/format'

export default function PlanFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [plan, setPlan] = useState({ nombre: '', descripcion: '', precio: '', activo: true })
  const [nombreOriginal, setNombreOriginal] = useState('')
  const [errores, setErrores] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    api.get(`/planes/${id}/`).then(({ data }) => {
      setPlan({ nombre: data.nombre, descripcion: data.descripcion || '', precio: String(Math.round(Number(data.precio))), activo: data.activo })
      setNombreOriginal(data.nombre)
    }).catch((e) => setError(mensajeError(e)))
  }, [id])

  const poner = (k, v) => { setPlan((p) => ({ ...p, [k]: v })); setErrores((e) => ({ ...e, [k]: undefined })) }

  async function enviar(e) {
    e.preventDefault()
    const locales = {}
    if (!plan.nombre.trim()) locales.nombre = 'Ingrese el nombre del plan.'
    if (!plan.precio || Number(plan.precio) < 1000) locales.precio = 'El precio mínimo es $1.000.'
    if (Object.keys(locales).length) { setErrores(locales); return }
    const cuerpo = { nombre: plan.nombre.trim(), descripcion: plan.descripcion.trim() || null, precio: plan.precio, activo: plan.activo }
    try {
      const { data } = id ? await api.put(`/planes/${id}/`, cuerpo) : await api.post('/planes/', cuerpo)
      toast.exito(id
        ? `Plan '${data.nombre}' actualizado. Los cambios aplican solo a membresías nuevas; las ya contratadas conservan su precio y fechas.`
        : `Plan '${data.nombre}' creado exitosamente.`)
      navigate('/planes')
    } catch (err) {
      setErrores(erroresCampos(err))
      if (err.response?.status !== 400) setError(mensajeError(err))
    }
  }

  return (
    <div style={css('max-width: 600px; margin: 0 auto;')}>
      <div style={css('margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;')}>
        <div>
          <h2 className="ios-title">{id ? `Editar Plan: ${nombreOriginal}` : 'Crear Nuevo Plan'}</h2>
          <p className="ios-subtitle">Defina el nombre y el precio comercial del plan mensual.</p>
        </div>
        <Link to="/planes" className="btn-ios-secondary">← Volver</Link>
      </div>

      <form onSubmit={enviar} className="ios-form" noValidate>
        <ErrorFormulario mensaje={error} />
        <div className="ios-card" style={css('padding: 1.5rem; margin-bottom: 1.5rem;')}>
          <Campo label="Nombre del Plan" htmlFor="id_nombre" error={errores.nombre}>
            <input type="text" id="id_nombre" className="ios-input" placeholder="Ej: Mensual Full Gym" maxLength={50}
                   value={plan.nombre} onChange={(e) => poner('nombre', e.target.value)} />
          </Campo>
          <div className="form-grid">
            <Campo label="Duración en Días" htmlFor="id_duracion" ayuda="Todos los planes son mensuales.">
              <input type="text" id="id_duracion" className="ios-input" value="30 días (mensual)" disabled />
            </Campo>
            <Campo label="Precio ($ CLP)" htmlFor="id_precio" error={errores.precio}>
              <input type="text" id="id_precio" className="ios-input" placeholder="Ej: 35000" inputMode="numeric" maxLength={7}
                     value={plan.precio} onChange={(e) => poner('precio', soloDigitos(e.target.value))} />
            </Campo>
          </div>
          <Campo label="Descripción y Servicios Incluidos" htmlFor="id_descripcion" error={errores.descripcion}>
            <textarea id="id_descripcion" className="ios-input" rows={3} maxLength={500}
                      placeholder="Ej: Acceso libre a musculación y clases grupales."
                      value={plan.descripcion} onChange={(e) => poner('descripcion', e.target.value)} />
          </Campo>
          <div className="form-group" style={css('display: flex; align-items: center; gap: 0.75rem; margin-top: 1rem;')}>
            <input type="checkbox" id="id_activo" className="ios-checkbox" checked={plan.activo} onChange={(e) => poner('activo', e.target.checked)} />
            <label htmlFor="id_activo" style={css('margin-bottom: 0; cursor: pointer;')}>Disponible para la Venta</label>
          </div>
        </div>
        <div style={css('display: flex; justify-content: flex-end; gap: 1rem;')}>
          <Link to="/planes" className="btn-ios-secondary">Cancelar</Link>
          <button type="submit" className="btn-ios-primary" style={css('padding-left: 2rem; padding-right: 2rem;')}>Guardar Plan</button>
        </div>
      </form>
    </div>
  )
}
