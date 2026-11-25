import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { erroresCampos, mensajeError } from '../../api/client'
import { Campo, ErrorFormulario, TituloBloque } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import css from '../../utils/css'
import { capitalizar, mascaraRut, mascaraTelefono, rutValido, soloLetras, telefonoValido } from '../../utils/format'

const VACIO = { rut: '', nombres: '', apellidos: '', email: '', telefono: '', contacto_emergencia: '', activo: true }

export default function SocioFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [socio, setSocio] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const titulo = id ? `Editar Socio: ${socio.nombres} ${socio.apellidos}` : 'Registrar Nuevo Socio'

  useEffect(() => {
    if (!id) return
    api.get(`/socios/${id}/`).then(({ data }) => setSocio({
      ...VACIO, ...data, telefono: mascaraTelefono(data.telefono),
      email: data.email || '', contacto_emergencia: data.contacto_emergencia || '',
    })).catch((e) => setError(mensajeError(e)))
  }, [id])

  const poner = (campo, valor) => {
    setSocio((s) => ({ ...s, [campo]: valor }))
    setErrores((e) => ({ ...e, [campo]: undefined }))
  }

  /** Al salir del campo RUT: valida el dígito verificador y avisa si ya está registrado. */
  async function revisarRut() {
    if (!socio.rut || id) return
    if (!rutValido(socio.rut)) {
      setErrores((e) => ({ ...e, rut: 'El RUT ingresado no es válido (el dígito verificador no corresponde).' }))
      return
    }
    try {
      const { data } = await api.get('/socios/', { params: { rut: socio.rut } })
      const otro = (data.results || [])[0]
      if (otro) setErrores((e) => ({ ...e, rut: `Ya existe un socio registrado con este RUT (${otro.nombres} ${otro.apellidos}).` }))
    } catch { /* el servidor vuelve a validar al guardar */ }
  }

  async function enviar(e) {
    e.preventDefault()
    const locales = {}
    if (!rutValido(socio.rut)) locales.rut = 'Ingrese un RUT válido.'
    else if (errores.rut) locales.rut = errores.rut
    if (!socio.nombres.trim()) locales.nombres = 'Ingrese los nombres.'
    if (!socio.apellidos.trim()) locales.apellidos = 'Ingrese los apellidos.'
    if (!telefonoValido(socio.telefono)) locales.telefono = 'Ingrese un teléfono de 9 dígitos (ej: +56 9 1234 5678).'
    if (socio.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(socio.email)) locales.email = 'Ingrese un correo válido.'
    if (Object.keys(locales).length) { setErrores(locales); return }

    setGuardando(true)
    setError(null)
    const cuerpo = {
      rut: socio.rut,
      nombres: capitalizar(socio.nombres),
      apellidos: capitalizar(socio.apellidos),
      telefono: socio.telefono,
      email: socio.email.trim() || null,
      contacto_emergencia: socio.contacto_emergencia.trim() || null,
      activo: socio.activo,
    }
    try {
      const { data } = id ? await api.put(`/socios/${id}/`, cuerpo) : await api.post('/socios/', cuerpo)
      toast.exito(id
        ? `Datos de ${data.nombres} ${data.apellidos} actualizados correctamente.`
        : `Socio ${data.nombres} ${data.apellidos} registrado exitosamente.`)
      navigate(`/socios/${data.id}`)
    } catch (err) {
      setErrores(erroresCampos(err))
      if (err.response?.status !== 400) setError(mensajeError(err))
    } finally {
      setGuardando(false)
    }
  }

  const clase = (campo) => `ios-input ${errores[campo] ? 'con-error' : ''}`

  return (
    <div style={css('max-width: 680px; margin: 0 auto;')}>
      <div style={css('margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;')}>
        <div>
          <h2 className="ios-title">{titulo}</h2>
          <p className="ios-subtitle">Ingrese los datos personales y de contacto del cliente del gimnasio.</p>
        </div>
        <Link to="/socios" className="btn-ios-secondary">← Volver al listado</Link>
      </div>

      <form onSubmit={enviar} className="ios-form" noValidate>
        <ErrorFormulario mensaje={error} />

        {/* Bloque 1: Identificación del Socio */}
        <div className="ios-card" style={css('margin-bottom: 1.25rem; padding: 1.5rem;')}>
          <TituloBloque>1. Identificación Oficial</TituloBloque>
          <Campo label="RUT del Socio" htmlFor="id_rut" error={errores.rut}
                 ayuda={id ? 'El RUT no se puede modificar.' : 'Se ordena automáticamente mientras escribe.'}>
            <input type="text" id="id_rut" className={clase('rut')} placeholder="Ej: 12.345.678-5 o 123456785" maxLength={12}
                   value={socio.rut} disabled={!!id} onChange={(e) => poner('rut', mascaraRut(e.target.value))} onBlur={revisarRut} />
          </Campo>
        </div>

        {/* Bloque 2: Datos Personales y Contacto */}
        <div className="ios-card" style={css('margin-bottom: 1.25rem; padding: 1.5rem;')}>
          <TituloBloque>2. Nombres y Teléfono</TituloBloque>
          <div className="form-grid">
            <Campo label="Nombres" htmlFor="id_nombres" error={errores.nombres}>
              <input type="text" id="id_nombres" className={clase('nombres')} placeholder="Ej: Juan Andrés" maxLength={100}
                     value={socio.nombres} onChange={(e) => poner('nombres', soloLetras(e.target.value))}
                     onBlur={() => poner('nombres', capitalizar(socio.nombres))} />
            </Campo>
            <Campo label="Apellidos" htmlFor="id_apellidos" error={errores.apellidos}>
              <input type="text" id="id_apellidos" className={clase('apellidos')} placeholder="Ej: Pérez Gómez" maxLength={100}
                     value={socio.apellidos} onChange={(e) => poner('apellidos', soloLetras(e.target.value))}
                     onBlur={() => poner('apellidos', capitalizar(socio.apellidos))} />
            </Campo>
          </div>
          <div className="form-grid" style={css('margin-top: 0.5rem;')}>
            <Campo label="Correo Electrónico" htmlFor="id_email" error={errores.email}>
              <input type="email" id="id_email" className={clase('email')} placeholder="ejemplo@correo.cl" maxLength={254}
                     value={socio.email} onChange={(e) => poner('email', e.target.value.replace(/\s/g, '').toLowerCase())} />
            </Campo>
            <Campo label="Teléfono de Contacto" htmlFor="id_telefono" error={errores.telefono}>
              <input type="text" id="id_telefono" className={clase('telefono')} placeholder="Ej: +56 9 1234 5678" inputMode="tel" maxLength={15}
                     value={socio.telefono} onChange={(e) => poner('telefono', mascaraTelefono(e.target.value))} />
            </Campo>
          </div>
        </div>

        {/* Bloque 3: Emergencia y Estado */}
        <div className="ios-card" style={css('margin-bottom: 1.5rem; padding: 1.5rem;')}>
          <TituloBloque>3. Seguridad y Estado</TituloBloque>
          <Campo label="Contacto de Emergencia" htmlFor="id_contacto_emergencia" error={errores.contacto_emergencia}>
            <input type="text" id="id_contacto_emergencia" className={clase('contacto_emergencia')} placeholder="Nombre y Teléfono" maxLength={255}
                   value={socio.contacto_emergencia} onChange={(e) => poner('contacto_emergencia', e.target.value)} />
          </Campo>
          <div className="form-group" style={css('display: flex; align-items: center; gap: 0.75rem; margin-top: 1.25rem;')}>
            <input type="checkbox" id="id_activo" className="ios-checkbox" checked={socio.activo} onChange={(e) => poner('activo', e.target.checked)} />
            <label htmlFor="id_activo" style={css('margin-bottom: 0; cursor: pointer;')}>Socio Activo (Permitir Contrataciones)</label>
          </div>
        </div>

        <div style={css('display: flex; justify-content: flex-end; gap: 1rem;')}>
          <Link to="/socios" className="btn-ios-secondary">Cancelar</Link>
          <button type="submit" className="btn-ios-primary" style={css('padding-left: 2rem; padding-right: 2rem;')} disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar Socio'}
          </button>
        </div>
      </form>
    </div>
  )
}
