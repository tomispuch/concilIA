import { useState } from 'react'
import './index.css'
import UploadScreen from './screens/UploadScreen'
import ReviewScreen from './screens/ReviewScreen'
import DownloadScreen from './screens/DownloadScreen'

export default function App() {
  const [screen, setScreen] = useState('upload')
  const [conciliaData, setConciliaData] = useState(null)
  const [formParams, setFormParams] = useState({ periodo: '', empresa: '' })
  const [reviewedItems, setReviewedItems] = useState([])

  function handleAnalysisResult(data, params) {
    const itemsWithState = data.revision.map(item => ({ ...item, estado: null, edicion: null }))
    setConciliaData(data)
    setFormParams(params)
    setReviewedItems(itemsWithState)
    setScreen('review')
  }

  function handleGenerarConciliacion() {
    setScreen('download')
  }

  function handleReiniciar() {
    setScreen('upload')
    setConciliaData(null)
    setFormParams({ periodo: '', empresa: '' })
    setReviewedItems([])
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a3356', display: 'flex', flexDirection: 'column' }}>
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }} className="px-8 py-4 flex items-center gap-4">
        <img src="/logo-cvrs.jfif" alt="CVRS" className="h-10" style={{ borderRadius: '4px' }} />
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.25)' }} />
        <span className="font-bold text-lg tracking-wide" style={{ color: '#fff' }}>ConcilIA</span>
      </header>

      {screen === 'upload' && (
        <UploadScreen onResult={handleAnalysisResult} />
      )}
      {screen === 'review' && (
        <ReviewScreen
          conciliadas={conciliaData.conciliadas}
          revision={reviewedItems}
          setRevision={setReviewedItems}
          saldoContabilidad={conciliaData.saldo_contabilidad}
          saldoExtracto={conciliaData.saldo_extracto}
          params={formParams}
          onGenerar={handleGenerarConciliacion}
        />
      )}
      {screen === 'download' && (
        <DownloadScreen
          conciliadas={conciliaData.conciliadas}
          revision={reviewedItems}
          saldoContabilidad={conciliaData.saldo_contabilidad}
          saldoExtracto={conciliaData.saldo_extracto}
          params={formParams}
          onReiniciar={handleReiniciar}
        />
      )}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        marginTop: 'auto',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Desarrollado por</span>
        <img src="/logo-trs-completo.png" alt="TRS Automatizaciones" style={{ height: '22px', opacity: 0.65 }} />
      </footer>
    </div>
  )
}
