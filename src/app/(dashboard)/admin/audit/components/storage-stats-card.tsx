'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { useStorageStats, useRetentionCompliance } from '@/lib/api/audit-api';
import {
  Database,
  HardDrive,
  Layers,
  CheckCircle,
  XCircle,
  Archive,
  Clock,
} from 'lucide-react';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function StorageStatsCard() {
  const { data: storageData, isLoading: storageLoading, error: storageError } = useStorageStats();
  const { data: retentionData, isLoading: retentionLoading, error: retentionError } = useRetentionCompliance();

  const isLoading = storageLoading || retentionLoading;
  const hasError = storageError || retentionError;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Storage & Compliance</CardTitle>
          <CardDescription>TimescaleDB storage and HIPAA retention status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-32 animate-pulse bg-muted rounded" />
                <div className="h-4 w-20 animate-pulse bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Storage & Compliance</CardTitle>
          <CardDescription>TimescaleDB storage and HIPAA retention status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Failed to load storage stats</div>
        </CardContent>
      </Card>
    );
  }

  const stats = storageData ? [
    {
      label: 'Total Size',
      value: formatBytes(storageData.storage.totalSizeBytes),
      icon: HardDrive,
    },
    {
      label: 'Chunks',
      value: storageData.hypertable.numChunks.toString(),
      icon: Layers,
    },
    {
      label: 'Compression Ratio',
      value: storageData.compression.compressionRatio > 0
        ? `${storageData.compression.compressionRatio.toFixed(1)}:1`
        : 'N/A',
      icon: Archive,
    },
    {
      label: 'Total Records',
      value: storageData.hypertable.totalRows.toLocaleString(),
      icon: Database,
    },
  ] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage & Compliance</CardTitle>
        <CardDescription>TimescaleDB storage and HIPAA retention status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Compliance Status */}
          {retentionData && (
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-2">
                {retentionData.isCompliant ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">HIPAA Retention</span>
              </div>
              <span className={`text-sm font-medium ${retentionData.isCompliant ? 'text-green-600' : 'text-red-600'}`}>
                {retentionData.isCompliant ? 'Compliant' : 'Non-Compliant'}
              </span>
            </div>
          )}

          {/* Retention Details */}
          {retentionData && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Retention Period</span>
              </div>
              <span className="font-medium">
                {Math.floor(retentionData.retentionDays / 365)} years ({retentionData.retentionDays} days)
              </span>
            </div>
          )}

          {/* Storage Stats */}
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  <span>{stat.label}</span>
                </div>
                <span className="font-medium">{stat.value}</span>
              </div>
            );
          })}

          {/* Hypertable Status */}
          {storageData && (
            <div className="flex items-center justify-between text-sm pt-4 border-t">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Database className="h-4 w-4" />
                <span>TimescaleDB</span>
              </div>
              <span className={`text-sm font-medium ${storageData.hypertable.isHypertable ? 'text-green-600' : 'text-amber-600'}`}>
                {storageData.hypertable.isHypertable ? 'Hypertable Active' : 'Standard Table'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
