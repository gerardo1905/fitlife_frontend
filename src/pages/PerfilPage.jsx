import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { erroresCampos, mensajeError } from '../api/client'
import { Campo } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import css from '../utils/css'
import { capitalizar, mascaraTelefono, soloLetras, telefonoValido } from '../utils/format'

const fila = css('display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 0; border-bottom: 1px solid var(--ios-separator);')
const etiqueta = css('font-size: 0.9rem; font-weight: 500; color: var(--ios-text);')

export default function PerfilPage() {
  const { actualizarUsuario } = useAuth()
  const toast = useToast()
  const [perfil, setPerfil] = useState(null)
  const [errores, setErrores] = useState({})

  useEffect(() => {
    api.get('/auth/perfil/').then(({ data }) => setPerfil({ ...data, email: data.email || '', telefono: mascaraTelefono(data.telefono) }))
      .catch((e) => toast.error(mensajeError(e)))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!perfil) return null
  const poner = (k, v) => { setPerfil((p) => ({ ...p, [k]: v })); setErrores((e) => ({ ...e, [k]: undefined })) }

  async function enviar(e) {
    e.preventDefault()
    const l = {}
    if (!perfil.first_name.trim()) l.first_name = 'Ingrese sus nombres.'
    if (!perfil.last_name.trim()) l.last_name = 'Ingrese sus apellidos.'
    if (perfil.telefono && !telefonoValido(perfil.telefono)) l.telefono = 'Ingrese un teléfono de 9 dígitos.'
    if (Object.keys(l).length) { setErrores(l); return }
    try {
      const { data } = await api.patch('/auth/perfil/', {
        first_name: capitalizar(perfil.first_name), last_name: capitalizar(perfil.last_name),
        email: perfil.email, telefono: perfil.telefono || null,
      })
      actualizarUsuario(data)
      toast.exito('Tu perfil ha sido actualizado correctamente.')
    } catch (err) { setErrores(erroresCampos(err)) }
  }

  return (
    <div style={css('max-width: 650px; margin: 0 auto;')}>
      <div style={css('margin-bottom: 1.5rem;')}>
        <h2 className="ios-title">Mi Perfil Profesional 👤</h2>
        <p className="ios-subtitle">Información personal de tu cuenta y rol asignado en la plataforma.</p>
      </div>

      {/* Bloque 1: Resumen de Cuenta */}
      <div className="ios-card" style={css('margin-bottom: 1.5rem; padding: 0.5rem 1.5rem;')}>
        <div style={css('font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ios-muted); font-weight: 700; padding: 0.85rem 0 0.5rem 0; border-bottom: 1px solid var(--ios-separator);')}>
          Credenciales de Acceso
        </div>
        <div style={fila}><span style={etiqueta}>Nombre de Usuario</span><strong style={css('font-size: 0.95rem; color: var(--ios-text);')}>{perfil.username}</strong></div>
        <div style={fila}><span style={etiqueta}>RUT del Trabajador</span><span style={css('font-size: 0.95rem; color: var(--ios-subtext);')}>{perfil.rut}</span></div>
        <div style={fila}><span style={etiqueta}>Rol en el Sistema</span><span className="ios-badge blue">{perfil.rol_display}</span></div>
        <div style={css('display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 0;')}>
          <span style={etiqueta}>Estado de la Cuenta</span><span className="ios-badge green">Activa</span>
        </div>
      </div>

      {/* Bloque 2: Formulario de Edición de Datos Personales */}
      <form onSubmit={enviar} className="ios-form" noValidate>
        <div className="ios-card" style={css('margin-bottom: 1.5rem; padding: 1.5rem;')}>
          <div style={css('font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ios-muted); font-weight: 700; margin-bottom: 1.25rem;')}>
            Datos Personales de Contacto
          </div>
          <div className="form-grid">
            <Campo label="Nombres" htmlFor="id_first_name" error={errores.first_name}>
              <input type="text" id="id_first_name" className="ios-input" maxLength={150} value={perfil.first_name}
                     onChange={(e) => poner('first_name', soloLetras(e.target.value))} onBlur={() => poner('first_name', capitalizar(perfil.first_name))} />
            </Campo>
            <Campo label="Apellidos" htmlFor="id_last_name" error={errores.last_name}>
              <input type="text" id="id_last_name" className="ios-input" maxLength={150} value={perfil.last_name}
                     onChange={(e) => poner('last_name', soloLetras(e.target.value))} onBlur={() => poner('last_name', capitalizar(perfil.last_name))} />
            </Campo>
          </div>
          <div className="form-grid" style={css('margin-top: 0.5rem;')}>
            <Campo label="Correo Electrónico" htmlFor="id_email" error={errores.email}>
              <input type="email" id="id_email" className="ios-input" maxLength={254} value={perfil.email}
                     onChange={(e) => poner('email', e.target.value.replace(/\s/g, '').toLowerCase())} />
            </Campo>
            <Campo label="Teléfono" htmlFor="id_telefono" error={errores.telefono}>
              <input type="text" id="id_telefono" className="ios-input" placeholder="+56 9 1234 5678" inputMode="tel" maxLength={15}
                     value={perfil.telefono} onChange={(e) => poner('telefono', mascaraTelefono(e.target.value))} />
            </Campo>
          </div>
        </div>
        <div style={css('display: flex; justify-content: space-between; align-items: center; gap: 1rem;')}>
          <Link to="/perfil/cambiar-password" className="btn-ios-secondary">🔑 Cambiar Contraseña</Link>
          <button type="submit" className="btn-ios-primary" style={css('padding-left: 1.75rem; padding-right: 1.75rem;')}>Guardar Cambios</button>
        </div>
      </form>
    </div>
  )
}
