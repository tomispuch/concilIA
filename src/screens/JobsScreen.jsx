import { useState, useEffect } from 'react'

const N8N_RESULTADO = 'https://trs-n8n.qbj5bb.easypanel.host/webhook/concilia-resultado'
const JOBS_KEY = 'concilia_jobs'
const TWO_HOURS = 2 * 60 * 60 * 1000

export function loadJobs() {
  try {
    return JSON.parse(localStorage.getItem(JOBS_KEY) || '[]')
      .filter(j => Date.now() - j.startedAt < TWO_HOURS)
  } catch { return [] }
}

function persistJobs(jobs) {
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs))
}

export function addJob(job) {
  const jobs = loadJobs()
  jobs.unshift(job)
  persistJobs(jobs)
}

function timeAgo(ts) {
  const secs = Math.floor((Date.now() - ts) / 1000)
  if (secs < 60) return 'hace un momento'
  if (secs < 3600) return `hace ${Math.floor(secs / 60)} min`
  return `hace ${Math.floor(secs / 3600)} h`
}

const STATUS_STYLE = {
  procesando: { label: 'Procesando', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)' },
  completado:  { label: 'Completado', color: '#34d399', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)' },
  error:       { label: 'Error',      color: '#f87171', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.35)' },
}

export default function JobsScreen({ onAbrir, onNueva }) {
  const [jobs, setJobs] = useState(loadJobs)

  useEffect(() => {
    const poll = async () => {
      const current = loadJobs()
      const pending = current.filter(j => j.status === 'procesando')
      if (!pending.length) return

      const results = await Promise.all(pending.map(async j => {
        try {
          const r = await fetch(`${N8N_RESULTADO}?jobId=${j.jobId}`)
          const d = await r.json()
          return { jobId: j.jobId, status: d.status, resultado: d.resultado, error: d.error }
        } catch { return null }
      }))

      const updated = current.map(j => {
        const u = results.find(r => r?.jobId === j.jobId)
        return u ? { ...j, ...u } : j
      })
      persistJobs(updated)
      setJobs([...updated])
    }

    const id = setInterval(poll, 5000)
    return () => clearInterval(id)
  }, [])

  const pendingCount = jobs.filter(j => j.status === 'procesando').length

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px' }}>
      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }`}</style>

      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', margin: '0 0 4px' }}>
            Conciliaciones recientes
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>
            {pendingCount > 0
              ? `${pendingCount} en proceso · actualizando cada 5 s`
              : 'Los resultados se guardan por 2 horas'}
          </p>
        </div>
        <button
          onClick={onNueva}
          style={{
            padding: '9px 18px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)',
            backgroundColor: 'transparent', color: 'rgba(255,255,255,0.7)',
            fontSize: '13px', fontWeight: '600', cursor: 'pointer', flexShrink: 0,
          }}
        >
          Nueva conciliación
        </button>
      </div>

      {jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
          No hay conciliaciones recientes
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {jobs.map(job => {
            const st = STATUS_STYLE[job.status] || STATUS_STYLE.procesando
            return (
              <div key={job.jobId} style={{
                backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '3px' }}>
                    {job.empresa}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                    {job.periodo} · {timeAgo(job.startedAt)}
                  </div>
                  {job.status === 'error' && job.error && (
                    <div style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>
                      {job.error}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <span style={{
                    backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border}`,
                    borderRadius: '4px', padding: '3px 10px', fontSize: '11px', fontWeight: '700',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    {job.status === 'procesando' && (
                      <span style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        backgroundColor: '#fbbf24', display: 'inline-block',
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }} />
                    )}
                    {st.label}
                  </span>

                  {job.status === 'completado' && (
                    <button
                      onClick={() => onAbrir(job.resultado, { empresa: job.empresa, periodo: job.periodo })}
                      style={{
                        padding: '6px 16px', borderRadius: '4px', border: 'none',
                        backgroundColor: '#fff', color: '#0a3356',
                        fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                      }}
                    >
                      Abrir
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
