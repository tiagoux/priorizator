'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { LandingPage } from '../src/pages/LandingPage'
import { HomePage } from '../src/pages/HomePage'
import { AuthWrapper } from '../src/components/AuthWrapper'

export default function Page() {
  const session = useSession()

  if (!session) {
    return <LandingPage />
  }

  return (
    <AuthWrapper>
      <HomePage />
    </AuthWrapper>
  )
} 