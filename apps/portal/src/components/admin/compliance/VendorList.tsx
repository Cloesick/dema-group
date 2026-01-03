'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function VendorList() {
  const [selectedVendor, setSelectedVendor] = useState<any>(null)

  // This would be fetched from the vendor management API
  const vendors = [
    {
      id: 1,
      name: 'AWS',
      category: 'infrastructure',
      riskLevel: 'critical',
      status: 'active',
      lastAssessment: '2023-11-15',
      compliance: {
        soc2: true,
        iso27001: true,
        gdpr: true
      }
    },
    {
      id: 2,
      name: 'Salesforce',
      category: 'software',
      riskLevel: 'high',
      status: 'active',
      lastAssessment: '2023-10-20',
      compliance: {
        soc2: true,
        iso27001: true,
        gdpr: true
      }
    }
  ]

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'warning'
      case 'medium':
        return 'secondary'
      default:
        return 'default'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Vendor Management</CardTitle>
            <CardDescription>Manage and assess vendors</CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add Vendor</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
                <DialogDescription>
                  Enter vendor details and initial risk assessment.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Vendor Name</Label>
                  <Input id="name" placeholder="Enter vendor name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="risk">Initial Risk Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Save Vendor</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Assessment</TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map(vendor => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium">{vendor.name}</TableCell>
                <TableCell className="capitalize">{vendor.category}</TableCell>
                <TableCell>
                  <Badge variant={getRiskBadgeVariant(vendor.riskLevel)}>
                    {vendor.riskLevel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={vendor.status === 'active' ? 'success' : 'secondary'}>
                    {vendor.status}
                  </Badge>
                </TableCell>
                <TableCell>{vendor.lastAssessment}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {vendor.compliance.soc2 && <Badge variant="outline">SOC 2</Badge>}
                    {vendor.compliance.iso27001 && <Badge variant="outline">ISO 27001</Badge>}
                    {vendor.compliance.gdpr && <Badge variant="outline">GDPR</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">View Details</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Vendor Details - {vendor.name}</DialogTitle>
                        <DialogDescription>
                          View and manage vendor information, assessments, and compliance status.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Risk Assessment</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Current Risk Level</span>
                                <Badge variant={getRiskBadgeVariant(vendor.riskLevel)}>
                                  {vendor.riskLevel}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Last Assessment</span>
                                <span>{vendor.lastAssessment}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Next Review Due</span>
                                <span>2024-01-15</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle>Compliance Status</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>SOC 2</span>
                                <Badge variant="success">Verified</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>ISO 27001</span>
                                <Badge variant="success">Verified</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>GDPR</span>
                                <Badge variant="success">Compliant</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="mt-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Activity</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell>2023-12-15</TableCell>
                                  <TableCell>Security Assessment</TableCell>
                                  <TableCell>
                                    <Badge variant="success">Completed</Badge>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>2023-12-01</TableCell>
                                  <TableCell>SOC 2 Report Review</TableCell>
                                  <TableCell>
                                    <Badge variant="success">Approved</Badge>
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
