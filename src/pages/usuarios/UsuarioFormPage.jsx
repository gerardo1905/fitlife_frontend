import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { erroresCampos, mensajeError } from '../../api/client'
import { Campo, ErrorFormulario, TituloBloque } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import css from '../../utils/css'
import { capitalizar, mascaraRut, mascaraTelefono, rutValido, soloLetras, telefonoValido } from '../../utils/format'

const ROLES = [['ADMINISTRADOR', 'Administrador'], ['RECEPCIONISTA', 'Recepcionista'], ['ENTRENADOR', 'Entrenador']]

export default function UsuarioFormPage() {
  const { id } = useParams()
  const { usuario: yo } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [u, setU] = useState({ username: '', rut: '', first_name: '', last_name: '', email: '', telefono: '', rol: 'RECEPCIONISTA', password: '', is_active: true })
  const [usernameOriginal, setUsernameOriginal] = useState('')
  const [errores, setErrores] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    api.get(`/usuarios/${id}/`).then(({ data }) => {
      setU({ ...data, email: data.email || '', telefono: mascaraTelefono(data.telefono), password: '' })
      setUsernameOriginal(data.username)
    }).catch((e) => setError(mensajeError(e)))
  }, [id])

  const poner = (k, v) => { setU((x) => ({ ...x, [k]: v })); setErrores((e) => ({ ...e, [k]: undefined })) }
  const clase = (k) => `ios-input ${errores[k] ? 'con-error' : ''}`
  const esYoMismo = id && Number(id) === yo?.id

  async function enviar(e) {
    e.preventDefault()
    const l = {}
    if (!id) {
      if (!u.username || u.username.length < 3) l.username = 'Mínimo 3 caracteres.'
      if (!rutValido(u.rut)) l.rut = 'Ingrese un RUT válido.'
      if (!u.password || u.password.length < 8) l.password = 'La contraseña debe tener al menos 8 caracteres.'
    }
    if (!u.first_name.trim()) l.first_name = 'Ingrese los nombres.'
    if (!u.last_name.trim()) l.last_name = 'Ingrese los apellidos.'
    if (u.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email)) l.email = 'Ingrese un correo válido.'
    if (u.telefono && !telefonoValido(u.telefono)) l.telefono = 'Ingrese un teléfono de 9 dígitos.'
    if (Object.keys(l).length) { setErrores(l); return }

    const comunes = {
      first_name: capitalizar(u.first_name), last_name: capitalizar(u.last_name), email: u.email || '',
      telefono: u.telefono || null, rol: u.rol,
    }
    try {
      if (id) {
        await api.patch(`/usuarios/${id}/`, { ...comunes, is_active: u.is_active })
        toast.exito(`Datos de ${usernameOriginal} actualizados correctamente.`)
      } else {
        await api.post('/usuarios/', { ...comunes, username: u.username, rut: u.rut, password: u.password })
        toast.exito('Nuevo trabajador registrado correctamente.')
      }
      navigate('/trabajadores')
    } catch (err) {
      setErrores(erroresCampos(err))
      if (err.response?.status !== 400 || erroresCampos(err).detail) setError(mensajeError(err))
    }
  }

  return (
    <div style={css('max-width: 680px; margin: 0 auto;')}>
      <div style={css('margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;')}>
        <div>
          <h2 className="ios-title">{id ? `Editar Trabajador: ${usernameOriginal}` : 'Registrar Nuevo Trabajador'}</h2>
          <p className="ios-subtitle">Complete los campos para guardar la cuenta del trabajador.</p>
        </div>
        <Link to="/trabajadores" className="btn-ios-secondary">← Volver al listado</Link>
      </div>

      <form onSubmit={enviar} className="ios-form" noValidate>
        <ErrorFormulario mensaje={error} />

        {/* Bloque 1: Datos de Acceso e Identificación (solo al crear) */}
        {!id && (
          <div className="ios-card" style={css('margin-bottom: 1.25rem; padding: 1.5rem;')}>
            <TituloBloque>1. Identificación y Acceso</TituloBloque>
            <div className="form-grid">
              <Campo label="Nombre de Usuario" htmlFor="id_username" error={errores.username}>
                <input type="text" id="id_username" className={clase('username')} placeholder="Ej: carlos.silva" maxLength={30}
                       value={u.username} onChange={(e) => poner('username', e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))} />
              </Campo>
              <Campo label="RUT del Trabajador" htmlFor="id_rut" error={errores.rut}>
                <input type="text" id="id_rut" className={clase('rut')} placeholder="Ej: 12.345.678-5 o 123456785" maxLength={12}
                       value={u.rut} onChange={(e) => poner('rut', mascaraRut(e.target.value))}
                       onBlur={() => u.rut && !rutValido(u.rut) && setErrores((x) => ({ ...x, rut: 'El RUT ingresado no es válido (el dígito verificador no corresponde).' }))} />
              </Campo>
            </div>
          </div>
        )}

        {/* Bloque 2: Información Personal */}
        <div className="ios-card" style={css('margin-bottom: 1.25rem; padding: 1.5rem;')}>
          <TituloBloque>{id ? '1' : '2'}. Datos Personales</TituloBloque>
          <div className="form-grid">
            <Campo label="Nombres" htmlFor="id_first_name" error={errores.first_name}>
              <input type="text" id="id_first_name" className={clase('first_name')} placeholder="Ej: Carlos" maxLength={150}
                     value={u.first_name} onChange={(e) => poner('first_name', soloLetras(e.target.value))} onBlur={() => poner('first_name', capitalizar(u.first_name))} />
            </Campo>
            <Campo label="Apellidos" htmlFor="id_last_name" error={errores.last_name}>
              <input type="text" id="id_last_name" className={clase('last_name')} placeholder="Ej: Silva" maxLength={150}
                     value={u.last_name} onChange={(e) => poner('last_name', soloLetras(e.target.value))} onBlur={() => poner('last_name', capitalizar(u.last_name))} />
            </Campo>
          </div>
          <div className="form-grid" style={css('margin-top: 0.5rem;')}>
            <Campo label="Correo Electrónico" htmlFor="id_email" error={errores.email}>
              <input type="email" id="id_email" className={clase('email')} placeholder="correo@fitlife.cl" maxLength={254}
                     value={u.email} onChange={(e) => poner('email', e.target.value.replace(/\s/g, '').toLowerCase())} />
            </Campo>
            <Campo label="Teléfono de Contacto" htmlFor="id_telefono" error={errores.telefono}>
              <input type="text" id="id_telefono" className={clase('telefono')} placeholder="Ej: +56 9 1234 5678" inputMode="tel" maxLength={15}
                     value={u.telefono} onChange={(e) => poner('telefono', mascaraTelefono(e.target.value))} />
            </Campo>
          </div>
        </div>

        {/* Bloque 3: Rol y Estado */}
        <div className="ios-card" style={css('margin-bottom: 1.5rem; padding: 1.5rem;')}>
          <TituloBloque>{id ? '2' : '3'}. Permisos y Configuración</TituloBloque>
          <div className="form-grid">
            <Campo label="Rol en el Sistema" htmlFor="id_rol" error={errores.rol} ayuda={esYoMismo ? 'No puedes cambiar tu propio rol.' : null}>
              <select id="id_rol" className={clase('rol')} value={u.rol} disabled={esYoMismo} onChange={(e) => poner('rol', e.target.value)}>
                {ROLES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
              </select>
            </Campo>
            {!id && (
              <Campo label="Contraseña" htmlFor="id_password" error={errores.password}>
                <input type="password" id="id_password" className={clase('password')} placeholder="Mínimo 8 caracteres" maxLength={128} autoComplete="new-password"
                       value={u.password} onChange={(e) => poner('password', e.target.value)} />
              </Campo>
            )}
            {id && (
              <div className="form-group" style={css('display: flex; align-items: center; gap: 0.75rem; margin-top: 1.5rem;')}>
                <input type="checkbox" id="id_is_active" className="ios-checkbox" checked={u.is_active} disabled={esYoMismo}
                       onChange={(e) => poner('is_active', e.target.checked)} />
                <label htmlFor="id_is_active" style={css('margin-bottom: 0; cursor: pointer;')}>Permitir acceso a la plataforma (Cuenta Activa)</label>
              </div>
            )}
          </div>
        </div>

        <div style={css('display: flex; justify-content: flex-end; gap: 1rem;')}>
          <Link to="/trabajadores" className="btn-ios-secondary">Cancelar</Link>
          <button type="submit" className="btn-ios-primary" style={css('padding-left: 2rem; padding-right: 2rem;')}>Guardar Trabajador</button>
        </div>
      </form>
    </div>
  )
}
