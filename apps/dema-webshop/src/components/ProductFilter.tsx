import { useState, useEffect } from 'react';

interface ProductFilterProps {
  products: any[];
  onFilterChange: (filters: any) => void;
}

export default function ProductFilter({ products, onFilterChange }: ProductFilterProps) {
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    minPower: '',
    maxPower: '',
    minPressure: '',
    maxPressure: '',
  });

  // Extract unique categories and sort alphabetically
  const categories = Array.from(new Set(products.map(p => p.product_category).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  
  // Extract power range
  const powerValues = products
    .map(p => p.power_kw)
    .filter((p): p is number => p !== undefined && p !== null);
  const minPower = Math.floor(Math.min(...powerValues, 0));
  const maxPower = Math.ceil(Math.max(...powerValues, 100));

  // Extract pressure range
  const pressureValues = products
    .map(p => p.pressure_max_bar)
    .filter((p): p is number => p !== undefined && p !== null);
  const minPressure = Math.floor(Math.min(...pressureValues, 0));
  const maxPressure = Math.ceil(Math.max(...pressureValues, 20));

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      minPower: '',
      maxPower: '',
      minPressure: '',
      maxPressure: '',
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="mb-4">
        <h3 className="font-bold text-lg mb-3">Filters</h3>
        <button 
          onClick={resetFilters}
          className="text-sm text-blue-600 hover:underline mb-4"
        >
          Clear all filters
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Category</h4>
        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Price Range (€)</h4>
        <div className="flex space-x-2">
          <input
            type="number"
            name="minPrice"
            placeholder="Min"
            value={filters.minPrice}
            onChange={handleChange}
            className="w-1/2 p-2 border rounded-md"
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={handleChange}
            className="w-1/2 p-2 border rounded-md"
          />
        </div>
      </div>

      {/* Power Range */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Power (kW)</h4>
        <div className="flex space-x-2">
          <input
            type="number"
            name="minPower"
            placeholder={`Min (${minPower} kW)`}
            min={minPower}
            max={maxPower}
            value={filters.minPower}
            onChange={handleChange}
            className="w-1/2 p-2 border rounded-md"
          />
          <input
            type="number"
            name="maxPower"
            placeholder={`Max (${maxPower} kW)`}
            min={minPower}
            max={maxPower}
            value={filters.maxPower}
            onChange={handleChange}
            className="w-1/2 p-2 border rounded-md"
          />
        </div>
      </div>

      {/* Pressure Range */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Max Pressure (bar)</h4>
        <div className="flex space-x-2">
          <input
            type="number"
            name="minPressure"
            placeholder={`Min (${minPressure} bar)`}
            min={minPressure}
            max={maxPressure}
            value={filters.minPressure}
            onChange={handleChange}
            className="w-1/2 p-2 border rounded-md"
          />
          <input
            type="number"
            name="maxPressure"
            placeholder={`Max (${maxPressure} bar)`}
            min={minPressure}
            max={maxPressure}
            value={filters.maxPressure}
            onChange={handleChange}
            className="w-1/2 p-2 border rounded-md"
          />
        </div>
      </div>
    </div>
  );
}
