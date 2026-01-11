import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, FileText, Shield, Clock, Globe } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import type { AuditLog, PaginatedResponse, AuditFilters, AuditAction } from '@/lib/types'
import { formatDateTime, cn } from '@/lib/utils'

const actionColors: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  login: 'success',
  logout: 'secondary',
  login_failed: 'destructive',
  password_change: 'warning',
  user_create: 'success',
  user_update: 'default',
  user_delete: 'destructive',
  user_role_change: 'warning',
  project_create: 'success',
  project_update: 'default',
  project_delete: 'destructive',
  project_status_change: 'warning',
}

const actionIcons: Record<string, string> = {
  login: '🔓',
  logout: '🚪',
  login_failed: '⚠️',
  password_change: '🔑',
  user_create: '👤',
  user_update: '✏️',
  user_delete: '🗑️',
  user_role_change: '👑',
  project_create: '📁',
  project_update: '📝',
  project_delete: '🗑️',
  project_status_change: '🔄',
}

export function AuditLogsPage() {
  const [filters, setFilters] = useState<AuditFilters>({
    page: 1,
    page_size: 20,
    search: '',
    action: undefined,
    resource_type: undefined,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => api.get<PaginatedResponse<AuditLog>>('/audit-logs', filters),
  })

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="animate-fade-in-down">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
            <p className="text-muted-foreground">
              View all system activity and security events
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search by request ID..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
            <Select
              value={filters.action || 'all'}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  action: value === 'all' ? undefined : (value as AuditAction),
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="login_failed">Login Failed</SelectItem>
                <SelectItem value="user_create">User Create</SelectItem>
                <SelectItem value="user_update">User Update</SelectItem>
                <SelectItem value="user_delete">User Delete</SelectItem>
                <SelectItem value="user_role_change">Role Change</SelectItem>
                <SelectItem value="project_create">Project Create</SelectItem>
                <SelectItem value="project_update">Project Update</SelectItem>
                <SelectItem value="project_delete">Project Delete</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.resource_type || 'all'}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  resource_type: value === 'all' ? undefined : value,
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="auth">Auth</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="project">Project</SelectItem>
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
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timestamp
                  </div>
                </TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    IP Address
                  </div>
                </TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(10)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-muted mb-4">
                        <FileText className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <p className="text-lg font-medium mb-1">No audit logs found</p>
                      <p className="text-muted-foreground text-sm">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((log, idx) => (
                  <TableRow 
                    key={log.id}
                    className="animate-fade-in-left opacity-0 group"
                    style={{ animationDelay: `${0.3 + idx * 0.02}s`, animationFillMode: 'forwards' }}
                  >
                    <TableCell className="whitespace-nowrap font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" />
                        {formatDateTime(log.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{actionIcons[log.action] || '📋'}</span>
                        <Badge variant={actionColors[log.action] || 'default'}>
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.user_email ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-2xs font-bold text-white">
                            {log.user_email.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-mono">{log.user_email}</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="font-mono">System</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-medium">
                          {log.resource_type}
                        </Badge>
                        {log.resource_id && (
                          <span className="text-muted-foreground font-mono text-sm">
                            #{log.resource_id}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {log.ip_address || '-'}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {log.details ? (
                        <code className={cn(
                          "text-2xs bg-secondary/50 px-2 py-1 rounded-lg truncate block",
                          "border border-border/30 font-mono"
                        )}>
                          {JSON.stringify(log.details).slice(0, 40)}
                          {JSON.stringify(log.details).length > 40 && '...'}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
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
    </div>
  )
}
