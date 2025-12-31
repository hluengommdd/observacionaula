async function imprimirYPDF() {
  try {
    // Recoger datos del formulario actual
    const docenteSelect = document.getElementById('docente');
    const docenteText = docenteSelect?.options[docenteSelect.selectedIndex]?.text || '';
    const curso = document.getElementById('curso')?.value || '';
    const asignatura = document.getElementById('asignatura')?.value || '';
    const observadorSelect = document.getElementById('observador');
    const observadorText = observadorSelect?.options[observadorSelect.selectedIndex]?.text || '';
    const fecha = document.getElementById('fecha')?.value || '';
    const hora = document.getElementById('hora')?.value || '';
    const observaciones_generales = document.querySelector('textarea[name="observaciones_generales"]')?.value || '';
    const criterios_por_mejorar = document.querySelector('textarea[name="criterios_por_mejorar"]')?.value || '';
    const nombreDocente = document.getElementById('nombre-docente')?.value || '';
    const nombreObservador = document.getElementById('nombre-observador')?.value || '';

    // Agrupar indicadores por sección (h2 + tabla)
    const container = document.querySelector('.container');
    const secciones = [];
    if (container) {
      const headings = container.querySelectorAll('h2');
      headings.forEach(h => {
        const label = h.textContent.trim();
        let table = h.nextElementSibling;
        while (table && table.tagName !== 'TABLE') table = table.nextElementSibling;
        const items = [];
        if (table) {
          const rows = table.querySelectorAll('tbody tr');
          rows.forEach(r => {
            const indicatorEl = r.querySelector('.indicator');
            const indicator = indicatorEl ? indicatorEl.textContent.trim() : '';
            const checked = r.querySelector('input[type="radio"]:checked');
            let value = 'N/A';
            if (checked) {
              value = checked.value === '1' ? 'SÍ' : checked.value === '0' ? 'NO' : 'N/A';
            }
            items.push({ indicator, value });
          });
        }
        if (items.length) secciones.push({ label, items });
      });
    }

    // Crear div temporal con contenido imprimible
    const printContainer = document.createElement('div');
    printContainer.id = 'print-container-temp';
    
    const docHTML = `
      <div style="font-family: 'Helvetica', Arial, sans-serif; background: white; color: #1f2937; padding: 20pt; line-height: 1.5; font-size: 9pt;">
        <style>
          @page { margin: 16pt; size: A4; orphans: 3; widows: 3; }
          @media print {
            body > * { display: none !important; }
            #print-container-temp { display: block !important; }
            #print-container-temp * { display: block; }
          }
          #print-container-temp { display: none; }
          
          /* ENCABEZADO */
          #print-container-temp .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16pt;
            margin-bottom: 16pt;
            border-bottom: 2pt solid #e5e7eb;
            padding-bottom: 12pt;
          }
          #print-container-temp .header-text { flex: 1; }
          #print-container-temp .header-title {
            font-size: 14pt;
            font-weight: bold;
            margin: 0 0 3pt 0;
            color: #000;
          }
          #print-container-temp .header-subtitle {
            font-size: 9pt;
            color: #374151;
            margin: 3pt 0 2pt 0;
          }
          #print-container-temp .header-date {
            font-size: 8pt;
            color: #6b7280;
            margin: 2pt 0 0 0;
          }
          #print-container-temp .logo-box {
            width: 45pt;
            height: 50pt;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f9fafb;
            border: 1pt solid #d1d5db;
            border-radius: 4pt;
            flex-shrink: 0;
          }
          
          /* SECCIONES */
          #print-container-temp .section {
            margin-bottom: 14pt;
            page-break-inside: avoid;
          }
          #print-container-temp .section-title {
            font-size: 10pt;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 6pt;
            border-bottom: 1pt solid #e5e7eb;
            padding-bottom: 3pt;
          }
          
          /* CAJA DE INFORMACIÓN */
          #print-container-temp .info-box {
            background: #f9fafb;
            border: 1pt solid #e5e7eb;
            border-radius: 4pt;
            padding: 10pt;
            margin-bottom: 10pt;
          }
          #print-container-temp .info-row {
            display: flex;
            margin-bottom: 4pt;
          }
          #print-container-temp .info-label {
            width: 120pt;
            font-weight: bold;
            color: #374151;
            font-size: 8pt;
          }
          #print-container-temp .info-value {
            flex: 1;
            color: #1f2937;
            font-size: 8pt;
          }
          
          /* TABLA DE INDICADORES */
          #print-container-temp .indicators-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12pt;
            font-size: 8pt;
          }
          #print-container-temp .indicators-table th {
            background: #f3f4f6;
            color: #1f2937;
            padding: 6pt;
            text-align: left;
            font-weight: bold;
            border-bottom: 1pt solid #d1d5db;
          }
          #print-container-temp .desc-header {
            width: 75%;
          }
          #print-container-temp .result-header {
            width: 25%;
            text-align: center;
          }
          #print-container-temp .indicators-table td {
            padding: 5pt 6pt;
            border-bottom: 1pt solid #f3f4f6;
          }
          #print-container-temp .desc-cell {
            width: 75%;
            text-align: left;
          }
          #print-container-temp .result-cell {
            width: 25%;
            text-align: center;
            font-weight: bold;
          }
          #print-container-temp .indicators-table tr:nth-child(even) {
            background: #f9fafb;
          }
          
          /* CAJA DE TEXTO */
          #print-container-temp .text-box {
            background: #f9fafb;
            border: 1pt solid #e5e7eb;
            border-radius: 4pt;
            padding: 10pt;
            margin-bottom: 10pt;
            font-size: 8pt;
            line-height: 1.4;
            color: #1f2937;
          }
          #print-container-temp .text-box:empty::before {
            content: "N/A";
            color: #9ca3af;
          }
          
          /* FIRMAS */
          #print-container-temp .signatures {
            display: flex;
            justify-content: space-between;
            gap: 30pt;
            margin-top: 30pt;
            page-break-inside: avoid;
          }
          #print-container-temp .signature-box {
            flex: 1;
            text-align: center;
          }
          #print-container-temp .signature-line {
            border-top: 1pt solid #374151;
            padding-top: 6pt;
            margin-bottom: 0;
            height: 30pt;
          }
          #print-container-temp .signature-label {
            font-size: 8pt;
            font-weight: bold;
            color: #374151;
            margin-top: 6pt;
          }
          #print-container-temp .signature-name {
            font-size: 7pt;
            color: #6b7280;
            margin-top: 2pt;
          }
          
          /* FOOTER */
          #print-container-temp .footer {
            margin-top: 16pt;
            padding-top: 10pt;
            border-top: 1pt solid #e5e7eb;
            text-align: center;
            font-size: 7pt;
            color: #9ca3af;
          }
        </style>
        
        <!-- ENCABEZADO -->
        <div class="header">
          <div class="header-text">
            <div class="header-title">RETROALIMENTACIÓN ACOMPAÑAMIENTO DOCENTE</div>
            <div class="header-subtitle">Colegio Madres Dominicas - Concepción</div>
            <div class="header-date">Fecha de emisión: ${fecha || 'N/A'}</div>
          </div>
          <div class="logo-box">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="45" height="50" style="max-width:100%; max-height:100%;">
              <defs>
                <style>.logo-text { font-family: Arial, sans-serif; font-weight: bold; font-size: 5px; }</style>
              </defs>
              <!-- Escudo exterior negro -->
              <path d="M 50 5 L 85 25 L 85 50 Q 85 75 50 110 Q 15 75 15 50 L 15 25 Z" fill="#1a1a1a" stroke="#000" stroke-width="1"/>
              <!-- Dividir en 4 secciones alternadas -->
              <path d="M 50 25 L 50 95 M 30 55 L 70 55" stroke="white" stroke-width="2" fill="none"/>
              <!-- Secciones rellenas alternadas (blanco y negro) -->
              <path d="M 50 25 L 70 55 L 50 95 Z" fill="white"/>
              <path d="M 50 25 L 30 55 L 50 95 Z" fill="white"/>
              <!-- Cruz central decorativa -->
              <circle cx="50" cy="50" r="3" fill="white"/>
              <circle cx="40" cy="40" r="2" fill="white"/>
              <circle cx="60" cy="40" r="2" fill="white"/>
              <circle cx="40" cy="60" r="2" fill="white"/>
              <circle cx="60" cy="60" r="2" fill="white"/>
              <!-- Texto VERITAS -->
              <text x="50" y="108" text-anchor="middle" class="logo-text" fill="white" font-weight="bold">VERITAS</text>
            </svg>
          </div>
        </div>
        
        <!-- SECCIÓN 1: IDENTIFICACIÓN -->
        <div class="section">
          <div class="section-title">1. Identificación de la Observación</div>
          <div class="info-box">
            <div class="info-row">
              <div class="info-label">Docente observado:</div>
              <div class="info-value">${docenteText}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Curso:</div>
              <div class="info-value">${curso}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Asignatura:</div>
              <div class="info-value">${asignatura}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Observador:</div>
              <div class="info-value">${observadorText}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Fecha / Hora:</div>
              <div class="info-value">${fecha} ${hora || 'N/A'}</div>
            </div>
          </div>
        </div>
        
        <!-- SECCIÓN 2: INDICADORES -->
        ${secciones.map((s, idx) => `
        <div class="section">
          <div class="section-title">${idx + 2}. ${s.label}</div>
          <table class="indicators-table">
            <thead>
              <tr>
                <th class="desc-header">Descriptor</th>
                <th class="result-header">Resultado</th>
              </tr>
            </thead>
            <tbody>
              ${s.items.map((it, i) => `
              <tr>
                <td class="desc-cell">${it.indicator}</td>
                <td class="result-cell" style="color: ${it.value === 'SÍ' ? '#059669' : it.value === 'NO' ? '#dc2626' : '#6b7280'};">${it.value}</td>
              </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        `).join('')}
        
        <!-- SECCIÓN: OBSERVACIONES GENERALES -->
        <div class="section">
          <div class="section-title">${secciones.length + 2}. Observaciones Generales</div>
          <div class="text-box">${(observaciones_generales || '').replace(/\n/g, '<br>') || '<em style="color: #9ca3af;">Sin observaciones</em>'}</div>
        </div>
        
        <!-- SECCIÓN: CRITERIOS POR MEJORAR -->
        <div class="section">
          <div class="section-title">${secciones.length + 3}. Criterios por Mejorar</div>
          <div class="text-box">${(criterios_por_mejorar || '').replace(/\n/g, '<br>') || '<em style="color: #9ca3af;">Sin criterios registrados</em>'}</div>
        </div>
        
        <!-- FIRMAS -->
        <div class="signatures">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">Nombre y Firma del Docente</div>
            <div class="signature-name">${nombreDocente || 'Por firmar'}</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">Nombre y Firma del Observador</div>
            <div class="signature-name">${nombreObservador || 'Por firmar'}</div>
          </div>
        </div>
        
        <div style="text-align: right; font-size: 9pt; color: #6b7280; margin-top: 16pt;">
          Concepción, ____ de ______________ de 2025
        </div>
        
        <!-- FOOTER -->
        <div class="footer">
          Informe generado automáticamente por el Sistema de Observación Docente - Madres Dominicas
        </div>
      </div>
    `;

    printContainer.innerHTML = docHTML;
    document.body.appendChild(printContainer);

    // Esperar a que se renderice y luego imprimir
    setTimeout(() => {
      window.print();
      // Remover el contenedor después de imprimir
      setTimeout(() => {
        printContainer.remove();
      }, 500);
    }, 100);

  } catch (err) {
    console.error('Error preparando la impresión:', err);
    window.print();
  }
}

window.imprimirYPDF = imprimirYPDF;
