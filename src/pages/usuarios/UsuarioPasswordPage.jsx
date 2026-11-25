import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { erroresCampos, mensajeError } from '../../api/client'
import { Campo } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import css from '../../utils/css'

export default function UsuarioPasswordPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [trabajador, setTrabajador] = useState(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/usuarios/${id}/`).then(({ data }) => setTrabajador(data)).catch((e) => toast.error(mensajeError(e)))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function enviar(e) {
    e.preventDefault()
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    try {
      const { data } = await api.post(`/usuarios/${id}/cambiar-password/`, { password })
      toast.exito(data.detail)
      navigate('/trabajadores')
    } catch (err) { setError(erroresCampos(err).password || mensajeError(err)) }
  }

  return (
    <div style={css('max-width: 500px; margin: 0 auto;')}>
      <div style={css('margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;')}>
        <div>
          <h2 className="ios-title">Cambiar Contraseña</h2>
          <p className="ios-subtitle">Trabajador: {trabajador ? `${trabajador.first_name} ${trabajador.last_name} (${trabajador.username})` : ''}</p>
        </div>
        <Link to="/trabajadores" className="btn-ios-secondary">← Volver</Link>
      </div>
      <form onSubmit={enviar} className="ios-form" noValidate>
        <div className="ios-card" style={css('padding: 1.5rem; margin-bottom: 1.5rem;')}>
          <Campo label="Nueva Contraseña" htmlFor="password" error={error}
                 ayuda="Mínimo 8 caracteres; no puede ser solo números ni una contraseña común.">
            <input type="password" id="password" className="ios-input" placeholder="Mínimo 8 caracteres" autoFocus maxLength={128}
                   autoComplete="new-password" value={password} onChange={(e) => { setPassword(e.target.value); setError(null) }} />
          </Campo>
        </div>
        <div style={css('display: flex; justify-content: flex-end; gap: 1rem;')}>
          <Link to="/trabajadores" className="btn-ios-secondary">Cancelar</Link>
          <button type="submit" className="btn-ios-primary">Actualizar Contraseña</button>
        </div>
      </form>
    </div>
  )
}
