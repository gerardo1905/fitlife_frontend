import { Link } from 'react-router-dom'
import api, { mensajeError } from '../../api/client'
import { FilaVacia } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import useLista from '../../hooks/useLista'
import css from '../../utils/css'

export default function CategoriasPage() {
  const toast = useToast()
  const lista = useLista('/categorias-gasto/')

  async function eliminar(c) {
    if (!window.confirm(`¿Eliminar la categoría '${c.nombre}'? Esto no se puede deshacer.`)) return
    try {
      await api.delete(`/categorias-gasto/${c.id}/`)
      toast.exito(`Categoría '${c.nombre}' eliminada correctamente.`)
      lista.recargar()
    } catch (e) {
      toast.error(e.response?.status === 409
        ? `No se puede eliminar '${c.nombre}' porque tiene gastos registrados asociados. Elimina o reasigna esos gastos a otra categoría primero.`
        : mensajeError(e))
    }
  }

  return (
    <>
      <div className="ios-page-header">
        <div>
          <h2 className="ios-title">Categorías de Gasto 🗂️</h2>
          <p className="ios-subtitle">Clasificación de los egresos del gimnasio.</p>
        </div>
        <div style={css('display: flex; gap: 0.75rem;')}>
          <Link to="/gastos" className="btn-ios-secondary">← Volver a Gastos</Link>
          <Link to="/gastos/categorias/nueva" className="btn-ios-primary">+ Nueva Categoría</Link>
        </div>
      </div>
      <div className="ios-table-container">
        <table className="ios-table">
          <thead><tr><th>Nombre</th><th>Descripción</th><th style={css('text-align: right;')}>Acciones</th></tr></thead>
          <tbody>
            {lista.datos.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.nombre}</strong></td>
                <td style={css('color: var(--ios-subtext); font-size: 0.85rem;')}>{c.descripcion || 'Sin descripción'}</td>
                <td style={css('text-align: right;')}>
                  <Link to={`/gastos/categorias/${c.id}/editar`} className="btn-ios-link">Editar</Link>
                  <button type="button" className="btn-ios-link" style={css('color: var(--ios-red);')} onClick={() => eliminar(c)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {!lista.cargando && lista.datos.length === 0 && (
              <tr><td colSpan={3} style={css('text-align: center; color: var(--ios-muted); padding: 2rem;')}>No hay categorías creadas. Presione "+ Nueva Categoría" para agregar la primera.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
