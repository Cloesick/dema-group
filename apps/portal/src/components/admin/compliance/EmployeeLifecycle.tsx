'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function EmployeeLifecycle() {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [showNewEmployee, setShowNewEmployee] = useState(false)

  // This would be fetched from the employee lifecycle API
  const stats = {
    total: 125,
    onboarding: 3,
    active: 120,
    offboarding: 2
  }

  const employees = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@dema-group.com',
      department: 'Engineering',
      status: 'onboarding',
      progress: {
        access: 'pending',
        training: 'in-progress',
        equipment: 'completed',
        compliance: 'pending'
      }
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@dema-group.com',
      department: 'Sales',
      status: 'offboarding',
      progress: {
        access: 'in-progress',
        equipment: 'pending',
        data: 'pending',
        exit: 'completed'
      }
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Employee Status</CardTitle>
          <CardDescription>Current employee lifecycle status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Total Employees</span>
              <span className="font-bold">{stats.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Onboarding</span>
              <Badge variant="warning">{stats.onboarding}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Active</span>
              <Badge variant="success">{stats.active}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Offboarding</span>
              <Badge variant="destructive">{stats.offboarding}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Employee Management</CardTitle>
            <CardDescription>Manage employee lifecycle</CardDescription>
          </div>
          <Button onClick={() => setShowNewEmployee(true)}>New Employee</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map(employee => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">{employee.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        employee.status === 'onboarding'
                          ? 'warning'
                          : employee.status === 'offboarding'
                          ? 'destructive'
                          : 'success'
                      }
                    >
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {Object.entries(employee.progress).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <Badge
                            variant={
                              value === 'completed'
                                ? 'success'
                                : value === 'in-progress'
                                ? 'warning'
                                : 'secondary'
                            }
                            className="w-20"
                          >
                            {value}
                          </Badge>
                          <span className="text-sm capitalize">{key}</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEmployee(employee)}
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

      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>
              Manage employee lifecycle and compliance status
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="mt-4 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <div className="font-medium">{selectedEmployee.name}</div>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <div className="font-medium">{selectedEmployee.email}</div>
                    </div>
                    <div>
                      <Label>Department</Label>
                      <div className="font-medium">{selectedEmployee.department}</div>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge
                        variant={
                          selectedEmployee.status === 'onboarding'
                            ? 'warning'
                            : selectedEmployee.status === 'offboarding'
                            ? 'destructive'
                            : 'success'
                        }
                      >
                        {selectedEmployee.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Access & Equipment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>GSuite Account</Label>
                      <Badge variant="success">Active</Badge>
                    </div>
                    <div>
                      <Label>Slack</Label>
                      <Badge variant="success">Active</Badge>
                    </div>
                    <div>
                      <Label>GitHub</Label>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    <div>
                      <Label>Equipment</Label>
                      <div className="text-sm">
                        <div>Laptop (LT-2023-001)</div>
                        <div>Monitor (MON-2023-001)</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Requirement</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Security Training</TableCell>
                        <TableCell>
                          <Badge variant="warning">In Progress</Badge>
                        </TableCell>
                        <TableCell>2024-01-15</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Policy Acknowledgment</TableCell>
                        <TableCell>
                          <Badge variant="success">Completed</Badge>
                        </TableCell>
                        <TableCell>2023-12-28</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Background Check</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Pending</Badge>
                        </TableCell>
                        <TableCell>2024-01-05</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showNewEmployee} onOpenChange={setShowNewEmployee}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Employee</DialogTitle>
            <DialogDescription>
              Start the onboarding process for a new employee
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="Enter first name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Enter last name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter email" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="specialist">Specialist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowNewEmployee(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowNewEmployee(false)}>
              Start Onboarding
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
