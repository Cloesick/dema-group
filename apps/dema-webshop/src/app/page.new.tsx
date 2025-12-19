import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                DemaWebshop
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/products" className="text-gray-700 hover:text-primary px-3 py-2">
                Products
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-primary px-3 py-2">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary px-3 py-2">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to DemaWebshop
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Your one-stop shop for quality products and professional equipment.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/products"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark md:py-4 md:text-lg md:px-10"
            >
              Shop Now
            </Link>
            <Link
              href="/categories"
              className="px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
