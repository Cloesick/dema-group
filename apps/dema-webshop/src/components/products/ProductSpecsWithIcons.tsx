/**
 * ProductSpecsWithIcons - Beautiful display of product specifications with icons
 * Supports both icon display and traditional table view
 */
import React, { useState } from 'react';

interface Spec {
  name: string;
  value: string;
  value_plain?: string;
  icon_display?: boolean;
}

interface Product {
  sku: string;
  name: string;
  brand?: string;
  specs: Spec[];
  attributes_with_icons?: Record<string, string>;
  attributes_english?: Record<string, string>;
  price?: {
    amount: number;
    currency: string;
    display?: string;
    excl_vat?: number;
    incl_vat?: number;
  };
}

interface ProductSpecsWithIconsProps {
  product: Product;
  defaultView?: 'icons' | 'table';
}

export const ProductSpecsWithIcons: React.FC<ProductSpecsWithIconsProps> = ({
  product,
  defaultView = 'icons'
}) => {
  const [viewMode, setViewMode] = useState<'icons' | 'table'>(defaultView);

  // Get specs from product
  const specs = product.specs || [];
  const hasIcons = specs.some(spec => spec.icon_display);

  return (
    <div className="product-specs-container">
      {/* Header with view toggle */}
      <div className="specs-header">
        <h3 className="specs-title">Specifications</h3>
        
        {hasIcons && (
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'icons' ? 'active' : ''}`}
              onClick={() => setViewMode('icons')}
              aria-label="Icon view"
            >
              ✨ Icons
            </button>
            <button
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              aria-label="Table view"
            >
              📋 Table
            </button>
          </div>
        )}
      </div>

      {/* Icon View - Beautiful card layout */}
      {viewMode === 'icons' && (
        <div className="specs-icon-grid">
          {specs.map((spec, index) => (
            <div key={index} className="spec-card">
              <div className="spec-card-header">
                <span className="spec-name">{spec.name}</span>
              </div>
              <div className="spec-card-value">
                {spec.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View - Traditional layout */}
      {viewMode === 'table' && (
        <div className="specs-table-container">
          <table className="specs-table">
            <tbody>
              {specs.map((spec, index) => (
                <tr key={index} className="spec-row">
                  <td className="spec-name-col">{spec.name}</td>
                  <td className="spec-value-col">
                    {spec.value_plain || spec.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Price Display */}
      {product.price && (
        <div className="product-price-section">
          <div className="price-card">
            <div className="price-label">Price</div>
            <div className="price-amount">
              {product.price.display || `€${product.price.amount.toFixed(2)}`}
            </div>
            {product.price.excl_vat && (
              <div className="price-detail">
                excl. VAT: €{product.price.excl_vat.toFixed(2)}
              </div>
            )}
            {product.price.incl_vat && (
              <div className="price-detail">
                incl. VAT: €{product.price.incl_vat.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .product-specs-container {
          width: 100%;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .specs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .specs-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .view-toggle {
          display: flex;
          gap: 0.5rem;
          background: #f5f5f5;
          padding: 0.25rem;
          border-radius: 8px;
        }

        .toggle-btn {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          color: #666;
        }

        .toggle-btn.active {
          background: white;
          color: #2563eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .toggle-btn:hover:not(.active) {
          color: #2563eb;
        }

        /* Icon Grid View */
        .specs-icon-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .spec-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 1rem;
          transition: all 0.3s ease;
          cursor: default;
        }

        .spec-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: #2563eb;
        }

        .spec-card-header {
          margin-bottom: 0.75rem;
        }

        .spec-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .spec-card-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.4;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Table View */
        .specs-table-container {
          overflow-x: auto;
          margin-bottom: 1.5rem;
        }

        .specs-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .spec-row {
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s;
        }

        .spec-row:last-child {
          border-bottom: none;
        }

        .spec-row:hover {
          background-color: #f9fafb;
        }

        .spec-name-col {
          padding: 1rem;
          font-weight: 600;
          color: #4b5563;
          width: 40%;
          vertical-align: middle;
        }

        .spec-value-col {
          padding: 1rem;
          color: #1a1a1a;
          font-weight: 500;
          vertical-align: middle;
        }

        /* Price Section */
        .product-price-section {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 2px solid #f0f0f0;
        }

        .price-card {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .price-label {
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.9;
          margin-bottom: 0.5rem;
        }

        .price-amount {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .price-detail {
          font-size: 0.875rem;
          opacity: 0.9;
          margin-top: 0.25rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .specs-icon-grid {
            grid-template-columns: 1fr;
          }

          .specs-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .spec-name-col {
            width: 50%;
          }

          .price-amount {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductSpecsWithIcons;
