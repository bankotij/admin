import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, UserCheck, UserX, Users as UsersIcon } from 'lucide-react'
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
import type { User, PaginatedResponse, UserRole, UserFilters } from '@/lib/types'
import { formatDate, capitalize, cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { UserModal } from '@/components/users/user-modal'

const roleColors: Record<UserRole, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  manager: 'secondary',
  viewer: 'outline',
}

const roleGradients: Record<UserRole, string> = {
  admin: 'from-primary to-primary/70',
  manager: 'from-blue-500 to-blue-600',
  viewer: 'from-emerald-500 to-green-600',
}

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const isAdmin = currentUser?.role === 'admin'
  
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    page_size: 10,
    search: '',
    role: undefined,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => api.get<PaginatedResponse<User>>('/users', filters),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast({ title: 'User deleted successfully', variant: 'success' })
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete user',
        description: error?.data?.detail || 'An error occurred',
        variant: 'destructive',
      })
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      api.patch(`/users/${id}`, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({ title: 'User updated', variant: 'success' })
    },
    onError: () => {
      toast({ title: 'Failed to update user', variant: 'destructive' })
    },
  })

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setModalOpen(true)
  }

  const handleCreate = () => {
    setEditingUser(null)
    setModalOpen(true)
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in-down">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-glow">
            <UsersIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage user accounts and permissions
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button onClick={handleCreate} className="gap-2 animate-fade-in-right">
            <Plus className="h-4 w-4" />
            New User
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
                placeholder="Search users..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
            <Select
              value={filters.role || 'all'}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  role: value === 'all' ? undefined : (value as UserRole),
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
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
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created</TableHead>
                {isAdmin && <TableHead className="w-12"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(isAdmin ? 6 : 5)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
                        <UsersIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((user, idx) => (
                  <TableRow 
                    key={user.id}
                    className="animate-fade-in-left opacity-0 group"
                    style={{ animationDelay: `${0.3 + idx * 0.03}s`, animationFillMode: 'forwards' }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg",
                          "bg-gradient-to-br transition-transform duration-200 group-hover:scale-105",
                          roleGradients[user.role]
                        )}>
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground font-mono">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleColors[user.role]}>
                        {capitalize(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'success' : 'destructive'}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full mr-1.5",
                          user.is_active ? "bg-success animate-pulse" : "bg-destructive"
                        )} />
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {user.last_login ? formatDate(user.last_login) : 'Never'}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {formatDate(user.created_at)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleEdit(user)} className="gap-2">
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                toggleActiveMutation.mutate({
                                  id: user.id,
                                  is_active: !user.is_active,
                                })
                              }
                              className="gap-2"
                            >
                              {user.is_active ? (
                                <>
                                  <UserX className="h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            {user.id !== currentUser?.id && (
                              <DropdownMenuItem
                                className="text-destructive gap-2"
                                onClick={() => handleDeleteClick(user)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
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

      {/* User Modal */}
      <UserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={editingUser}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description={`Are you sure you want to delete "${userToDelete?.full_name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
