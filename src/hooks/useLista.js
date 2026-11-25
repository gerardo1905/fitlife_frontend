import { useCallback, useEffect, useState } from 'react'
import api, { mensajeError } from '../api/client'

/**
 * Carga un listado paginado de DRF ({count, next, previous, results}).
 * También acepta respuestas sin paginar (arreglo simple).
 */
export default function useLista(url, params = {}) {
  const [datos, setDatos] = useState([])
  const [extra, setExtra] = useState({})
  const [pagina, setPagina] = useState(1)
  const [total, setTotal] = useState(0)
  const [hayMas, setHayMas] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const clave = JSON.stringify(params)

  const cargar = useCallback(async () => {
    if (!url) return
    setCargando(true)
    setError(null)
    try {
      const { data } = await api.get(url, { params: { ...JSON.parse(clave), page: pagina } })
      if (Array.isArray(data)) {
        setDatos(data); setTotal(data.length); setHayMas(false); setExtra({})
      } else {
        const { results, count, next, previous, ...resto } = data
        setDatos(results || []); setTotal(count || 0); setHayMas(!!next); setExtra(resto)
      }
    } catch (e) {
      setError(mensajeError(e))
    } finally {
      setCargando(false)
    }
  }, [url, clave, pagina])

  useEffect(() => { setPagina(1) }, [clave])
  useEffect(() => { cargar() }, [cargar])

  return { datos, extra, total, pagina, setPagina, hayMas, cargando, error, recargar: cargar }
}
