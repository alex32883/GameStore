'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  MessageSquare, 
  Globe, 
  Star, 
  History, 
  Settings,
  Bookmark
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/dashboard', label: 'Мои промпты', icon: MessageSquare },
  { href: '/dashboard/public', label: 'Публичные промпты', icon: Globe },
  { href: '/dashboard/favorites', label: 'Избранное', icon: Star },
  { href: '/dashboard/history', label: 'История', icon: History },
  { href: '/dashboard/settings', label: 'Настройки', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-[280px] border-r bg-card h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">GameStore</h1>
        <p className="text-sm text-muted-foreground">Управление промптами</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          Выйти
        </button>
      </div>
    </div>
  )
}
