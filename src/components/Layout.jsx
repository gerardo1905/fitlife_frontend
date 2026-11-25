import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ADMIN, ENTRENADOR, useAuth } from '../context/AuthContext'
import { Mensajes } from '../context/ToastContext'

/** Misma estructura que templates/base.html del sistema original. */
export default function Layout() {
  const { usuario, logout } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const location = useLocation()

  useEffect(() => { setMenuAbierto(false) }, [location.pathname])

  const esEntrenador = usuario?.rol === ENTRENADOR
  const esAdmin = usuario?.rol === ADMIN || usuario?.is_superuser

  return (
    <>
      {/* Header Translucido iOS */}
      <header className="header-navbar">
        <div className="header-container">
          <Link to="/" className="brand-logo">
            <span>FitLife 🏋️‍♂️</span>
            <span className="brand-badge">Staff</span>
          </Link>

          <button className="nav-toggle-btn" aria-label="Abrir menú" onClick={() => setMenuAbierto(!menuAbierto)}>☰</button>

          <nav className={`nav-links ${menuAbierto ? 'show' : ''}`}>
            {esEntrenador ? (
              <>
                {/* Menú Exclusivo para Entrenador */}
                <Link to="/clases" className="nav-link nav-highlight">📅 Mis Clases &amp; Agenda</Link>
                <Link to="/actividades" className="nav-link">🧘‍♀️ Actividades y Salas</Link>
                <Link to="/mis-socios" className="nav-link">🏃‍♂️ Mis Socios Asignados</Link>
              </>
            ) : (
              <>
                {/* Menú para Administrador y Recepcionista */}
                <Link to="/" className="nav-link">Inicio</Link>
                <Link to="/acceso" className="nav-link nav-highlight">⚡ Acceso / Aforo</Link>
                <Link to="/socios" className="nav-link">Socios</Link>
                <Link to="/membresias" className="nav-link">Membresías</Link>
                <Link to="/clases" className="nav-link">Clases</Link>
                <Link to="/planes" className="nav-link">Planes</Link>
                <Link to="/entrenadores" className="nav-link">Entrenadores</Link>
                <Link to="/equipos" className="nav-link">Equipamiento</Link>
                {esAdmin && (
                  <>
                    <Link to="/trabajadores" className="nav-link">Trabajadores</Link>
                    <Link to="/gastos" className="nav-link">Gastos</Link>
                  </>
                )}
              </>
            )}

            {/* Menú de Usuario / Perfil */}
            <div className="user-menu">
              <Link to="/perfil" className="user-pill" title="Editar Mi Perfil">
                👤 {usuario?.username} <span className="user-role">({usuario?.rol_display})</span>
              </Link>
              <button type="button" className="nav-link-logout" onClick={logout}>Salir</button>
            </div>
          </nav>
        </div>
      </header>

      {/* Alertas del Sistema */}
      <Mensajes />

      {/* Contenido Principal */}
      <main className="main-wrapper">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer-bar">
        <p>&copy; 2026 Centro Deportivo FitLife — Plataforma de Control Interno</p>
      </footer>
    </>
  )
}
