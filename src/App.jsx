import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RutaProtegida from './components/RutaProtegida'
import { ADMIN, ENTRENADOR, RECEPCION, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AccesoPage from './pages/AccesoPage'
import PerfilPage from './pages/PerfilPage'
import CambiarPasswordPage from './pages/CambiarPasswordPage'
import NoEncontradaPage from './pages/NoEncontradaPage'
import SociosPage from './pages/socios/SociosPage'
import SocioFormPage from './pages/socios/SocioFormPage'
import SocioDetallePage from './pages/socios/SocioDetallePage'
import MembresiasPage from './pages/membresias/MembresiasPage'
import NuevaMembresiaPage from './pages/membresias/NuevaMembresiaPage'
import PagoPage from './pages/membresias/PagoPage'
import PlanesPage from './pages/membresias/PlanesPage'
import PlanFormPage from './pages/membresias/PlanFormPage'
import SesionesPage from './pages/clases/SesionesPage'
import SesionFormPage from './pages/clases/SesionFormPage'
import SesionDetallePage from './pages/clases/SesionDetallePage'
import ActividadesPage from './pages/clases/ActividadesPage'
import CatalogoFormPage from './pages/clases/CatalogoFormPage'
import EntrenadoresPage from './pages/entrenadores/EntrenadoresPage'
import EntrenadorDetallePage from './pages/entrenadores/EntrenadorDetallePage'
import EntrenadorFormPage from './pages/entrenadores/EntrenadorFormPage'
import MisSociosPage from './pages/entrenadores/MisSociosPage'
import EquiposPage from './pages/equipos/EquiposPage'
import EquipoFormPage from './pages/equipos/EquipoFormPage'
import EquipoDetallePage from './pages/equipos/EquipoDetallePage'
import GastosPage from './pages/gastos/GastosPage'
import GastoFormPage from './pages/gastos/GastoFormPage'
import CategoriasPage from './pages/gastos/CategoriasPage'
import CategoriaFormPage from './pages/gastos/CategoriaFormPage'
import UsuariosPage from './pages/usuarios/UsuariosPage'
import UsuarioFormPage from './pages/usuarios/UsuarioFormPage'
import UsuarioPasswordPage from './pages/usuarios/UsuarioPasswordPage'

function Inicio() {
  const { usuario } = useAuth()
  // Igual que el sistema original: el entrenador entra directo a su agenda de clases.
  return usuario?.rol === ENTRENADOR ? <Navigate to="/clases" replace /> : <DashboardPage />
}

const STAFF = [ADMIN, RECEPCION]
const TODOS = [ADMIN, RECEPCION, ENTRENADOR]

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="perfil" element={<PerfilPage />} />
          <Route path="perfil/cambiar-password" element={<CambiarPasswordPage />} />

          <Route element={<RutaProtegida roles={STAFF} />}>
            <Route path="acceso" element={<AccesoPage />} />
            <Route path="socios" element={<SociosPage />} />
            <Route path="socios/nuevo" element={<SocioFormPage />} />
            <Route path="socios/:id" element={<SocioDetallePage />} />
            <Route path="socios/:id/editar" element={<SocioFormPage />} />
            <Route path="membresias" element={<MembresiasPage />} />
            <Route path="membresias/nueva" element={<NuevaMembresiaPage />} />
            <Route path="membresias/:id/pago" element={<PagoPage />} />
            <Route path="planes" element={<PlanesPage />} />
            <Route path="entrenadores" element={<EntrenadoresPage />} />
            <Route path="entrenadores/:id" element={<EntrenadorDetallePage />} />
            <Route path="equipos" element={<EquiposPage />} />
            <Route path="equipos/:id" element={<EquipoDetallePage />} />
          </Route>

          <Route element={<RutaProtegida roles={TODOS} />}>
            <Route path="clases" element={<SesionesPage />} />
            <Route path="clases/nueva" element={<SesionFormPage />} />
            <Route path="clases/:id" element={<SesionDetallePage />} />
            <Route path="actividades" element={<ActividadesPage />} />
          </Route>

          <Route element={<RutaProtegida roles={[ENTRENADOR]} />}>
            <Route path="mis-socios" element={<MisSociosPage />} />
          </Route>

          <Route element={<RutaProtegida roles={[ADMIN]} />}>
            <Route path="planes/nuevo" element={<PlanFormPage />} />
            <Route path="planes/:id/editar" element={<PlanFormPage />} />
            <Route path="actividades/nueva" element={<CatalogoFormPage tipo="actividad" />} />
            <Route path="salas/nueva" element={<CatalogoFormPage tipo="sala" />} />
            <Route path="entrenadores/:id/editar" element={<EntrenadorFormPage />} />
            <Route path="equipos/nuevo" element={<EquipoFormPage />} />
            <Route path="equipos/:id/editar" element={<EquipoFormPage />} />
            <Route path="gastos" element={<GastosPage />} />
            <Route path="gastos/nuevo" element={<GastoFormPage />} />
            <Route path="gastos/categorias" element={<CategoriasPage />} />
            <Route path="gastos/categorias/nueva" element={<CategoriaFormPage />} />
            <Route path="gastos/categorias/:id/editar" element={<CategoriaFormPage />} />
            <Route path="trabajadores" element={<UsuariosPage />} />
            <Route path="trabajadores/nuevo" element={<UsuarioFormPage />} />
            <Route path="trabajadores/:id/editar" element={<UsuarioFormPage />} />
            <Route path="trabajadores/:id/password" element={<UsuarioPasswordPage />} />
          </Route>

          <Route path="*" element={<NoEncontradaPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
