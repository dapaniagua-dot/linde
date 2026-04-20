'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft, BookOpen, Play, Calendar,
  CheckCircle2, Lock, ExternalLink,
  Clock, ChevronRight, LogOut, Award, AlertTriangle, FileText,
} from 'lucide-react'
import { getSession, logout } from '@/lib/auth'
import { UNITS, getVideoUrl } from '@/lib/data'
import { getUnitProgress, markMaterialDone, canTakeEvaluation, isUnitLocked } from '@/lib/storage'
import type { Session } from '@/lib/auth'
import type { UnitProgress } from '@/lib/storage'

type Tab = 'guia' | 'video' | 'clase'

/* ── Background orbs ────────────────────────────────────── */
function Orbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="anim-orb absolute -top-20 -right-20 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,78,151,0.30) 0%, transparent 70%)', animationDelay: '0s' }} />
      <div className="anim-orb absolute bottom-10 -left-20 w-80 h-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)', animationDelay: '4s' }} />
    </div>
  )
}

/* ── Tab button ─────────────────────────────────────────── */
function TabBtn({
  id, active, done, label, icon: Icon, onClick,
}: {
  id: Tab; active: boolean; done: boolean
  label: string; icon: React.ElementType; onClick: () => void
}) {
  return (
    <button onClick={onClick}
      className={`relative flex flex-col items-center gap-1.5 py-3 px-3 rounded-xl text-xs font-semibold transition-all duration-150 min-w-[68px] border ${
        active
          ? 'bg-white/[0.14] border-white/25 text-white shadow-lg'
          : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:bg-white/[0.08] hover:text-white/80'
      }`}>
      <div className="relative">
        <Icon className="w-5 h-5" />
        {done && (
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400 absolute -top-1.5 -right-1.5 bg-[#001830] rounded-full" />
        )}
      </div>
      <span className="leading-tight">{label}</span>
      {active && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#FF6B00] rounded-full" />}
    </button>
  )
}

/* ── Guide tab ──────────────────────────────────────────── */
function GuiaTab({ unit, done, unitId }: { unit: (typeof UNITS)[0]; done: boolean; unitId: number }) {
  const router = useRouter()
  return (
    <div className="space-y-4 anim-fade-in">
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-blue-300" />
          <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">Temas de la clase</span>
        </div>
        <ul className="space-y-2 mb-5">
          {unit.topics.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/60">
              <ChevronRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
              {t}
            </li>
          ))}
        </ul>
        <button
          onClick={() => router.push(`/unidad/${unitId}/guia`)}
          className="w-full btn-sky glow-sky flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm"
        >
          <FileText className="w-4 h-4" />
          Leer guía completa
        </button>
      </div>

      {done ? (
        <div className="flex items-center justify-center gap-2 bg-green-500/15 border border-green-400/25 text-green-300 py-3 rounded-2xl text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" /> Guía completada
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-400/20 bg-blue-500/[0.06] px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-blue-400/60 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-200/60">Al terminar de leer, marcá la guía como leída desde el visor para habilitar la evaluación.</p>
        </div>
      )}
    </div>
  )
}


/* ── Video tab ──────────────────────────────────────────── */
function VideoTab({ unit, done, onMarkDone }: { unit: (typeof UNITS)[0]; done: boolean; onMarkDone: () => void }) {
  const [hasVideo, setHasVideo] = useState(true)
  const videoUrl = getVideoUrl(unit.id)

  return (
    <div className="space-y-4 anim-fade-in">
      <div className="glass rounded-2xl overflow-hidden">
        {hasVideo ? (
          <video
            src={videoUrl}
            controls
            preload="metadata"
            className="w-full"
            onEnded={onMarkDone}
            onError={() => setHasVideo(false)}
          />
        ) : (
          <div className="aspect-video flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
              <Play className="w-7 h-7 text-white/20 ml-1" />
            </div>
            <p className="text-white/35 font-semibold">Video próximamente disponible</p>
            <p className="text-white/20 text-sm">El contenido audiovisual está en producción</p>
          </div>
        )}
      </div>

      {!hasVideo && (
        <div className="flex items-start gap-3 glass rounded-2xl px-5 py-4 border border-orange-400/20">
          <Clock className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-sm text-orange-200/70">
            Podés avanzar a la evaluación completando la guía.
          </p>
        </div>
      )}

      {done && (
        <div className="flex items-center justify-center gap-2 bg-green-500/15 border border-green-400/25 text-green-300 py-3 rounded-2xl text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" /> Video completado
        </div>
      )}
    </div>
  )
}

/* ── Sync class tab ─────────────────────────────────────── */
function ClaseTab({ unit, done }: { unit: (typeof UNITS)[0]; done: boolean }) {
  const fmt = (d: string | null) => {
    if (!d) return null
    const dt = new Date(d)
    return {
      date: dt.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: dt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    }
  }
  const sched = fmt(unit.syncClassDate)

  return (
    <div className="space-y-4 anim-fade-in">
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-500/20 border border-blue-400/30 rounded-xl flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Clase Sincrónica · Clase {unit.id}</h3>
            <p className="text-white/50 text-sm mt-0.5">Sesión en vivo con el instructor para repasar conceptos y consultas.</p>
          </div>
        </div>

        {sched ? (
          <>
            <div className="border-t border-white/[0.06] pt-4">
              <p className="text-white/35 text-xs uppercase tracking-wider font-semibold mb-1">Fecha programada</p>
              <p className="text-white font-semibold capitalize">{sched.date}</p>
              <p className="text-white/55 text-sm">{sched.time} hs (ARG)</p>
            </div>
            <div className="border-t border-white/[0.06] pt-4">
              <p className="text-white/35 text-xs uppercase tracking-wider font-semibold mb-1">Enlace de acceso</p>
              {unit.syncClassLink ? (
                <a href={unit.syncClassLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm font-medium transition-colors">
                  <ExternalLink className="w-4 h-4" /> Unirse a la clase
                </a>
              ) : (
                <p className="text-white/35 text-sm italic">El enlace será enviado por su supervisor.</p>
              )}
            </div>
          </>
        ) : (
          <div className="border-t border-white/[0.06] pt-4 text-center py-4">
            <p className="text-white/30 text-sm">Fecha pendiente de confirmación</p>
          </div>
        )}
      </div>

      {done ? (
        <div className="flex items-center justify-center gap-2 bg-green-500/15 border border-green-400/25 text-green-300 py-3 rounded-2xl text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" /> Clase sincrónica completada
        </div>
      ) : (
        <div className="flex items-start gap-3 glass rounded-2xl px-5 py-4 border border-orange-400/20">
          <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-sm text-orange-200/70">La asistencia será registrada por tu instructor.</p>
        </div>
      )}
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────── */
export default function UnitPage() {
  const router = useRouter()
  const params = useParams()
  const unitId = parseInt(params.id as string)

  const [session, setSession]     = useState<Session | null>(null)
  const [progress, setProgress]   = useState<UnitProgress | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('guia')
  const [canEval, setCanEval]     = useState(false)
  const [locked, setLocked]       = useState(false)

  const unit = UNITS.find(u => u.id === unitId)

  useEffect(() => {
    const s = getSession()
    if (!s) { router.replace('/login'); return }
    if (s.role === 'admin') { router.replace('/admin'); return }
    setSession(s)
    if (!unit) { router.replace('/dashboard'); return }
    const lk = isUnitLocked(s.userId, unitId)
    setLocked(lk)
    if (lk) return
    const p = getUnitProgress(s.userId, unitId)
    setProgress(p)
    setCanEval(canTakeEvaluation(s.userId, unitId))
  }, [router, unit, unitId])

  function handleMark(m: 'guia' | 'video' | 'clase') {
    if (!session) return
    markMaterialDone(session.userId, unitId, m)
    const p = getUnitProgress(session.userId, unitId)
    setProgress(p)
    setCanEval(canTakeEvaluation(session.userId, unitId))
  }

  if (!session || !unit) return (
    <div className="min-h-dvh flex items-center justify-center" style={{ background: 'linear-gradient(160deg,#001830 0%,#002060 50%,#001428 100%)' }}>
      <div className="w-8 h-8 border-4 border-blue-500/40 border-t-blue-400 rounded-full animate-spin" />
    </div>
  )

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'guia',  label: 'Guía',  icon: BookOpen },
    { id: 'video', label: 'Video', icon: Play },
    { id: 'clase', label: 'Clase', icon: Calendar },
  ]

  return (
    <div className="min-h-dvh relative" style={{ background: 'linear-gradient(160deg,#001830 0%,#002060 50%,#001428 100%)' }}>
      <Orbs />

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08]"
        style={{ background: 'rgba(0,15,40,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Inicio</span>
            </button>
            <div className="w-px h-5 bg-white/10" />
            <div className="bg-white/95 rounded-xl px-3 py-1.5">
              <Image src="/logo.png" alt="Linde" width={70} height={28} className="object-contain" />
            </div>
          </div>
          <button onClick={() => { logout(); router.replace('/login') }}
            className="flex items-center gap-2 text-white/50 hover:text-white border border-white/10 hover:border-white/25 px-3 py-2 rounded-xl text-sm transition-all duration-150">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {locked ? (
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-9 h-9 text-white/20" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Clase bloqueada</h2>
          <p className="text-white/45 mb-8">Completá la clase anterior para acceder a ésta.</p>
          <button onClick={() => router.push('/dashboard')}
            className="btn-orange px-8 py-3.5 rounded-2xl">
            Volver al inicio
          </button>
        </div>
      ) : (
        <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">

          {/* ── Unit hero ── */}
          <div className="anim-fade-up glass rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/[0.06]">
              <p className="text-white/35 text-xs font-bold uppercase tracking-widest mb-2">
                Clase {unit.id} de {UNITS.length}
              </p>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight uppercase tracking-wide">
                {unit.title}
              </h1>
              <p className="text-white/50 text-sm mt-2 leading-relaxed">{unit.description}</p>

              {progress?.evaluationPassed && (
                <div className="flex items-center gap-2 mt-3 bg-blue-500/15 border border-blue-400/25 rounded-xl px-4 py-2 text-sm font-semibold text-blue-300">
                  <Award className="w-4 h-4" />
                  Evaluación aprobada · {progress.evaluationScore}%
                </div>
              )}
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-2 overflow-x-auto pb-1 anim-fade-up" style={{ animationDelay: '60ms' }}>
            {tabs.map(t => (
              <TabBtn key={t.id} id={t.id} active={activeTab === t.id}
                done={
                  progress
                    ? t.id === 'guia'  ? progress.guiaDone
                    : t.id === 'video' ? progress.videoDone
                    : progress.claseDone
                    : false
                }
                label={t.label} icon={t.icon}
                onClick={() => setActiveTab(t.id)}
              />
            ))}
          </div>

          {/* ── Tab content ── */}
          <div key={activeTab}>
            {activeTab === 'guia' && progress &&
              <GuiaTab unit={unit} done={progress.guiaDone} unitId={unitId} />}
            {activeTab === 'video' && progress &&
              <VideoTab unit={unit} done={progress.videoDone} onMarkDone={() => handleMark('video')} />}
            {activeTab === 'clase' && progress &&
              <ClaseTab unit={unit} done={progress.claseDone} />}
          </div>

          {/* ── Evaluation CTA ── */}
          <div className={`anim-fade-up glass rounded-3xl overflow-hidden border transition-all duration-300 ${
            canEval ? 'border-orange-400/35' : 'border-white/[0.08]'
          }`} style={{ animationDelay: '120ms' }}>
            {canEval && <div className="h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent" />}
            <div className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  progress?.evaluationPassed ? 'bg-blue-500/20 border border-blue-400/30'
                  : canEval ? 'bg-orange-500/20 border border-orange-400/30'
                  : 'bg-white/[0.05] border border-white/10'
                }`}>
                  {progress?.evaluationPassed
                    ? <Award className="w-6 h-6 text-blue-300" />
                    : <FileText className={`w-6 h-6 ${canEval ? 'text-orange-300' : 'text-white/25'}`} />
                  }
                </div>
                <div>
                  <h3 className={`font-bold text-base ${canEval ? 'text-orange-100' : 'text-white/80'}`}>
                    {progress?.evaluationPassed ? 'Evaluación aprobada' : 'Evaluación de la unidad'}
                  </h3>
                  <p className={`text-sm mt-0.5 ${canEval ? 'text-orange-200/65' : 'text-white/35'}`}>
                    {progress?.evaluationPassed
                      ? `Puntuación: ${progress.evaluationScore}% · Clase completada.`
                      : canEval
                      ? '¡Todo listo! Iniciá la evaluación para certificar esta clase.'
                      : 'Leé la guía completa para habilitar la evaluación.'}
                  </p>

                  {!canEval && !progress?.evaluationPassed && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-white/30">
                      <span className={`flex items-center gap-1 ${progress?.guiaDone ? 'text-green-400' : ''}`}>
                        {progress?.guiaDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        Completá la guía para habilitar la evaluación
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {!progress?.evaluationPassed && (
                <button disabled={!canEval}
                  onClick={() => router.push(`/unidad/${unitId}/evaluacion`)}
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-150 ${
                    canEval ? 'btn-orange glow-orange' : 'bg-white/[0.04] text-white/20 cursor-not-allowed border border-white/[0.06]'
                  }`}>
                  {canEval
                    ? <><span>Iniciar evaluación</span><ChevronRight className="w-5 h-5" /></>
                    : <><Lock className="w-4 h-4" /><span>Evaluación bloqueada</span></>
                  }
                </button>
              )}

              {progress?.evaluationPassed && (
                <div className="flex flex-col sm:flex-row gap-2 mt-1">
                  <button onClick={() => router.push('/dashboard')}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-white/80 py-3 rounded-2xl font-semibold text-sm transition-all">
                    <ArrowLeft className="w-4 h-4" /> Inicio
                  </button>
                  {unitId < UNITS.length && (
                    <button onClick={() => router.push(`/unidad/${unitId + 1}`)}
                      className="flex-1 btn-sky py-3 rounded-2xl flex items-center justify-center gap-2 text-sm">
                      Siguiente clase <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        </main>
      )}
    </div>
  )
}
