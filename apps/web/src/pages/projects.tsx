import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, FolderKanban, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { api } from '@/lib/api'
import type { Project, PaginatedResponse, ProjectStatus, ProjectFilters } from '@/lib/types'
import { formatDate, formatCurrency, capitalize, cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { ProjectModal } from '@/components/projects/project-modal'

const statusColors: Record<ProjectStatus, 'default' | 'success' | 'warning' | 'secondary' | 'destructive'> = {
  draft: 'secondary',
  active: 'success',
  on_hold: 'warning',
  completed: 'default',
  archived: 'destructive',
}

const statusGradients: Record<ProjectStatus, string> = {
  draft: 'from-slate-500 to-slate-600',
  active: 'from-emerald-500 to-green-600',
  on_hold: 'from-amber-500 to-orange-600',
  completed: 'from-primary to-primary/70',
  archived: 'from-rose-500 to-red-600',
}

const priorityGradients: Record<string, string> = {
  low: 'from-slate-400 to-slate-500',
  medium: 'from-blue-500 to-blue-600',
  high: 'from-amber-500 to-orange-600',
  critical: 'from-rose-500 to-red-600',
}

export function ProjectsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const canEdit = user?.role === 'admin' || user?.role === 'manager'
  
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    page_size: 10,
    search: '',
    status: undefined,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => api.get<PaginatedResponse<Project>>('/projects', filters),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast({ title: 'Project deleted successfully', variant: 'success' })
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
    },
    onError: () => {
      toast({ title: 'Failed to delete project', variant: 'destructive' })
    },
  })

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setModalOpen(true)
  }

  const handleCreate = () => {
    setEditingProject(null)
    setModalOpen(true)
  }

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      deleteMutation.mutate(projectToDelete.id)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in-down">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
            <FolderKanban className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage your projects and track progress
            </p>
          </div>
        </div>
        {canEdit && (
          <Button onClick={handleCreate} className="gap-2 animate-fade-in-right">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search projects..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  status: value === 'all' ? undefined : (value as ProjectStatus),
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Created</TableHead>
                {canEdit && <TableHead className="w-12"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(canEdit ? 7 : 6)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 7 : 6} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
                        <FolderKanban className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No projects found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((project, idx) => (
                  <TableRow 
                    key={project.id}
                    className="animate-fade-in-left opacity-0 group"
                    style={{ animationDelay: `${0.3 + idx * 0.03}s`, animationFillMode: 'forwards' }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg",
                          "bg-gradient-to-br transition-transform duration-200 group-hover:scale-105",
                          statusGradients[project.status]
                        )}>
                          <FolderKanban className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{project.name}</p>
                          {project.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[project.status]}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full mr-1.5",
                          project.status === 'active' ? "bg-success animate-pulse" : "bg-current opacity-50"
                        )} />
                        {capitalize(project.status.replace('_', ' '))}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full bg-gradient-to-br",
                          priorityGradients[project.priority]
                        )} />
                        <span className="text-sm font-medium">{capitalize(project.priority)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {project.owner && (
                          <>
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-2xs font-bold text-white">
                              {project.owner.full_name.charAt(0)}
                            </div>
                            <span className="text-sm">{project.owner.full_name}</span>
                          </>
                        )}
                        {!project.owner && <span className="text-muted-foreground">-</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {project.budget ? (
                        <div className="flex items-center gap-1.5 font-mono text-sm">
                          <DollarSign className="w-3.5 h-3.5 text-success" />
                          {formatCurrency(project.budget).replace('$', '')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {formatDate(project.created_at)}
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleEdit(project)} className="gap-2">
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive gap-2"
                              onClick={() => handleDeleteClick(project)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div 
          className="flex items-center justify-between animate-fade-in-up opacity-0"
          style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
        >
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{(filters.page! - 1) * filters.page_size! + 1}</span> to{' '}
            <span className="font-medium text-foreground">{Math.min(filters.page! * filters.page_size!, data.total)}</span> of{' '}
            <span className="font-medium text-foreground">{data.total}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page === 1}
              onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page === data.pages}
              onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        project={editingProject}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Project"
        description={`Are you sure you want to delete "${projectToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
