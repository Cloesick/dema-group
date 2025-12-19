/**
 * Enhanced Product Card with Icon Support
 * Beautiful product card that displays specs with icons
 */
import React from 'react';
import ProductSpecsWithIcons from './ProductSpecsWithIcons';

interface Product {
  id: string;
  sku: string;
  name: string;
  brand?: string;
  category?: string;
  description?: string;
  specs: Array<{
    name: string;
    value: string;
    value_plain?: string;
    icon_display?: boolean;
  }>;
  media: Array<{
    url: string;
    role: string;
    type: string;
    format: string;
  }>;
  price?: {
    amount: number;
    currency: string;
    display?: string;
    excl_vat?: number;
    incl_vat?: number;
  };
  imageUrl?: string;
}

interface ProductCardEnhancedProps {
  product: Product;
  layout?: 'grid' | 'list';
  showQuickView?: boolean;
}

export const ProductCardEnhanced: React.FC<ProductCardEnhancedProps> = ({
  product,
  layout = 'grid',
  showQuickView = true
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const mainImage = product.media.find(m => m.role === 'main') || product.media[0];
  const hasSpecs = product.specs && product.specs.length > 0;

  return (
    <div className={`product-card-enhanced ${layout}`}>
      {/* Product Image */}
      <div className="product-image-container">
        {mainImage && (
          <img
            src={mainImage.url}
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
        )}
        
        {product.brand && (
          <div className="product-badge">{product.brand}</div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        {product.category && (
          <div className="product-category">{product.category}</div>
        )}
        
        <h3 className="product-title">{product.name}</h3>
        
        {product.description && (
          <p className="product-description">{product.description}</p>
        )}

        {/* Quick Specs Preview */}
        {hasSpecs && !isExpanded && (
          <div className="quick-specs">
            {product.specs.slice(0, 3).map((spec, index) => (
              <div key={index} className="quick-spec-item">
                <span className="quick-spec-value">{spec.value}</span>
              </div>
            ))}
            {product.specs.length > 3 && (
              <button
                className="view-more-btn"
                onClick={() => setIsExpanded(true)}
              >
                +{product.specs.length - 3} more specs
              </button>
            )}
          </div>
        )}

        {/* Price */}
        {product.price && !isExpanded && (
          <div className="product-price-compact">
            <span className="price-amount">
              {product.price.display || `€${product.price.amount.toFixed(2)}`}
            </span>
            {product.price.excl_vat && (
              <span className="price-label">excl. VAT</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {!isExpanded && (
          <div className="product-actions">
            <button className="btn-primary">
              Add to Cart
            </button>
            {showQuickView && (
              <button
                className="btn-secondary"
                onClick={() => setIsExpanded(true)}
              >
                View Details
              </button>
            )}
          </div>
        )}

        {/* Expanded View */}
        {isExpanded && hasSpecs && (
          <div className="product-expanded">
            <ProductSpecsWithIcons product={product} />
            <div className="expanded-actions">
              <button className="btn-primary">Add to Cart</button>
              <button
                className="btn-secondary"
                onClick={() => setIsExpanded(false)}
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .product-card-enhanced {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .product-card-enhanced:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          transform: translateY(-4px);
        }

        .product-card-enhanced.list {
          flex-direction: row;
        }

        /* Image Container */
        .product-image-container {
          position: relative;
          width: 100%;
          padding-top: 75%;
          background: #f8f9fa;
          overflow: hidden;
        }

        .product-card-enhanced.list .product-image-container {
          width: 250px;
          padding-top: 0;
          height: 200px;
        }

        .product-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 1rem;
        }

        .product-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
        }

        /* Product Info */
        .product-info {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          flex: 1;
        }

        .product-category {
          font-size: 0.75rem;
          font-weight: 600;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .product-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
          line-height: 1.3;
        }

        .product-description {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }

        /* Quick Specs */
        .quick-specs {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .quick-spec-item {
          background: #f8f9fa;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          border-left: 3px solid #2563eb;
        }

        .quick-spec-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1a1a1a;
        }

        .view-more-btn {
          background: transparent;
          border: 1px dashed #d1d5db;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          color: #6b7280;
          transition: all 0.2s;
        }

        .view-more-btn:hover {
          border-color: #2563eb;
          color: #2563eb;
        }

        /* Price Compact */
        .product-price-compact {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          padding: 1rem 0;
          border-top: 1px solid #f0f0f0;
          border-bottom: 1px solid #f0f0f0;
        }

        .price-amount {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1a1a1a;
        }

        .price-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        /* Actions */
        .product-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: auto;
        }

        .btn-primary {
          flex: 1;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          border: none;
          padding: 0.875rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }

        .btn-secondary {
          background: white;
          color: #2563eb;
          border: 2px solid #2563eb;
          padding: 0.875rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-secondary:hover {
          background: #f0f7ff;
        }

        /* Expanded View */
        .product-expanded {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 2px solid #f0f0f0;
        }

        .expanded-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .product-card-enhanced.list {
            flex-direction: column;
          }

          .product-card-enhanced.list .product-image-container {
            width: 100%;
            padding-top: 75%;
            height: auto;
          }

          .product-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductCardEnhanced;
