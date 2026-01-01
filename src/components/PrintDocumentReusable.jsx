import React, { useEffect } from 'react'
import './PrintDocumentReusable.css'

export default function PrintDocumentReusable({
  data = {},
  logo,
  title = '',
  footerText = '',
  autoPrint = false,
  showPrintButton = false,
}) {
  useEffect(() => {
    if (!autoPrint) return
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => window.print())
    } else {
      setTimeout(() => window.print(), 300)
    }
  }, [autoPrint])

  return (
    <div className="print-document" id="print-document-root">
      <header className="print-header">
        {logo && <img className="print-logo" src={logo} alt="Logo" />}
        <div className="print-title">{title}</div>
      </header>

      <main className="print-body">
        {data.intro && <p className="print-intro">{data.intro}</p>}

        {data.sections && data.sections.length > 0 && (
          data.sections.map((sec, i) => (
            <section className="print-section" key={i}>
              {sec.heading && <h3 className="section-heading">{sec.heading}</h3>}
              {sec.paragraphs && sec.paragraphs.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
              {sec.table && (
                <table className="print-table">
                  <thead>
                    <tr>
                      {sec.table.headers.map((h, k) => <th key={k}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {sec.table.rows.map((r, ri) => (
                      <tr key={ri}>
                        {r.map((c, ci) => <td key={ci}>{c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          ))
        )}
      </main>

      <footer className="print-footer">
        <div>{footerText}</div>
      </footer>

      {showPrintButton && (
        <div className="print-controls no-print">
          <button onClick={() => window.print()}>Imprimir</button>
        </div>
      )}
    </div>
  )
}
