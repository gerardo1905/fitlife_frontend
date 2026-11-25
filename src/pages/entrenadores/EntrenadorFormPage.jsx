import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { mensajeError } from '../../api/client'
import { Campo, ErrorFormulario } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import css from '../../utils/css'

export default function EntrenadorFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [entrenador, setEntrenador] = useState(null)
  const [especialidad, setEspecialidad] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/entrenadores/${id}/`).then(({ data }) => { setEntrenador(data); setEspecialidad(data.especialidad || '') })
      .catch((e) => setError(mensajeError(e)))
  }, [id])

  async function enviar(e) {
    e.preventDefault()
    try {
      await api.patch(`/entrenadores/${id}/`, { especialidad: especialidad.trim() || null })
      toast.exito(`Especialidad de ${entrenador.first_name} ${entrenador.last_name} actualizada correctamente.`)
      navigate(`/entrenadores/${id}`)
    } catch (err) { setError(mensajeError(err)) }
  }

  return (
    <div style={css('max-width: 560px; margin: 0 auto;')}>
      <div style={css('margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;')}>
        <div>
          <h2 className="ios-title">Editar Especialidad: {entrenador ? `${entrenador.first_name} ${entrenador.last_name}` : ''}</h2>
          <p className="ios-subtitle">Define la especialidad principal del entrenador.</p>
        </div>
        <Link to={`/entrenadores/${id}`} className="btn-ios-secondary">← Volver</Link>
      </div>
      <form onSubmit={enviar} className="ios-form">
        <ErrorFormulario mensaje={error} />
        <div className="ios-card" style={css('padding: 1.5rem; margin-bottom: 1.5rem;')}>
          <Campo label="Especialidad Principal" htmlFor="id_especialidad">
            <input type="text" id="id_especialidad" className="ios-input" placeholder="Ej: Musculación y Fuerza" maxLength={100}
                   value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} />
          </Campo>
        </div>
        <div style={css('display: flex; justify-content: flex-end; gap: 1rem;')}>
          <Link to={`/entrenadores/${id}`} className="btn-ios-secondary">Cancelar</Link>
          <button type="submit" className="btn-ios-primary" style={css('padding-left: 2rem; padding-right: 2rem;')}>Guardar</button>
        </div>
      </form>
    </div>
  )
}
