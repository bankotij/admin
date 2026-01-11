import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  FileText, 
  Settings,
  X,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Audit Logs', href: '/audit-logs', icon: FileText, adminOnly: true },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const filteredNav = navigation.filter(item => !item.adminOnly || isAdmin)

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-full max-w-xs lg:hidden transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button */}
        <div className={cn(
          "absolute left-full top-0 flex w-16 justify-center pt-5 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-foreground hover:bg-secondary/80 rounded-xl"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Sidebar content */}
        <div className="flex h-full grow flex-col overflow-y-auto glass-strong border-r border-border/30">
          {/* Decorative gradient */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          
          {/* Logo */}
          <div className="relative flex h-20 shrink-0 items-center gap-3 px-6 border-b border-border/30">
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-xl font-bold text-primary-foreground">K</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-card" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Kuro Admin</h1>
              <p className="text-2xs text-muted-foreground font-medium">Control Panel</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex flex-1 flex-col px-4 py-6">
            <p className="px-3 mb-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
              Navigation
            </p>
            <ul role="list" className="flex flex-col gap-1">
              {filteredNav.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        'hover:bg-secondary/80 active:scale-[0.98]',
                        isActive
                          ? 'bg-primary/10 text-primary shadow-inner-glow'
                          : 'text-muted-foreground hover:text-foreground'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={cn(
                          "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200",
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-glow" 
                            : "bg-secondary/50 text-muted-foreground group-hover:bg-secondary group-hover:text-foreground"
                        )}>
                          <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                        </div>
                        <span className="flex-1">{item.name}</span>
                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* User section */}
          <div className="p-4 border-t border-border/30">
            <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-xl bg-secondary/30 border border-border/30">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                Status: <span className="text-success font-medium">Online</span>
              </span>
            </div>
            
            <div className="flex items-center gap-3 rounded-xl p-3 bg-secondary/50">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-sm font-bold text-primary-foreground shadow-glow">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-card" />
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-semibold truncate">{user?.full_name}</p>
                <p className="text-2xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
