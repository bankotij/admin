import { Menu, Moon, Sun, LogOut, User, ChevronDown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()
  const { setTheme, resolvedTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border/50 glass-strong px-4 sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden hover:bg-secondary/80 transition-colors"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Separator */}
      <div className="h-6 w-px bg-border/50 lg:hidden" />

      {/* Spacer & Actions */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Page indicator for desktop */}
        <div className="hidden lg:flex items-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/30">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              Welcome back, <span className="text-foreground">{user?.full_name?.split(' ')[0]}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-x-2 lg:gap-x-3">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className={cn(
              "relative h-9 w-9 rounded-xl transition-all duration-300",
              "hover:bg-secondary/80 hover:scale-105 active:scale-95"
            )}
          >
            <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "gap-2 px-2 pr-3 h-10 rounded-xl",
                  "hover:bg-secondary/80 transition-all duration-200",
                  "focus-visible:ring-2 focus-visible:ring-primary/20"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-sm font-bold text-primary-foreground shadow-glow">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-medium">{user?.full_name}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-64 p-2 glass-strong border-border/50 rounded-xl animate-scale-in"
            >
              <DropdownMenuLabel className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-lg font-bold text-primary-foreground shadow-glow">
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="font-semibold truncate">{user?.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50 my-2" />
              <DropdownMenuItem 
                onClick={() => navigate('/settings')}
                className="px-3 py-2.5 rounded-lg cursor-pointer transition-colors focus:bg-secondary/80"
              >
                <User className="mr-3 h-4 w-4 text-muted-foreground" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50 my-2" />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="px-3 py-2.5 rounded-lg cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
