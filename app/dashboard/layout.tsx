import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <main className="flex-1 ml-[280px] overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
