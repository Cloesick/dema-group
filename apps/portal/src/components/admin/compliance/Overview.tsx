'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DonutChart } from '@/components/ui/charts/DonutChart'
import { LineChart } from '@/components/ui/charts/LineChart'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ExclamationTriangleIcon, CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons'

export function Overview() {
  // This would be fetched from the compliance API
  const stats = {
    vendorStats: {
      total: 45,
      critical: 5,
      high: 12,
      medium: 18,
      low: 10
    },
    securityStats: {
      scansRun: 234,
      issuesFound: 12,
      criticalIssues: 2,
      resolvedIssues: 8
    },
    complianceStatus: {
      soc2: 'compliant',
      iso27001: 'in-progress',
      gdpr: 'compliant',
      hipaa: 'not-applicable'
    },
    recentAlerts: [
      {
        id: 1,
        type: 'critical',
        message: 'Critical vendor certificate expiring in 15 days',
        timestamp: '2023-12-28T09:00:00Z'
      },
      {
        id: 2,
        type: 'warning',
        message: 'Security scan detected 3 new vulnerabilities',
        timestamp: '2023-12-28T08:30:00Z'
      }
    ]
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Vendor Risk</CardTitle>
          <CardDescription>Risk distribution by level</CardDescription>
        </CardHeader>
        <CardContent>
          <DonutChart
            data={[
              { name: 'Critical', value: stats.vendorStats.critical },
              { name: 'High', value: stats.vendorStats.high },
              { name: 'Medium', value: stats.vendorStats.medium },
              { name: 'Low', value: stats.vendorStats.low }
            ]}
            colors={['#ef4444', '#f97316', '#eab308', '#22c55e']}
          />
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span>Total Vendors</span>
              <span className="font-bold">{stats.vendorStats.total}</span>
            </div>
            <div className="flex items-center justify-between text-red-500">
              <span>Critical Risk</span>
              <span className="font-bold">{stats.vendorStats.critical}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Status</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Scans Run</span>
              <span className="font-bold">{stats.securityStats.scansRun}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Issues Found</span>
              <Badge variant={stats.securityStats.criticalIssues > 0 ? 'destructive' : 'default'}>
                {stats.securityStats.issuesFound}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Critical Issues</span>
              <Badge variant="destructive">{stats.securityStats.criticalIssues}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Resolved</span>
              <Badge variant="success">{stats.securityStats.resolvedIssues}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Status</CardTitle>
          <CardDescription>Framework compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>SOC 2</span>
              <Badge variant={stats.complianceStatus.soc2 === 'compliant' ? 'success' : 'default'}>
                {stats.complianceStatus.soc2}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>ISO 27001</span>
              <Badge variant={stats.complianceStatus.iso27001 === 'compliant' ? 'success' : 'default'}>
                {stats.complianceStatus.iso27001}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>GDPR</span>
              <Badge variant={stats.complianceStatus.gdpr === 'compliant' ? 'success' : 'default'}>
                {stats.complianceStatus.gdpr}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>HIPAA</span>
              <Badge variant={stats.complianceStatus.hipaa === 'compliant' ? 'success' : 'default'}>
                {stats.complianceStatus.hipaa}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentAlerts.map(alert => (
              <Alert key={alert.id} variant={alert.type === 'critical' ? 'destructive' : 'warning'}>
                {alert.type === 'critical' ? (
                  <ExclamationTriangleIcon className="h-4 w-4" />
                ) : (
                  <CrossCircledIcon className="h-4 w-4" />
                )}
                <AlertTitle>{alert.type === 'critical' ? 'Critical Alert' : 'Warning'}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
