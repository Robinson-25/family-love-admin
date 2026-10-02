# Family Love — Panel de administración

Panel para publicar y editar **Proyectos** y **Noticias** y ver las solicitudes de **Voluntarios**.
Hecho con **Next.js 14 + Tailwind CSS**. Solo entran usuarios con rol `admin` o `colaborator`.

## Dashboard
- Resumen de proyectos, noticias, solicitudes de voluntariado y usuarios registrados.
- Actividad de publicaciones en los últimos 6 o 12 meses, calculada con `createdAt` en la zona horaria de Lima.
- Publicaciones recientes, últimas solicitudes y accesos directos a los editores.
- Búsqueda, filtros, ordenación, paginación y vistas de tarjetas o lista para el contenido.
- Directorio de voluntarios con búsqueda y filtro de solicitudes del mes.
- Menú adaptable a móviles y búsqueda de secciones con `Ctrl/Cmd + K`.

Las métricas se consultan en el backend existente. Si un servicio falla, el panel muestra el error y permite volver a intentarlo.

### Verificación
```bash
npm test       # Fechas, periodos, ordenación y búsqueda
npm run lint
npm run build
```

## Empezar
```bash
npm install
cp .env.example .env.local   # en Windows: copy .env.example .env.local
npm run dev                  # http://localhost:3001
```

## Crear el primer administrador
1. Regístrate en el sitio público (o con `POST /api/v1/auth/register`).
2. En tu base de datos ejecuta:
   ```sql
   UPDATE `user` SET role = 'admin' WHERE email = 'tu-correo@gmail.com';
   ```
3. Inicia sesión en el panel.

## Variables de entorno
| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL del backend |
| `NEXT_PUBLIC_SITE_URL` | URL del sitio público |
| `NEXTAUTH_URL` | URL de este panel |
| `NEXTAUTH_SECRET` | Secreto de la sesión (usa uno distinto al del sitio) |
| `NEXT_PUBLIC_GOOGLE_ENABLED`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Opcional: entrar con Google |

## Publicar
En Vercel, como un proyecto aparte (por ejemplo `admin.tudominio.com`).
Recuerda agregar ese dominio en `CORS_ORIGINS` del backend.
