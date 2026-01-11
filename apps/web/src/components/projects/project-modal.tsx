import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Loader2, FolderKanban, FileText, DollarSign, Check, FolderPlus, FolderCog,
  Zap, Clock, Pause, CheckCircle2, Archive, AlertTriangle
} from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import type { Project, ProjectCreate, ProjectUpdate, ProjectStatus, ProjectPriority } from '@/lib/types'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface ProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
}

const statuses: { value: ProjectStatus; label: string; icon: React.ElementType; color: string; gradient: string }[] = [
  { value: 'draft', label: 'Draft', icon: FileText, color: 'bg-slate-500', gradient: 'from-slate-500 to-slate-600' },
  { value: 'active', label: 'Active', icon: Zap, color: 'bg-emerald-500', gradient: 'from-emerald-500 to-green-600' },
  { value: 'on_hold', label: 'On Hold', icon: Pause, color: 'bg-amber-500', gradient: 'from-amber-500 to-orange-600' },
  { value: 'completed', label: 'Done', icon: CheckCircle2, color: 'bg-primary', gradient: 'from-primary to-primary/70' },
  { value: 'archived', label: 'Archived', icon: Archive, color: 'bg-rose-500', gradient: 'from-rose-500 to-red-600' },
]

const priorities: { value: ProjectPriority; label: string; color: string; textColor: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-slate-100 dark:bg-slate-800', textColor: 'text-slate-600 dark:text-slate-400' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-600 dark:text-blue-400' },
  { value: 'high', label: 'High', color: 'bg-amber-100 dark:bg-amber-900/30', textColor: 'text-amber-600 dark:text-amber-400' },
  { value: 'critical', label: 'Critical', color: 'bg-rose-100 dark:bg-rose-900/30', textColor: 'text-rose-600 dark:text-rose-400' },
]

export function ProjectModal({ open, onOpenChange, project }: ProjectModalProps) {
  const queryClient = useQueryClient()
  const isEditing = !!project

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProjectCreate>({
    defaultValues: {
      name: '',
      description: '',
      status: 'draft',
      priority: 'medium',
      budget: undefined,
    },
  })

  const currentStatus = watch('status') || 'draft'
  const currentPriority = watch('priority') || 'medium'
  const currentName = watch('name')
  const currentBudget = watch('budget')

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description || '',
        status: project.status,
        priority: project.priority,
        budget: project.budget || undefined,
      })
    } else {
      reset({
        name: '',
        description: '',
        status: 'draft',
        priority: 'medium',
        budget: undefined,
      })
    }
  }, [project, reset, open])

  const createMutation = useMutation({
    mutationFn: (data: ProjectCreate) => api.post<Project>('/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast({ title: 'Project created successfully!', variant: 'success' })
      onOpenChange(false)
    },
    onError: () => {
      toast({ title: 'Failed to create project', variant: 'destructive' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: ProjectUpdate) => api.patch<Project>(`/projects/${project?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast({ title: 'Project updated successfully!', variant: 'success' })
      onOpenChange(false)
    },
    onError: () => {
      toast({ title: 'Failed to update project', variant: 'destructive' })
    },
  })

  const onSubmit = (data: ProjectCreate) => {
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending
  const selectedStatus = statuses.find(s => s.value === currentStatus) || statuses[0]
  const selectedPriority = priorities.find(p => p.value === currentPriority) || priorities[1]

  const formatBudget = (cents?: number) => {
    if (!cents) return '$0'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className={cn("p-6 pb-4 bg-gradient-to-br text-white", selectedStatus.gradient)}>
          <DialogHeader className="mb-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                {isEditing ? <FolderCog className="w-7 h-7" /> : <FolderPlus className="w-7 h-7" />}
              </div>
              <div>
                <DialogTitle className="text-white text-xl">
                  {isEditing ? 'Edit Project' : 'Create New Project'}
                </DialogTitle>
                <DialogDescription className="text-white/80">
                  {isEditing ? 'Update project details and settings' : 'Start a new project in your workspace'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Preview card */}
        <div className="px-6 -mt-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card border shadow-sm">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl text-white bg-gradient-to-br",
              selectedStatus.gradient
            )}>
              <FolderKanban className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{currentName || 'New Project'}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <selectedStatus.icon className="w-3 h-3" />
                  {selectedStatus.label}
                </span>
                <span>•</span>
                <span>{formatBudget(currentBudget)}</span>
              </div>
            </div>
            <Badge className={cn("text-xs", selectedPriority.color, selectedPriority.textColor)}>
              {selectedPriority.label}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-4 space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
              <FolderKanban className="w-3.5 h-3.5 text-muted-foreground" />
              Project Name
            </Label>
            <Input
              id="name"
              {...register('name', { required: 'Project name is required' })}
              placeholder="My Awesome Project"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              Description
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="Brief description of the project"
            />
          </div>

          <Separator />

          {/* Status selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              Status
            </Label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => {
                const Icon = status.icon
                return (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => setValue('status', status.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      currentStatus === status.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/50 hover:border-border hover:bg-secondary/30"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center",
                      currentStatus === status.value
                        ? cn("bg-gradient-to-br text-white", status.gradient)
                        : "bg-secondary text-muted-foreground"
                    )}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-medium">{status.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Priority selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
              Priority
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {priorities.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setValue('priority', priority.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-all duration-200",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    currentPriority === priority.value
                      ? "border-primary shadow-sm"
                      : "border-transparent"
                  )}
                >
                  <div className={cn(
                    "w-full py-1.5 rounded-md text-center text-xs font-medium",
                    priority.color,
                    priority.textColor
                  )}>
                    {priority.label}
                  </div>
                  {currentPriority === priority.value && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget" className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
              Budget
              <span className="text-muted-foreground font-normal">(in cents)</span>
            </Label>
            <div className="relative">
              <Input
                id="budget"
                type="number"
                {...register('budget', { valueAsNumber: true })}
                placeholder="100000"
                className="pl-8"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            </div>
            {currentBudget && currentBudget > 0 && (
              <p className="text-xs text-muted-foreground">
                Display value: <span className="font-medium text-foreground">{formatBudget(currentBudget)}</span>
              </p>
            )}
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
              {isEditing ? 'Save Changes' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
