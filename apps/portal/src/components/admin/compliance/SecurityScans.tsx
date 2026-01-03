'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DonutChart } from '@/components/ui/charts/DonutChart'
import { LineChart } from '@/components/ui/charts/LineChart'

export function SecurityScans() {
  const [selectedScan, setSelectedScan] = useState<any>(null)

  // This would be fetched from the security scanner API
  const stats = {
    dependencies: {
      total: 1245,
      critical: 2,
      high: 5,
      medium: 12,
      low: 25
    },
    secrets: {
      total: 150,
      violations: 1
    },
    containers: {
      total: 25,
      vulnerable: 3
    },
    infrastructure: {
      total: 45,
      compliant: 42
    }
  }

  const recentScans = [
    {
      id: 1,
      type: 'dependency',
      target: 'portal',
      timestamp: '2023-12-28T08:00:00Z',
      findings: 3,
      status: 'critical'
    },
    {
      id: 2,
      type: 'secret',
      target: 'api',
      timestamp: '2023-12-28T07:30:00Z',
      findings: 0,
      status: 'success'
    }
  ]

  const trendData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    value: Math.floor(Math.random() * 10)
  }))

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Dependencies</CardTitle>
          <CardDescription>Vulnerability distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <DonutChart
            data={[
              { name: 'Critical', value: stats.dependencies.critical },
              { name: 'High', value: stats.dependencies.high },
              { name: 'Medium', value: stats.dependencies.medium },
              { name: 'Low', value: stats.dependencies.low }
            ]}
            colors={['#ef4444', '#f97316', '#eab308', '#22c55e']}
          />
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span>Total Dependencies</span>
              <span className="font-bold">{stats.dependencies.total}</span>
            </div>
            <div className="flex items-center justify-between text-red-500">
              <span>Critical Vulnerabilities</span>
              <span className="font-bold">{stats.dependencies.critical}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Secret Scanning</CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Files Scanned</span>
              <span className="font-bold">{stats.secrets.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Violations Found</span>
              <Badge variant={stats.secrets.violations > 0 ? 'destructive' : 'success'}>
                {stats.secrets.violations}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Container Security</CardTitle>
          <CardDescription>Image scan results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Images Scanned</span>
              <span className="font-bold">{stats.containers.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Vulnerable Images</span>
              <Badge variant={stats.containers.vulnerable > 0 ? 'destructive' : 'success'}>
                {stats.containers.vulnerable}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Infrastructure</CardTitle>
          <CardDescription>Compliance status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Resources Checked</span>
              <span className="font-bold">{stats.infrastructure.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Compliant</span>
              <Badge variant="success">
                {Math.round((stats.infrastructure.compliant / stats.infrastructure.total) * 100)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Findings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentScans.map(scan => (
                <TableRow key={scan.id}>
                  <TableCell className="font-medium capitalize">{scan.type}</TableCell>
                  <TableCell>{scan.target}</TableCell>
                  <TableCell>{scan.findings}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        scan.status === 'critical'
                          ? 'destructive'
                          : scan.status === 'warning'
                          ? 'warning'
                          : 'success'
                      }
                    >
                      {scan.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedScan(scan)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Vulnerability Trend</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart data={trendData} height={300} />
        </CardContent>
      </Card>

      <Dialog open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Details</DialogTitle>
            <DialogDescription>
              Scan results for {selectedScan?.target}
            </DialogDescription>
          </DialogHeader>
          {selectedScan && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Type:</span>
                  <span className="ml-2 capitalize">{selectedScan.type}</span>
                </div>
                <div>
                  <span className="font-medium">Target:</span>
                  <span className="ml-2">{selectedScan.target}</span>
                </div>
                <div>
                  <span className="font-medium">Timestamp:</span>
                  <span className="ml-2">
                    {new Date(selectedScan.timestamp).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge
                    variant={
                      selectedScan.status === 'critical'
                        ? 'destructive'
                        : selectedScan.status === 'warning'
                        ? 'warning'
                        : 'success'
                    }
                    className="ml-2"
                  >
                    {selectedScan.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Findings</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedScan.type === 'dependency' && (
                      <>
                        <TableRow>
                          <TableCell>
                            <Badge variant="destructive">Critical</Badge>
                          </TableCell>
                          <TableCell>Vulnerable dependency: lodash@4.17.15</TableCell>
                          <TableCell>Open</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Badge variant="warning">High</Badge>
                          </TableCell>
                          <TableCell>Vulnerable dependency: axios@0.21.1</TableCell>
                          <TableCell>In Progress</TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
