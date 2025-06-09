import dynamic from 'next/dynamic'

const ClientApp = dynamic(() => import('../components/ClientApp'), { ssr: false })

export default function HomePage() {
  return <ClientApp />
} 