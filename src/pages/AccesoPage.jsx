import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { mensajeError } from '../api/client'
import { useToast } from '../context/ToastContext'
import css from '../utils/css'
import { horaDe } from '../utils/format'

export default function AccesoPage() {
  const toast = useToast()
  const [codigo, setCodigo] = useState('')
  const [resultado, setResultado] = useState(null)
  const [adentro, setAdentro] = useState([])
  const [enviando, setEnviando] = useState(false)
  const entrada = useRef(null)

  const cargar = useCallback(async () => {
    try {
      const { data } = await api.get('/accesos/', { params: { dentro: 'true' } })
      setAdentro(data.results)
    } catch (e) { toast.error(mensajeError(e)) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { cargar() }, [cargar])

  async function validar(e) {
    e.preventDefault()
    if (!codigo.trim()) return
    setEnviando(true)
    try {
      const { data } = await api.post('/accesos/validar/', { codigo: codigo.trim() })
      setResultado(data)
      setCodigo('')
      cargar()
    } catch (err) {
      toast.error(mensajeError(err))
    } finally {
      setEnviando(false)
      entrada.current?.focus()
    }
  }

  async function salida(item) {
    try {
      await api.post(`/accesos/${item.id}/salida/`)
      toast.info(`Salida de ${item.socio_nombre} registrada.`)
      cargar()
    } catch (err) { toast.error(mensajeError(err)) }
  }

  return (
    <div style={css('max-width: 900px; margin: 0 auto;')}>
      {/* Encabezado con Contador de Aforo Vivo */}
      <div className="ios-page-header">
        <div>
          <h2 className="ios-title">Control de Acceso &amp; Aforo 🛡️</h2>
          <p className="ios-subtitle">Validación instantánea de credenciales QR y registro de entrada/salida.</p>
        </div>
        <div style={css('background: var(--ios-card); padding: 0.6rem 1.25rem; border-radius: var(--radius-ios-md); border: 1px solid var(--ios-separator); box-shadow: var(--shadow-ios-card); text-align: right;')}>
          <span style={css('font-size: 0.75rem; text-transform: uppercase; color: var(--ios-muted); font-weight: 700; display: block;')}>Aforo Actual del Gimnasio</span>
          <strong style={css('font-size: 1.4rem; color: var(--ios-blue);')}>👥 {adentro.length} Socios Presentes</strong>
        </div>
      </div>

      {/* Caja de Escaneo QR / RUT */}
      <div className="ios-card" style={css('padding: 1.75rem; margin-bottom: 1.5rem; text-align: center; background: #ffffff;')}>
        <span style={css('font-size: 2.2rem; display: block; margin-bottom: 0.5rem;')}>📲</span>
        <h3 style={css('font-size: 1.15rem; font-weight: 700; color: var(--ios-text); margin-bottom: 0.2rem;')}>Escaneo de Código QR o RUT</h3>
        <p style={css('font-size: 0.875rem; color: var(--ios-subtext); margin-bottom: 1.25rem;')}>Escanee la credencial del cliente o digite el RUT para abrir el torniquete.</p>
        <form onSubmit={validar} style={css('max-width: 450px; margin: 0 auto; display: flex; gap: 0.75rem;')}>
          <input ref={entrada} type="text" className="ios-input" placeholder="Ej: 12.345.678-5 o 123456785" autoFocus required
                 maxLength={64} value={codigo} onChange={(e) => setCodigo(e.target.value)}
                 style={css('text-align: center; font-size: 1.1rem; font-weight: 700; letter-spacing: 0.05em;')} />
          <button type="submit" className="btn-ios-primary" style={css('padding: 0 1.5rem;')} disabled={enviando}>Validar Acceso</button>
        </form>
      </div>

      {/* Resultado Visual del Acceso (Pantalla de Torniquete) */}
      {resultado && (resultado.permitido ? (
        <div className="ios-card" style={css('background: var(--ios-green-bg); border: 2px solid #34c759; padding: 1.75rem; margin-bottom: 1.5rem; text-align: center; animation: fadeIn 0.25s ease-out;')}>
          <div style={css('font-size: 3rem; margin-bottom: 0.5rem;')}>🟢</div>
          <h2 style={css('font-size: 1.6rem; font-weight: 800; color: #14532d; margin-bottom: 0.2rem;')}>¡ACCESO AUTORIZADO!</h2>
          <p style={css('font-size: 1.1rem; font-weight: 700; color: #166534; margin-bottom: 1rem;')}>
            Bienvenido(a), {resultado.socio.nombres} {resultado.socio.apellidos}
          </p>
          <div style={css('display: inline-flex; gap: 1.5rem; background: rgba(255,255,255,0.7); padding: 0.75rem 1.5rem; border-radius: var(--radius-pill); font-size: 0.9rem; color: #14532d;')}>
            <span><strong>Plan:</strong> {resultado.membresia.plan_nombre}</span>
            <span><strong>Vigencia restante:</strong> {resultado.dias_restantes} Días</span>
          </div>
        </div>
      ) : (
        <div className="ios-card" style={css('background: var(--ios-red-bg); border: 2px solid #ff3b30; padding: 1.75rem; margin-bottom: 1.5rem; text-align: center; animation: fadeIn 0.25s ease-out;')}>
          <div style={css('font-size: 3rem; margin-bottom: 0.5rem;')}>🔴</div>
          <h2 style={css('font-size: 1.6rem; font-weight: 800; color: #7f1d1d; margin-bottom: 0.2rem;')}>ACCESO RECHAZADO</h2>
          <p style={css('font-size: 1.05rem; font-weight: 600; color: #991b1b; margin-bottom: 0.5rem;')}>{resultado.motivo}</p>
          {resultado.socio && (
            <Link to={`/socios/${resultado.socio.id}`} className="btn-ios-secondary" style={css('margin-top: 0.5rem; border-color: #fca5a5;')}>
              Ver Ficha del Socio / Regularizar Pago →
            </Link>
          )}
        </div>
      ))}

      {/* Listado de Socios Adentro Actualmente (Aforo) */}
      <div className="ios-card" style={css('padding: 1.5rem; margin-bottom: 1.5rem;')}>
        <h3 style={css('font-size: 1.1rem; font-weight: 700; color: var(--ios-text); margin-bottom: 1rem;')}>Socios en el Gimnasio (Marca de Salida) 🚪</h3>
        <div className="ios-table-container">
          <table className="ios-table">
            <thead><tr><th>Socio</th><th>RUT</th><th>Hora de Entrada</th><th style={css('text-align: right;')}>Acción</th></tr></thead>
            <tbody>
              {adentro.map((item) => (
                <tr key={item.id}>
                  <td><Link to={`/socios/${item.socio}`} style={css('color: var(--ios-text); font-weight: 600; text-decoration: none;')}>{item.socio_nombre}</Link></td>
                  <td style={css('color: var(--ios-subtext);')}>{item.socio_rut}</td>
                  <td style={css('color: var(--ios-subtext); font-size: 0.85rem;')}>{horaDe(item.fecha_hora_ingreso)} hrs</td>
                  <td style={css('text-align: right;')}>
                    <button type="button" className="btn-ios-secondary" style={css('padding: 0.35rem 0.75rem; font-size: 0.8rem;')} onClick={() => salida(item)}>
                      Registrar Salida 👋
                    </button>
                  </td>
                </tr>
              ))}
              {adentro.length === 0 && (
                <tr><td colSpan={4} style={css('text-align: center; color: var(--ios-muted); padding: 2rem;')}>No hay socios registrados dentro de las instalaciones en este momento.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
