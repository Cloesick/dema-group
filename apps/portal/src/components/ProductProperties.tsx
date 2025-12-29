'use client'

import { useMemo } from 'react'
import { 
  getProductGroup, 
  getGroupedSpecifications,
  getPrimaryProperties,
  type PropertyDefinition 
} from '@/config/productGroups'

// =============================================================================
// PRODUCT PROPERTIES COMPONENT
// =============================================================================
// Renders product properties based on product group/series.
// Empty properties are NEVER rendered.
// =============================================================================

interface ProductPropertiesProps {
  product: Record<string, unknown>
  catalogGroup: string
  language?: 'en' | 'nl' | 'fr'
  variant?: 'card' | 'detail' | 'table'
}

/**
 * Renders product properties based on the product's catalog group.
 * Only shows properties that:
 * 1. Are applicable to the product group
 * 2. Have a non-empty value
 */
export function ProductProperties({ 
  product, 
  catalogGroup, 
  language = 'en',
  variant = 'detail'
}: ProductPropertiesProps) {
  const groupedSpecs = useMemo(() => 
    getGroupedSpecifications(product, catalogGroup, language),
    [product, catalogGroup, language]
  )

  if (groupedSpecs.length === 0) {
    return null
  }

  if (variant === 'card') {
    return <CardProperties product={product} catalogGroup={catalogGroup} language={language} />
  }

  if (variant === 'table') {
    return <TableProperties groupedSpecs={groupedSpecs} />
  }

  return <DetailProperties groupedSpecs={groupedSpecs} />
}

// -----------------------------------------------------------------------------
// Card View - Primary properties only
// -----------------------------------------------------------------------------

interface CardPropertiesProps {
  product: Record<string, unknown>
  catalogGroup: string
  language: 'en' | 'nl' | 'fr'
}

function CardProperties({ product, catalogGroup, language }: CardPropertiesProps) {
  const primaryProps = useMemo(() => {
    const props = getPrimaryProperties(catalogGroup)
    return props
      .filter(p => {
        const value = product[p.key]
        return value !== undefined && value !== null && value !== ''
      })
      .slice(0, 4) // Max 4 properties in card view
  }, [product, catalogGroup])

  if (primaryProps.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {primaryProps.map(prop => {
        const value = product[prop.key]
        const label = prop.labels[language]
        
        return (
          <span 
            key={prop.key}
            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
            title={label}
          >
            <span className="font-medium">{label}:</span>
            <span className="ml-1">
              {String(value)}
              {prop.unit && <span className="text-gray-500 ml-0.5">{prop.unit}</span>}
            </span>
          </span>
        )
      })}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Detail View - Grouped specifications
// -----------------------------------------------------------------------------

interface DetailPropertiesProps {
  groupedSpecs: Array<{
    group: { id: string; name: string }
    specs: Array<{ label: string; value: string; unit?: string }>
  }>
}

function DetailProperties({ groupedSpecs }: DetailPropertiesProps) {
  return (
    <div className="space-y-6">
      {groupedSpecs.map(({ group, specs }) => (
        <div key={group.id}>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
            {group.name}
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {specs.map((spec, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                <dt className="text-sm text-gray-600">{spec.label}</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {spec.value}
                  {spec.unit && <span className="text-gray-500 ml-1">{spec.unit}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Table View - Compact table format
// -----------------------------------------------------------------------------

interface TablePropertiesProps {
  groupedSpecs: Array<{
    group: { id: string; name: string }
    specs: Array<{ label: string; value: string; unit?: string }>
  }>
}

function TableProperties({ groupedSpecs }: TablePropertiesProps) {
  // Flatten all specs for table view
  const allSpecs = groupedSpecs.flatMap(g => g.specs)

  if (allSpecs.length === 0) {
    return null
  }

  return (
    <table className="min-w-full text-sm">
      <tbody>
        {allSpecs.map((spec, i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
            <td className="px-3 py-2 text-gray-600 font-medium w-1/3">
              {spec.label}
            </td>
            <td className="px-3 py-2 text-gray-900">
              {spec.value}
              {spec.unit && <span className="text-gray-500 ml-1">{spec.unit}</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// -----------------------------------------------------------------------------
// Property Badge - Single property display
// -----------------------------------------------------------------------------

interface PropertyBadgeProps {
  property: PropertyDefinition
  value: unknown
  language?: 'en' | 'nl' | 'fr'
  size?: 'sm' | 'md'
}

export function PropertyBadge({ 
  property, 
  value, 
  language = 'en',
  size = 'sm' 
}: PropertyBadgeProps) {
  // Never render if value is empty
  if (value === undefined || value === null || value === '') {
    return null
  }

  const label = property.labels[language]

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-3 py-1 text-sm'

  return (
    <span className={`inline-flex items-center bg-gray-100 text-gray-700 rounded ${sizeClasses}`}>
      <span className="font-medium">{label}:</span>
      <span className="ml-1">
        {String(value)}
        {property.unit && <span className="text-gray-500 ml-0.5">{property.unit}</span>}
      </span>
    </span>
  )
}

// -----------------------------------------------------------------------------
// Specification Table - For product detail page
// -----------------------------------------------------------------------------

interface SpecificationTableProps {
  product: Record<string, unknown>
  catalogGroup: string
  language?: 'en' | 'nl' | 'fr'
}

export function SpecificationTable({ 
  product, 
  catalogGroup, 
  language = 'en' 
}: SpecificationTableProps) {
  const groupedSpecs = useMemo(() => 
    getGroupedSpecifications(product, catalogGroup, language),
    [product, catalogGroup, language]
  )

  if (groupedSpecs.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic">
        {language === 'nl' ? 'Geen specificaties beschikbaar' 
         : language === 'fr' ? 'Aucune spécification disponible'
         : 'No specifications available'}
      </p>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {groupedSpecs.map(({ group, specs }, groupIndex) => (
        <div key={group.id}>
          {/* Group Header */}
          <div className="bg-gray-100 px-4 py-2 border-b">
            <h4 className="font-semibold text-gray-900 text-sm">{group.name}</h4>
          </div>
          
          {/* Specs Table */}
          <table className="min-w-full">
            <tbody>
              {specs.map((spec, i) => (
                <tr 
                  key={i} 
                  className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${
                    i < specs.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-600 w-1/2">
                    {spec.label}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {spec.value}
                    {spec.unit && (
                      <span className="text-gray-500 ml-1">{spec.unit}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Separator between groups */}
          {groupIndex < groupedSpecs.length - 1 && (
            <div className="border-b-2 border-gray-200" />
          )}
        </div>
      ))}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Filter Chips - For search/filter UI
// -----------------------------------------------------------------------------

interface FilterChipsProps {
  product: Record<string, unknown>
  catalogGroup: string
  language?: 'en' | 'nl' | 'fr'
  maxChips?: number
}

export function FilterChips({ 
  product, 
  catalogGroup, 
  language = 'en',
  maxChips = 5
}: FilterChipsProps) {
  const chips = useMemo(() => {
    const props = getPrimaryProperties(catalogGroup)
    return props
      .filter(p => {
        const value = product[p.key]
        return value !== undefined && value !== null && value !== ''
      })
      .slice(0, maxChips)
      .map(prop => {
        const value = product[prop.key]
        const label = prop.labels[language]
        return {
          key: prop.key,
          label,
          value: String(value),
          unit: prop.unit,
        }
      })
  }, [product, catalogGroup, language, maxChips])

  if (chips.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-1">
      {chips.map(chip => (
        <span 
          key={chip.key}
          className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
        >
          {chip.value}
          {chip.unit && <span className="ml-0.5">{chip.unit}</span>}
        </span>
      ))}
    </div>
  )
}
