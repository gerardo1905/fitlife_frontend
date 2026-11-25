import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { erroresCampos, mensajeError } from '../../api/client'
import { Campo, ErrorFormulario } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import css from '../../utils/css'

export default function CategoriaFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [c, setC] = useState({ nombre: '', descripcion: '' })
  const [nombreOriginal, setNombreOriginal] = useState('')
  const [errores, setErrores] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    api.get(`/categorias-gasto/${id}/`).then(({ data }) => { setC({ nombre: data.nombre, descripcion: data.descripcion || '' }); setNombreOriginal(data.nombre) })
      .catch((e) => setError(mensajeError(e)))
  }, [id])

  async function enviar(e) {
    e.preventDefault()
    if (!c.nombre.trim()) { setErrores({ nombre: 'Ingrese el nombre de la categoría.' }); return }
    const cuerpo = { nombre: c.nombre.trim(), descripcion: c.descripcion.trim() || null }
    try {
      const { data } = id ? await api.put(`/categorias-gasto/${id}/`, cuerpo) : await api.post('/categorias-gasto/', cuerpo)
      toast.exito(id ? `Categoría '${data.nombre}' actualizada correctamente.` : `Categoría '${data.nombre}' creada correctamente.`)
      navigate('/gastos/categorias')
    } catch (err) {
      setErrores(erroresCampos(err))
      if (err.response?.status !== 400) setError(mensajeError(err))
    }
  }

  return (
    <div style={css('max-width: 560px; margin: 0 auto;')}>
      <div style={css('margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;')}>
        <div>
          <h2 className="ios-title">{id ? `Editar Categoría: ${nombreOriginal}` : 'Nueva Categoría de Gasto'}</h2>
          <p className="ios-subtitle">Define una categoría para clasificar los gastos.</p>
        </div>
        <Link to="/gastos/categorias" className="btn-ios-secondary">← Volver</Link>
      </div>
      <form onSubmit={enviar} className="ios-form" noValidate>
        <ErrorFormulario mensaje={error} />
        <div className="ios-card" style={css('padding: 1.5rem; margin-bottom: 1.5rem;')}>
          <Campo label="Nombre de la Categoría" htmlFor="id_nombre" error={errores.nombre}>
            <input type="text" id="id_nombre" className="ios-input" placeholder="Ej: Mantenimiento de Equipos" maxLength={50}
                   value={c.nombre} onChange={(e) => { setC({ ...c, nombre: e.target.value }); setErrores({}) }} />
          </Campo>
          <Campo label="Descripción" htmlFor="id_descripcion">
            <textarea id="id_descripcion" className="ios-input" rows={2} maxLength={300}
                      placeholder="Ej: Gastos asociados a reparación y mantención de máquinas."
                      value={c.descripcion} onChange={(e) => setC({ ...c, descripcion: e.target.value })} />
          </Campo>
        </div>
        <div style={css('display: flex; justify-content: flex-end; gap: 1rem;')}>
          <Link to="/gastos/categorias" className="btn-ios-secondary">Cancelar</Link>
          <button type="submit" className="btn-ios-primary" style={css('padding-left: 2rem; padding-right: 2rem;')}>Guardar Categoría</button>
        </div>
      </form>
    </div>
  )
}
