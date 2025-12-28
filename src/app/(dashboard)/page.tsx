/**
 * Dashboard Home Page
 * Role-based dashboard with personalized content
 */

'use client';

import { useAuth } from '@/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import {
  Users,
  Calendar,
  FileText,
  Activity,
  Stethoscope,
  ClipboardList,
  UserPlus,
  Pill,
  TestTube,
  TrendingUp,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { UserRole } from '@/types';
import { useMemo } from 'react';
import Link from 'next/link';

// Role-based dashboard configurations
const getRoleDashboardConfig = (roles: UserRole[]) => {
  const hasRole = (role: UserRole) => roles.includes(role);

  // Stats configuration based on role
  const stats = [];

  if (hasRole(UserRole.DOCTOR) || hasRole(UserRole.ADMIN)) {
    stats.push(
      {
        id: 'patients',
        title: 'Total Patients',
        value: '1,234',
        change: '+12%',
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      },
      {
        id: 'appointments',
        title: 'Appointments Today',
        value: '45',
        change: '+8%',
        icon: Calendar,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      }
    );
  }

  if (hasRole(UserRole.NURSE) || hasRole(UserRole.ADMIN)) {
    stats.push(
      {
        id: 'vitals',
        title: 'Vitals Recorded',
        value: '89',
        change: '+15%',
        icon: Activity,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
      }
    );
  }

  if (hasRole(UserRole.PHARMACIST)) {
    stats.push(
      {
        id: 'prescriptions',
        title: 'Prescriptions',
        value: '127',
        change: '+10%',
        icon: Pill,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
      }
    );
  }

  if (hasRole(UserRole.LAB_TECHNICIAN)) {
    stats.push(
      {
        id: 'tests',
        title: 'Tests Pending',
        value: '34',
        change: '-5%',
        icon: TestTube,
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
      }
    );
  }

  stats.push(
    {
      id: 'active',
      title: 'Active Sessions',
      value: '12',
      change: '+5%',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    }
  );

  // Quick actions based on role
  const quickActions = [];

  if (hasRole(UserRole.DOCTOR)) {
    quickActions.push(
      { title: 'New Consultation', icon: Stethoscope, href: '/consultations/new', color: 'bg-blue-500' },
      { title: 'View Patients', icon: Users, href: '/patients', color: 'bg-green-500' }
    );
  }

  if (hasRole(UserRole.NURSE)) {
    quickActions.push(
      { title: 'Record Vitals', icon: Activity, href: '/vitals/new', color: 'bg-purple-500' },
      { title: 'Patient Queue', icon: ClipboardList, href: '/queue', color: 'bg-indigo-500' }
    );
  }

  if (hasRole(UserRole.RECEPTIONIST)) {
    quickActions.push(
      { title: 'Register Patient', icon: UserPlus, href: '/patients/register', color: 'bg-blue-500' },
      { title: 'Schedule Appointment', icon: Calendar, href: '/appointments/new', color: 'bg-green-500' }
    );
  }

  if (hasRole(UserRole.PHARMACIST)) {
    quickActions.push(
      { title: 'Dispense Medication', icon: Pill, href: '/pharmacy/dispense', color: 'bg-orange-500' },
      { title: 'Inventory', icon: ClipboardList, href: '/pharmacy/inventory', color: 'bg-yellow-500' }
    );
  }

  if (hasRole(UserRole.LAB_TECHNICIAN)) {
    quickActions.push(
      { title: 'Process Test', icon: TestTube, href: '/lab/process', color: 'bg-pink-500' },
      { title: 'View Results', icon: FileText, href: '/lab/results', color: 'bg-purple-500' }
    );
  }

  if (hasRole(UserRole.ADMIN)) {
    quickActions.push(
      { title: 'User Management', icon: Users, href: '/admin/users', color: 'bg-red-500' },
      { title: 'System Settings', icon: Activity, href: '/admin/settings', color: 'bg-gray-500' }
    );
  }

  return { stats, quickActions };
};

export default function DashboardPage() {
  const { user } = useAuth();

  const { stats, quickActions } = useMemo(() => {
    if (!user?.roles) {
      return { stats: [], quickActions: [] };
    }
    return getRoleDashboardConfig(user.roles);
  }, [user?.roles]);

  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {firstName}!
          </h1>
          <p className="text-muted-foreground">
            {user?.roles && user.roles.length > 0 && (
              <>
                {user.roles.map((role) => role.replace('_', ' ')).join(', ')} Dashboard
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} href={action.href}>
                  <Card className="cursor-pointer transition-all hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className={`rounded-lg ${action.color} p-3`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="font-semibold">{action.title}</div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {stats.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Overview</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              const isNegative = stat.change.startsWith('-');
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
                    <p className="text-xs text-muted-foreground">
                      <span className={isNegative ? 'text-red-600' : 'text-green-600'}>
                        {stat.change}
                      </span>{' '}
                      from last month
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>Your upcoming appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                No upcoming appointments to display.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Important updates and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">System Maintenance</p>
                  <p className="text-xs text-muted-foreground">
                    Scheduled maintenance on Sunday at 2:00 AM
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
