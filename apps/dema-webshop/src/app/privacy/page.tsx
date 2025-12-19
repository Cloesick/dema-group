export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about products, services, and promotions</li>
            <li>Improve our website and customer service</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Cookies</h2>
          <p className="text-gray-700 mb-4">
            We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can manage your cookie preferences through our cookie consent banner.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing and accidental loss, destruction, or damage.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
          <p className="text-gray-700 mb-4">
            You have the right to access, correct, or delete your personal data. You may also object to or restrict certain processing of your data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about this Privacy Policy, please contact us.
          </p>
        </section>
      </div>
    </div>
  );
}
