import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { erroresCampos, mensajeError } from '../../api/client'
import { Campo, ErrorFormulario } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import css from '../../utils/css'
import { soloDigitos } from '../../utils/format'

/** Formulario de Nueva Actividad o Nueva Sala (mismo diseño que tipo_clase_form.html). */
export default function CatalogoFormPage({ tipo }) {
  const esSala = tipo === 'sala'
  const navigate = useNavigate()
  const toast = useToast()
  const [v, setV] = useState({ nombre: '', descripcion: '', ubicacion: '', capacidad_maxima: '', activa: true })
  const [errores, setErrores] = useState({})
  const [error, setError] = useState(null)

  const poner = (k, valor) => { setV((x) => ({ ...x, [k]: valor })); setErrores((e) => ({ ...e, [k]: undefined })) }

  async function enviar(e) {
    e.preventDefault()
    const locales = {}
    if (!v.nombre.trim()) locales.nombre = 'Este campo es obligatorio.'
    if (esSala && (!v.capacidad_maxima || Number(v.capacidad_maxima) < 1 || Number(v.capacidad_maxima) > 200)) {
      locales.capacidad_maxima = 'Ingrese una capacidad entre 1 y 200 personas.'
    }
    if (Object.keys(locales).length) { setErrores(locales); return }
    const cuerpo = esSala
      ? { nombre: v.nombre.trim(), ubicacion: v.ubicacion.trim() || null, capacidad_maxima: Number(v.capacidad_maxima), activa: v.activa }
      : { nombre: v.nombre.trim(), descripcion: v.descripcion.trim() || null, activa: v.activa }
    try {
      const { data } = await api.post(esSala ? '/salas/' : '/tipos-clase/', cuerpo)
      toast.exito(esSala ? `Sala '${data.nombre}' registrada correctamente.` : `Actividad '${data.nombre}' creada exitosamente.`)
      navigate('/actividades')
    } catch (err) {
      setErrores(erroresCampos(err))
      if (err.response?.status !== 400) setError(mensajeError(err))
    }
  }

  return (
    <div style={css('max-width: 600px; margin: 0 auto;')}>
      <div style={css('margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;')}>
        <div>
          <h2 className="ios-title">{esSala ? 'Registrar Nueva Sala' : 'Nueva Actividad Deportiva'}</h2>
          <p className="ios-subtitle">Complete la información requerida en la plataforma.</p>
        </div>
        <Link to="/actividades" className="btn-ios-secondary">← Volver</Link>
      </div>
      <form onSubmit={enviar} className="ios-form" noValidate>
        <ErrorFormulario mensaje={error} />
        <div className="ios-card" style={css('padding: 1.5rem; margin-bottom: 1.5rem;')}>
          <Campo label={esSala ? 'Nombre de la Sala' : 'Nombre de la Actividad'} htmlFor="id_nombre" error={errores.nombre}>
            <input type="text" id="id_nombre" className="ios-input" maxLength={esSala ? 50 : 100}
                   placeholder={esSala ? 'Ej: Sala 1 - Fitness' : 'Ej: Spinning High Intensity'}
                   value={v.nombre} onChange={(e) => poner('nombre', e.target.value)} />
          </Campo>
          {esSala ? (
            <>
              <Campo label="Ubicación Interna" htmlFor="id_ubicacion" error={errores.ubicacion}>
                <input type="text" id="id_ubicacion" className="ios-input" maxLength={100} placeholder="Ej: Segundo Piso - Sector Oriente"
                       value={v.ubicacion} onChange={(e) => poner('ubicacion', e.target.value)} />
              </Campo>
              <Campo label="Capacidad Máxima (Aforo Persona)" htmlFor="id_capacidad" error={errores.capacidad_maxima}>
                <input type="text" id="id_capacidad" className="ios-input" placeholder="Ej: 20" inputMode="numeric" maxLength={3}
                       value={v.capacidad_maxima} onChange={(e) => poner('capacidad_maxima', soloDigitos(e.target.value))} />
              </Campo>
            </>
          ) : (
            <>
              <Campo label="Descripción del Entrenamiento" htmlFor="id_descripcion" error={errores.descripcion}>
                <textarea id="id_descripcion" className="ios-input" rows={3} maxLength={500}
                          placeholder="Ej: Entrenamiento cardiovascular en bicicleta fija."
                          value={v.descripcion} onChange={(e) => poner('descripcion', e.target.value)} />
              </Campo>
              <Campo label="Duración Habitual (Minutos)" htmlFor="id_duracion" ayuda="Todas las clases duran 1 hora.">
                <input type="text" id="id_duracion" className="ios-input" value="60 minutos" disabled />
              </Campo>
            </>
          )}
          <Campo label={esSala ? 'Sala Habilitada' : 'Disponible en Oferta'} htmlFor="id_activa">
            <input type="checkbox" id="id_activa" className="ios-checkbox" checked={v.activa} onChange={(e) => poner('activa', e.target.checked)} />
          </Campo>
        </div>
        <div style={css('display: flex; justify-content: flex-end; gap: 1rem;')}>
          <Link to="/actividades" className="btn-ios-secondary">Cancelar</Link>
          <button type="submit" className="btn-ios-primary" style={css('padding-left: 2rem; padding-right: 2rem;')}>Guardar</button>
        </div>
      </form>
    </div>
  )
}
