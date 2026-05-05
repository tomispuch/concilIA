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
    <div className="min-h-screen" style={{ backgroundColor: '#070708' }}>
      <header style={{ borderBottom: '1px solid #1f1f1f' }} className="px-8 py-4 flex items-center gap-4">
        <img src="/logo.png" alt="TRS" className="h-8" />
        <div style={{ width: '1px', height: '24px', backgroundColor: '#333' }} />
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
    </div>
  )
}
