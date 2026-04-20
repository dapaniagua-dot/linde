'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  BookOpen, Play, Calendar,
  CheckCircle2, Lock, ChevronRight, LogOut,
  Award, AlertTriangle, Flame,
} from 'lucide-react'
import { getSession, logout } from '@/lib/auth'
import { UNITS } from '@/lib/data'
import { getUnitStatus, getOverallProgress, getUnitProgress } from '@/lib/storage'
import type { Session } from '@/lib/auth'
import type { UnitProgress } from '@/lib/storage'

type UnitStatusType = 'locked' | 'available' | 'in_progress' | 'completed'

/* ── Background orbs ─────────────────────────────────────── */
function Orbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="anim-orb absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,78,151,0.35) 0%, transparent 70%)', animationDelay: '0s' }} />
      <div className="anim-orb absolute top-1/2 -left-48 w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,50,120,0.25) 0%, transparent 70%)', animationDelay: '3s' }} />
      <div className="anim-orb absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.10) 0%, transparent 70%)', animationDelay: '6s' }} />
    </div>
  )
}

/* ── Material status dots ────────────────────────────────── */
function MaterialDots({ progress }: { progress: UnitProgress }) {
  const dots = [
    { done: progress.guiaDone,  icon: BookOpen,  label: 'Guía' },
    { done: progress.videoDone, icon: Play,      label: 'Video' },
    { done: progress.claseDone, icon: Calendar,  label: 'Clase' },
  ]
  return (
    <div className="flex items-center gap-2">
      {dots.map(({ done, icon: Icon, label }) => (
        <div key={label} title={label}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
            done
              ? 'bg-blue-500/30 border border-blue-400/50 text-blue-300'
              : 'bg-white/5 border border-white/10 text-white/25'
          }`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      ))}
    </div>
  )
}

/* ── Unit card ───────────────────────────────────────────── */
function UnitCard({
  unit, status, progress, index,
}: {
  unit: (typeof UNITS)[0]
  status: UnitStatusType
  progress: UnitProgress
  index: number
}) {
  const router = useRouter()
  const isLocked    = status === 'locked'
  const isCompleted = status === 'completed'
  const isActive    = status === 'available' || status === 'in_progress'

  const borderColor =
    isCompleted ? 'border-blue-400/40'  :
    isActive    ? 'border-white/[0.14]' :
                  'border-white/[0.06]'

  const bgColor =
    isCompleted ? 'bg-blue-500/[0.09]' :
    isActive    ? 'bg-white/[0.06]'    :
                  'bg-white/[0.03]'

  return (
    <div
      className={`anim-fade-up relative rounded-2xl border overflow-hidden glass-hover
        ${bgColor} ${borderColor} ${isLocked ? 'opacity-50' : ''}`}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      {/* Completed shimmer line */}
      {isCompleted && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
      )}
      {/* In-progress indicator */}
      {status === 'in_progress' && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent" />
      )}

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
            isCompleted
              ? 'text-blue-300 bg-blue-500/20 border-blue-400/30'
              : 'text-white/50 bg-white/5 border-white/10'
          }`}>
            Clase {unit.id}
          </span>

          {isCompleted && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-300 bg-blue-500/20 border border-blue-400/30 rounded-full px-2 py-0.5">
              <CheckCircle2 className="w-3 h-3" /> Completado
            </span>
          )}
          {status === 'in_progress' && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-orange-300 bg-orange-500/15 border border-orange-400/30 rounded-full px-2 py-0.5">
              <Flame className="w-3 h-3" /> En progreso
            </span>
          )}
          {isLocked && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-white/30 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
              <Lock className="w-3 h-3" /> Bloqueado
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={`font-bold text-base leading-snug mb-1.5 uppercase tracking-wide ${
          isLocked ? 'text-white/35' : 'text-white'
        }`}>
          {unit.title}
        </h3>

        <p className={`text-sm leading-relaxed mb-4 line-clamp-2 ${
          isLocked ? 'text-white/20' : 'text-white/55'
        }`}>
          {unit.description}
        </p>

        {/* Material dots */}
        <div className="mb-4">
          <MaterialDots progress={progress} />
        </div>

        {/* Score badge */}
        {isCompleted && progress.evaluationScore !== null && (
          <div className="flex items-center gap-1.5 mb-4 text-xs text-blue-300 bg-blue-500/15 border border-blue-400/20 rounded-lg px-3 py-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>Evaluación: {progress.evaluationScore}%</span>
          </div>
        )}

        {/* CTA */}
        <button
          disabled={isLocked}
          onClick={() => router.push(`/unidad/${unit.id}`)}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-150 ${
            isLocked
              ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
              : isCompleted
              ? 'bg-white/8 text-white/70 hover:bg-white/12 border border-white/10'
              : 'btn-sky glow-sky'
          }`}
        >
          {isLocked ? (
            <><Lock className="w-4 h-4" /> Bloqueado</>
          ) : isCompleted ? (
            <><CheckCircle2 className="w-4 h-4" /> Revisar</>
          ) : (
            <>Ver clase <ChevronRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  )
}

/* ── Circular progress ring ─────────────────────────────── */
function ProgressRing({ pct }: { pct: number }) {
  const r = 40, circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="anim-scale-in">
      <circle cx="50" cy="50" r={r} fill="none"
        stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none"
        stroke="#004E97" strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)' }}
      />
      <text x="50" y="50" dominantBaseline="middle" textAnchor="middle"
        fill="white" fontSize="18" fontWeight="800" fontFamily="Inter,sans-serif">
        {pct}%
      </text>
    </svg>
  )
}

/* ── Page ────────────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter()
  const [session, setSession]           = useState<Session | null>(null)
  const [unitStatuses, setUnitStatuses] = useState<UnitStatusType[]>([])
  const [unitProgresses, setUnitProgresses] = useState<UnitProgress[]>([])
  const [overallPct, setOverallPct]     = useState(0)

  useEffect(() => {
    const s = getSession()
    if (!s) { router.replace('/login'); return }
    if (s.role === 'admin') { router.replace('/admin'); return }
    setSession(s)

    setUnitStatuses(UNITS.map(u => getUnitStatus(s.userId, u.id)))
    setUnitProgresses(UNITS.map(u => getUnitProgress(s.userId, u.id)))
    setOverallPct(getOverallProgress(s.userId, UNITS.length))
  }, [router])

  if (!session) return (
    <div className="min-h-dvh flex items-center justify-center" style={{ background: 'linear-gradient(160deg,#001830 0%,#002060 50%,#001428 100%)' }}>
      <div className="w-8 h-8 border-4 border-blue-500/40 border-t-blue-400 rounded-full animate-spin" />
    </div>
  )

  const completedCount = unitStatuses.filter(s => s === 'completed').length

  return (
    <div className="min-h-dvh relative" style={{ background: 'linear-gradient(160deg,#001830 0%,#002060 50%,#001428 100%)' }}>
      <Orbs />

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08]"
        style={{ background: 'rgba(0,15,40,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-white/95 rounded-xl px-3 py-1.5 shadow-lg">
              <Image src="/logo.png" alt="Linde" width={80} height={32} className="object-contain" priority />
            </div>
            <span className="hidden sm:block text-white/40 text-xs font-medium tracking-wide">
              Capacitación CO₂
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-white text-sm font-semibold leading-tight">{session.name}</span>
              <span className="text-white/40 text-xs">Conductor</span>
            </div>
            <button onClick={() => { logout(); router.replace('/login') }}
              className="flex items-center gap-2 text-white/60 hover:text-white border border-white/10 hover:border-white/25 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Hero ── */}
        <div className="anim-fade-up glass rounded-3xl overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Text */}
            <div className="flex-1">
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2 anim-slide-r" style={{ animationDelay: '80ms' }}>
                Linde · Programa de Certificación
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-1 anim-fade-up" style={{ animationDelay: '120ms' }}>
                Bienvenido, {session.name.split(' ')[0]}
              </h1>
              <p className="text-white/55 text-sm sm:text-base anim-fade-up" style={{ animationDelay: '160ms' }}>
                Transporte seguro de CO₂ líquido y gaseoso
              </p>

              {/* Progress bar wide */}
              <div className="mt-5 anim-fade-up" style={{ animationDelay: '200ms' }}>
                <div className="flex justify-between text-xs text-white/50 mb-1.5">
                  <span>{completedCount} de {UNITS.length} unidades completadas</span>
                  <span className="font-bold text-white">{overallPct}%</span>
                </div>
                <div className="w-full h-2.5 bg-white/[0.08] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${overallPct}%`,
                      background: 'linear-gradient(90deg,#004E97,#3B82F6)',
                      boxShadow: '0 0 12px rgba(59,130,246,0.5)',
                    }} />
                </div>
              </div>
            </div>

            {/* Ring */}
            <div className="anim-scale-in shrink-0" style={{ animationDelay: '100ms' }}>
              <ProgressRing pct={overallPct} />
            </div>
          </div>
        </div>

        {/* ── Safety notice ── */}
        <div className="anim-fade-up flex items-start gap-3 rounded-2xl border border-orange-400/25 bg-orange-500/[0.08] px-5 py-4"
          style={{ animationDelay: '100ms' }}>
          <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-sm text-orange-200/80 leading-relaxed">
            <strong className="text-orange-300">Avance secuencial:</strong> completá la evaluación de cada unidad con mínimo 70% para desbloquear la siguiente.
          </p>
        </div>

        {/* ── Units grid ── */}
        <div>
          <h2 className="anim-fade-up text-white/80 text-xs font-bold uppercase tracking-widest mb-4"
            style={{ animationDelay: '80ms' }}>
            Unidades del curso
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {UNITS.map((unit, i) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                status={unitStatuses[i] ?? 'locked'}
                progress={unitProgresses[i] ?? {
                  unitId: unit.id, guiaDone: false,
                  videoDone: false, claseDone: true, evaluationPassed: false,
                  evaluationScore: null, evaluationAttempts: 0,
                }}
                index={i}
              />
            ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] py-5 mt-8">
        <p className="text-center text-white/20 text-xs">
          © {new Date().getFullYear()} Linde plc · Plataforma de Capacitación Técnica
        </p>
      </footer>
    </div>
  )
}
