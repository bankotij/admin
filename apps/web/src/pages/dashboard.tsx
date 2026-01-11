import { useQuery } from '@tanstack/react-query'
import { Users, FolderKanban, Activity, TrendingUp, ArrowUpRight, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import type { StatsResponse, PaginatedResponse, AuditLog } from '@/lib/types'
import { formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const actionColors: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  login: 'success',
  logout: 'secondary',
  login_failed: 'destructive',
  password_change: 'warning',
  user_create: 'success',
  user_update: 'default',
  user_delete: 'destructive',
  project_create: 'success',
  project_update: 'default',
  project_delete: 'destructive',
}

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get<StatsResponse>('/dashboard/stats'),
  })

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => api.get<PaginatedResponse<AuditLog>>('/audit-logs', { page_size: 5 }),
  })

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users ?? 0,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      bgGlow: 'bg-blue-500/20',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Projects',
      value: stats?.total_projects ?? 0,
      icon: FolderKanban,
      gradient: 'from-violet-500 to-purple-600',
      bgGlow: 'bg-violet-500/20',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Active Projects',
      value: stats?.active_projects ?? 0,
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-green-600',
      bgGlow: 'bg-emerald-500/20',
      change: '+23%',
      changeType: 'positive' as const,
    },
    {
      title: 'Activity (24h)',
      value: stats?.recent_activity_count ?? 0,
      icon: Activity,
      gradient: 'from-amber-500 to-orange-600',
      bgGlow: 'bg-amber-500/20',
      change: '+5%',
      changeType: 'positive' as const,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="animate-fade-in-down">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your admin panel activity
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => (
          <div
            key={stat.title}
            className="animate-fade-in-up opacity-0"
            style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: 'forwards' }}
          >
            <Card className={cn(
              "relative overflow-hidden group cursor-pointer",
              "hover:scale-[1.02] transition-all duration-300"
            )}>
              {/* Background glow effect */}
              <div className={cn(
                "absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                stat.bgGlow
              )} />
              
              {/* Corner accent */}
              <div className={cn(
                "absolute top-0 right-0 w-20 h-20 bg-gradient-to-br opacity-5",
                stat.gradient
              )} style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />

              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    {statsLoading ? (
                      <Skeleton className="h-9 w-20" />
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold tracking-tight">
                          {stat.value.toLocaleString()}
                        </span>
                        <span className={cn(
                          "flex items-center text-xs font-semibold",
                          stat.changeType === 'positive' ? 'text-success' : 'text-destructive'
                        )}>
                          <ArrowUpRight className="w-3 h-3" />
                          {stat.change}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br shadow-lg",
                    "transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                    stat.gradient
                  )}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-4 h-1 rounded-full bg-muted overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out",
                      stat.gradient
                    )}
                    style={{ 
                      width: statsLoading ? '0%' : `${Math.min((stat.value / 100) * 100, 100)}%`,
                      transitionDelay: `${idx * 0.2}s`
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div 
        className="animate-fade-in-up opacity-0"
        style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
      >
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-glow">
                  <Activity className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <p className="text-sm text-muted-foreground">Latest system events</p>
                </div>
              </div>
              <Badge variant="secondary" className="font-mono">
                Live
                <span className="ml-1.5 w-2 h-2 rounded-full bg-success animate-pulse" />
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : recentActivity?.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mx-auto mb-4">
                  <Activity className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity?.items.map((log, idx) => (
                  <div
                    key={log.id}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-xl transition-all duration-200",
                      "hover:bg-muted/50 group cursor-pointer",
                      "animate-fade-in-left opacity-0"
                    )}
                    style={{ animationDelay: `${0.5 + idx * 0.05}s`, animationFillMode: 'forwards' }}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-xl",
                      "bg-secondary/50 group-hover:bg-secondary transition-colors"
                    )}>
                      <Activity className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium capitalize">
                        {log.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {log.user_email || 'System'} • {log.resource_type}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant={actionColors[log.action] || 'secondary'}>
                        {log.resource_type}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {formatDateTime(log.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
