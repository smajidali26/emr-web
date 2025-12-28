'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useComplianceMetrics } from '@/lib/api/audit-api';
import {
  FileText,
  Shield,
  ShieldAlert,
  UserCheck,
  Users,
  Globe,
  Key,
  Download,
} from 'lucide-react';

interface ComplianceStatsProps {
  fromDate?: string;
  toDate?: string;
}

export function ComplianceStats({ fromDate, toDate }: ComplianceStatsProps) {
  const { data: metrics, isLoading, error } = useComplianceMetrics(fromDate, toDate);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 animate-pulse bg-muted rounded" />
              <div className="h-8 w-8 animate-pulse bg-muted rounded-lg" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        Failed to load compliance metrics
      </div>
    );
  }

  const successRate = metrics.totalAuditEvents > 0
    ? ((metrics.totalAuditEvents - metrics.accessDeniedCount) / metrics.totalAuditEvents * 100).toFixed(1)
    : '100';

  const stats = [
    {
      id: 'total-events',
      title: 'Total Events',
      value: metrics.totalAuditEvents.toLocaleString(),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'success-rate',
      title: 'Success Rate',
      value: `${successRate}%`,
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'access-denied',
      title: 'Access Denied',
      value: metrics.accessDeniedCount.toLocaleString(),
      icon: ShieldAlert,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      id: 'active-users',
      title: 'Active Users',
      value: metrics.activeUsers.toLocaleString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const detailedStats = [
    {
      id: 'phi-access',
      title: 'PHI Access',
      value: metrics.phiAccessCount.toLocaleString(),
      icon: UserCheck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      id: 'auth-events',
      title: 'Auth Events',
      value: metrics.authEventCount.toLocaleString(),
      icon: Key,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      id: 'unique-ips',
      title: 'Unique IPs',
      value: metrics.uniqueIpAddresses.toLocaleString(),
      icon: Globe,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      id: 'exports',
      title: 'Export/Print',
      value: metrics.exportPrintCount.toLocaleString(),
      icon: Download,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`rounded-lg ${stat.bgColor} p-2`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {detailedStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`rounded-lg ${stat.bgColor} p-2`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
