'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, CheckCircle2, LogOut } from 'lucide-react'
import { getSession, logout } from '@/lib/auth'
import { UNITS } from '@/lib/data'
import { getUnitProgress, markMaterialDone, isUnitLocked } from '@/lib/storage'
import type { Session } from '@/lib/auth'

export default function GuiaPage() {
  const router = useRouter()
  const params = useParams()
  const unitId = parseInt(params.id as string)

  const [session, setSession] = useState<Session | null>(null)
  const [done, setDone] = useState(false)

  const unit = UNITS.find(u => u.id === unitId)

  useEffect(() => {
    const s = getSession()
    if (!s) { router.replace('/login'); return }
    if (s.role === 'admin') { router.replace('/admin'); return }
    if (!unit || isUnitLocked(s.userId, unitId)) { router.replace('/dashboard'); return }
    setSession(s)
    setDone(getUnitProgress(s.userId, unitId).guiaDone)
  }, [router, unit, unitId])

  function handleMarkDone() {
    if (!session) return
    markMaterialDone(session.userId, unitId, 'guia')
    setDone(true)
  }

  if (!session || !unit) {
    return (
      <div className="min-h-dvh flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg,#001830 0%,#002060 50%,#001428 100%)' }}>
        <div className="w-8 h-8 border-4 border-blue-500/40 border-t-blue-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col"
      style={{ background: 'linear-gradient(160deg,#001830 0%,#002060 50%,#001428 100%)' }}>

      {/* ── Header ── */}
      <header className="shrink-0 z-40 border-b border-white/[0.08]"
        style={{ background: 'rgba(0,15,40,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 gap-4">

          {/* Left: back + logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => router.push(`/unidad/${unitId}`)}
              className="flex items-center gap-2 text-white/60 hover:text-white border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver</span>
            </button>
            <div className="w-px h-5 bg-white/10" />
            <div className="bg-white/95 rounded-xl px-2.5 py-1 shadow-md">
              <Image src="/logo.png" alt="Linde" width={60} height={24} className="object-contain" priority />
            </div>
          </div>

          {/* Center: title */}
          <div className="flex-1 min-w-0 text-center">
            <p className="text-white/80 text-sm font-bold truncate uppercase tracking-wide">
              Clase {unit.id} — {unit.title}
            </p>
          </div>

          {/* Right: mark done + logout */}
          <div className="flex items-center gap-2 shrink-0">
            {!done ? (
              <button
                onClick={handleMarkDone}
                className="flex items-center gap-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 text-green-300 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-150"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Marcar leída</span>
              </button>
            ) : (
              <span className="flex items-center gap-1.5 bg-green-500/15 border border-green-400/20 text-green-400 px-3 py-1.5 rounded-xl text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Leída</span>
              </span>
            )}
            <button
              onClick={() => { logout(); router.replace('/login') }}
              className="flex items-center gap-1.5 text-white/50 hover:text-white border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-xl text-sm transition-all duration-150"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── PDF viewer (fills remaining height) ── */}
      <div className="flex-1">
        <iframe
          src={`${unit.guideFile}#toolbar=0&navpanes=0&scrollbar=1`}
          className="w-full h-full"
          style={{ minHeight: 'calc(100dvh - 56px)', border: 'none' }}
          title={`Guía Clase ${unit.id}`}
        />
      </div>
    </div>
  )
}
