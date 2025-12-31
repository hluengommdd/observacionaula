import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import ObservacionForm from './components/ObservacionForm'
import './App.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

function App() {
  const [docentes, setDocentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [envError, setEnvError] = useState(!supabase)

  useEffect(() => {
    if (supabase) {
      fetchDocentes()
    } else {
      setLoading(false)
      setEnvError(true)
    }
  }, [])

  const fetchDocentes = async () => {
    try {
      const { data, error } = await supabase
        .from('docentes')
        .select('id, nombre')
        .order('nombre', { ascending: true })

      if (error) throw error
      setDocentes(data || [])
    } catch (error) {
      console.error('Error fetching docentes:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>MADRES DOMINICAS</h1>
        <p>Concepción</p>
        <h2>PAUTA DE OBSERVACIÓN DOCENTE</h2>
      </header>

      <main className="app-main">
        {envError ? (
          <div className="loading">
            Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_KEY.
            Configúralas en el entorno antes de continuar.
          </div>
        ) : loading ? (
          <div className="loading">Cargando docentes...</div>
        ) : (
          <ObservacionForm docentes={docentes} supabase={supabase} />
        )}
      </main>

      <footer className="app-footer">
        Documento institucional – Pauta de observación docente – Evaluación formativa
      </footer>
    </div>
  )
}

export default App
