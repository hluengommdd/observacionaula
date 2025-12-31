# ObservacionAula - Servidor local de prueba

Este repositorio contiene una página `index.html` y un servidor Node mínimo (`server.js`) que sirve archivos estáticos y expone dos endpoints proxy a Supabase:

- `GET /api/docentes` - devuelve `id,nombre` ordenado por `nombre`.
- `POST /api/observaciones` - inserta una fila en `observaciones` y luego inserta las `respuestas`; si alguna respuesta falla, intenta eliminar la observación insertada (compensating delete).

Requisitos:

- Node.js 18+ (para `fetch` global).

Variables de entorno necesarias para usar los endpoints API:

- `SUPABASE_URL` (ej: `https://xyz.supabase.co`)
- `SUPABASE_KEY` (service role key o una key con permisos de inserción)

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
