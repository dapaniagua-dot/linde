'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { login, getSession } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const session = getSession()
    if (session) {
      router.replace(session.role === 'admin' ? '/admin' : '/dashboard')
    }
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    await new Promise((r) => setTimeout(r, 400))

    const session = login(username.trim(), password)
    if (session) {
      router.replace(session.role === 'admin' ? '/admin' : '/dashboard')
    } else {
      setError('Usuario o contraseña incorrectos. Verifique sus credenciales.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-[#003875] via-[#004E97] to-[#0066CC] flex flex-col items-center justify-center p-4">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-white rounded-2xl p-4 shadow-xl mb-4">
            <Image
              src="/logo.png"
              alt="Linde"
              width={140}
              height={56}
              className="object-contain"
              priority
            />
          </div>
          <p className="text-blue-100 text-sm font-medium tracking-wide uppercase">
            Plataforma de Capacitación Técnica
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Card header */}
          <div className="bg-[#004E97] px-6 py-4">
            <h1 className="text-white font-semibold text-lg">
              Acceso al Sistema
            </h1>
            <p className="text-blue-200 text-sm mt-0.5">
              Transporte de CO₂ – Programa de Certificación
            </p>
          </div>

          {/* Card body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Usuario
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004E97] focus:border-transparent transition-all text-base"
                placeholder="Ingrese su usuario"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004E97] focus:border-transparent transition-all text-base"
                  placeholder="Ingrese su contraseña"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-[#FF6B00] hover:bg-[#e05f00] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Acceder'
              )}
            </button>

            <p className="text-center text-sm text-gray-500 leading-relaxed">
              Para recibir sus credenciales de acceso,
              <br />
              contacte a su supervisor.
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-200 text-xs mt-6 opacity-70">
          © {new Date().getFullYear()} Linde plc. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
