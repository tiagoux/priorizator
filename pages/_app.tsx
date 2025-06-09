import type { AppProps } from 'next/app'
import { StrictMode } from 'react'
import { Toaster } from 'react-hot-toast'
import { createClient } from '@supabase/supabase-js'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import '../src/index.css'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

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