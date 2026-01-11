import { useState } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { MobileSidebar } from './mobile-sidebar'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        {/* Animated loading state */}
        <div className="relative">
          {/* Background glow */}
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative space-y-4 text-center">
            {/* Animated logo */}
            <div className="relative mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-glow animate-pulse-glow">
                <span className="text-2xl font-bold text-primary-foreground">K</span>
              </div>
              {/* Spinning ring */}
              <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 animate-spin-slow" style={{ borderTopColor: 'hsl(var(--primary))' }} />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground animate-pulse">Loading...</p>
              <div className="flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        
        {/* Top gradient */}
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary/3 to-transparent" />
        
        {/* Ambient glow */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Desktop sidebar */}
      <Sidebar />
      
      {/* Mobile sidebar */}
      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main content */}
      <div className="relative lg:pl-72">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        
        <main className="py-6 lg:py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Page transition wrapper */}
            <div 
              key={location.pathname}
              className={cn(
                "animate-fade-in-up",
                "min-h-[calc(100vh-8rem)]"
              )}
            >
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
