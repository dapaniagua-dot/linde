'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default function Root() {
  const router = useRouter()

  useEffect(() => {
    const session = getSession()
    if (session) {
      router.replace(session.role === 'admin' ? '/admin' : '/dashboard')
    } else {
      router.replace('/login')
    }
  }, [router])

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-100">
      <div className="w-8 h-8 border-4 border-[#004E97] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
