'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Overview } from '@/components/admin/compliance/Overview'
import { VendorList } from '@/components/admin/compliance/VendorList'
import { SecurityScans } from '@/components/admin/compliance/SecurityScans'
import { AccessReviews } from '@/components/admin/compliance/AccessReviews'
import { ComplianceReports } from '@/components/admin/compliance/ComplianceReports'
import { PolicyManager } from '@/components/admin/compliance/PolicyManager'

export default function ComplianceDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Compliance Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="access">Access</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Overview />
        </TabsContent>
        <TabsContent value="vendors" className="space-y-4">
          <VendorList />
        </TabsContent>
        <TabsContent value="security" className="space-y-4">
          <SecurityScans />
        </TabsContent>
        <TabsContent value="access" className="space-y-4">
          <AccessReviews />
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <ComplianceReports />
        </TabsContent>
        <TabsContent value="policies" className="space-y-4">
          <PolicyManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
