import { Link } from 'react-router-dom'
import css from '../utils/css'

export default function SinPermisoPage() {
  return (
    <div style={css('max-width: 550px; margin: 4rem auto; text-align: center;')}>
      <div className="ios-card" style={css('padding: 3rem 2rem;')}>
        <div style={css('font-size: 4rem; margin-bottom: 1rem;')}>🔒</div>
        <h1 className="ios-title" style={css('font-size: 1.6rem; margin-bottom: 0.5rem;')}>Acceso denegado</h1>
        <p className="ios-subtitle" style={css('font-size: 1rem; margin-bottom: 2rem;')}>No tienes los permisos necesarios para realizar esta acción.</p>
        <Link to="/" className="btn-ios-primary">🏠 Volver al Panel Principal</Link>
      </div>
    </div>
  )
}
