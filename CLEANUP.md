Repository cleanup performed

Resumen de acciones realizadas por el dev assistant antes del push:

- Eliminado local `node_modules` para liberar espacio (no se sube al repo).
- Eliminado `server.log` innecesario.
- Eliminado `public/veritas.jpg` (duplicado). Si lo necesitas, recupéralo desde tu copia local antes de subir.
- Añadido `.vite/` a `.gitignore` para evitar cache/build en el repo.
- Actualizado `.gitignore` y limpiado entradas duplicadas.
- Añadido `logoUrl` por defecto en `src/components/ObservacionForm.jsx` (usa `VITE_LOGO_URL` con fallback a `/logo-oficial.png`).
- `src/components/PrintDocument.jsx` modificado para usar `formData.logoUrl` o `VITE_LOGO_URL` con fallback a un SVG embebido (evita problemas de carga al imprimir).
- Commits y push realizados a `origin/main`.

Notas importantes:
- Asegúrate de no incluir credenciales en `.env.local` si vas a compartir el repositorio.
- Si quieres revertir alguno de los cambios, indícalo y lo deshago.
