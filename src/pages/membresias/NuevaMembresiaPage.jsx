import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api, { erroresCampos, mensajeError } from '../../api/client'
import { Campo, ErrorFormulario, ModalConfirmacion, SelectorSocio } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import css from '../../utils/css'
import { formatoFecha, hoyISO, miles, sumarDias } from '../../utils/format'

const filaResumen = css('display: flex; justify-content: space-between; padding: 0.3rem 0;')
const MAX_DIAS_INICIO = 60

export default function NuevaMembresiaPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [socio, setSocio] = useState(params.get('socio') || null)
  const [nombreSocio, setNombreSocio] = useState(null)
  const [planId, setPlanId] = useState('')
  const [fechaInicio, setFechaInicio] = useState(hoyISO())
  const [planes, setPlanes] = useState([])
  const [errores, setErrores] = useState({})
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(false)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    api.get('/planes/', { params: { activo: 'true' } }).then(({ data }) => setPlanes(data.results)).catch((e) => setError(mensajeError(e)))
    const preseleccionado = params.get('socio')
    if (preseleccionado) api.get(`/socios/${preseleccionado}/`).then(({ data }) => setNombreSocio(data.nombres)).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const plan = planes.find((p) => String(p.id) === String(planId))
  const hoy = hoyISO()
  const maxInicio = sumarDias(hoy, MAX_DIAS_INICIO)

  function abrirConfirmacion() {
    const locales = {}
    if (!socio) locales.socio = 'Seleccione un socio.'
    if (!planId) locales.plan = 'Seleccione un plan.'
    if (!fechaInicio) locales.fecha_inicio = 'Seleccione la fecha de inicio.'
    else if (fechaInicio < hoy) locales.fecha_inicio = 'La fecha de inicio no puede ser anterior a hoy.'
    else if (fechaInicio > maxInicio) locales.fecha_inicio = `Máximo ${MAX_DIAS_INICIO} días hacia adelante.`
    setErrores(locales)
    if (!Object.keys(locales).length) setModal(true)
  }

  async function enviar() {
    setEnviando(true)
    try {
      // Se envían socio, plan y fecha de inicio: término, importe y estado los calcula el servidor.
      const { data } = await api.post('/membresias/', { socio, plan: planId, fecha_inicio: fechaInicio })
      toast.info('Membresía creada como PENDIENTE DE PAGO. Se activará al registrar el pago.')
      navigate(`/membresias/${data.id}/pago`)
    } catch (err) {
      setModal(false)
      setErrores(erroresCampos(err))
      setError(mensajeError(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div style={css('max-width: 680px; margin: 0 auto;')}>
      <div style={css('margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;')}>
        <div>
          <h2 className="ios-title">{nombreSocio ? `Registrar Membresía — ${nombreSocio}` : 'Registrar Membresía'}</h2>
          <p className="ios-subtitle">Seleccione socio y plan. Las fechas y el importe se calculan automáticamente según el plan.</p>
        </div>
        <Link to="/membresias" className="btn-ios-secondary">← Volver</Link>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); abrirConfirmacion() }} className="ios-form" noValidate>
        <ErrorFormulario mensaje={error} />
        <div className="ios-card" style={css('padding: 1.5rem; margin-bottom: 1.5rem;')}>
          <Campo label="Socio Titular" htmlFor="id_socio" error={errores.socio}
                 ayuda="Solo aparecen socios activos que no tienen una membresía en curso.">
            <SelectorSocio id="id_socio" valor={socio} onChange={setSocio} error={errores.socio} filtros={{ sin_membresia: 'true' }}
                           vacio="No hay socios disponibles: todos los socios activos ya tienen una membresía en curso." />
          </Campo>

          <Campo label="Plan a Contratar" htmlFor="id_plan" error={errores.plan}>
            <select id="id_plan" className="ios-input" value={planId} onChange={(e) => setPlanId(e.target.value)}>
              <option value="">---------</option>
              {planes.map((p) => <option key={p.id} value={p.id}>{p.nombre} - ${miles(p.precio)} ({p.duracion_dias} días)</option>)}
            </select>
          </Campo>

          <Campo label="Fecha de Inicio" htmlFor="id_fecha_inicio" error={errores.fecha_inicio}
                 ayuda={`Desde hoy hasta ${MAX_DIAS_INICIO} días hacia adelante. La membresía dura 30 días desde esta fecha.`}>
            <input type="date" id="id_fecha_inicio" className="ios-input" min={hoy} max={maxInicio}
                   value={fechaInicio} onChange={(e) => { setFechaInicio(e.target.value); setErrores((x) => ({ ...x, fecha_inicio: undefined })) }} />
          </Campo>

          {/* Vista previa calculada (solo lectura) */}
          {plan && (
            <div style={css('margin-top: 0.5rem; padding: 1rem; background: var(--ios-bg); border-radius: var(--radius-ios-md);')}>
              <div style={filaResumen}>
                <span style={css('color: var(--ios-muted);')}>Vigencia</span>
                <strong>{formatoFecha(fechaInicio)} al {formatoFecha(sumarDias(fechaInicio, plan.duracion_dias - 1))}</strong>
              </div>
              <div style={filaResumen}>
                <span style={css('color: var(--ios-muted);')}>Importe a cobrar</span>
                <strong style={css('color: var(--ios-blue);')}>${miles(plan.precio)}</strong>
              </div>
              <p style={css('font-size: 0.78rem; color: var(--ios-muted); margin-top: 0.5rem;')}>
                La membresía queda <strong>pendiente de pago</strong> y se activa al registrar el cobro.
              </p>
            </div>
          )}
        </div>

        <div style={css('display: flex; justify-content: flex-end; gap: 1rem;')}>
          <Link to="/membresias" className="btn-ios-secondary">Cancelar</Link>
          <button type="submit" className="btn-ios-primary" style={css('padding-left: 2rem; padding-right: 2rem;')}>
            Registrar y Continuar al Pago →
          </button>
        </div>
      </form>

      <ModalConfirmacion abierto={modal} icono="📋" titulo="Confirmar Membresía" textoConfirmar="Confirmar Ingreso"
                         onConfirmar={enviar} onCerrar={() => setModal(false)} ocupado={enviando}>
        ¿Desea registrar esta membresía en el sistema y proceder a la pantalla de cobro?
      </ModalConfirmacion>
    </div>
  )
}
