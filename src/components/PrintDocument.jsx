import React, { useState } from 'react'
import './PrintDocument.css'

// Parse a YYYY-MM-DD string into a local Date (avoids UTC shift)
const parseLocalDate = (yyyyMmDd) => {
  if (!yyyyMmDd) return null
  const parts = String(yyyyMmDd).split('-')
  if (parts.length < 3) return null
  const y = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10) - 1
  const d = parseInt(parts[2], 10)
  return new Date(y, m, d)
}

const formatoFechaLarga = (fechaIso) => {
  const date = parseLocalDate(fechaIso)
  if (!date) return ''
  return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatoFechaCorta = (fechaIso) => {
  const date = parseLocalDate(fechaIso)
  if (!date) return ''
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

const hoyIso = () => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const PrintDocument = ({ formData, respuestas, docentes, indicadores }) => {
  const [logoFailed, setLogoFailed] = useState(false)
  const docenteNombre = docentes.find(d => String(d.id) === String(formData.docente_id))?.nombre || ''
  const nombreObservador = formData.nombre_observador || formData.observador || ''
  const fechaEmisionIso = formData.fecha || hoyIso()
  const fechaEmisionLarga = formatoFechaLarga(fechaEmisionIso)
  const fechaEmisionCorta = formatoFechaCorta(fechaEmisionIso)
  const logoSrc = formData?.logoUrl || import.meta.env.VITE_LOGO_URL || ''

  const agruparRespuestas = () => {
    return indicadores.map((dimension, dIdx) => ({
      ...dimension,
      respuestas: dimension.items.map((_, iIdx) => {
        const key = `dimension_${dIdx}_item_${iIdx}`
        const valor = respuestas[key]
        return valor === 'si' ? 'SÍ' : valor === 'no' ? 'NO' : 'N/A'
      })
    }))
  }

  const datosAgrupados = agruparRespuestas()

  return (
    <div className="print-container">
      <div className="print-document">
        {/* ENCABEZADO */}
        <div className="print-header">
          <div className="header-text">
            <h1>RETROALIMENTACIÓN ACOMPAÑAMIENTO DOCENTE</h1>
            <p className="header-subtitle">Colegio Madres Dominicas - Concepción</p>
            <p className="header-date">Fecha de emisión: {fechaEmisionCorta}</p>
          </div>
          <div className="logo-box">
            {logoSrc && !logoFailed ? (
              <img
                src={logoSrc}
                alt="Logo"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 120 140"
                width="45"
                height="50"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              >
                <defs>
                  <style>{`.logo-text { font-family: Arial, sans-serif; font-weight: bold; font-size: 10px; }`}</style>
                </defs>
                {/* Marco exterior */}
                <rect x="10" y="10" width="100" height="120" rx="8" ry="8" fill="white" stroke="#222" strokeWidth="3" />
                {/* Texto superior */}
                <rect x="18" y="18" width="84" height="18" fill="#111" rx="2" />
                <text x="60" y="32" textAnchor="middle" className="logo-text" fill="white">VERITAS</text>
                {/* Escudo */}
                <path d="M 60 40 L 92 58 L 92 82 Q 92 108 60 130 Q 28 108 28 82 L 28 58 Z" fill="#111" stroke="#111" strokeWidth="1" />
                {/* Divisiones */}
                <path d="M 60 55 L 60 110" stroke="white" strokeWidth="3" />
                <path d="M 42 75 L 78 75" stroke="white" strokeWidth="3" />
                {/* Flecha / Cruz central */}
                <path d="M60 60 L68 75 L60 75 L60 100 L52 100 L52 75 L44 75 Z" fill="white" />
              </svg>
            )}
          </div>
        </div>

        {/* SECCIÓN 1: IDENTIFICACIÓN */}
        <div className="print-section">
          <h2 className="print-section-title">1. Identificación de la Observación</h2>
          <div className="info-box">
            <div className="info-row">
              <span className="info-label">Docente observado:</span>
              <span className="info-value">{docenteNombre}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Curso:</span>
              <span className="info-value">{formData.curso}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Asignatura:</span>
              <span className="info-value">{formData.asignatura}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Observador:</span>
              <span className="info-value">{formData.observador}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Nombre del Observador:</span>
              <span className="info-value">{nombreObservador}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Fecha / Hora:</span>
              <span className="info-value">{fechaEmisionCorta} {formData.hora || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* SECCIONES DE INDICADORES */}
        {datosAgrupados.map((dimension, idx) => (
          <div key={idx} className="print-section">
            <h2 className="print-section-title">{idx + 2}. {dimension.dimension}</h2>
            <table className="print-indicators-table">
              <thead>
                <tr>
                  <th className="desc-header">Descriptor</th>
                  <th className="result-header">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {dimension.items.map((item, iIdx) => (
                  <tr key={iIdx}>
                    <td className="desc-cell">{item}</td>
                    <td className={`result-cell ${dimension.respuestas[iIdx]?.toLowerCase()}`}>
                      {dimension.respuestas[iIdx]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* OBSERVACIONES GENERALES */}
        <div className="print-section">
          <h2 className="print-section-title">{datosAgrupados.length + 2}. Observaciones Generales</h2>
          <div className="text-box">
            {formData.observaciones_generales || 'Sin observaciones'}
          </div>
        </div>

        {/* CRITERIOS POR MEJORAR */}
        <div className="print-section">
          <h2 className="print-section-title">{datosAgrupados.length + 3}. Criterios por Mejorar</h2>
          <div className="text-box">
            {formData.criterios_por_mejorar || 'Sin criterios registrados'}
          </div>
        </div>

        {/* FIRMAS */}
        <div className="print-signatures">
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">Nombre y Firma del Docente</div>
            <div className="signature-name">{docenteNombre || 'Por firmar'}</div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">Nombre y Firma del Observador</div>
            <div className="signature-name">{nombreObservador || 'Por firmar'}</div>
          </div>
        </div>

        <div className="print-date">
          Concepción, {fechaEmisionLarga || '____ de ______________ de ____'}
        </div>

        {/* FOOTER */}
        <div className="print-footer">
          Informe generado automáticamente por el Sistema de Observación Docente - Madres Dominicas
        </div>
      </div>
    </div>
  )
}

export default PrintDocument
