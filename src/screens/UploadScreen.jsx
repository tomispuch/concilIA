import { useState, useRef } from 'react'
import axios from 'axios'

const N8N_WEBHOOK = import.meta.env.VITE_N8N_WEBHOOK || 'https://tu-n8n.ejemplo.com/webhook/concilia'

function FileDropZone({ label, accept, file, onChange }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onChange(f)
  }

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? 'rgba(255,255,255,0.7)' : file ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)'}`,
        backgroundColor: dragging ? 'rgba(255,255,255,0.07)' : file ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)',
        borderRadius: '8px',
        padding: '24px 16px',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background-color 0.2s',
        textAlign: 'center',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={e => onChange(e.target.files[0])}
      />
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke={file ? '#fff' : 'rgba(255,255,255,0.4)'} strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      <span style={{ color: file ? '#fff' : 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      {file ? (
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>{file.name}</span>
      ) : (
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Arrastrá o hacé click para seleccionar</span>
      )}
    </div>
  )
}

export default function UploadScreen({ onResult }) {
  const [pdfBanco, setPdfBanco] = useState(null)
  const [excelContable, setExcelContable] = useState(null)
  const [excelAnterior, setExcelAnterior] = useState(null)
  const [periodo, setPeriodo] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingLong, setLoadingLong] = useState(false)
  const [error, setError] = useState(null)

  const canSubmit = pdfBanco && excelContable && excelAnterior && periodo.trim() && empresa.trim()

  async function handleAnalizar() {
    if (!canSubmit) return
    setLoading(true)
    setError(null)

    const longTimer = setTimeout(() => setLoadingLong(true), 30000)

    const formData = new FormData()
    formData.append('pdf_banco', pdfBanco)
    formData.append('excel_contable', excelContable)
    formData.append('excel_conciliacion_anterior', excelAnterior)
    formData.append('periodo', periodo.trim())
    formData.append('empresa', empresa.trim())

    try {
      const res = await axios.post(N8N_WEBHOOK, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000,
      })
      clearTimeout(longTimer)
      onResult(res.data, { periodo: periodo.trim(), empresa: empresa.trim() })
    } catch (err) {
      clearTimeout(longTimer)
      setError(err.response?.data?.message || 'Error al conectar con el servidor. Verificá tu conexión e intentá de nuevo.')
    } finally {
      setLoading(false)
      setLoadingLong(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 65px)', gap: '24px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#fff',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '16px', textAlign: 'center', maxWidth: '360px' }}>
          {loadingLong
            ? 'Esto puede tardar unos minutos, la IA está procesando los movimientos…'
            : 'La IA está analizando los movimientos…'}
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '700', margin: '0 0 8px' }}>
          Conciliación Bancaria
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
          Cargá los archivos y la IA propone el cruce de movimientos
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <FileDropZone
          label="Extracto bancario (PDF)"
          accept=".pdf"
          file={pdfBanco}
          onChange={setPdfBanco}
        />
        <FileDropZone
          label="Sistema contable (Excel)"
          accept=".xlsx,.xls"
          file={excelContable}
          onChange={setExcelContable}
        />
        <FileDropZone
          label="Conciliación anterior (Excel)"
          accept=".xlsx,.xls"
          file={excelAnterior}
          onChange={setExcelAnterior}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <div>
          <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
            Período
          </label>
          <input
            type="text"
            placeholder="Ej: Abril 2025"
            value={periodo}
            onChange={e => setPeriodo(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(0,0,0,0.25)',
              color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <div>
          <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
            Empresa
          </label>
          <input
            type="text"
            placeholder="Ej: Cordial Collections S.A."
            value={empresa}
            onChange={e => setEmpresa(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(0,0,0,0.25)',
              color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.35)',
          borderRadius: '6px', padding: '14px 16px', marginBottom: '24px',
          color: '#fca5a5', fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleAnalizar}
        disabled={!canSubmit}
        style={{
          backgroundColor: canSubmit ? '#fff' : 'rgba(255,255,255,0.08)',
          color: canSubmit ? '#0a3356' : 'rgba(255,255,255,0.25)',
          border: 'none', borderRadius: '6px', padding: '14px 32px',
          fontSize: '15px', fontWeight: '700', cursor: canSubmit ? 'pointer' : 'not-allowed',
          letterSpacing: '0.02em', transition: 'background-color 0.2s',
          width: '100%',
        }}
      >
        Analizar
      </button>
    </div>
  )
}
