'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Users,
  Plus,
  X,
  LogOut,
  CheckCircle2,
  Clock,
  Lock,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  Award,
  LayoutDashboard,
} from 'lucide-react'
import { getSession, logout } from '@/lib/auth'
import { USERS } from '@/lib/data'
import { UNITS } from '@/lib/data'
import { getUserProgress, getUnitStatus } from '@/lib/storage'
import type { Session } from '@/lib/auth'

interface MockUser {
  id: string
  username: string
  name: string
  email: string
  role: 'admin' | 'driver'
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-[#004E97]" />
    case 'in_progress':
      return <Clock className="w-4 h-4 text-[#FF6B00]" />
    case 'locked':
      return <Lock className="w-4 h-4 text-gray-300" />
    case 'available':
      return <Clock className="w-4 h-4 text-gray-400" />
    default:
      return <Lock className="w-4 h-4 text-gray-300" />
  }
}

function AddUserModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (user: MockUser) => void
}) {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !username || !email || !password) {
      setError('Todos los campos son obligatorios.')
      return
    }
    const newUser: MockUser = {
      id: `driver-${Date.now()}`,
      username: username.trim().toLowerCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'driver',
    }
    onAdd(newUser)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Agregar conductor"
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">Agregar conductor</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          {[
            { id: 'name', label: 'Nombre completo', type: 'text', value: name, setter: setName, placeholder: 'Ej: Juan García' },
            { id: 'username', label: 'Usuario', type: 'text', value: username, setter: setUsername, placeholder: 'Ej: jgarcia' },
            { id: 'email', label: 'Correo electrónico', type: 'email', value: email, setter: setEmail, placeholder: 'Ej: jgarcia@linde.com' },
            { id: 'password', label: 'Contraseña inicial', type: 'text', value: password, setter: setPassword, placeholder: 'Ej: linde2024' },
          ].map((field) => (
            <div key={field.id} className="space-y-1.5">
              <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                {field.label} <span className="text-red-500">*</span>
              </label>
              <input
                id={field.id}
                type={field.type}
                required
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004E97] focus:border-transparent"
              />
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-[#004E97] text-white font-bold text-sm hover:bg-[#003875] transition-colors"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UserRow({ user }: { user: MockUser }) {
  const [expanded, setExpanded] = useState(false)
  const progress = getUserProgress(user.id)

  const completedUnits = Object.values(progress.units).filter(
    (u) => u.evaluationPassed
  ).length

  const overallPct = Math.round((completedUnits / UNITS.length) * 100)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3 bg-white shadow-sm">
      {/* Row header */}
      <div className="p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#004E97] text-white flex items-center justify-center font-bold text-sm shrink-0">
          {user.name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{user.name}</p>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-bold text-[#004E97]">{overallPct}%</p>
            <p className="text-xs text-gray-500">
              {completedUnits}/{UNITS.length} unidades
            </p>
          </div>
          <div className="w-24">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#004E97] h-2 rounded-full transition-all"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? 'Colapsar' : 'Expandir'}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 shrink-0"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Mobile progress */}
      <div className="sm:hidden px-4 pb-3 flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#004E97] h-2 rounded-full"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <span className="text-sm font-bold text-[#004E97]">{overallPct}%</span>
      </div>

      {/* Expanded unit grid */}
      {expanded && (
        <div className="border-t border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Progreso por unidad
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {UNITS.map((unit) => {
              const status = getUnitStatus(user.id, unit.id)
              const unitProg = progress.units[unit.id]
              return (
                <div
                  key={unit.id}
                  className={`rounded-lg p-2 text-center border ${
                    status === 'completed'
                      ? 'bg-blue-50 border-blue-200'
                      : status === 'in_progress'
                      ? 'bg-orange-50 border-orange-200'
                      : status === 'available'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    {getStatusIcon(status)}
                  </div>
                  <p className="text-[10px] font-bold text-gray-700">
                    U{unit.id}
                  </p>
                  {unitProg?.evaluationScore !== null && unitProg?.evaluationScore !== undefined && (
                    <p className="text-[10px] text-[#004E97] font-semibold">
                      {unitProg.evaluationScore}%
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [search, setSearch] = useState('')
  const [drivers, setDrivers] = useState<MockUser[]>([])

  useEffect(() => {
    const s = getSession()
    if (!s) { router.replace('/login'); return }
    if (s.role !== 'admin') { router.replace('/dashboard'); return }
    setSession(s)

    const initialDrivers = USERS.filter((u) => u.role === 'driver').map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      email: u.email,
      role: u.role as 'driver',
    }))
    setDrivers(initialDrivers)
  }, [router])

  function handleLogout() {
    logout()
    router.replace('/login')
  }

  function handleAddUser(user: MockUser) {
    setDrivers((prev) => [...prev, user])
  }

  function handleExport() {
    const headers = ['Nombre', 'Usuario', 'Email', ...UNITS.map((u) => `U${u.id} Estado`), 'Progreso (%)']
    const rows = drivers.map((driver) => {
      const progress = getUserProgress(driver.id)
      const completed = Object.values(progress.units).filter((u) => u.evaluationPassed).length
      const pct = Math.round((completed / UNITS.length) * 100)
      const unitStatuses = UNITS.map((u) => getUnitStatus(driver.id, u.id))
      return [driver.name, driver.username, driver.email, ...unitStatuses, `${pct}%`]
    })

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-capacitacion-linde-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.username.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase())
  )

  if (!session) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-[#004E97] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const totalCompleted = drivers.reduce((acc, d) => {
    const p = getUserProgress(d.id)
    return acc + Object.values(p.units).filter((u) => u.evaluationPassed).length
  }, 0)

  const avgProgress =
    drivers.length > 0
      ? Math.round((totalCompleted / (drivers.length * UNITS.length)) * 100)
      : 0

  return (
    <div className="min-h-dvh bg-gray-100">
      {/* Header */}
      <header className="bg-[#004E97] shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg px-3 py-1.5">
                <Image
                  src="/logo.png"
                  alt="Linde"
                  width={80}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-white text-xs font-semibold opacity-80">
                  Panel de Administración
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-white text-sm font-semibold">
                  {session.name}
                </span>
                <span className="text-blue-200 text-xs">Administrador</span>
              </div>
              <button
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Conductores',
              value: drivers.length,
              icon: Users,
              color: 'bg-[#004E97]',
            },
            {
              label: 'Unidades totales',
              value: UNITS.length,
              icon: LayoutDashboard,
              color: 'bg-gray-700',
            },
            {
              label: 'Unidades aprobadas',
              value: totalCompleted,
              icon: CheckCircle2,
              color: 'bg-green-600',
            },
            {
              label: 'Progreso promedio',
              value: `${avgProgress}%`,
              icon: Award,
              color: 'bg-[#FF6B00]',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-lg ${stat.color} text-white flex items-center justify-center shrink-0`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 leading-tight">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Conductores section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Conductores</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {drivers.length} conductor{drivers.length !== 1 ? 'es' : ''} registrado{drivers.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex-1" />
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05f00] text-white text-sm font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar conductor
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mt-4">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                placeholder="Buscar por nombre, usuario o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004E97] focus:border-transparent"
              />
            </div>
          </div>

          <div className="p-4">
            {filteredDrivers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  {search ? 'No se encontraron resultados' : 'No hay conductores registrados'}
                </p>
              </div>
            ) : (
              filteredDrivers.map((driver) => (
                <UserRow key={driver.id} user={driver} />
              ))
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Referencia de estados
          </p>
          <div className="flex flex-wrap gap-4">
            {[
              { icon: <CheckCircle2 className="w-4 h-4 text-[#004E97]" />, label: 'Completado' },
              { icon: <Clock className="w-4 h-4 text-[#FF6B00]" />, label: 'En progreso' },
              { icon: <Clock className="w-4 h-4 text-gray-400" />, label: 'Disponible' },
              { icon: <Lock className="w-4 h-4 text-gray-300" />, label: 'Bloqueado' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-gray-600">
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-8 border-t border-gray-200 bg-white py-4">
        <p className="text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Linde plc · Panel de Administración
        </p>
      </footer>

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddUser}
        />
      )}
    </div>
  )
}
