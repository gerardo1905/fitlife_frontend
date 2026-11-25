import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { erroresCampos, mensajeError } from '../../api/client'
import { Campo } from '../../components/ui'
import { ENTRENADOR, useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import css from '../../utils/css'
import { hoyISO, soloDigitos } from '../../utils/format'

// Todas las clases duran 1 hora y comienzan a la hora en punto (06:00 a 21:00).
const HORAS = Array.from({ length: 16 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`)
const masUnaHora = (h) => `${String(Number(h.slice(0, 2)) + 1).padStart(2, '0')}:00`

const NOMBRES = { tipo_clase: 'Actividad', entrenador: 'Entrenador', sala: 'Sala', cupo_maximo: 'Cupo', fecha: 'Fecha', hora_inicio: 'Hora de inicio', non_field_errors: 'Error', detail: 'Error' }

export default function SesionFormPage() {
  const { usuario } = useAuth()
  const esEntrenador = usuario?.rol === ENTRENADOR
  const navigate = useNavigate()
  const toast = useToast()
  const [s, setS] = useState({ tipo_clase: '', entrenador: '', sala: '', cupo_maximo: '', fecha: hoyISO(), hora_inicio: '' })
  const [opc, setOpc] = useState({ tipos: [], salas: [], entrenadores: [] })
  const [errores, setErrores] = useState({})

  useEffect(() => {
    const peticiones = [api.get('/tipos-clase/'), api.get('/salas/')]
    if (!esEntrenador) peticiones.push(api.get('/entrenadores/'))
    Promise.all(peticiones).then(([t, sa, e]) => setOpc({
      tipos: t.data.results.filter((x) => x.activa),
      salas: sa.data.results.filter((x) => x.activa),
      entrenadores: e ? e.data.results.filter((x) => x.is_active) : [],
    })).catch((err) => toast.error(mensajeError(err)))
  }, [esEntrenador]) // eslint-disable-line react-hooks/exhaustive-deps

  const sala = opc.salas.find((x) => String(x.id) === String(s.sala))
  const poner = (k) => ({ value: s[k], onChange: (e) => setS({ ...s, [k]: e.target.value }) })

  async function enviar(e) {
    e.preventDefault()
    const locales = {}
    if (!s.tipo_clase) locales.tipo_clase = 'Seleccione la actividad.'
    if (!s.sala) locales.sala = 'Seleccione la sala.'
    if (!s.cupo_maximo || Number(s.cupo_maximo) < 1) locales.cupo_maximo = 'Ingrese un cupo de al menos 1.'
    else if (sala && Number(s.cupo_maximo) > sala.capacidad_maxima) locales.cupo_maximo = `El cupo supera la capacidad de la sala (${sala.capacidad_maxima}).`
    if (!s.fecha) locales.fecha = 'Seleccione la fecha.'
    else if (s.fecha < hoyISO()) locales.fecha = 'No se pueden programar sesiones en una fecha pasada.'
    if (!s.hora_inicio) locales.hora_inicio = 'Seleccione la hora de inicio.'
    if (Object.keys(locales).length) { setErrores(locales); return }

    try {
      // La hora de término no se envía: el servidor la calcula (inicio + 1 hora).
      const { data } = await api.post('/sesiones/', {
        tipo_clase: s.tipo_clase, sala: s.sala, cupo_maximo: Number(s.cupo_maximo), fecha: s.fecha,
        hora_inicio: s.hora_inicio, entrenador: esEntrenador ? undefined : (s.entrenador || null),
      })
      toast.exito(`Sesión de '${data.tipo_clase_nombre}' programada exitosamente.`)
      navigate('/clases')
    } catch (err) {
      setErrores(Object.keys(erroresCampos(err)).length ? erroresCampos(err) : { detail: mensajeError(err) })
    }
  }

  const listaErrores = Object.entries(errores).filter(([, v]) => v)

  return (
    <div style={css('max-width: 650px; margin: 0 auto;')}>
      <div style={css('margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;')}>
        <div>
          <h2 className="ios-title">Programar Sesión de Clase</h2>
          <p className="ios-subtitle">Seleccione la actividad, sala, horario y límite de participantes.</p>
        </div>
        <Link to="/clases" className="btn-ios-secondary">← Volver</Link>
      </div>

      {listaErrores.length > 0 && (
        <div style={css('background: var(--ios-red-bg); border: 1px solid #fecaca; color: #b91c1c; padding: 1rem; border-radius: var(--radius-ios-md); margin-bottom: 1.5rem;')}>
          <strong style={css('display: block; margin-bottom: 0.5rem;')}>⚠️ Corrige los siguientes errores antes de guardar:</strong>
          <ul style={css('margin-left: 1.25rem; font-size: 0.9rem;')}>
            {listaErrores.map(([campo, msg]) => <li key={campo}><strong>{NOMBRES[campo] || campo}:</strong> {msg}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={enviar} className="ios-form" noValidate>
        <div className="ios-card" style={css('padding: 1.5rem; margin-bottom: 1.5rem;')}>
          <Campo label="Actividad Deportiva" htmlFor="id_tipo_clase">
            <select id="id_tipo_clase" className="ios-input" {...poner('tipo_clase')}>
              <option value="">---------</option>
              {opc.tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre} ({t.duracion_minutos} min)</option>)}
            </select>
          </Campo>
          {!esEntrenador && (
            <Campo label="Entrenador a Cargo (Opcional)" htmlFor="id_entrenador">
              <select id="id_entrenador" className="ios-input" {...poner('entrenador')}>
                <option value="">---------</option>
                {opc.entrenadores.map((t) => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
              </select>
            </Campo>
          )}
          <div className="form-grid">
            <Campo label="Sala Reservada" htmlFor="id_sala">
              <select id="id_sala" className="ios-input" {...poner('sala')}>
                <option value="">---------</option>
                {opc.salas.map((t) => <option key={t.id} value={t.id}>{t.nombre} - Capacidad: {t.capacidad_maxima}</option>)}
              </select>
            </Campo>
            <Campo label="Cupo Máximo de Inscritos" htmlFor="id_cupo_maximo" ayuda={sala ? `Máximo ${sala.capacidad_maxima} personas.` : null}>
              <input type="text" id="id_cupo_maximo" className="ios-input" placeholder="Ej: 15" inputMode="numeric" maxLength={3}
                     value={s.cupo_maximo} onChange={(e) => setS({ ...s, cupo_maximo: soloDigitos(e.target.value) })} />
            </Campo>
          </div>
          <Campo label="Fecha de la Sesión" htmlFor="id_fecha">
            <input type="date" id="id_fecha" className="ios-input" min={hoyISO()} {...poner('fecha')} />
          </Campo>
          <div className="form-grid">
            <Campo label="Hora de Inicio" htmlFor="id_hora_inicio">
              <select id="id_hora_inicio" className="ios-input" {...poner('hora_inicio')}>
                <option value="">---------</option>
                {HORAS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </Campo>
            <Campo label="Hora de Término" htmlFor="id_hora_fin" ayuda="Todas las clases duran 1 hora.">
              <input type="text" id="id_hora_fin" className="ios-input" disabled value={s.hora_inicio ? masUnaHora(s.hora_inicio) : '—'} />
            </Campo>
          </div>
        </div>
        <div style={css('display: flex; justify-content: flex-end; gap: 1rem;')}>
          <Link to="/clases" className="btn-ios-secondary">Cancelar</Link>
          <button type="submit" className="btn-ios-primary" style={css('padding-left: 2rem; padding-right: 2rem;')}>Guardar Sesión</button>
        </div>
      </form>
    </div>
  )
}
