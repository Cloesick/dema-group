'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { useLocale } from '@/contexts/LocaleContext';
import { useCartStore } from '@/store/cartStore';

type FormData = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  saveInfo: boolean;
  paymentMethod: 'credit-card' | 'bank-transfer' | 'on-delivery';
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
  terms: boolean;
};

export default function CheckoutPage() {
  const { t, locale } = useLocale();
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    postalCode: '',
    country: 'Belgium',
    phone: '',
    saveInfo: true,
    paymentMethod: 'bank-transfer',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
    terms: false,
  });

  const [useDifferentBilling, setUseDifferentBilling] = useState<boolean>(false);
  const [useAccountDetails, setUseAccountDetails] = useState<boolean>(false);
  const orderRef = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const rnd = Math.floor(Math.random() * 9000) + 1000;
    return `DEMA-${y}${m}${day}-${rnd}`;
  }, []);
  const BANK_NAME = process.env.NEXT_PUBLIC_BANK_NAME || '';
  const BANK_ACCOUNT_NAME = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || '';
  const BANK_IBAN = process.env.NEXT_PUBLIC_BANK_IBAN || '';
  const BANK_BIC = process.env.NEXT_PUBLIC_BANK_BIC || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Autofill from stored account profile if present
  useEffect(() => {
    try {
      const raw = localStorage.getItem('account-profile');
      if (raw) {
        const prof = JSON.parse(raw);
        setFormData(prev => ({
          ...prev,
          email: prof.email || prev.email,
          firstName: prof.firstName || prev.firstName,
          lastName: prof.lastName || prev.lastName,
          address: prof.address || prev.address,
          city: prof.city || prev.city,
          postalCode: prof.postalCode || prev.postalCode,
          country: prof.country || prev.country,
          phone: prof.phone || prev.phone,
        }));
        setUseAccountDetails(true);
      }
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Compute totals and send email confirmation
    try {
      const items = cartItems.map((it) => ({
        sku: it.sku,
        name: it.description?.split(' ').slice(0, 3).join(' ') || it.sku,
        quantity: it.quantity,
        price: Number((it.sku?.length || 1) * 10)
      }));
      const subtotalCalc = items.reduce((s, it) => s + it.price * it.quantity, 0);
      const shippingCalc = 0;
      const taxCalc = subtotalCalc * 0.21;
      const totalCalc = subtotalCalc + shippingCalc + taxCalc;
      await fetch('/api/orders/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderRef,
          items,
          totals: { subtotal: subtotalCalc, shipping: shippingCalc, tax: taxCalc, total: totalCalc },
          customer: {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
          },
          billing: useDifferentBilling ? {
            name: (document.getElementById('billingName') as HTMLInputElement | null)?.value || '',
            company: (document.getElementById('billingCompany') as HTMLInputElement | null)?.value || '',
            vat: (document.getElementById('billingVat') as HTMLInputElement | null)?.value || '',
          } : null,
          locale,
          bank: {
            accountName: BANK_ACCOUNT_NAME,
            bankName: BANK_NAME,
            iban: BANK_IBAN,
            bic: BANK_BIC,
          }
        })
      });
    } catch {}
    setStep(3);
  };

  // Cart data from store
  const cartItems = useCartStore(s => s.items);
  const subtotal: number = cartItems.reduce((sum: number, item: any) => sum + ((item.sku?.length || 1) * 10) * item.quantity, 0);
  const shipping: number = 0;
  const tax: number = subtotal * 0.21;
  const total: number = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto lg:max-w-none">
          {/* Progress Steps */}
          <nav aria-label="Progress" className="mb-12">
            <ol className="flex items-center">
              <li className={`relative pr-8 sm:pr-20 ${step >= 1 ? 'text-primary' : 'text-gray-500'}`}>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className={`h-0.5 w-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                </div>
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                  {step > 1 ? <FiCheckCircle className="w-5 h-5" /> : '1'}
                </div>
                <span className="mt-2 block text-sm font-medium">{t('checkout.steps.information')}</span>
              </li>
              
              <li className={`relative pr-8 sm:pr-20 ${step >= 2 ? 'text-primary' : 'text-gray-500'}`}>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className={`h-0.5 w-full ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                </div>
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                  {step > 2 ? <FiCheckCircle className="w-5 h-5" /> : '2'}
                </div>
                <span className="mt-2 block text-sm font-medium">{t('checkout.steps.payment')}</span>
              </li>
              
              <li className={`relative ${step >= 3 ? 'text-primary' : 'text-gray-500'}`}>
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-100'}">
                  3
                </div>
                <span className="mt-2 block text-sm font-medium">{t('checkout.steps.confirmation')}</span>
              </li>
            </ol>
          </nav>

          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="lg:grid lg:grid-cols-2 lg:gap-x-12">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">{t('checkout.contact_info')}</h2>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('checkout.email')}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>

                <h2 className="text-lg font-medium text-gray-900 mt-8 mb-6">{t('checkout.shipping_info')}</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">{t('checkout.first_name')}</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">{t('checkout.last_name')}</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">{t('checkout.address')}</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">{t('checkout.apartment_optional')}</label>
                  <input
                    type="text"
                    id="apartment"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">{t('checkout.city')}</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">{t('checkout.postal_code')}</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">{t('checkout.country')}</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  >
                    <option>{t('checkout.countries.be')}</option>
                    <option>{t('checkout.countries.nl')}</option>
                    <option>{t('checkout.countries.de')}</option>
                    <option>{t('checkout.countries.fr')}</option>
                    <option>{t('checkout.countries.lu')}</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('checkout.phone')}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>

                <div className="flex items-center mb-8">
                  <input
                    id="saveInfo"
                    name="saveInfo"
                    type="checkbox"
                    checked={formData.saveInfo}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="saveInfo" className="ml-2 block text-sm text-gray-700">
                    {t('checkout.save_info')}
                  </label>
                </div>

                <div className="flex justify-between">
                  <Link
                    href="/cart"
                    className="flex items-center text-sm font-medium text-primary hover:text-primary-dark"
                  >
                    <FiArrowLeft className="mr-1" /> {t('checkout.back_to_cart')}
                  </Link>
                  <button
                    type="submit"
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {t('checkout.continue_to_payment')}
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-10 lg:mt-0">
                <h2 className="text-lg font-medium text-gray-900 mb-6">{t('checkout.order_summary')}</h2>
                <div className="bg-white shadow rounded-lg">
                  <ul role="list" className="divide-y divide-gray-200 p-6">
                    {cartItems.map((item) => (
                      <li key={item.id} className="flex py-4">
                        <div className="flex-shrink-0 w-20 h-20 border border-gray-200 rounded-md overflow-hidden">
                          <img
                            src="/assets/front/images/placeholder-product.jpg"
                            alt={item.name}
                            className="w-full h-full object-center object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1 flex flex-col">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {item.name}
                            </h4>
                            <p className="mt-1 text-sm text-gray-500">{t('checkout.qty')} {item.quantity}</p>
                          </div>
                          <p className="mt-2 text-sm font-medium text-gray-900">
                            €{(((item?.sku?.length || 1) * 10) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-gray-200 p-6">
                    <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                      <p>{t('checkout.subtotal')}</p>
                      <p>€{subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <p>{t('checkout.shipping')}</p>
                      <p>{shipping === 0 ? t('checkout.free') : `€${shipping.toFixed(2)}`}</p>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-4">
                      <p>{t('checkout.tax_21')}</p>
                      <p>€{tax.toFixed(2)}</p>
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex justify-between text-base font-medium text-gray-900">
                      <p>{t('checkout.total')}</p>
                      <p>€{total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-2 lg:gap-x-12">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">{t('checkout.payment_method')}</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="credit-card"
                      name="paymentMethod"
                      type="radio"
                      value="credit-card"
                      checked={formData.paymentMethod === 'credit-card'}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <label htmlFor="credit-card" className="ml-3 block text-sm font-medium text-gray-700">
                      {t('checkout.payment.credit_card')}
                    </label>
                  </div>

                  {formData.paymentMethod === 'credit-card' && (
                    <div className="mt-4 space-y-4 pl-6">
                      <div>
                            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                              {t('checkout.card.number')}
                            </label>
                            <input
                              type="text"
                              id="cardNumber"
                              name="cardNumber"
                              required
                              value={formData.cardNumber}
                              onChange={handleChange}
                              placeholder="1234 1234 1234 1234"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700">
                                {t('checkout.card.expiry')}
                              </label>
                              <input
                                type="text"
                                id="cardExpiry"
                                name="cardExpiry"
                                required
                                value={formData.cardExpiry}
                                onChange={handleChange}
                                placeholder="MM/YY"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                              />
                            </div>
                            <div>
                              <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700">
                                {t('checkout.card.cvc')}
                              </label>
                              <input
                                type="text"
                                id="cardCvc"
                                name="cardCvc"
                                required
                                value={formData.cardCvc}
                                onChange={handleChange}
                                placeholder="CVC"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                              {t('checkout.card.name')}
                            </label>
                            <input
                              type="text"
                              id="cardName"
                              name="cardName"
                              required
                              value={formData.cardName}
                              onChange={handleChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <input
                          id="bank-transfer"
                          name="paymentMethod"
                          type="radio"
                          value="bank-transfer"
                          checked={formData.paymentMethod === 'bank-transfer'}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <label htmlFor="bank-transfer" className="ml-3 block text-sm font-medium text-gray-700">
                          {t('checkout.payment.bank_transfer')}
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="on-delivery"
                          name="paymentMethod"
                          type="radio"
                          value="on-delivery"
                          checked={formData.paymentMethod === 'on-delivery'}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <label htmlFor="on-delivery" className="ml-3 block text-sm font-medium text-gray-700">
                          {t('checkout.payment.cash_on_delivery')}
                        </label>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex items-center mb-6">
                        <input
                          id="terms"
                          name="terms"
                          type="checkbox"
                          required
                          checked={formData.terms}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                          {t('checkout.terms_prefix')}{' '}<a href="/terms" className="text-primary hover:text-primary-dark">{t('footer.terms')}</a>{' '}{t('checkout.and')}{' '}<a href="/privacy" className="text-primary hover:text-primary-dark">{t('footer.privacy')}</a>
                        </label>
                      </div>

                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex items-center text-sm font-medium text-primary hover:text-primary-dark"
                        >
                          <FiArrowLeft className="mr-1" /> {t('checkout.back_to_information')}
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          {t('checkout.complete_order')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="mt-10 lg:mt-0">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">{t('checkout.order_summary')}</h2>
                    <div className="bg-white shadow rounded-lg">
                      <ul role="list" className="divide-y divide-gray-200 p-6">
                        {cartItems.map((item) => (
                          <li key={item.id} className="flex py-4">
                            <div className="flex-shrink-0 w-20 h-20 border border-gray-200 rounded-md overflow-hidden">
                              <img
                                src="/assets/front/images/placeholder-product.jpg"
                                alt={item.name}
                                className="w-full h-full object-center object-cover"
                              />
                            </div>
                            <div className="ml-4 flex-1 flex flex-col">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </h4>
                                <p className="mt-1 text-sm text-gray-500">{t('checkout.qty')} {item.quantity}</p>
                              </div>
                              <p className="mt-2 text-sm font-medium text-gray-900">
                                €{(((item?.sku?.length || 1) * 10) * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="border-t border-gray-200 p-6">
                        <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                          <p>{t('checkout.subtotal')}</p>
                          <p>€{subtotal.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <p>{t('checkout.shipping')}</p>
                          <p>{shipping === 0 ? t('checkout.free') : `€${shipping.toFixed(2)}`}</p>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mb-4">
                          <p>{t('checkout.tax_21')}</p>
                          <p>€{tax.toFixed(2)}</p>
                        </div>
                        <div className="border-t border-gray-200 pt-4 flex justify-between text-base font-medium text-gray-900">
                          <p>{t('checkout.total')}</p>
                          <p>€{total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {step === 3 && (
                <div className="text-center py-12">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <FiCheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="mt-4 text-2xl font-extrabold text-gray-900">{t('checkout.confirmed.title')}</h2>
                  <p className="mt-2 text-gray-600">{t('checkout.confirmed.subtitle')}</p>
                  <div className="mt-4 max-w-lg mx-auto text-left bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{t('checkout.bank.transfer_title')}</h3>
                    <ul className="text-sm text-gray-700 list-disc ml-5 space-y-1">
                      {BANK_ACCOUNT_NAME ? <li>{t('checkout.bank.account_name')}: <span className="font-medium">{BANK_ACCOUNT_NAME}</span></li> : null}
                      {BANK_NAME ? <li>{t('checkout.bank.bank_name')}: <span className="font-medium">{BANK_NAME}</span></li> : null}
                      {BANK_IBAN ? <li>{t('checkout.bank.iban')}: <span className="font-medium">{BANK_IBAN}</span></li> : null}
                      {BANK_BIC ? <li>{t('checkout.bank.bic')}: <span className="font-medium">{BANK_BIC}</span></li> : null}
                      <li>{t('checkout.bank.reference')}: <span className="font-medium">{orderRef}</span></li>
                    </ul>
                    <p className="mt-3 text-sm text-gray-600">{t('checkout.bank.note')}</p>
                  </div>
                  <div className="mt-8">
                    <Link
                      href="/products"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      {t('cart.actions.continue_shopping')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
