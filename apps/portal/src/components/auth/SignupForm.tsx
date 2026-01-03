import { useState } from 'react';
import { useRouter } from 'next/router';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserRole, CompanyBrand } from '@/types/users';
import { DataProtection } from '@/utils/gdpr/dataProtection';
import { BusinessMetrics } from '@/utils/analytics/businessMetrics';
import { AuditLogger } from '@/utils/monitoring/logger';
import { UserValidationService } from '@/utils/validation/userValidation';

interface SignupFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function SignupForm({ onSuccess, onError }: SignupFormProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    vatNumber: '',
    industry: '',
    size: '',
    companyBrand: '',
    department: '',
    employeeId: '',
    marketingConsent: false
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role options based on relationship
  const roleOptions = [
    { value: 'customer.b2b', label: t.auth.roles.b2bCustomer },
    { value: 'customer.b2c', label: t.auth.roles.b2cCustomer },
    { value: 'employee', label: t.auth.roles.employee },
    { value: 'partner', label: t.auth.roles.partner },
    { value: 'supplier', label: t.auth.roles.supplier }
  ];

  // Company brands
  const companyBrands: { value: CompanyBrand; label: string }[] = [
    { value: 'dema', label: 'DEMA' },
    { value: 'fluxer', label: 'Fluxer' },
    { value: 'beltz247', label: 'Beltz247' },
    { value: 'devisschere', label: 'De Visschere Technics' },
    { value: 'accu', label: 'Accu Components' }
  ];

  // Industry options
  const industryOptions = [
    { value: 'manufacturing', label: t.industries.manufacturing },
    { value: 'construction', label: t.industries.construction },
    { value: 'wholesale', label: t.industries.wholesale },
    { value: 'retail', label: t.industries.retail },
    { value: 'services', label: t.industries.services }
  ];

  // Department options
  const departmentOptions = [
    { value: 'sales', label: t.departments.sales },
    { value: 'support', label: t.departments.support },
    { value: 'logistics', label: t.departments.logistics },
    { value: 'finance', label: t.departments.finance },
    { value: 'hr', label: t.departments.hr },
    { value: 'it', label: t.departments.it },
    { value: 'operations', label: t.departments.operations }
  ];

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear previous errors
    setErrors([]);

    // Real-time validation for critical fields
    if (['email', 'vatNumber', 'employeeId'].includes(name)) {
      try {
        await UserValidationService.validateUser(
          { ...formData, [name]: value },
          formData.role as UserRole
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Validation failed';
        setErrors([errorMessage]);
      }
    }
  };

  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    try {
      // Validate user data
      const validation = await UserValidationService.validateUser(
        formData,
        formData.role as UserRole
      );

      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      // Process personal data according to GDPR
      const processedData = await DataProtection.processPersonalData(
        {
          type: 'email',
          value: formData.email,
          purpose: 'contract',
          retention: 365 * 2, // 2 years
          categories: ['account'],
          specialCategory: false,
          crossBorder: false,
          processingBasis: 'contract'
        },
        formData.email
      );

      // Store user data (implement your storage logic)
      // await createUser(processedData);

      // Track signup for analytics
      await BusinessMetrics.trackConversion({
        type: 'signup',
        userId: processedData,
        value: 1,
        source: formData.role
      });

      // Log the signup
      await AuditLogger.logBusinessEvent({
        type: 'user_signup',
        details: {
          role: formData.role,
          company: formData.companyName || 'individual'
        },
        userId: processedData
      });

      // Handle success
      onSuccess?.();
      router.push('/auth/verify-email');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setErrors([errorMessage]);
      onError?.(new Error(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepOne = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          {t.auth.labels.relationship}
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">{t.common.select}</option>
          {roleOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t.auth.labels.email}
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t.auth.labels.password}
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          required
          minLength={12}
        />
        <p className="text-xs text-slate-500 mt-1">
          {t.auth.passwordRequirements}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setStep(2)}
        disabled={!formData.role || !formData.email || !formData.password}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {t.common.continue}
      </button>
    </div>
  );

  const renderStepTwo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t.auth.labels.firstName}
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {t.auth.labels.lastName}
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t.auth.labels.phone}
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          placeholder="+32..."
        />
      </div>

      {/* Company-specific fields */}
      {(formData.role === 'customer.b2b' || 
        formData.role === 'partner' || 
        formData.role === 'supplier') && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t.auth.labels.companyName}
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t.auth.labels.vatNumber}
            </label>
            <input
              type="text"
              name="vatNumber"
              value={formData.vatNumber}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="BE0123456789"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t.auth.labels.industry}
            </label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">{t.common.select}</option>
              {industryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t.auth.labels.companySize}
            </label>
            <select
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">{t.common.select}</option>
              <option value="small">1-50</option>
              <option value="medium">51-250</option>
              <option value="large">251-1000</option>
              <option value="enterprise">1000+</option>
            </select>
          </div>
        </>
      )}

      {/* Employee-specific fields */}
      {formData.role === 'employee' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t.auth.labels.company}
            </label>
            <select
              name="companyBrand"
              value={formData.companyBrand}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">{t.common.select}</option>
              {companyBrands.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t.auth.labels.department}
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">{t.common.select}</option>
              {departmentOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t.auth.labels.employeeId}
            </label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="EMP123456"
              required
            />
          </div>
        </>
      )}

      {/* Marketing consent */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="marketingConsent"
          id="marketingConsent"
          checked={formData.marketingConsent}
          onChange={handleConsentChange}
          className="rounded border-slate-300"
        />
        <label htmlFor="marketingConsent" className="text-sm">
          {t.auth.labels.marketingConsent}
        </label>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="w-1/2 py-2 px-4 border border-slate-300 rounded hover:bg-slate-50"
        >
          {t.common.back}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-1/2 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? t.common.processing : t.auth.signup}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {t.auth.createAccount}
      </h1>

      {errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded">
          <ul className="list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {step === 1 ? renderStepOne() : renderStepTwo()}
    </form>
  );
}
