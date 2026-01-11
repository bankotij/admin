import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, User, Mail, Lock, Shield, Eye, EyeOff, Check, UserPlus, UserCog, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api'
import type { User as UserType, UserCreate, UserUpdate, UserRole } from '@/lib/types'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface UserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserType | null
}

interface FormData {
  email: string
  full_name: string
  password: string
  role: UserRole
}

const roles: { value: UserRole; label: string; description: string; color: string; gradient: string }[] = [
  { value: 'viewer', label: 'Viewer', description: 'View-only access', color: 'bg-emerald-500', gradient: 'from-emerald-500 to-green-600' },
  { value: 'manager', label: 'Manager', description: 'Manage projects', color: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600' },
  { value: 'admin', label: 'Admin', description: 'Full access', color: 'bg-primary', gradient: 'from-primary to-primary/70' },
]

export function UserModal({ open, onOpenChange, user }: UserModalProps) {
  const queryClient = useQueryClient()
  const isEditing = !!user
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      email: '',
      full_name: '',
      password: '',
      role: 'viewer',
    },
  })

  const currentRole = watch('role')
  const currentName = watch('full_name')
  const password = watch('password')

  // Password strength
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' }
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++
    
    if (score <= 2) return { score, label: 'Weak', color: 'bg-destructive' }
    if (score <= 3) return { score, label: 'Fair', color: 'bg-amber-500' }
    if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500' }
    return { score, label: 'Strong', color: 'bg-success' }
  }, [password])

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        full_name: user.full_name,
        password: '',
        role: user.role,
      })
    } else {
      reset({
        email: '',
        full_name: '',
        password: '',
        role: 'viewer',
      })
    }
    setShowPassword(false)
  }, [user, reset, open])

  const createMutation = useMutation({
    mutationFn: (data: UserCreate) => api.post<UserType>('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast({ title: 'User created successfully!', variant: 'success' })
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create user',
        description: error?.data?.detail || 'An error occurred',
        variant: 'destructive',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UserUpdate) => api.patch<UserType>(`/users/${user?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({ title: 'User updated successfully!', variant: 'success' })
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update user',
        description: error?.data?.detail || 'An error occurred',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      const updateData: UserUpdate = {
        email: data.email,
        full_name: data.full_name,
        role: data.role,
      }
      updateMutation.mutate(updateData)
    } else {
      createMutation.mutate(data)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending
  const selectedRole = roles.find(r => r.value === currentRole) || roles[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className={cn("p-6 pb-4 bg-gradient-to-br text-white", selectedRole.gradient)}>
          <DialogHeader className="mb-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                {isEditing ? <UserCog className="w-7 h-7" /> : <UserPlus className="w-7 h-7" />}
              </div>
              <div>
                <DialogTitle className="text-white text-xl">
                  {isEditing ? 'Edit User' : 'Create New User'}
                </DialogTitle>
                <DialogDescription className="text-white/80">
                  {isEditing ? 'Update user information and permissions' : 'Add a new team member to your workspace'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Preview card */}
        <div className="px-6 -mt-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card border shadow-sm">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold bg-gradient-to-br",
              selectedRole.gradient
            )}>
              {currentName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{currentName || 'New User'}</p>
              <p className="text-xs text-muted-foreground">{selectedRole.label} • {selectedRole.description}</p>
            </div>
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-4 space-y-5">
          {/* Name & Email */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2 text-sm font-medium">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="full_name"
                {...register('full_name', { required: 'Required' })}
                placeholder="John Doe"
                className={errors.full_name ? 'border-destructive' : ''}
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email',
                  },
                })}
                placeholder="john@example.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Password - only for new users */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Required',
                    minLength: { value: 8, message: 'Min 8 characters' },
                  })}
                  placeholder="Min. 8 characters"
                  className={cn("pr-10", errors.password ? 'border-destructive' : '')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
              
              {/* Password strength */}
              {password && (
                <div className="space-y-1.5 animate-fade-in">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all duration-300",
                          i <= passwordStrength.score ? passwordStrength.color : "bg-secondary"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Strength: <span className={cn(
                      "font-medium",
                      passwordStrength.score <= 2 ? "text-destructive" :
                      passwordStrength.score <= 3 ? "text-amber-500" :
                      passwordStrength.score <= 4 ? "text-blue-500" : "text-success"
                    )}>{passwordStrength.label}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Role selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              Role & Permissions
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setValue('role', role.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    currentRole === role.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/50 hover:border-border hover:bg-secondary/30"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    currentRole === role.value
                      ? cn("bg-gradient-to-br text-white", role.gradient)
                      : "bg-secondary"
                  )}>
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{role.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{role.description}</p>
                  </div>
                  {currentRole === role.value && (
                    <div className={cn("w-1.5 h-1.5 rounded-full", role.color)} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className={cn("gap-2", isLoading && "opacity-80")}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {isEditing ? 'Save Changes' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
