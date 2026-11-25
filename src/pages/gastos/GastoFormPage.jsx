import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { erroresCampos, mensajeError } from '../../api/client'
import { Campo, ErrorFormulario } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import css from '../../utils/css'
import { hoyISO, soloDigitos } from '../../utils/format'

export default function GastoFormPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [categorias, setCategorias] = useState([])
  const [g, setG] = useState({ categoria: '', concepto: '', importe: '', fecha: hoyISO(), comprobante: '' })
  const [errores, setErrores] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/categorias-gasto/').then(({ data }) => setCategorias(data.results)).catch((e) => setError(mensajeError(e)))
  }, [])

  const poner = (k, v) => { setG((x) => ({ ...x, [k]: v })); setErrores((e) => ({ ...e, [k]: undefined })) }

  async function enviar(e) {
    e.preventDefault()
    const locales = {}
    if (!g.categoria) locales.categoria = 'Seleccione una categoría.'
    if (!g.concepto.trim()) locales.concepto = 'Ingrese el concepto.'
    if (!g.importe || Number(g.importe) < 1) locales.importe = 'El importe debe ser mayor a cero.'
    if (!g.fecha) locales.fecha = 'Ingrese la fecha.'
    else if (g.fecha > hoyISO()) locales.fecha = 'No se pueden registrar gastos con fecha futura.'
    if (Object.keys(locales).length) { setErrores(locales); return }
    try {
      const { data } = await api.post('/gastos/', { ...g, concepto: g.concepto.trim(), comprobante: g.comprobante.trim() || null })
      toast.exito(`Gasto '${data.concepto}' registrado correctamente.`)
      navigate('/gastos')
    } catch (err) {
      setErrores(erroresCampos(err))
      if (err.response?.status !== 400) setError(mensajeError(err))
    }
  }

  return (
    <div style={css('max-width: 640px; margin: 0 auto;')}>
      <div style={css('margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;')}>
        <div>
          <h2 className="ios-title">Registrar Nuevo Gasto</h2>
          <p className="ios-subtitle">Registra un egreso operativo del gimnasio.</p>
        </div>
        <Link to="/gastos" className="btn-ios-secondary">← Volver</Link>
      </div>
      <form onSubmit={enviar} className="ios-form" noValidate>
        <ErrorFormulario mensaje={error} />
        <div className="ios-card" style={css('padding: 1.5rem; margin-bottom: 1.5rem;')}>
          <Campo label="Categoría" htmlFor="id_categoria" error={errores.categoria}>
            <select id="id_categoria" className="ios-input" value={g.categoria} onChange={(e) => poner('categoria', e.target.value)}>
              <option value="">---------</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </Campo>
          <Campo label="Concepto / Detalle" htmlFor="id_concepto" error={errores.concepto}>
            <input type="text" id="id_concepto" className="ios-input" placeholder="Ej: Compra de artículos de limpieza" maxLength={150}
                   value={g.concepto} onChange={(e) => poner('concepto', e.target.value)} />
          </Campo>
          <div className="form-grid">
            <Campo label="Importe ($)" htmlFor="id_importe" error={errores.importe}>
              <input type="text" id="id_importe" className="ios-input" placeholder="Ej: 45000" inputMode="numeric" maxLength={9}
                     value={g.importe} onChange={(e) => poner('importe', soloDigitos(e.target.value))} />
            </Campo>
            <Campo label="Fecha del Gasto" htmlFor="id_fecha" error={errores.fecha}>
              <input type="date" id="id_fecha" className="ios-input" max={hoyISO()} value={g.fecha} onChange={(e) => poner('fecha', e.target.value)} />
            </Campo>
          </div>
          <Campo label="Referencia de Comprobante (Opcional)" htmlFor="id_comprobante" error={errores.comprobante}>
            <input type="text" id="id_comprobante" className="ios-input" placeholder="Ej: Boleta #4521" maxLength={100}
                   value={g.comprobante} onChange={(e) => poner('comprobante', e.target.value)} />
          </Campo>
        </div>
        <div style={css('display: flex; justify-content: flex-end; gap: 1rem;')}>
          <Link to="/gastos" className="btn-ios-secondary">Cancelar</Link>
          <button type="submit" className="btn-ios-primary" style={css('padding-left: 2rem; padding-right: 2rem;')}>Guardar Gasto</button>
        </div>
      </form>
    </div>
  )
}
