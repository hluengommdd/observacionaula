**Componente React reutilizable para impresión**

He añadido un componente reutilizable listo para copiar: `src/components/PrintDocumentReusable.jsx` y sus estilos en `src/components/PrintDocumentReusable.css`.

Uso mínimo:

1. Importar los estilos globales de impresión (si los tienes) y el componente:

  import 'print-styles/css/print-variables.css'
  import 'print-styles/css/print.css'
  import PrintDocumentReusable from './src/components/PrintDocumentReusable'

2. Renderizar el componente con datos de ejemplo:

  const exampleData = {
    intro: 'Informe de observación institucional',
    sections: [
      {
        heading: 'Datos del alumno',
        paragraphs: ['Nombre: Juan Pérez', 'Grado: 5°'],
      },
      {
        heading: 'Observaciones',
        table: {
          headers: ['Ítem', 'Descripción'],
          rows: [[ 'Atención', 'Buena' ], [ 'Participación', 'Activa' ]]
        }
      }
    ]
  }

  <PrintDocumentReusable
    data={exampleData}
    logo="/assets/logo.png"
    title="Informe de Observación"
    footerText="Institución - Dirección"
    showPrintButton={true}
  />

3. Para auto imprimir al montar (por ejemplo en página dedicada), pasar `autoPrint={true}`.

El componente:
- Usa clases estándar: `print-document`, `print-header`, `print-body`, `print-section`, `print-footer`.
- Evita forzar comportamientos de paginado; utiliza `page-break-inside: avoid` en la CSS.

Si quieres, adapto este componente para exportarlo como paquete (ZIP) o lo transformo en un hook que prepare la impresión automáticamente.
