import { useState } from 'react'

const CONFIANZA_COLORS = {
  alta: { bg: 'rgba(16,185,129,0.2)', color: '#34d399', border: 'rgba(16,185,129,0.35)', label: 'Alta' },
  media: { bg: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: 'rgba(245,158,11,0.35)', label: 'Media' },
  baja: { bg: 'rgba(239,68,68,0.2)', color: '#f87171', border: 'rgba(239,68,68,0.35)', label: 'Baja' },
}

function formatImporte(n) {
  if (n == null) return '-'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(n)
}

function EditPanel({ item, onSave, onCancel }) {
  const [importe, setImporte] = useState(String(item.edicion?.importe ?? item.banco?.importe ?? ''))
  const [clasificacion, setClasificacion] = useState(item.edicion?.clasificacion ?? item.clasificacion_propuesta ?? 'temporaria')
  const [concepto, setConcepto] = useState(item.edicion?.concepto ?? item.banco?.descripcion ?? '')

  return (
    <div style={{
      marginTop: '12px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Importe</label>
          <input
            type="number"
            value={importe}
            onChange={e => setImporte(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(0,0,0,0.25)', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Clasificación</label>
          <select
            value={clasificacion}
            onChange={e => setClasificacion(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(0,20,50,0.8)', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          >
            <option value="temporaria">Temporaria</option>
            <option value="permanente">Permanente</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>
      <div>
        <label style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Concepto / Descripción</label>
        <input
          type="text"
          value={concepto}
          onChange={e => setConcepto(e.target.value)}
          style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(0,0,0,0.25)', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '7px 16px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button
          onClick={() => onSave({ importe: parseFloat(importe), clasificacion, concepto })}
          style={{ padding: '7px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#fff', color: '#0a3356', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
        >
          Guardar
        </button>
      </div>
    </div>
  )
}

function RevisionCard({ item, onAprobar, onEditar, onRechazar }) {
  const [editando, setEditando] = useState(false)
  const conf = CONFIANZA_COLORS[item.confianza] || CONFIANZA_COLORS.media

  const estadoColor = item.estado === 'aprobado' ? '#34d399' : item.estado === 'rechazado' ? '#f87171' : item.estado === 'editado' ? '#fbbf24' : null

  return (
    <div style={{
      border: `1px solid ${estadoColor ? estadoColor + '55' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: '8px', padding: '16px', backgroundColor: 'rgba(0,0,0,0.2)',
      opacity: item.estado ? 0.75 : 1,
      transition: 'opacity 0.2s, border-color 0.2s',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>Banco</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{item.banco?.fecha}</div>
          <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>{item.banco?.descripcion}</div>
          <div style={{ color: '#fbbf24', fontSize: '14px', fontWeight: '700', marginTop: '4px' }}>{formatImporte(item.banco?.importe)}</div>
        </div>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>Sistema Contable</div>
          {item.contable ? (
            <>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{item.contable.fecha}</div>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>{item.contable.descripcion}</div>
              <div style={{ color: '#fbbf24', fontSize: '14px', fontWeight: '700', marginTop: '4px' }}>{formatImporte(item.contable.importe)}</div>
            </>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontStyle: 'italic' }}>Sin correlato</div>
          )}
        </div>
      </div>

      <div style={{
        backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: '6px', padding: '10px 12px',
        marginBottom: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.5'
      }}>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: '600' }}>IA: </span>
        {item.propuesta_ia}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            backgroundColor: conf.bg, color: conf.color, border: `1px solid ${conf.border}`,
            borderRadius: '4px', padding: '3px 8px', fontSize: '11px', fontWeight: '700'
          }}>
            Confianza {conf.label}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', textTransform: 'capitalize' }}>
            {item.edicion?.clasificacion ?? item.clasificacion_propuesta}
          </span>
          {item.estado && (
            <span style={{ color: estadoColor, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
              {item.estado === 'editado' ? 'Editado' : item.estado === 'aprobado' ? 'Aprobado' : 'Rechazado'}
            </span>
          )}
        </div>

        {!item.estado && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { setEditando(!editando) }}
              style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
            >
              Editar
            </button>
            <button
              onClick={onRechazar}
              style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.4)', backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
            >
              Rechazar
            </button>
            <button
              onClick={onAprobar}
              style={{ padding: '6px 14px', borderRadius: '4px', border: 'none', backgroundColor: '#fff', color: '#0a3356', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              Aprobar
            </button>
          </div>
        )}
      </div>

      {editando && (
        <EditPanel
          item={item}
          onSave={edicion => { onEditar(edicion); setEditando(false) }}
          onCancel={() => setEditando(false)}
        />
      )}
    </div>
  )
}

export default function ReviewScreen({ conciliadas, revision, setRevision, saldoContabilidad, saldoExtracto, params, onGenerar }) {
  const procesadas = revision.filter(i => i.estado !== null).length
  const total = revision.length
  const todasProcesadas = procesadas === total

  function updateItem(id, updates) {
    setRevision(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
  }

  const totalConciliadas = conciliadas.reduce((sum, c) => sum + (c.importe || 0), 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', minHeight: 'calc(100vh - 65px)', gap: '0' }}>
      {/* Columna izquierda */}
      <div style={{ borderRight: '1px solid rgba(255,255,255,0.08)', padding: '32px 24px', overflowY: 'auto', maxHeight: 'calc(100vh - 65px)' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', margin: '0 0 4px' }}>
            Partidas conciliadas
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: 0 }}>
            {conciliadas.length} partidas · {formatImporte(totalConciliadas)}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {conciliadas.map((c, i) => (
            <div key={i} style={{
              backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '10px 12px',
              border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>{c.concepto}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{c.fecha} · <span style={{ textTransform: 'capitalize' }}>{c.clasificacion}</span></div>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: '600', flexShrink: 0 }}>
                {formatImporte(c.importe)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Columna derecha */}
      <div style={{ padding: '32px 24px', overflowY: 'auto', maxHeight: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', margin: '0 0 4px' }}>
              Partidas para revisión
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: 0 }}>
              {params.empresa} · {params.periodo}
            </p>
          </div>
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px',
            padding: '8px 16px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: '600'
          }}>
            {procesadas} / {total} revisadas
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {revision.map(item => (
            <RevisionCard
              key={item.id}
              item={item}
              onAprobar={() => updateItem(item.id, { estado: 'aprobado' })}
              onEditar={edicion => updateItem(item.id, { estado: 'editado', edicion })}
              onRechazar={() => updateItem(item.id, { estado: 'rechazado' })}
            />
          ))}
        </div>

        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={onGenerar}
            disabled={!todasProcesadas}
            style={{
              width: '100%', padding: '14px', borderRadius: '6px', border: 'none',
              backgroundColor: todasProcesadas ? '#fff' : 'rgba(255,255,255,0.08)',
              color: todasProcesadas ? '#0a3356' : 'rgba(255,255,255,0.25)',
              fontSize: '15px', fontWeight: '700', cursor: todasProcesadas ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s',
            }}
          >
            Generar conciliación
          </button>
          {!todasProcesadas && (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>
              Revisá todas las partidas para continuar
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
