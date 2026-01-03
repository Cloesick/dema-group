import { useState } from 'react';
import { CustomerValidator, CustomerType } from '@/utils/customerValidation';
import { useLanguage } from '@/contexts/LanguageContext';

export function CustomerRegistration() {
  const { t } = useLanguage();
  const [customerType, setCustomerType] = useState<CustomerType>('b2c');
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Validation is triggered in three scenarios:
  // 1. When customer type changes (B2B/B2C toggle)
  const handleCustomerTypeChange = async (type: CustomerType) => {
    setCustomerType(type);
    setFormData({}); // Reset form when switching type
    setErrors([]);
  };

  // 2. During form field changes (real-time validation)
  const handleFieldChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Trigger real-time validation for critical fields
    if (['vatNumber', 'email', 'companyName'].includes(name)) {
      const validation = await CustomerValidator.validateCustomer(newFormData);
      if (!validation.isValid) {
        setErrors(validation.errors);
      } else {
        setErrors([]);
      }
    }
  };

  // 3. On form submission (complete validation)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    try {
      const validation = await CustomerValidator.validateCustomer(formData);
      
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      // For B2B customers, perform additional validations
      if (validation.type === 'b2b' && validation.companyInfo) {
        const creditCheck = await CustomerValidator.validateCreditEligibility(
          validation.companyInfo
        );

        if (!creditCheck.eligible) {
          setErrors([t.auth.errors.creditCheckFailed]);
          return;
        }
      }

      // If all validations pass, proceed with registration
      await handleRegistration(validation);

    } catch (error) {
      setErrors([t.auth.errors.registrationFailed]);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-center space-x-4 mb-8">
        <button
          className={`px-4 py-2 rounded-lg ${
            customerType === 'b2c' ? 'bg-blue-600 text-white' : 'bg-gray-100'
          }`}
          onClick={() => handleCustomerTypeChange('b2c')}
        >
          {t.auth.individual}
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            customerType === 'b2b' ? 'bg-blue-600 text-white' : 'bg-gray-100'
          }`}
          onClick={() => handleCustomerTypeChange('b2b')}
        >
          {t.auth.business}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {customerType === 'b2b' ? (
          // B2B Form Fields
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t.auth.fields.vatNumber}
              </label>
              <input
                type="text"
                name="vatNumber"
                onChange={handleFieldChange}
                className="w-full p-2 border rounded"
                placeholder="BE0123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t.auth.fields.companyName}
              </label>
              <input
                type="text"
                name="companyName"
                onChange={handleFieldChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t.auth.fields.industryType}
              </label>
              <select
                name="industryType"
                onChange={handleFieldChange}
                className="w-full p-2 border rounded"
              >
                <option value="">{t.auth.fields.selectIndustry}</option>
                <option value="manufacturing">{t.industries.manufacturing}</option>
                <option value="construction">{t.industries.construction}</option>
                <option value="wholesale">{t.industries.wholesale}</option>
              </select>
            </div>
          </>
        ) : (
          // B2C Form Fields
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t.auth.fields.firstName}
              </label>
              <input
                type="text"
                name="firstName"
                onChange={handleFieldChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t.auth.fields.lastName}
              </label>
              <input
                type="text"
                name="lastName"
                onChange={handleFieldChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </>
        )}

        {/* Common Fields */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t.auth.fields.email}
          </label>
          <input
            type="email"
            name="email"
            onChange={handleFieldChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 text-red-600 p-4 rounded">
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={isValidating}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isValidating ? t.common.processing : t.auth.register}
        </button>
      </form>
    </div>
  );
}

async function handleRegistration(validation: any) {
  // Here you would integrate with your authentication/registration service
  console.log('Registration successful', validation);
}
