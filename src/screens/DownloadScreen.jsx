import * as XLSX from 'xlsx'

function formatImporte(n) {
  if (n == null) return '-'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(n)
}

function buildExcel(conciliadas, revision, saldoContabilidad, saldoExtracto, params) {
  const aprobadas = revision.filter(i => i.estado === 'aprobado' || i.estado === 'editado')

  const chequesNoDebitados = aprobadas.filter(i => {
    const clasif = (i.edicion?.clasificacion ?? i.clasificacion_propuesta ?? '').toLowerCase()
    const tipo = (i.edicion?.tipo ?? i.banco?.tipo ?? '').toLowerCase()
    return clasif === 'temporaria' && tipo === 'debito'
  })

  const chequesNoContabilizados = aprobadas.filter(i => {
    const clasif = (i.edicion?.clasificacion ?? i.clasificacion_propuesta ?? '').toLowerCase()
    const tipo = (i.edicion?.tipo ?? i.banco?.tipo ?? '').toLowerCase()
    return clasif === 'permanente' && tipo === 'debito'
  })

  const depositosNoAcreditados = aprobadas.filter(i => {
    const clasif = (i.edicion?.clasificacion ?? i.clasificacion_propuesta ?? '').toLowerCase()
    const tipo = (i.edicion?.tipo ?? i.banco?.tipo ?? '').toLowerCase()
    return clasif === 'temporaria' && tipo === 'credito'
  })

  const depositosNoContabilizados = aprobadas.filter(i => {
    const clasif = (i.edicion?.clasificacion ?? i.clasificacion_propuesta ?? '').toLowerCase()
    const tipo = (i.edicion?.tipo ?? i.banco?.tipo ?? '').toLowerCase()
    return clasif === 'permanente' && tipo === 'credito'
  })

  const rows = []

  rows.push([params.empresa])
  rows.push([`Banco: Galicia`, '', `Período: ${params.periodo}`])
  rows.push([])
  rows.push(['Saldo según Contabilidad', '', formatImporte(saldoContabilidad)])
  rows.push([])

  function addSection(title, items) {
    rows.push([title])
    rows.push(['Fecha', 'Número', 'Importe'])
    let sum = 0
    items.forEach((item) => {
      const importe = item.edicion?.importe ?? item.banco?.importe ?? 0
      const concepto = item.edicion?.concepto ?? item.banco?.descripcion ?? ''
      sum += importe
      rows.push([item.banco?.fecha ?? '', concepto, formatImporte(importe)])
    })
    rows.push(['Total', '', formatImporte(sum)])
    rows.push([])
  }

  addSection('CHEQUES NO DEBITADOS', chequesNoDebitados)
  addSection('CHEQUES NO CONTABILIZADOS', chequesNoContabilizados)
  addSection('DEPÓSITOS NO ACREDITADOS', depositosNoAcreditados)
  addSection('DEPÓSITOS NO CONTABILIZADOS', depositosNoContabilizados)

  const diferencia = saldoExtracto - saldoContabilidad
  rows.push(['Saldo según Extracto', '', formatImporte(saldoExtracto)])
  rows.push([])
  rows.push(['Diferencia', '', formatImporte(diferencia)])

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 40 }, { wch: 20 }, { wch: 20 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Conciliación')
  return wb
}

export default function DownloadScreen({ conciliadas, revision, saldoContabilidad, saldoExtracto, params, onReiniciar }) {
  const aprobadas = revision.filter(i => i.estado === 'aprobado' || i.estado === 'editado')
  const rechazadas = revision.filter(i => i.estado === 'rechazado')
  const diferencia = saldoExtracto - saldoContabilidad
  const totalPartidas = conciliadas.length + aprobadas.length

  function handleDescargar() {
    const wb = buildExcel(conciliadas, revision, saldoContabilidad, saldoExtracto, params)
    XLSX.writeFile(wb, `Conciliacion_${params.empresa.replace(/\s+/g, '_')}_${params.periodo.replace(/\s+/g, '_')}.xlsx`)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
      }}>
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '700', margin: '0 0 8px' }}>
        Conciliación lista
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', margin: '0 0 40px' }}>
        {params.empresa} · {params.periodo}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>Partidas</div>
          <div style={{ color: '#fff', fontSize: '22px', fontWeight: '700' }}>{totalPartidas}</div>
        </div>
        <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>Rechazadas</div>
          <div style={{ color: rechazadas.length > 0 ? '#f87171' : '#fff', fontSize: '22px', fontWeight: '700' }}>{rechazadas.length}</div>
        </div>
        <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>Diferencia</div>
          <div style={{ color: Math.abs(diferencia) < 1 ? '#34d399' : '#fbbf24', fontSize: '18px', fontWeight: '700' }}>
            {formatImporte(diferencia)}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Saldo según Contabilidad</span>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: '600' }}>{formatImporte(saldoContabilidad)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Saldo según Extracto</span>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: '600' }}>{formatImporte(saldoExtracto)}</span>
        </div>
      </div>

      <button
        onClick={handleDescargar}
        style={{
          width: '100%', padding: '16px', borderRadius: '6px', border: 'none',
          backgroundColor: '#fff', color: '#0a3356',
          fontSize: '16px', fontWeight: '700', cursor: 'pointer',
          marginBottom: '12px', letterSpacing: '0.02em',
        }}
      >
        Descargar Excel
      </button>

      <button
        onClick={onReiniciar}
        style={{
          width: '100%', padding: '12px', borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'transparent',
          color: 'rgba(255,255,255,0.5)', fontSize: '14px', cursor: 'pointer',
        }}
      >
        Nueva conciliación
      </button>
    </div>
  )
}
