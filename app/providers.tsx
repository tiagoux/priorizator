'use client'

import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  const [supabaseClient] = useState(() => createClientComponentClient())

  return (
    <BrowserRouter>
      <SessionContextProvider supabaseClient={supabaseClient}>
        <Toaster position="top-right" />
        {children}
      </SessionContextProvider>
    </BrowserRouter>
  )
} 