Observación Aula

Pequeña aplicación React para registrar observaciones docentes y generar un documento imprimible.

Requisitos
- Node 18+ y npm
- (Opcional) Supabase project y credenciales para sincronizar observaciones

Instalación

1. Instala dependencias:

```bash
npm install
```

2. Variables de entorno (local): crea `.env.local` con al menos:

```
VITE_LOGO_URL=/logo-oficial.png
VITE_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_URL=https://...your-supabase-url...
SUPABASE_KEY=your-service-role-key
```

Nota: el código utiliza `import.meta.env.VITE_LOGO_URL || '/logo-oficial.png'` como fallback, por lo que si no defines `VITE_LOGO_URL` se usará `/logo-oficial.png`. `VITE_LOGO_URL` puede apuntar a un archivo en `public/` (ej. `/logo-oficial.png`) o a una URL externa.

Desarrollo

Arrancar el servidor de desarrollo (Vite):

```bash
npm run dev
```

La app estará disponible en `http://localhost:5173/` (puede usar otro puerto si está ocupado).

API proxy (opcional)

El proyecto incluye `server.js` que actúa como proxy sencillo hacia la REST API de Supabase. Para usarlo define `SUPABASE_URL` y `SUPABASE_KEY` en el entorno y luego:

```bash
node server.js
```

Imprimir

La vista de impresión usa `src/components/PrintDocument.jsx`. El logo se toma de `formData.logoUrl`, luego de `VITE_LOGO_URL`, y finalmente cae a un SVG embebido para garantizar que siempre haya un logo al imprimir.

Buenas prácticas antes de subir
- No incluyas `.env.local` en el repo (ya está en `.gitignore`).
- Revisa que no haya claves sensibles en historial de git.

Contacto
Si necesitas que ajuste el logo, el layout de impresión, o la integración con Supabase, dime y lo implemento.
# ObservacionAula - Servidor local de prueba

Este repositorio contiene una página `index.html` y un servidor Node mínimo (`server.js`) que sirve archivos estáticos y expone dos endpoints proxy a Supabase:

- `GET /api/docentes` - devuelve `id,nombre` ordenado por `nombre`.
- `POST /api/observaciones` - inserta una fila en `observaciones` y luego inserta las `respuestas`; si alguna respuesta falla, intenta eliminar la observación insertada (compensating delete).

Requisitos:

- Node.js 18+ (para `fetch` global).

Variables de entorno necesarias para usar los endpoints API:

- `SUPABASE_URL` (ej: `https://xyz.supabase.co`)
- `SUPABASE_KEY` (service role key o una key con permisos de inserción)

Para el cliente frontend define `VITE_SUPABASE_ANON_KEY` (clave pública, con permisos limitados). No expongas `SUPABASE_KEY` en el cliente.

Ejemplo para ejecutar localmente:

```bash
cd path/to/observacionaula
export SUPABASE_URL="https://mgiwhpggvgjbwiarhgym.supabase.co"
export SUPABASE_KEY="<tu_service_role_key_aqui>"
node server.js
```

Luego abre en el navegador: http://localhost:3000

Pruebas rápidas con `curl`:

```bash
# Obtener docentes
curl -sS "http://localhost:3000/api/docentes"

# Insertar observación + respuestas (payload ejemplo)
curl -sS -X POST "http://localhost:3000/api/observaciones" \
  -H "Content-Type: application/json" \
  -d '{"observacion":{"docente_id":"<uuid>","curso":"1A","asignatura":"Matemática","observador":"Jefa de UTP","fecha":"2025-12-30"},"respuestas":[{"indicador_id":1,"valor":1},{"indicador_id":2,"valor":0}] }'
```

Notas de seguridad:

- No subas `SUPABASE_KEY` (service role) públicamente. Usa variables de entorno en entorno controlado.
