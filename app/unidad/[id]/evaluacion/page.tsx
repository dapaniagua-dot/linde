'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft, ArrowRight, CheckCircle2, XCircle,
  Award, RotateCcw, LogOut, AlertTriangle, ClipboardCheck,
} from 'lucide-react'
import { getSession, logout } from '@/lib/auth'
import { UNITS, pickRandomQuestions } from '@/lib/data'
import { saveEvaluationResult, getUnitProgress, isUnitLocked } from '@/lib/storage'
import type { Session } from '@/lib/auth'
import type { Question } from '@/lib/data'

type EvalState = 'intro' | 'taking' | 'results'

const PASS_THRESHOLD = 70
const QUESTIONS_PER_ATTEMPT = 10

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

export default function EvaluacionPage() {
  const router = useRouter()
  const params = useParams()
  const unitId = parseInt(params.id as string)

  const [session, setSession] = useState<Session | null>(null)
  const [evalState, setEvalState] = useState<EvalState>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, 'a' | 'b' | 'c' | 'd'>>({})
  const [score, setScore] = useState(0)
  const [passed, setPassed] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])

  const unit = UNITS.find((u) => u.id === unitId)
  const totalQ = questions.length

  useEffect(() => {
    const s = getSession()
    if (!s) { router.replace('/login'); return }
    if (s.role === 'admin') { router.replace('/admin'); return }
    setSession(s)
    if (!unit) { router.replace('/dashboard'); return }
    if (isUnitLocked(s.userId, unitId)) { router.replace('/dashboard'); return }
    const progress = getUnitProgress(s.userId, unitId)
    if (progress.evaluationPassed) {
      setScore(progress.evaluationScore ?? 0)
      setPassed(true)
      setEvalState('results')
    }
  }, [router, unit, unitId])

  function handleAnswer(answer: 'a' | 'b' | 'c' | 'd') {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: answer }))
    setShowFeedback(false)
  }

  function handleNext() {
    if (answers[currentQuestion] === undefined) { setShowFeedback(true); return }
    if (currentQuestion < totalQ - 1) { setCurrentQuestion((p) => p + 1); setShowFeedback(false) }
  }

  function handlePrev() {
    if (currentQuestion > 0) { setCurrentQuestion((p) => p - 1); setShowFeedback(false) }
  }

  function handleSubmit() {
    if (!session) return
    let correct = 0
    questions.forEach((q, i) => { if (answers[i] === q.correcta) correct++ })
    const pct = Math.round((correct / totalQ) * 100)
    const hasPassed = pct >= PASS_THRESHOLD
    setScore(pct)
    setPassed(hasPassed)
    saveEvaluationResult(session.userId, unitId, pct, hasPassed)
    setEvalState('results')
  }

  function startAttempt() {
    setQuestions(pickRandomQuestions(unitId, QUESTIONS_PER_ATTEMPT))
    setAnswers({})
    setCurrentQuestion(0)
    setShowFeedback(false)
    setEvalState('taking')
  }

  function handleRetry() {
    startAttempt()
  }

  if (!session || !unit) {
    return (
      <div className="min-h-dvh flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg,#001830 0%,#002060 50%,#001428 100%)' }}>
        <div className="w-8 h-8 border-4 border-blue-500/40 border-t-blue-400 rounded-full animate-spin" />
      </div>
    )
  }

  const answeredCount = Object.keys(answers).length
  const isLastQuestion = currentQuestion === totalQ - 1
  const canSubmit = answeredCount === totalQ

  return (
    <div className="min-h-dvh relative"
      style={{ background: 'linear-gradient(160deg,#001830 0%,#002060 50%,#001428 100%)' }}>
      <Orbs />

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08]"
        style={{ background: 'rgba(0,15,40,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/unidad/${unitId}`)}
              aria-label="Volver a la unidad"
              className="flex items-center gap-2 text-white/60 hover:text-white border border-white/10 hover:border-white/25 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Unidad</span>
            </button>
            <div className="w-px h-6 bg-white/15" />
            <div className="bg-white/95 rounded-xl px-3 py-1.5 shadow-lg">
              <Image src="/logo.png" alt="Linde" width={70} height={28} className="object-contain" priority />
            </div>
          </div>
          <button
            onClick={() => { logout(); router.replace('/login') }}
            className="flex items-center gap-2 text-white/60 hover:text-white border border-white/10 hover:border-white/25 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* ── INTRO ── */}
        {evalState === 'intro' && (
          <div className="space-y-5">
            <div className="anim-fade-up glass rounded-3xl overflow-hidden">
              {/* Title bar */}
              <div className="p-6 border-b border-white/[0.08]">
                <div className="flex items-center gap-2 text-blue-300/70 text-[11px] font-bold uppercase tracking-widest mb-2">
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Evaluación
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight uppercase tracking-wide">
                  Clase {unit.id}: {unit.title}
                </h1>
              </div>

              {/* Stats */}
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Preguntas', value: QUESTIONS_PER_ATTEMPT },
                    { label: 'Mínimo', value: `${PASS_THRESHOLD}%` },
                    { label: 'Intentos', value: '∞' },
                  ].map((item, i) => (
                    <div key={item.label}
                      className="anim-fade-up bg-white/[0.05] border border-white/[0.08] rounded-2xl p-4 text-center"
                      style={{ animationDelay: `${i * 50}ms` }}>
                      <p className="text-2xl font-black text-white">{item.value}</p>
                      <p className="text-[11px] text-white/45 mt-0.5 font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-orange-400/25 bg-orange-500/[0.08] px-5 py-4">
                  <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-300 text-sm mb-1">Instrucciones</p>
                    <ul className="text-sm text-orange-200/70 space-y-0.5">
                      <li>• Seleccione la respuesta correcta para cada pregunta.</li>
                      <li>• Puede navegar entre preguntas usando los botones.</li>
                      <li>• Debe responder todas las preguntas antes de enviar.</li>
                      <li>• Se requiere un mínimo de {PASS_THRESHOLD}% para aprobar.</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={startAttempt}
                  className="w-full btn-orange glow-orange flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-base"
                >
                  <ClipboardCheck className="w-5 h-5" />
                  Iniciar evaluación
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAKING ── */}
        {evalState === 'taking' && (
          <div className="space-y-4">
            {/* Progress tracker */}
            <div className="anim-fade-up glass rounded-2xl p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold text-white">Pregunta {currentQuestion + 1} de {totalQ}</span>
                <span className="text-white/50">{answeredCount}/{totalQ} respondidas</span>
              </div>
              <div className="w-full bg-white/[0.08] rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestion + 1) / totalQ) * 100}%`,
                    background: 'linear-gradient(90deg,#004E97,#3B82F6)',
                    boxShadow: '0 0 8px rgba(59,130,246,0.5)',
                  }} />
              </div>

              {/* Dot navigator */}
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentQuestion(i); setShowFeedback(false) }}
                    className={`w-7 h-7 rounded-full text-xs font-bold transition-all duration-150 ${
                      i === currentQuestion
                        ? 'bg-blue-500 text-white ring-2 ring-blue-400/40'
                        : answers[i] !== undefined
                        ? 'bg-green-500/80 text-white'
                        : 'bg-white/[0.08] text-white/50 hover:bg-white/15'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Question card */}
            <div className="anim-fade-up glass rounded-2xl overflow-hidden" style={{ animationDelay: '60ms' }}>
              <div className="px-6 py-5 border-b border-white/[0.08]"
                style={{ background: 'rgba(0,78,151,0.25)' }}>
                <p className="text-white font-semibold text-base leading-relaxed">
                  {questions[currentQuestion].pregunta}
                </p>
              </div>

              <div className="p-5 space-y-3">
                {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                  const selected = answers[currentQuestion] === opt
                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-start gap-3 ${
                        selected
                          ? 'border-blue-400/60 bg-blue-500/[0.15]'
                          : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.07]'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 transition-all ${
                        selected ? 'bg-blue-500 text-white' : 'bg-white/[0.08] text-white/60'
                      }`}>
                        {opt.toUpperCase()}
                      </span>
                      <span className={`text-sm leading-relaxed ${selected ? 'text-white font-medium' : 'text-white/70'}`}>
                        {questions[currentQuestion][opt]}
                      </span>
                    </button>
                  )
                })}

                {showFeedback && (
                  <p className="text-sm text-orange-300 bg-orange-500/[0.10] border border-orange-400/25 rounded-xl px-4 py-2.5">
                    Seleccione una respuesta antes de continuar.
                  </p>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="anim-fade-up flex gap-3" style={{ animationDelay: '100ms' }}>
              <button
                onClick={handlePrev}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/[0.10] bg-white/[0.04] font-semibold text-sm text-white/60 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </button>
              <div className="flex-1" />
              {!isLastQuestion ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-150"
                  style={{ background: '#004E97' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#003875')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#004E97')}
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-150 ${
                    canSubmit ? 'btn-orange glow-orange' : 'bg-white/[0.08] text-white/30 cursor-not-allowed'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4" />
                  Enviar{!canSubmit ? ` (${answeredCount}/${totalQ})` : ''}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {evalState === 'results' && (
          <div className="space-y-5">
            {/* Score hero */}
            <div className="anim-scale-in glass rounded-3xl overflow-hidden">
              <div className={`p-8 text-center border-b border-white/[0.08] ${
                passed
                  ? 'bg-gradient-to-br from-blue-600/30 to-blue-900/20'
                  : 'bg-gradient-to-br from-gray-700/20 to-gray-900/20'
              }`}>
                {/* Top shimmer line */}
                {passed && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
                )}
                <div className="flex justify-center mb-5">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                    passed ? 'bg-blue-500/20 border-2 border-blue-400/40' : 'bg-white/[0.07] border-2 border-white/[0.10]'
                  }`}>
                    {passed
                      ? <Award className="w-12 h-12 text-blue-300" />
                      : <XCircle className="w-12 h-12 text-white/40" />
                    }
                  </div>
                </div>
                <p className="text-6xl font-black text-white mb-2">{score}%</p>
                <p className="text-xl font-bold text-white">
                  {passed ? '¡Evaluación aprobada!' : 'No aprobado'}
                </p>
                <p className="text-white/50 text-sm mt-1">
                  {passed
                    ? `Superó el umbral mínimo de ${PASS_THRESHOLD}%`
                    : `Se requiere mínimo ${PASS_THRESHOLD}% para aprobar`}
                </p>
              </div>

              <div className="p-5">
                {passed ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-blue-400/25 bg-blue-500/[0.08] px-5 py-4">
                    <CheckCircle2 className="w-6 h-6 text-blue-400 shrink-0" />
                    <div>
                      <p className="font-bold text-white text-sm">Clase {unit.id} completada</p>
                      <p className="text-white/50 text-xs mt-0.5">
                        {unit.id < UNITS.length
                          ? 'La siguiente clase está ahora disponible.'
                          : '¡Completó todas las clases del curso!'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-2xl border border-orange-400/25 bg-orange-500/[0.08] px-5 py-4">
                    <AlertTriangle className="w-6 h-6 text-orange-400 shrink-0" />
                    <div>
                      <p className="font-bold text-orange-300 text-sm">Repase los materiales e intente nuevamente</p>
                      <p className="text-orange-200/60 text-xs mt-0.5">Revise la guía y la presentación antes de reintentar.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Answers review */}
            {Object.keys(answers).length > 0 && (
              <div className="anim-fade-up glass rounded-2xl overflow-hidden" style={{ animationDelay: '80ms' }}>
                <div className="px-5 py-4 border-b border-white/[0.08]">
                  <h2 className="font-bold text-white text-sm">Revisión de respuestas</h2>
                </div>
                <div className="divide-y divide-white/[0.06]">
                  {questions.map((q, i) => {
                    const userAns = answers[i]
                    const isCorrect = userAns === q.correcta
                    return (
                      <div key={i} className="p-4">
                        <div className="flex items-start gap-2 mb-2">
                          {isCorrect
                            ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                            : <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          }
                          <p className="text-sm font-medium text-white/80 leading-relaxed">
                            {i + 1}. {q.pregunta}
                          </p>
                        </div>
                        {!isCorrect && (
                          <div className="ml-6 space-y-1">
                            <p className="text-xs text-red-400/90">
                              Tu respuesta: {userAns?.toUpperCase()}) {userAns ? q[userAns] : '—'}
                            </p>
                            <p className="text-xs text-green-400 font-medium">
                              Correcta: {q.correcta.toUpperCase()}) {q[q.correcta]}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="anim-fade-up flex flex-col sm:flex-row gap-3" style={{ animationDelay: '100ms' }}>
              {!passed && (
                <button
                  onClick={handleRetry}
                  className="flex-1 flex items-center justify-center gap-2 btn-orange glow-orange py-3.5 px-6 rounded-2xl font-bold"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reintentar evaluación
                </button>
              )}
              <button
                onClick={() => router.push(`/unidad/${unitId}`)}
                className="flex-1 flex items-center justify-center gap-2 border border-white/[0.12] bg-white/[0.05] hover:bg-white/[0.09] text-white/80 hover:text-white py-3.5 px-6 rounded-2xl font-bold transition-all duration-150"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a la unidad
              </button>
              {passed && unit.id < UNITS.length && (
                <button
                  onClick={() => router.push(`/unidad/${unitId + 1}`)}
                  className="flex-1 flex items-center justify-center gap-2 text-white py-3.5 px-6 rounded-2xl font-bold transition-all duration-150 btn-sky glow-sky"
                >
                  Siguiente clase
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {passed && unit.id === UNITS.length && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 flex items-center justify-center gap-2 text-white py-3.5 px-6 rounded-2xl font-bold transition-all duration-150"
                  style={{ background: '#004E97' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#003875')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#004E97')}
                >
                  <Award className="w-4 h-4" />
                  Ver mis logros
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
