/**
 * Stats Banner Component - Dynamic Statistics Display
 * Shows real-time statistics from the product catalog
 */

import React, { useEffect, useState } from 'react';

interface CatalogStats {
  totalProducts: number;
  catalogs: number;
  categories: number;
  productsWithImages: number;
  totalImages: number;
  imageCoverage: number;
  avgImagesPerProduct: number;
}

export const StatsBanner: React.FC = () => {
  const [stats, setStats] = useState<CatalogStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load statistics from JSON file
    fetch('/catalog_statistics.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Not JSON response');
        }
        return response.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading statistics:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-500">Loading statistics...</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-bold text-primary group-hover:text-[#0088C0] transition-colors">
              {stats.catalogs}
            </div>
            <div className="text-gray-600 font-medium">Catalogs</div>
          </div>
          
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-bold text-primary group-hover:text-[#0088C0] transition-colors">
              {stats.totalProducts.toLocaleString()}
            </div>
            <div className="text-gray-600 font-medium">Total Products</div>
          </div>
          
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-bold text-primary group-hover:text-[#0088C0] transition-colors">
              {stats.totalImages.toLocaleString()}
            </div>
            <div className="text-gray-600 font-medium">Product Images</div>
          </div>
          
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-bold text-primary group-hover:text-[#0088C0] transition-colors">
              {stats.imageCoverage}%
            </div>
            <div className="text-gray-600 font-medium">Image Coverage</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Alternative version with more stats
export const StatsBannerExtended: React.FC = () => {
  const [stats, setStats] = useState<CatalogStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/catalog_statistics.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Not JSON response');
        }
        return response.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading statistics:', error);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-primary to-[#0088C0] text-white border-b shadow-lg">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <StatCard 
            icon="📚"
            value={stats.catalogs.toString()}
            label="Catalogs"
          />
          <StatCard 
            icon="📦"
            value={stats.totalProducts.toLocaleString()}
            label="Products"
          />
          <StatCard 
            icon="🏷️"
            value={stats.categories.toString()}
            label="Categories"
          />
          <StatCard 
            icon="🖼️"
            value={stats.totalImages.toLocaleString()}
            label="Images"
          />
          <StatCard 
            icon="📊"
            value={`${stats.imageCoverage}%`}
            label="Coverage"
          />
          <StatCard 
            icon="📸"
            value={`${stats.avgImagesPerProduct}x`}
            label="Avg/Product"
          />
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => (
  <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105">
    <div className="text-2xl mb-1">{icon}</div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm opacity-90 font-medium">{label}</div>
  </div>
);

export default StatsBanner;
