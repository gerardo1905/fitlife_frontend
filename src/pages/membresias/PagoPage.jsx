import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { erroresCampos, mensajeError } from '../../api/client'
import { Campo, Cargando, ErrorFormulario, ModalConfirmacion } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import css from '../../utils/css'
import { formatoFecha, hoyISO, miles, sumarDias } from '../../utils/format'

const METODOS = [['EFECTIVO', 'Efectivo'], ['TRANSFERENCIA', 'Transferencia'], ['DEBITO', 'Débito'], ['CREDITO', 'Crédito']]
const fila = css('display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--ios-separator);')
const etiqueta = css('font-size: 0.9rem; font-weight: 500; color: var(--ios-text);')

export default function PagoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [m, setM] = useState(null)
  const [duracion, setDuracion] = useState(30)
  const [metodo, setMetodo] = useState('EFECTIVO')
  const [comprobante, setComprobante] = useState('')
  const [errores, setErrores] = useState({})
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(false)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    api.get(`/membresias/${id}/`).then(async ({ data }) => {
      if (data.estado !== 'PENDIENTE') {
        toast.error(`Esta membresía está '${data.estado_display}': solo se pueden cobrar membresías pendientes de pago.`)
        navigate(`/socios/${data.socio}`, { replace: true })
        return
      }
      setM(data)
      const plan = await api.get(`/planes/${data.plan}/`)
      setDuracion(plan.data.duracion_dias)
    }).catch((e) => setError(mensajeError(e)))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const requiereComprobante = metodo !== 'EFECTIVO'

  function abrirConfirmacion() {
    if (requiereComprobante && !comprobante.trim()) {
      setErrores({ comprobante_ref: 'Para pagos con transferencia o tarjeta debe ingresar el número de comprobante.' })
      return
    }
    setErrores({})
    setModal(true)
  }

  async function pagar() {
    setEnviando(true)
    try {
      // El monto NO se envía: el servidor cobra siempre el importe acordado.
      const { data } = await api.post(`/membresias/${id}/pagar/`, { metodo_pago: metodo, comprobante_ref: comprobante })
      const mem = data.membresia
      toast.exito(`Pago de $${miles(mem.importe_acordado)} registrado exitosamente a nombre de: ${mem.socio_nombre}`)
      toast.exito(`Membresía activa a nombre de: ${mem.socio_nombre} (del ${formatoFecha(mem.fecha_inicio)} al ${formatoFecha(mem.fecha_fin)})`)
      data.qr_enviado ? toast.exito(data.mensaje_qr) : toast.aviso(data.mensaje_qr)
      navigate(`/socios/${mem.socio}`)
    } catch (err) {
      setModal(false)
      setErrores(erroresCampos(err))
      setError(mensajeError(err))
    } finally {
      setEnviando(false)
    }
  }

  if (error && !m) return <ErrorFormulario mensaje={error} />
  if (!m) return <Cargando />
  // Si la fecha de inicio elegida ya pasó, el servidor la corre al día del pago.
  const inicio = m.fecha_inicio > hoyISO() ? m.fecha_inicio : hoyISO()

  return (
    <div style={css('max-width: 600px; margin: 0 auto;')}>
      <div style={css('margin-bottom: 1.5rem;')}>
        <h2 className="ios-title">Registrar Pago — Membresía #{m.id}</h2>
        <p className="ios-subtitle">Comprobante de cobro para el cliente.</p>
      </div>

      <ErrorFormulario mensaje={error} />

      {/* Resumen de la Membresia */}
      <div className="ios-card" style={css('margin-bottom: 1.25rem; padding: 0.5rem 1.5rem;')}>
        <div style={css('font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ios-muted); font-weight: 700; padding: 0.85rem 0 0.5rem 0; border-bottom: 1px solid var(--ios-separator);')}>
          Resumen de Contratación
        </div>
        <div style={fila}>
          <span style={etiqueta}>Socio Titular</span>
          <strong style={css('font-size: 0.95rem; color: var(--ios-text);')}>{m.socio_nombre}</strong>
        </div>
        <div style={fila}>
          <span style={etiqueta}>Plan Contratado</span>
          <span style={css('font-size: 0.95rem; color: var(--ios-subtext);')}>{m.plan_nombre}</span>
        </div>
        <div style={fila}>
          <span style={etiqueta}>Vigencia</span>
          <span style={css('font-size: 0.95rem; color: var(--ios-subtext);')}>{formatoFecha(inicio)} al {formatoFecha(sumarDias(inicio, duracion - 1))}</span>
        </div>
        <div style={css('display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0;')}>
          <span style={etiqueta}>Monto a Cobrar</span>
          <strong style={css('font-size: 1.1rem; color: var(--ios-blue);')}>${miles(m.importe_acordado)}</strong>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); abrirConfirmacion() }} className="ios-form" noValidate>
        <div className="ios-card" style={css('padding: 1.5rem; margin-bottom: 1.5rem;')}>
          <div style={css('font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ios-muted); font-weight: 700; margin-bottom: 1rem;')}>
            Detalle del Pago
          </div>
          <Campo label="Método de Pago" htmlFor="id_metodo_pago" error={errores.metodo_pago}>
            <select id="id_metodo_pago" className="ios-input" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
              {METODOS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </Campo>
          <Campo label={`Nº Comprobante / Referencia ${requiereComprobante ? '(Obligatorio)' : '(Opcional)'}`} htmlFor="id_comprobante_ref" error={errores.comprobante_ref}>
            <input type="text" id="id_comprobante_ref" className="ios-input" placeholder="Ej: Transbank #982341" maxLength={100}
                   value={comprobante} onChange={(e) => { setComprobante(e.target.value); setErrores({}) }} />
          </Campo>
        </div>

        <div style={css('display: flex; justify-content: flex-end; gap: 1rem;')}>
          <Link to={`/socios/${m.socio}`} className="btn-ios-secondary">Cobrar después</Link>
          <button type="submit" className="btn-ios-primary" style={css('padding-left: 2rem; padding-right: 2rem;')}>Confirmar y Guardar Pago</button>
        </div>
      </form>

      <ModalConfirmacion abierto={modal} icono="💳" titulo="Confirmar Cobro" textoConfirmar="Procesar Pago"
                         onConfirmar={pagar} onCerrar={() => setModal(false)} ocupado={enviando}>
        ¿Confirma la recepción de <strong>${miles(m.importe_acordado)}</strong> a nombre de <strong>{m.socio_nombre}</strong>?
      </ModalConfirmacion>
    </div>
  )
}
