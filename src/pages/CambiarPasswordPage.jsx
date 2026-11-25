import { useState } from 'react'
import { Link } from 'react-router-dom'
import api, { erroresCampos, mensajeError } from '../api/client'
import { Campo } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import css from '../utils/css'

export default function CambiarPasswordPage() {
  const { logout } = useAuth()
  const toast = useToast()
  const [v, setV] = useState({ password_actual: '', password_nueva: '', confirmacion: '' })
  const [errores, setErrores] = useState({})

  async function enviar(e) {
    e.preventDefault()
    if (v.password_nueva !== v.confirmacion) { setErrores({ confirmacion: 'Las dos contraseñas no coinciden.' }); return }
    try {
      await api.post('/auth/cambiar-password/', { password_actual: v.password_actual, password_nueva: v.password_nueva })
      toast.exito('Tu contraseña ha sido actualizada con éxito. Inicia sesión nuevamente.')
      logout()
    } catch (err) {
      const campos = erroresCampos(err)
      setErrores(Object.keys(campos).length ? campos : { password_actual: mensajeError(err) })
    }
  }

  const campo = (k) => ({ value: v[k], onChange: (e) => { setV({ ...v, [k]: e.target.value }); setErrores({}) } })

  return (
    <div style={css('max-width: 500px; margin: 0 auto;')}>
      <div style={css('margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;')}>
        <div>
          <h2 className="ios-title">Cambiar Contraseña 🔑</h2>
          <p className="ios-subtitle">Actualiza tu clave de acceso al sistema.</p>
        </div>
        <Link to="/perfil" className="btn-ios-secondary">← Volver</Link>
      </div>
      <form onSubmit={enviar} className="ios-form" noValidate>
        <div className="ios-card" style={css('padding: 1.5rem; margin-bottom: 1.5rem;')}>
          <Campo label="Contraseña antigua" htmlFor="id_old" error={errores.password_actual}>
            <input type="password" id="id_old" className="ios-input" autoComplete="current-password" maxLength={128} {...campo('password_actual')} />
          </Campo>
          <Campo label="Contraseña nueva" htmlFor="id_new1" error={errores.password_nueva}
                 ayuda="Mínimo 8 caracteres; no puede ser solo números, ni una contraseña común, ni parecida a tus datos.">
            <input type="password" id="id_new1" className="ios-input" autoComplete="new-password" maxLength={128} {...campo('password_nueva')} />
          </Campo>
          <Campo label="Confirmación de contraseña nueva" htmlFor="id_new2" error={errores.confirmacion}>
            <input type="password" id="id_new2" className="ios-input" autoComplete="new-password" maxLength={128} {...campo('confirmacion')} />
          </Campo>
        </div>
        <div style={css('display: flex; justify-content: flex-end; gap: 1rem;')}>
          <Link to="/perfil" className="btn-ios-secondary">Cancelar</Link>
          <button type="submit" className="btn-ios-primary">Actualizar Contraseña</button>
        </div>
      </form>
    </div>
  )
}
