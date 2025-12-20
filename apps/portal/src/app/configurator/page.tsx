'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { 
  ChevronRight, 
  ChevronLeft,
  Check,
  AlertCircle,
  ShoppingCart,
  Save,
  RotateCcw,
  Download,
  Share2,
  Info
} from 'lucide-react'
import type { ConfiguratorProduct, ConfiguratorStep, ConfiguratorConfiguration } from '@/types'

// =============================================================================
// PRODUCT CONFIGURATOR PAGE - BLUEPRINT
// =============================================================================
// Features:
// - Step-by-step configuration wizard
// - Dynamic options based on previous selections
// - Real-time price calculation
// - Validation with error messages
// - Save/load configurations
// - Generate SKU and add to cart
// - Export configuration as PDF
// =============================================================================

// Mock configurator product - Replace with API
const mockHoseConfigurator: ConfiguratorProduct = {
  id: 'hose-assembly',
  type: 'hose_assembly',
  name: 'Custom Hose Assembly',
  name_nl: 'Slangassemblage op maat',
  description: 'Configure your custom industrial hose assembly with fittings',
  steps: [
    {
      id: 'hose-type',
      name: 'Hose Type',
      name_nl: 'Slangtype',
      description: 'Select the type of hose for your application',
      type: 'select',
      isRequired: true,
      sortOrder: 1,
      options: [
        { id: 'rubber-water', name: 'Rubber Water Hose', name_nl: 'Rubber Waterslang', image: '/images/subcategories/hose-coupling.svg', price: 15, specifications: { material: 'EPDM Rubber', pressure: '10 bar', temp: '-30°C to +80°C' } },
        { id: 'rubber-air', name: 'Rubber Air Hose', name_nl: 'Rubber Luchtslang', image: '/images/subcategories/hose-coupling.svg', price: 18, specifications: { material: 'NBR Rubber', pressure: '20 bar', temp: '-20°C to +70°C' } },
        { id: 'pvc-water', name: 'PVC Water Hose', name_nl: 'PVC Waterslang', image: '/images/subcategories/hose-coupling.svg', price: 8, specifications: { material: 'PVC', pressure: '8 bar', temp: '0°C to +60°C' } },
        { id: 'ptfe-chemical', name: 'PTFE Chemical Hose', name_nl: 'PTFE Chemische Slang', image: '/images/subcategories/hose-coupling.svg', price: 45, specifications: { material: 'PTFE', pressure: '16 bar', temp: '-50°C to +230°C' } },
        { id: 'ss-braided', name: 'SS Braided Hose', name_nl: 'RVS Gevlochten Slang', image: '/images/subcategories/hose-coupling.svg', price: 35, specifications: { material: 'Stainless Steel 316', pressure: '40 bar', temp: '-50°C to +200°C' } },
      ]
    },
    {
      id: 'diameter',
      name: 'Inner Diameter',
      name_nl: 'Binnendiameter',
      description: 'Select the inner diameter of the hose',
      type: 'select',
      isRequired: true,
      sortOrder: 2,
      options: [
        { id: 'dn13', name: 'DN13 (1/2")', name_nl: 'DN13 (1/2")', price: 0, specifications: { id: '13mm' } },
        { id: 'dn19', name: 'DN19 (3/4")', name_nl: 'DN19 (3/4")', price: 2, specifications: { id: '19mm' } },
        { id: 'dn25', name: 'DN25 (1")', name_nl: 'DN25 (1")', price: 4, specifications: { id: '25mm' } },
        { id: 'dn32', name: 'DN32 (1-1/4")', name_nl: 'DN32 (1-1/4")', price: 6, specifications: { id: '32mm' } },
        { id: 'dn38', name: 'DN38 (1-1/2")', name_nl: 'DN38 (1-1/2")', price: 8, specifications: { id: '38mm' } },
        { id: 'dn50', name: 'DN50 (2")', name_nl: 'DN50 (2")', price: 12, specifications: { id: '50mm' } },
      ]
    },
    {
      id: 'length',
      name: 'Length',
      name_nl: 'Lengte',
      description: 'Enter the desired length in meters',
      type: 'input',
      isRequired: true,
      sortOrder: 3,
      constraints: {
        min: 0.5,
        max: 100,
        step: 0.5,
        unit: 'm'
      }
    },
    {
      id: 'fitting-a',
      name: 'Fitting A (End 1)',
      name_nl: 'Fitting A (Uiteinde 1)',
      description: 'Select the fitting for the first end',
      type: 'select',
      isRequired: true,
      sortOrder: 4,
      options: [
        { id: 'none', name: 'No Fitting (Cut End)', name_nl: 'Geen Fitting (Afgesneden)', price: 0 },
        { id: 'bsp-male', name: 'BSP Male Thread', name_nl: 'BSP Buitendraad', price: 12 },
        { id: 'bsp-female', name: 'BSP Female Thread', name_nl: 'BSP Binnendraad', price: 14 },
        { id: 'camlock-a', name: 'Camlock Type A', name_nl: 'Camlock Type A', price: 18 },
        { id: 'camlock-c', name: 'Camlock Type C', name_nl: 'Camlock Type C', price: 18 },
        { id: 'flange', name: 'Flange Connection', name_nl: 'Flensaansluiting', price: 35 },
        { id: 'quick-connect', name: 'Quick Connect', name_nl: 'Snelkoppeling', price: 22 },
      ]
    },
    {
      id: 'fitting-b',
      name: 'Fitting B (End 2)',
      name_nl: 'Fitting B (Uiteinde 2)',
      description: 'Select the fitting for the second end',
      type: 'select',
      isRequired: true,
      sortOrder: 5,
      options: [
        { id: 'none', name: 'No Fitting (Cut End)', name_nl: 'Geen Fitting (Afgesneden)', price: 0 },
        { id: 'bsp-male', name: 'BSP Male Thread', name_nl: 'BSP Buitendraad', price: 12 },
        { id: 'bsp-female', name: 'BSP Female Thread', name_nl: 'BSP Binnendraad', price: 14 },
        { id: 'camlock-a', name: 'Camlock Type A', name_nl: 'Camlock Type A', price: 18 },
        { id: 'camlock-c', name: 'Camlock Type C', name_nl: 'Camlock Type C', price: 18 },
        { id: 'flange', name: 'Flange Connection', name_nl: 'Flensaansluiting', price: 35 },
        { id: 'quick-connect', name: 'Quick Connect', name_nl: 'Snelkoppeling', price: 22 },
      ]
    },
    {
      id: 'accessories',
      name: 'Accessories',
      name_nl: 'Accessoires',
      description: 'Add optional accessories',
      type: 'multi_select',
      isRequired: false,
      sortOrder: 6,
      options: [
        { id: 'spring-guard', name: 'Spring Guard', name_nl: 'Veerbeschermer', price: 8 },
        { id: 'sleeve', name: 'Protective Sleeve', name_nl: 'Beschermhoes', price: 5 },
        { id: 'whip-check', name: 'Whip Check Safety Cable', name_nl: 'Veiligheidskabel', price: 15 },
        { id: 'test-cert', name: 'Pressure Test Certificate', name_nl: 'Druktestcertificaat', price: 25 },
      ]
    }
  ],
  pricingRules: [
    { id: 'base', type: 'base', value: 10 }, // Base assembly fee
    { id: 'per-meter', type: 'per_unit', stepId: 'length', value: 1 }, // Multiplier for hose price per meter
  ],
  validationRules: [
    { 
      id: 'min-length', 
      type: 'range', 
      message: 'Minimum length is 0.5m', 
      message_nl: 'Minimale lengte is 0,5m',
      condition: { stepId: 'length', min: 0.5 }
    },
    {
      id: 'ptfe-fitting',
      type: 'compatibility',
      message: 'PTFE hoses require special fittings',
      message_nl: 'PTFE slangen vereisen speciale fittingen',
      condition: { if: { 'hose-type': 'ptfe-chemical' }, then: { 'fitting-a': ['bsp-male', 'bsp-female', 'flange'] } }
    }
  ]
}

const configuratorTypes = [
  { id: 'hose-assembly', name: 'Hose Assembly', name_nl: 'Slangassemblage', icon: '🔄', description: 'Custom hose with fittings', description_nl: 'Slang op maat met koppelingen' },
  { id: 'pipe-system', name: 'Pipe System', name_nl: 'Leidingsysteem', icon: '🔧', description: 'Configure pipe runs', description_nl: 'Configureer leidingtrajecten' },
  { id: 'pump-system', name: 'Pump System', name_nl: 'Pompsysteem', icon: '💧', description: 'Pump with accessories', description_nl: 'Pomp met toebehoren' },
  { id: 'valve-assembly', name: 'Valve Assembly', name_nl: 'Afsluiterassemblage', icon: '⚙️', description: 'Valve with actuator', description_nl: 'Afsluiter met actuator' },
]

export default function ConfiguratorPage() {
  const [language] = useState<'en' | 'nl'>('nl')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState<Record<string, string | number | string[]>>({})
  const [errors, setErrors] = useState<string[]>([])
  
  const configurator = selectedType === 'hose-assembly' ? mockHoseConfigurator : null
  const steps = configurator?.steps || []
  const activeStep = steps[currentStep]
  
  // Calculate price based on selections
  const calculatedPrice = useMemo(() => {
    if (!configurator) return 0
    
    let total = 10 // Base assembly fee
    
    // Hose type price per meter
    const hoseType = configurator.steps.find(s => s.id === 'hose-type')?.options?.find(o => o.id === selections['hose-type'])
    const length = Number(selections['length']) || 0
    if (hoseType) {
      total += hoseType.price * length
    }
    
    // Diameter surcharge per meter
    const diameter = configurator.steps.find(s => s.id === 'diameter')?.options?.find(o => o.id === selections['diameter'])
    if (diameter) {
      total += diameter.price * length
    }
    
    // Fittings
    const fittingA = configurator.steps.find(s => s.id === 'fitting-a')?.options?.find(o => o.id === selections['fitting-a'])
    const fittingB = configurator.steps.find(s => s.id === 'fitting-b')?.options?.find(o => o.id === selections['fitting-b'])
    if (fittingA) total += fittingA.price
    if (fittingB) total += fittingB.price
    
    // Accessories
    const accessories = selections['accessories'] as string[] || []
    const accessoryOptions = configurator.steps.find(s => s.id === 'accessories')?.options || []
    accessories.forEach(accId => {
      const acc = accessoryOptions.find(o => o.id === accId)
      if (acc) total += acc.price
    })
    
    return total
  }, [configurator, selections])
  
  // Generate SKU
  const generatedSku = useMemo(() => {
    if (!selections['hose-type'] || !selections['diameter']) return ''
    
    const hose = String(selections['hose-type']).toUpperCase().slice(0, 3)
    const dia = String(selections['diameter']).toUpperCase()
    const len = selections['length'] ? `${selections['length']}M` : ''
    const fitA = selections['fitting-a'] && selections['fitting-a'] !== 'none' ? String(selections['fitting-a']).toUpperCase().slice(0, 3) : 'CUT'
    const fitB = selections['fitting-b'] && selections['fitting-b'] !== 'none' ? String(selections['fitting-b']).toUpperCase().slice(0, 3) : 'CUT'
    
    return `HOSE-${hose}-${dia}-${len}-${fitA}-${fitB}`
  }, [selections])
  
  // Handle selection change
  const handleSelect = (stepId: string, value: string | number | string[]) => {
    setSelections(prev => ({ ...prev, [stepId]: value }))
    setErrors([])
  }
  
  // Handle multi-select toggle
  const toggleMultiSelect = (stepId: string, value: string) => {
    const current = (selections[stepId] as string[]) || []
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    handleSelect(stepId, updated)
  }
  
  // Validate current step
  const validateStep = () => {
    if (!activeStep) return true
    
    if (activeStep.isRequired) {
      const value = selections[activeStep.id]
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        if (activeStep.type !== 'multi_select') {
          setErrors([language === 'nl' ? 'Dit veld is verplicht' : 'This field is required'])
          return false
        }
      }
    }
    
    if (activeStep.type === 'input' && activeStep.constraints) {
      const value = Number(selections[activeStep.id])
      if (activeStep.constraints.min && value < activeStep.constraints.min) {
        setErrors([`${language === 'nl' ? 'Minimum waarde is' : 'Minimum value is'} ${activeStep.constraints.min}`])
        return false
      }
      if (activeStep.constraints.max && value > activeStep.constraints.max) {
        setErrors([`${language === 'nl' ? 'Maximum waarde is' : 'Maximum value is'} ${activeStep.constraints.max}`])
        return false
      }
    }
    
    return true
  }
  
  // Navigation
  const goNext = () => {
    if (validateStep() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setErrors([])
    }
  }
  
  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setErrors([])
    }
  }
  
  const goToStep = (index: number) => {
    if (index <= currentStep || validateStep()) {
      setCurrentStep(index)
      setErrors([])
    }
  }
  
  // Reset configurator
  const reset = () => {
    setSelections({})
    setCurrentStep(0)
    setErrors([])
  }
  
  // Check if configuration is complete
  const isComplete = useMemo(() => {
    return steps.every(step => {
      if (!step.isRequired) return true
      const value = selections[step.id]
      return value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0 || step.type === 'multi_select')
    })
  }, [steps, selections])

  // Type selection screen
  if (!selectedType) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'nl' ? 'Product Configurator' : 'Product Configurator'}
            </h1>
            <p className="text-indigo-100 max-w-2xl">
              {language === 'nl' 
                ? 'Configureer uw product op maat. Selecteer opties, bekijk de prijs in real-time en bestel direct.'
                : 'Configure your custom product. Select options, view real-time pricing, and order directly.'
              }
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            {language === 'nl' ? 'Selecteer een configurator' : 'Select a Configurator'}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {configuratorTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className="bg-white rounded-2xl border p-6 text-left hover:shadow-xl hover:border-indigo-300 transition group"
              >
                <span className="text-4xl mb-4 block">{type.icon}</span>
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition mb-2">
                  {language === 'nl' ? type.name_nl : type.name}
                </h3>
                <p className="text-sm text-slate-500">
                  {language === 'nl' ? type.description_nl : type.description}
                </p>
                <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium">
                  {language === 'nl' ? 'Start configuratie' : 'Start configuration'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedType(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-semibold text-slate-900">
                  {language === 'nl' ? configurator?.name_nl : configurator?.name}
                </h1>
                <p className="text-sm text-slate-500">
                  {language === 'nl' ? 'Stap' : 'Step'} {currentStep + 1} {language === 'nl' ? 'van' : 'of'} {steps.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={reset}
                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'nl' ? 'Reset' : 'Reset'}</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'nl' ? 'Opslaan' : 'Save'}</span>
              </button>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            {steps.map((step, index) => {
              const isCompleted = selections[step.id] !== undefined && selections[step.id] !== ''
              const isCurrent = index === currentStep
              
              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition ${
                    isCurrent 
                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                      : isCompleted
                      ? 'bg-green-50 text-green-700'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isCurrent 
                      ? 'bg-indigo-600 text-white' 
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isCompleted && !isCurrent ? <Check className="w-3 h-3" /> : index + 1}
                  </span>
                  <span className="hidden md:inline">
                    {language === 'nl' ? step.name_nl : step.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Configuration Area */}
          <div className="flex-1">
            {activeStep && (
              <div className="bg-white rounded-2xl border p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  {language === 'nl' ? activeStep.name_nl : activeStep.name}
                </h2>
                <p className="text-slate-500 mb-6">{activeStep.description}</p>
                
                {/* Errors */}
                {errors.length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <span>{errors[0]}</span>
                    </div>
                  </div>
                )}
                
                {/* Select Options */}
                {activeStep.type === 'select' && activeStep.options && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeStep.options.map(option => {
                      const isSelected = selections[activeStep.id] === option.id
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleSelect(activeStep.id, option.id)}
                          className={`p-4 rounded-xl border-2 text-left transition ${
                            isSelected 
                              ? 'border-indigo-500 bg-indigo-50' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {option.image && (
                            <div className="w-16 h-16 mb-3 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Image
                                src={option.image}
                                alt={option.name}
                                width={48}
                                height={48}
                                className="object-contain"
                              />
                            </div>
                          )}
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-900">
                                {language === 'nl' ? option.name_nl : option.name}
                              </p>
                              {option.specifications && (
                                <div className="mt-2 space-y-1">
                                  {Object.entries(option.specifications).map(([key, value]) => (
                                    <p key={key} className="text-xs text-slate-500">
                                      {key}: {value}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end">
                              {option.price > 0 && (
                                <span className="text-sm font-medium text-indigo-600">
                                  +€{option.price.toFixed(2)}
                                </span>
                              )}
                              {isSelected && (
                                <span className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center mt-2">
                                  <Check className="w-4 h-4 text-white" />
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
                
                {/* Input Field */}
                {activeStep.type === 'input' && activeStep.constraints && (
                  <div className="max-w-xs">
                    <div className="relative">
                      <input
                        type="number"
                        value={selections[activeStep.id] || ''}
                        onChange={(e) => handleSelect(activeStep.id, parseFloat(e.target.value))}
                        min={activeStep.constraints.min}
                        max={activeStep.constraints.max}
                        step={activeStep.constraints.step}
                        className="w-full px-4 py-3 border rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder={`${activeStep.constraints.min} - ${activeStep.constraints.max}`}
                      />
                      {activeStep.constraints.unit && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                          {activeStep.constraints.unit}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {language === 'nl' ? 'Bereik' : 'Range'}: {activeStep.constraints.min} - {activeStep.constraints.max} {activeStep.constraints.unit}
                    </p>
                  </div>
                )}
                
                {/* Multi-Select Options */}
                {activeStep.type === 'multi_select' && activeStep.options && (
                  <div className="space-y-3">
                    {activeStep.options.map(option => {
                      const isSelected = ((selections[activeStep.id] as string[]) || []).includes(option.id)
                      return (
                        <button
                          key={option.id}
                          onClick={() => toggleMultiSelect(activeStep.id, option.id)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition flex items-center justify-between ${
                            isSelected 
                              ? 'border-indigo-500 bg-indigo-50' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                            }`}>
                              {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <span className="font-medium text-slate-900">
                              {language === 'nl' ? option.name_nl : option.name}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-indigo-600">
                            +€{option.price.toFixed(2)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
                
                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <button
                    onClick={goPrev}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    {language === 'nl' ? 'Vorige' : 'Previous'}
                  </button>
                  
                  {currentStep < steps.length - 1 ? (
                    <button
                      onClick={goNext}
                      className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      {language === 'nl' ? 'Volgende' : 'Next'}
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      disabled={!isComplete}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {language === 'nl' ? 'Toevoegen aan winkelwagen' : 'Add to Cart'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Summary Sidebar */}
          <aside className="w-80 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl border sticky top-40">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-slate-900">
                  {language === 'nl' ? 'Configuratie overzicht' : 'Configuration Summary'}
                </h3>
              </div>
              
              <div className="p-4 space-y-3">
                {steps.map(step => {
                  const value = selections[step.id]
                  const option = step.options?.find(o => o.id === value)
                  const displayValue = step.type === 'multi_select'
                    ? ((value as string[]) || []).map(v => step.options?.find(o => o.id === v)?.name).join(', ')
                    : option 
                    ? (language === 'nl' ? option.name_nl : option.name)
                    : step.type === 'input' && value
                    ? `${value} ${step.constraints?.unit || ''}`
                    : null
                  
                  return (
                    <div key={step.id} className="flex items-start justify-between text-sm">
                      <span className="text-slate-500">
                        {language === 'nl' ? step.name_nl : step.name}
                      </span>
                      <span className={`text-right max-w-[150px] truncate ${displayValue ? 'font-medium text-slate-900' : 'text-slate-400'}`}>
                        {displayValue || '—'}
                      </span>
                    </div>
                  )
                })}
              </div>
              
              {/* Generated SKU */}
              {generatedSku && (
                <div className="px-4 pb-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">
                      {language === 'nl' ? 'Gegenereerd artikelnummer' : 'Generated SKU'}
                    </p>
                    <p className="font-mono text-sm font-medium text-slate-900">{generatedSku}</p>
                  </div>
                </div>
              )}
              
              {/* Price */}
              <div className="p-4 border-t bg-indigo-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600">
                    {language === 'nl' ? 'Totaalprijs' : 'Total Price'}
                  </span>
                  <span className="text-2xl font-bold text-indigo-600">
                    €{calculatedPrice.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {language === 'nl' ? 'excl. BTW' : 'excl. VAT'}
                </p>
              </div>
              
              {/* Actions */}
              <div className="p-4 border-t space-y-2">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 transition text-sm">
                  <Download className="w-4 h-4" />
                  {language === 'nl' ? 'Download PDF' : 'Download PDF'}
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 transition text-sm">
                  <Share2 className="w-4 h-4" />
                  {language === 'nl' ? 'Deel configuratie' : 'Share Configuration'}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
