import { Header } from './components/header'

interface Props {
  children?: React.ReactNode
}

export function MainLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">{children}</main>
    </div>
  )
}
