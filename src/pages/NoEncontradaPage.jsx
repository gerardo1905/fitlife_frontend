import { Link } from 'react-router-dom'
import css from '../utils/css'

export default function NoEncontradaPage() {
  return (
    <div style={css('max-width: 550px; margin: 4rem auto; text-align: center;')}>
      <div className="ios-card" style={css('padding: 3rem 2rem;')}>
        <div style={css('font-size: 4rem; margin-bottom: 1rem;')}>🔍</div>
        <h1 className="ios-title" style={css('font-size: 2rem; margin-bottom: 0.5rem;')}>404 — Página No Encontrada</h1>
        <p className="ios-subtitle" style={css('font-size: 1rem; margin-bottom: 2rem; line-height: 1.5;')}>
          La ruta o dirección ingresada no existe en la plataforma FitLife o fue movida.
        </p>
        <div><Link to="/" className="btn-ios-primary" style={css('padding: 0.8rem 2rem;')}>🏠 Volver al Panel Principal</Link></div>
      </div>
    </div>
  )
}
