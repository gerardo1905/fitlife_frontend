# FitLife — Frontend (React + Tailwind)

Interfaz web del personal del gimnasio FitLife. Es una aplicación **independiente** del backend:
se comunica **solo** con la API REST (JSON) a través de **Amazon API Gateway**, autenticándose con **JWT**.

- React 18 + Vite · Tailwind CSS · React Router · Axios
- Login JWT, renovación automática del token (refresh) y cierre de sesión con invalidación en el servidor.
- Menú y rutas según el rol (Administrador, Recepcionista, Entrenador). La API vuelve a validar cada permiso.

## Módulos

Inicio (métricas) · Control de acceso con QR/RUT y aforo · Socios · Membresías (pendiente → pago → activa,
congelar, reactivar, cancelar, QR) · Planes · Clases (sesiones, inscripciones, lista de espera, asistencia) ·
Actividades y salas · Entrenadores y asignaciones · Equipamiento y mantenciones · Gastos y categorías ·
Trabajadores · Mi perfil.

## Ejecución local

Requiere Node.js 18 o superior y el backend corriendo en `http://localhost:8000`.

```bash
npm install
copy .env.example .env      # Linux/Mac: cp .env.example .env
npm run dev                 # http://localhost:5173
```

`VITE_API_URL` define a qué API se conecta (local o la URL de API Gateway).

## Producción (EC2 + Nginx)

```bash
echo "VITE_API_URL=https://<id>.execute-api.us-east-1.amazonaws.com/api" > .env
npm run build               # genera dist/
sudo cp -r dist/* /var/www/fitlife/
```

Configuración de Nginx en `deploy/nginx-frontend.conf`. La guía completa está en el repositorio del backend
(`docs/GUIA_DESPLIEGUE_AWS.md`).

## Seguridad en el cliente

- Los tokens se guardan en `sessionStorage` (se borran al cerrar la pestaña; no viajan solos como una cookie,
  por lo que no hay riesgo de CSRF). React escapa todo el contenido mostrado, lo que mitiga XSS.
- Ningún secreto vive en el frontend: `VITE_API_URL` es pública por definición.
- Los montos, fechas y permisos los decide siempre el servidor; el frontend solo los muestra.
