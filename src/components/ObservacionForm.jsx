import React, { useEffect, useState } from 'react'
import PrintDocument from './PrintDocument'
import './ObservacionForm.css'

const INDICADORES = [
  {
    dimension: 'Ambiente de la clase',
    items: [
      'El docente mantiene un trato formal y respetuoso con los estudiantes.',
      'El docente estimula la participación de los estudiantes respetando las normas de trabajo y convivencia en la sala de clases.',
      'El docente utiliza estrategias para crear y mantener un clima de trabajo favorable para el aprendizaje.',
      'El docente regula las conductas disruptivas de los estudiantes frente al quiebre de las normas de convivencia.',
      'El docente estimula la aceptación e integración de los estudiantes con Necesidades Educativas Especiales, y los demás estudiantes.',
      'El docente implementa un trabajo cooperativo en el que se potencia un trabajo en equipo.'
    ]
  },
  {
    dimension: 'Interacción Pedagógica',
    items: [
      'El docente establece relaciones entre los objetivos y actividades de aprendizaje, con experiencias previas de los estudiantes.',
      'El docente utiliza actividades de enseñanza coherente con el contenido y adecuada al tiempo disponible.',
      'El docente utiliza distintas estrategias para explicar un contenido de la clase.',
      'El docente evalúa y monitorea sistemáticamente el grado de aprendizaje alcanzado por los estudiantes en los distintos momentos de la clase.',
      'El docente corrige los errores de los estudiantes y los utiliza como instancia de aprendizaje.',
      'El docente utiliza estrategias de retroalimentación que permiten a los estudiantes verificar el logro de sus aprendizajes.'
    ]
  },
  {
    dimension: 'Organización de la clase',
    items: [
      'Al inicio, el docente comunica los objetivos o propósitos que se trabajarán en la clase.',
      'El docente se preocupa de recibir, mantener y entregar la sala de clases limpia.',
      'El docente organiza el espacio de la sala para favorecer la participación e interacción de los estudiantes, y el monitoreo del trabajo.',
      'El docente utiliza recursos pertinentes para desarrollar las actividades de aprendizaje de la clase.',
      'El docente aprovecha productivamente el tiempo disponible de la clase para el aprendizaje de sus estudiantes.',
      'El docente refuerza las ideas fuerza desarrolladas al término de su clase.'
    ]
  }
]

const CURSOS = [
  'PK', 'KA', 'KB',
  '1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B',
  '1MA', '1MB', '2MA', '2MB', '3MA', '3MB', '4MA', '4MB'
]

const OBSERVADORES = [
  'Jefa de UTP',
  'Rector',
  'Directora Primaria',
  'Coordinador Primaria',
  'Coordinador Secundaria',
  'Directora Secundaria',
  'Jefe/a de Departamento',
  'Otro'
]

const ObservacionForm = ({ docentes, supabase }) => {
  const [formData, setFormData] = useState({
    docente_id: '',
    curso: '',
    asignatura: '',
    observador: '',
    fecha: '',
    hora: '',
    nombre_observador: '',
    observaciones_generales: '',
    criterios_por_mejorar: '',
    // Ruta al logo oficial ubicado en /public (se imprime si existe)
    logoUrl: '/logo-oficial.png'
  })

  const [respuestas, setRespuestas] = useState({})
  const [showPrint, setShowPrint] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [indicadoresMap, setIndicadoresMap] = useState(null)

  useEffect(() => {
    // Prefill fecha con el día actual en horario local si no se ha ingresado
    if (!formData.fecha) {
      const hoy = new Date()
      const yyyy = hoy.getFullYear()
      const mm = String(hoy.getMonth() + 1).padStart(2, '0')
      const dd = String(hoy.getDate()).padStart(2, '0')
      const localIso = `${yyyy}-${mm}-${dd}`
      setFormData(prev => ({ ...prev, fecha: localIso }))
    }
  }, [formData.fecha])

  useEffect(() => {
    if (!showPrint) return

    const handleAfterPrint = () => setShowPrint(false)
    const printTimeout = setTimeout(() => window.print(), 150)

    window.addEventListener('afterprint', handleAfterPrint)

    return () => {
      clearTimeout(printTimeout)
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [showPrint])

  // Cargar indicadores desde Supabase para mapear a indicador_id reales
  useEffect(() => {
    if (!supabase) return

    let mounted = true

    const fetchIndicadores = async () => {
      try {
        if (typeof supabase?.from !== 'function') {
          setIndicadoresMap({})
          return
        }

        const { data, error } = await supabase
          .from('indicadores')
          .select('id, dimension_id, orden')

        if (error) {
          setIndicadoresMap({})
          return
        }

        if (!mounted) return

        // ordenar en cliente por dimension_id y orden
        const sorted = (data || []).sort((a, b) => {
          const da = (a.dimension_id || 0) - (b.dimension_id || 0)
          if (da !== 0) return da
          return (a.orden || 0) - (b.orden || 0)
        })

        // Construir mapa: dimensionIndex (0-based), itemIndex (0-based) => indicador.id
        const map = {}
        sorted.forEach(row => {
          const dimIdx = (row.dimension_id != null) ? (Number(row.dimension_id) - 1) : 0
          const itemIdx = (row.orden != null) ? (Number(row.orden) - 1) : 0
          const key = `dimension_${dimIdx}_item_${itemIdx}`
          map[key] = row.id
        })

        setIndicadoresMap(map)
      } catch (err) {
        console.error('Error fetching indicadores:', err)
        setIndicadoresMap({})
      }
    }

    fetchIndicadores()

    return () => { mounted = false }
  }, [supabase])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRespuestaChange = (key, value) => {
    setRespuestas(prev => ({ ...prev, [key]: value }))
  }

  const handlePrint = () => {
    setShowPrint(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { docente_id, curso, asignatura, observador, fecha, hora, observaciones_generales, criterios_por_mejorar } = formData

      if (!docente_id || !curso || !asignatura || !observador || !fecha) {
        alert('Por favor completa todos los campos obligatorios')
        setSubmitting(false)
        return
      }

      // Insertar observación
      const { data: obsData, error: obsError } = await supabase
        .from('observaciones')
        .insert([{
          docente_id,
          curso,
          asignatura,
          observador,
          fecha,
          hora,
          observaciones_generales,
          criterios_por_mejorar
        }])
        .select()

      if (obsError) throw obsError

      const observacion_id = obsData[0].id

      // Insertar respuestas
      const respuestasArray = Object.entries(respuestas).map(([key, value]) => {
        const m = key.match(/^dimension_(\d+)_item_(\d+)$/)
        if (!m) return null
        const dIdx = parseInt(m[1], 10)
        const iIdx = parseInt(m[2], 10)

        // Preferir el id real desde indicadoresMap cuando esté disponible
        let indicador_id = null
        if (indicadoresMap && indicadoresMap[key] != null) {
          indicador_id = indicadoresMap[key]
        } else {
          // Fallback: calcular por posición (1-based)
          const offset = INDICADORES.slice(0, dIdx).reduce((s, dim) => s + (dim.items?.length || 0), 0)
          indicador_id = offset + iIdx + 1
        }

        return {
          observacion_id,
          indicador_id,
          valor: value === 'si' ? 1 : value === 'no' ? 0 : null
        }
      }).filter(r => r && r.valor !== null)

      if (respuestasArray.length > 0) {
        const { error: respError } = await supabase
          .from('respuestas')
          .insert(respuestasArray)

        if (respError) throw respError
      }

      alert('Observación guardada correctamente')
      resetForm()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      docente_id: '',
      curso: '',
      asignatura: '',
      observador: '',
      fecha: '',
      hora: '',
      nombre_observador: '',
      observaciones_generales: '',
      criterios_por_mejorar: ''
    })
    setRespuestas({})
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="observacion-form">
      {/* Sección de datos generales */}
      <div className="form-section">
        <h3>Datos Generales</h3>
        
        <div className="form-group">
          <label htmlFor="docente_id">Docente observado:</label>
          <select
            id="docente_id"
            name="docente_id"
            value={formData.docente_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Seleccionar docente...</option>
            {docentes.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.nombre}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="curso">Curso:</label>
            <select
              id="curso"
              name="curso"
              value={formData.curso}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccionar curso...</option>
              {CURSOS.map(curso => (
                <option key={curso} value={curso}>{curso}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="asignatura">Asignatura:</label>
            <input
              type="text"
              id="asignatura"
              name="asignatura"
              value={formData.asignatura}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="observador">Observador:</label>
            <select
              id="observador"
              name="observador"
              value={formData.observador}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccionar observador...</option>
              {OBSERVADORES.map(obs => (
                <option key={obs} value={obs}>{obs}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="nombre_observador">Nombre del Observador:</label>
            <input
              type="text"
              id="nombre_observador"
              name="nombre_observador"
              value={formData.nombre_observador}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha">Fecha:</label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={formData.fecha}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="hora">Hora:</label>
            <input
              type="time"
              id="hora"
              name="hora"
              value={formData.hora}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      {/* Sección de indicadores */}
      <div className="form-section">
        <h3>Indicadores de Evaluación</h3>
        
        {INDICADORES.map((dimension, dIdx) => (
          <div key={dIdx} className="dimension-section">
            <h4>{dimension.dimension}</h4>
            
            <table className="indicators-table">
              <tbody>
                {dimension.items.map((item, iIdx) => {
                  const key = `dimension_${dIdx}_item_${iIdx}`
                  return (
                    <tr key={key}>
                      <td className="indicator-text">{item}</td>
                      <td className="indicator-check">
                        <label>
                          <input
                            type="radio"
                            name={key}
                            value="si"
                            checked={respuestas[key] === 'si'}
                            onChange={() => handleRespuestaChange(key, 'si')}
                          />
                          Sí
                        </label>
                      </td>
                      <td className="indicator-check">
                        <label>
                          <input
                            type="radio"
                            name={key}
                            value="no"
                            checked={respuestas[key] === 'no'}
                            onChange={() => handleRespuestaChange(key, 'no')}
                          />
                          No
                        </label>
                      </td>
                      <td className="indicator-check">
                        <label>
                          <input
                            type="radio"
                            name={key}
                            value="na"
                            checked={respuestas[key] === 'na'}
                            onChange={() => handleRespuestaChange(key, 'na')}
                          />
                          N/A
                        </label>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Observaciones */}
      <div className="form-section">
        <h3>Observaciones</h3>
        
        <div className="form-group">
          <label htmlFor="observaciones_generales">Observaciones Generales:</label>
          <textarea
            id="observaciones_generales"
            name="observaciones_generales"
            value={formData.observaciones_generales}
            onChange={handleInputChange}
            rows="4"
            placeholder="Fortalezas, aspectos destacados, comentarios generales..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="criterios_por_mejorar">Criterios por Mejorar:</label>
          <textarea
            id="criterios_por_mejorar"
            name="criterios_por_mejorar"
            value={formData.criterios_por_mejorar}
            onChange={handleInputChange}
            rows="4"
            placeholder="Aspectos a reforzar, sugerencias de mejora..."
          />
        </div>
      </div>

      {/* Botones */}
      <div className="form-buttons no-print">
        <button type="button" className="btn btn-print" onClick={handlePrint}>
          🖨️ Imprimir / Guardar como PDF
        </button>
        <button type="submit" className="btn btn-save" disabled={submitting}>
          {submitting ? '💾 Guardando...' : '💾 Guardar en Registro'}
        </button>
        <button type="button" className="btn btn-clear" onClick={resetForm}>
          🧹 Limpiar datos
        </button>
      </div>
      </form>

      {showPrint && (
        <div className="print-container">
          <PrintDocument 
            formData={formData}
            respuestas={respuestas}
            docentes={docentes}
            indicadores={INDICADORES}
          />
        </div>
      )}
    </>
  )
}

export default ObservacionForm
