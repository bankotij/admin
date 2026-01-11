import { useState, useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { 
  Loader2, Moon, Sun, Monitor, Settings as SettingsIcon, Lock, Palette,
  AlertTriangle, Shield, Bell, Mail, Smartphone, Eye, EyeOff,
  Check, X, Clock, MapPin, Globe, Fingerprint, KeyRound, LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { api } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { cn, formatDate } from '@/lib/utils'

export function SettingsPage() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const passwordMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      api.post('/users/me/password', data),
    onSuccess: () => {
      toast({ title: 'Password updated successfully', variant: 'success' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update password',
        description: error?.data?.detail || 'An error occurred',
        variant: 'destructive',
      })
    },
  })

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' })
      return
    }
    
    if (newPassword.length < 8) {
      toast({ title: 'Password must be at least 8 characters', variant: 'destructive' })
      return
    }
    
    passwordMutation.mutate({
      current_password: currentPassword,
      new_password: newPassword,
    })
  }

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: '', color: '' }
    
    let score = 0
    if (newPassword.length >= 8) score++
    if (newPassword.length >= 12) score++
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) score++
    if (/\d/.test(newPassword)) score++
    if (/[^a-zA-Z0-9]/.test(newPassword)) score++
    
    if (score <= 2) return { score, label: 'Weak', color: 'bg-destructive' }
    if (score <= 3) return { score, label: 'Fair', color: 'bg-amber-500' }
    if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500' }
    return { score, label: 'Strong', color: 'bg-success' }
  }, [newPassword])

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Clean & bright' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Easy on eyes' },
    { value: 'system', label: 'System', icon: Monitor, description: 'Auto switch' },
  ] as const

  const roleGradient = user?.role === 'admin' 
    ? 'from-primary to-primary/70' 
    : user?.role === 'manager' 
    ? 'from-blue-500 to-blue-600' 
    : 'from-emerald-500 to-green-600'

  const roleBadgeVariant = user?.role === 'admin' ? 'default' : user?.role === 'manager' ? 'secondary' : 'outline'

  return (
    <div className="space-y-6 pb-8">
      {/* Page header */}
      <div className="animate-fade-in-down">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 shadow-lg">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Profile & Theme */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile section */}
          <Card className="animate-fade-in-up opacity-0 overflow-hidden" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            <div className={cn("h-24 bg-gradient-to-br", roleGradient)} />
            <CardContent className="relative pt-0">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                <div className="relative group">
                  <div className={cn(
                    "flex h-24 w-24 items-center justify-center rounded-2xl text-4xl font-bold text-white shadow-xl border-4 border-card",
                    "bg-gradient-to-br transition-transform duration-300 group-hover:scale-105",
                    roleGradient
                  )}>
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-4 border-card flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold">{user?.full_name}</h2>
                    <Badge variant={roleBadgeVariant} className="capitalize">
                      {user?.role}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground font-mono text-sm">{user?.email}</p>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {/* Account stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Login</p>
                    <p className="text-sm font-semibold">
                      {user?.last_login ? formatDate(user.last_login) : 'Just now'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10">
                    <Shield className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Account Status</p>
                    <p className="text-sm font-semibold text-emerald-500">Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
                    <Globe className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Member Since</p>
                    <p className="text-sm font-semibold">
                      {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme section */}
          <Card className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-500/10">
                  <Palette className="w-4 h-4 text-violet-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Appearance</CardTitle>
                  <CardDescription>Customize how the app looks</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200',
                      'hover:scale-[1.02] active:scale-[0.98]',
                      theme === option.value
                        ? 'border-primary bg-primary/5 shadow-glow'
                        : 'border-border/50 hover:border-border hover:bg-secondary/30'
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
                      theme === option.value 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary text-muted-foreground"
                    )}>
                      <option.icon className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Password change section */}
          <Card className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/10">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-sm font-medium">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="Enter your current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <Separator className="bg-border/50" />
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-medium">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        placeholder="Min. 8 characters"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>

                {/* Password strength indicator */}
                {newPassword && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Password strength</span>
                      <span className={cn(
                        "font-medium",
                        passwordStrength.score <= 2 ? "text-destructive" :
                        passwordStrength.score <= 3 ? "text-amber-500" :
                        passwordStrength.score <= 4 ? "text-blue-500" : "text-success"
                      )}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1.5 flex-1 rounded-full transition-all duration-300",
                            i <= passwordStrength.score ? passwordStrength.color : "bg-secondary"
                          )}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className={cn("flex items-center gap-1", newPassword.length >= 8 ? "text-success" : "text-muted-foreground")}>
                        {newPassword.length >= 8 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        8+ chars
                      </span>
                      <span className={cn("flex items-center gap-1", /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? "text-success" : "text-muted-foreground")}>
                        {/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Mixed case
                      </span>
                      <span className={cn("flex items-center gap-1", /\d/.test(newPassword) ? "text-success" : "text-muted-foreground")}>
                        {/\d/.test(newPassword) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Number
                      </span>
                      <span className={cn("flex items-center gap-1", /[^a-zA-Z0-9]/.test(newPassword) ? "text-success" : "text-muted-foreground")}>
                        {/[^a-zA-Z0-9]/.test(newPassword) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Symbol
                      </span>
                    </div>
                  </div>
                )}

                {/* Password match indicator */}
                {confirmPassword && (
                  <div className={cn(
                    "flex items-center gap-2 text-sm animate-fade-in",
                    newPassword === confirmPassword ? "text-success" : "text-destructive"
                  )}>
                    {newPassword === confirmPassword ? (
                      <>
                        <Check className="w-4 h-4" />
                        Passwords match
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Passwords do not match
                      </>
                    )}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  disabled={passwordMutation.isPending || !currentPassword || !newPassword || newPassword !== confirmPassword}
                  className="mt-2"
                >
                  {passwordMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Notifications & Security */}
        <div className="space-y-6">
          {/* Notifications section */}
          <Card className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10">
                    <Bell className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Notifications</CardTitle>
                    <CardDescription>Manage alerts</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">Coming Soon</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 opacity-50">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Get notified via email</p>
                  </div>
                </div>
                <Switch checked={false} disabled />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Browser alerts</p>
                  </div>
                </div>
                <Switch checked={false} disabled />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Security Alerts</p>
                    <p className="text-xs text-muted-foreground">Login notifications</p>
                  </div>
                </div>
                <Switch checked={false} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Security section */}
          <Card className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.35s', animationFillMode: 'forwards' }}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10">
                  <Lock className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Security</CardTitle>
                  <CardDescription>Protect your account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Two-Factor Auth</p>
                    <p className="text-xs text-muted-foreground">Extra security layer</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">Coming Soon</Badge>
              </div>
              
              <div className="p-3 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Active Session</p>
                    <p className="text-xs text-muted-foreground">Current device</p>
                  </div>
                </div>
                <div className="text-xs space-y-1 text-muted-foreground pl-8">
                  <p>• Windows · Chrome</p>
                  <p>• Last active: Just now</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card 
            className="border-destructive/30 bg-destructive/5 animate-fade-in-up opacity-0" 
            style={{ animationDelay: '0.45s', animationFillMode: 'forwards' }}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-destructive/10">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  if (confirm('Are you sure you want to sign out from all devices?')) {
                    logout()
                    toast({ title: 'Signed out from all devices' })
                  }
                }}
              >
                <LogOut className="w-4 h-4" />
                Sign out all devices
              </Button>
              <p className="text-xs text-muted-foreground">
                Contact an administrator to delete your account.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
