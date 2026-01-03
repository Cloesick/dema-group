'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlayIcon, PauseIcon, RefreshCwIcon, AlertTriangleIcon, CheckCircleIcon } from 'lucide-react';

interface TestResult {
  id: string;
  suite: string;
  spec: string;
  status: 'passed' | 'failed' | 'pending';
  duration: number;
  timestamp: string;
  performance: {
    loadTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

interface TestSuite {
  name: string;
  passRate: number;
  avgDuration: number;
  flakiness: number;
  lastRun: string;
}

export default function TestingDashboard() {
  const { user, isLoading } = useAuth();
  const [activeTests, setActiveTests] = useState<TestResult[]>([]);
  const [recentResults, setRecentResults] = useState<TestResult[]>([]);
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!user?.isAdmin) {
      window.location.href = '/login';
      return;
    }

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchData = async () => {
    try {
      const [activeRes, recentRes, suitesRes, perfRes] = await Promise.all([
        fetch('/api/testing/active'),
        fetch('/api/testing/recent'),
        fetch('/api/testing/suites'),
        fetch('/api/testing/performance')
      ]);

      setActiveTests(await activeRes.json());
      setRecentResults(await recentRes.json());
      setSuites(await suitesRes.json());
      setPerformanceData(await perfRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!user?.isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You need administrator privileges to access this page.
        </AlertDescription>
      </Alert>
    );
  }

  const startTests = async () => {
    setIsRunning(true);
    await fetch('/api/testing/start', { method: 'POST' });
  };

  const stopTests = async () => {
    setIsRunning(false);
    await fetch('/api/testing/stop', { method: 'POST' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Testing Dashboard</h1>
        <div className="space-x-4">
          <Button
            onClick={isRunning ? stopTests : startTests}
            variant={isRunning ? "destructive" : "default"}
          >
            {isRunning ? (
              <>
                <PauseIcon className="mr-2 h-4 w-4" />
                Stop Tests
              </>
            ) : (
              <>
                <PlayIcon className="mr-2 h-4 w-4" />
                Run Tests
              </>
            )}
          </Button>
          <Button onClick={fetchData} variant="outline">
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Active Tests</h3>
          <div className="text-3xl font-bold">{activeTests.length}</div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Pass Rate (24h)</h3>
          <div className="text-3xl font-bold text-green-600">
            {((recentResults.filter(r => r.status === 'passed').length / recentResults.length) * 100).toFixed(1)}%
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Avg Duration</h3>
          <div className="text-3xl font-bold">
            {(recentResults.reduce((sum, r) => sum + r.duration, 0) / recentResults.length / 1000).toFixed(1)}s
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="ci">CI/CD</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Recent Test Results</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Suite</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentResults.map(result => (
                  <TableRow key={result.id}>
                    <TableCell>{result.suite}</TableCell>
                    <TableCell>{result.spec}</TableCell>
                    <TableCell>
                      <Badge variant={result.status === 'passed' ? 'success' : 'destructive'}>
                        {result.status === 'passed' ? (
                          <CheckCircleIcon className="mr-1 h-3 w-3" />
                        ) : (
                          <AlertTriangleIcon className="mr-1 h-3 w-3" />
                        )}
                        {result.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{(result.duration / 1000).toFixed(2)}s</TableCell>
                    <TableCell>{new Date(result.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="suites">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Test Suites</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Suite</TableHead>
                  <TableHead>Pass Rate</TableHead>
                  <TableHead>Avg Duration</TableHead>
                  <TableHead>Flakiness</TableHead>
                  <TableHead>Last Run</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suites.map(suite => (
                  <TableRow key={suite.name}>
                    <TableCell>{suite.name}</TableCell>
                    <TableCell>
                      <Badge variant={suite.passRate >= 0.9 ? 'success' : 'warning'}>
                        {(suite.passRate * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{(suite.avgDuration / 1000).toFixed(2)}s</TableCell>
                    <TableCell>
                      <Badge variant={suite.flakiness <= 0.1 ? 'success' : 'destructive'}>
                        {(suite.flakiness * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(suite.lastRun).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Performance Trends</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="duration" stroke="#8884d8" name="Avg Duration (s)" />
                <Line type="monotone" dataKey="passRate" stroke="#82ca9d" name="Pass Rate (%)" />
                <Line type="monotone" dataKey="parallelism" stroke="#ffc658" name="Parallelism" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="ci">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">CI/CD Integration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">GitHub Actions</h4>
                  <p className="text-sm text-gray-600">Last run: 2 hours ago</p>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">Jenkins</h4>
                  <p className="text-sm text-gray-600">Last run: 1 hour ago</p>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">Azure DevOps</h4>
                  <p className="text-sm text-gray-600">Last run: 30 minutes ago</p>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
