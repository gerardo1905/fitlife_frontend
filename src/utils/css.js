/**
 * Permite copiar los estilos en línea del HTML original tal cual:
 *   style={css('display: flex; gap: 0.75rem;')}
 * Convierte el texto CSS en el objeto que React necesita.
 */
const cache = new Map()

export default function css(texto) {
  if (cache.has(texto)) return cache.get(texto)
  const objeto = {}
  for (const declaracion of texto.split(';')) {
    const i = declaracion.indexOf(':')
    if (i < 0) continue
    const propiedad = declaracion.slice(0, i).trim()
    const valor = declaracion.slice(i + 1).trim()
    if (!propiedad) continue
    const clave = propiedad.startsWith('--') ? propiedad : propiedad.replace(/-([a-z])/g, (_, l) => l.toUpperCase())
    objeto[clave] = valor
  }
  cache.set(texto, objeto)
  return objeto
}
