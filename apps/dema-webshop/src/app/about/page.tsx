import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* About Us Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">About DEMA</h1>
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
              For agri- and horticulture, both the individual grower and industrial processing, DEMA has various types of sprinklers, irrigation systems, water pumps and all kinds of fixed or flexible pipes.
            </p>
            <p>
              Besides agriculture and horticulture, building contractors, gardeners, installers, all kinds of craftsmen and industrial customers will find a wide range of quality products from leading brands. The experienced employees guarantee specific professional advice when selecting spare parts or machinery. Service and support to the customer are core values at DEMA. On request DEMA supports the customer by means of project management. In this case we help to determine which pump, pipe, nozzle or material is the best for your project.
            </p>
          </div>
        </div>
        
        {/* Back to Home Link */}
        <div className="mt-8">
          <Link 
            href="/" 
            className="text-primary-600 hover:text-primary-800 font-medium"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
