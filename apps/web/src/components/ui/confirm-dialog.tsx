import { useState } from 'react'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
  isLoading?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
  }

  const iconColors = {
    danger: 'bg-destructive/10 text-destructive',
    warning: 'bg-amber-500/10 text-amber-500',
    default: 'bg-primary/10 text-primary',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
        <div className="p-6 text-center">
          {/* Icon */}
          <div className={cn(
            "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4",
            iconColors[variant]
          )}>
            {variant === 'danger' ? (
              <Trash2 className="w-8 h-8" />
            ) : (
              <AlertTriangle className="w-8 h-8" />
            )}
          </div>

          {/* Title & Description */}
          <DialogHeader className="mb-0 text-center">
            <DialogTitle className="text-xl text-center">{title}</DialogTitle>
            <DialogDescription className="text-center mt-2">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Actions */}
        <div className="flex border-t border-border">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 py-3 px-4 text-sm font-medium text-muted-foreground hover:bg-secondary/50 transition-colors border-r border-border disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2",
              variant === 'danger' && "text-destructive hover:bg-destructive/10",
              variant === 'warning' && "text-amber-500 hover:bg-amber-500/10",
              variant === 'default' && "text-primary hover:bg-primary/10"
            )}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for easier usage
export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean
    title: string
    description: string
    confirmText?: string
    variant?: 'danger' | 'warning' | 'default'
    onConfirm: () => void
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  })

  const confirm = (options: {
    title: string
    description: string
    confirmText?: string
    variant?: 'danger' | 'warning' | 'default'
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        ...options,
        onConfirm: () => {
          setState(prev => ({ ...prev, open: false }))
          resolve(true)
        },
      })
    })
  }

  const DialogComponent = (
    <ConfirmDialog
      open={state.open}
      onOpenChange={(open) => setState(prev => ({ ...prev, open }))}
      title={state.title}
      description={state.description}
      confirmText={state.confirmText}
      variant={state.variant}
      onConfirm={state.onConfirm}
    />
  )

  return { confirm, DialogComponent }
}
