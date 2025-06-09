import type { AppProps } from 'next/app'
import { StrictMode } from 'react'
import { Toaster } from 'react-hot-toast'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from '../src/lib/supabase'
import '../src/index.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StrictMode>
      <SessionContextProvider supabaseClient={supabase}>
        <Component {...pageProps} />
        <Toaster position="top-right" />
      </SessionContextProvider>
    </StrictMode>
  )
} 