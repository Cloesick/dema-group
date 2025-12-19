import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navigation */}
      <nav className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="font-bold text-lg">
                DEMA Group
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-300">Admin Portal</span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/admin"
                className="text-sm hover:text-blue-400 transition-colors"
              >
                PIM Import
              </Link>
              <Link
                href="/admin/products"
                className="text-sm hover:text-blue-400 transition-colors"
              >
                Products
              </Link>
              <Link
                href="/admin/exports"
                className="text-sm hover:text-blue-400 transition-colors"
              >
                Exports
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {children}
    </div>
  )
}
