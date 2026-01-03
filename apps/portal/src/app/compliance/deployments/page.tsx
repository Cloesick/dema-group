'use client';

import { useState } from 'react';

interface Deployment {
  id: string;
  service: string;
  status: 'Successful' | 'Failed';
  deployedAt: string;
}

const mockDeployments: Deployment[] = [
  {
    id: '1',
    service: 'portal-app',
    status: 'Successful',
    deployedAt: new Date().toISOString(),
  },
  {
    id: '2',
    service: 'api-service',
    status: 'Failed',
    deployedAt: new Date().toISOString(),
  },
];

export default function DeploymentsPage() {
  const [deployments] = useState<Deployment[]>(mockDeployments);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Recent Deployments</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deployed At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deployments.map((deployment) => (
              <tr key={deployment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {deployment.service}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      deployment.status === 'Successful'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {deployment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(deployment.deployedAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {deployment.status === 'Failed' && (
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => {
                        // TODO: Implement rollback functionality
                      }}
                    >
                      Rollback
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
