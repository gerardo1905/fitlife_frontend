import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { mensajeError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Mensajes, useToast } from '../context/ToastContext'
import css from '../utils/css'

export default function LoginPage() {
  const { usuario, login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)

  if (usuario) return <Navigate to="/" replace />

  async function enviar(e) {
    e.preventDefault()
    setCargando(true)
    try {
      const u = await login(username.trim(), password)
      toast.exito(`¡Bienvenido de nuevo, ${u.first_name || u.username}!`)
      navigate(location.state?.desde || '/', { replace: true })
    } catch (err) {
      toast.error(err.response?.status === 401 ? 'Usuario o contraseña incorrectos.' : mensajeError(err))
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <header className="header-navbar">
        <div className="header-container">
          <Link to="/login" className="brand-logo"><span>FitLife 🏋️‍♂️</span><span className="brand-badge">Staff</span></Link>
          <nav className="nav-links"><Link to="/login" className="nav-link">Iniciar Sesión</Link></nav>
        </div>
      </header>
      {location.state?.expirada && (
        <div className="messages-wrapper"><div className="alert-toast info"><span>Tu sesión expiró. Ingresa nuevamente.</span></div></div>
      )}
      <Mensajes />
      <main className="main-wrapper">
        <div style={css('max-width: 420px; margin: 3rem auto 0;')}>
          <div className="ios-card" style={css('padding: 2.25rem 2rem;')}>
            <div style={css('text-align: center; margin-bottom: 2rem;')}>
              <div style={css('font-size: 2.5rem; margin-bottom: 0.5rem;')}>🏋️‍♂️</div>
              <h2 className="ios-title" style={css('font-size: 1.4rem;')}>Acceso FitLife Staff</h2>
              <p className="ios-subtitle">Ingresa tus credenciales para continuar</p>
            </div>
            <form onSubmit={enviar}>
              <div className="form-group">
                <label htmlFor="id_username">Nombre de Usuario</label>
                <input type="text" id="id_username" className="ios-input" placeholder="Ej: admin.fitlife" required autoFocus
                       autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="form-group" style={css('margin-bottom: 1.75rem;')}>
                <label htmlFor="id_password">Contraseña</label>
                <input type="password" id="id_password" className="ios-input" placeholder="••••••••" required
                       autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn-ios-primary" style={css('width: 100%; padding: 0.8rem; font-size: 1rem;')} disabled={cargando}>
                {cargando ? 'Ingresando…' : 'Ingresar al Sistema'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <footer className="footer-bar"><p>&copy; 2026 Centro Deportivo FitLife — Plataforma de Control Interno</p></footer>
    </>
  )
}
