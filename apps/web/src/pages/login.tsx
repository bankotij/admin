import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Loader2, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      toast({ title: 'Welcome back!', variant: 'success' })
      navigate('/')
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error?.data?.detail || 'Invalid email or password',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-background/50 to-background" />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div 
          className={cn(
            "glass rounded-2xl p-8 shadow-card animate-fade-in-up",
            "border border-border/50 relative overflow-hidden"
          )}
        >
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-primary/30 rounded-tl-2xl" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-primary/30 rounded-br-2xl" />
          
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-down" style={{ animationDelay: '0.1s' }}>
            {/* Logo */}
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-glow animate-pulse-glow">
                  <span className="text-3xl font-bold text-primary-foreground">K</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background animate-bounce-subtle" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Welcome to <span className="text-gradient">Kuro</span>
            </h1>
            <p className="text-muted-foreground">
              Sign in to access your admin dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div 
              className="space-y-2 animate-fade-in-up opacity-0" 
              style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
            >
              <Label 
                htmlFor="email" 
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  focusedField === 'email' && "text-primary"
                )}
              >
                Email
              </Label>
              <div className={cn(
                "relative rounded-lg transition-all duration-300",
                focusedField === 'email' && "ring-2 ring-primary/20"
              )}>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                  className="h-12 px-4 bg-secondary/50 border-border/50 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>

            <div 
              className="space-y-2 animate-fade-in-up opacity-0" 
              style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
            >
              <Label 
                htmlFor="password"
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  focusedField === 'password' && "text-primary"
                )}
              >
                Password
              </Label>
              <div className={cn(
                "relative rounded-lg transition-all duration-300",
                focusedField === 'password' && "ring-2 ring-primary/20"
              )}>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="h-12 px-4 bg-secondary/50 border-border/50 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>

            <div 
              className="pt-2 animate-fade-in-up opacity-0" 
              style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
            >
              <Button 
                type="submit" 
                className={cn(
                  "w-full h-12 text-base font-semibold",
                  "bg-gradient-to-r from-primary to-primary/80",
                  "hover:shadow-glow transition-all duration-300",
                  "group relative overflow-hidden"
                )}
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Button>
            </div>
          </form>

          {/* Demo credentials */}
          <div 
            className="mt-8 animate-fade-in-up opacity-0" 
            style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Demo Credentials
                </span>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              {[
                { role: 'Admin', email: 'admin@example.com', pass: 'admin123', color: 'text-primary' },
                { role: 'Manager', email: 'manager@example.com', pass: 'manager123', color: 'text-info' },
                { role: 'Viewer', email: 'viewer@example.com', pass: 'viewer123', color: 'text-success' },
              ].map((cred, idx) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => {
                    setEmail(cred.email)
                    setPassword(cred.pass)
                  }}
                  className={cn(
                    "w-full p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50",
                    "border border-transparent hover:border-border/50",
                    "transition-all duration-200 text-left group",
                    "hover:scale-[1.02] active:scale-[0.98]"
                  )}
                  style={{ animationDelay: `${0.6 + idx * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={cn("font-medium text-sm", cred.color)}>{cred.role}</span>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {cred.email}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6 animate-fade-in opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
          Powered by <span className="text-primary font-medium">Kuro Admin</span> • Built with React & FastAPI
        </p>
      </div>
    </div>
  )
}
