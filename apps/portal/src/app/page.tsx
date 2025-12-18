import Link from 'next/link'

const companies = [
  {
    id: 'dema',
    name: 'DEMA',
    tagline: 'Pumps, Pipes & Tools',
    description: 'Quality products for agriculture, construction, and industry',
    color: 'bg-blue-600',
    products: ['Pumps', 'Pipes', 'Fittings', 'Hoses', 'Power Tools', 'Irrigation'],
  },
  {
    id: 'fluxer',
    name: 'Fluxer',
    tagline: 'Process Flow Experts',
    description: 'Industrial valves, instrumentation, and process control',
    color: 'bg-orange-600',
    products: ['Ball Valves', 'Gate Valves', 'Control Valves', 'Actuators', 'Instrumentation'],
  },
  {
    id: 'beltz247',
    name: 'Beltz247',
    tagline: '24/7 Conveyor Solutions',
    description: 'Industrial conveyor belts and mechanical maintenance',
    color: 'bg-green-600',
    products: ['Conveyor Belts', 'FDA/HACCP Belts', 'Maintenance', '24/7 Service'],
  },
  {
    id: 'devisschere',
    name: 'De Visschere Technics',
    tagline: 'Irrigation Specialists',
    description: 'Design, installation, and maintenance of irrigation systems',
    color: 'bg-cyan-600',
    products: ['Garden Irrigation', 'Drip Systems', 'Sprinklers', 'Water Technology'],
  },
  {
    id: 'accu',
    name: 'Accu Components',
    tagline: 'Precision Engineering',
    description: '500,000+ precision components for engineering and manufacturing',
    color: 'bg-purple-600',
    products: ['Fasteners', 'Standoffs', 'Washers', 'Nuts', 'Custom Parts'],
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              DEMA Group
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Your unified industrial partner for pumps, valves, pipes, tools, conveyors, and precision components.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/products" 
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition"
              >
                Browse All Products
              </Link>
              <Link 
                href="/contact" 
                className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-lg font-semibold transition"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600">5</div>
              <div className="text-slate-600">Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">50,000+</div>
              <div className="text-slate-600">Products</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">25+</div>
              <div className="text-slate-600">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">24/7</div>
              <div className="text-slate-600">Service Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Grid */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Companies</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/${company.id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-6 group"
              >
                <div className={`w-12 h-12 ${company.color} rounded-lg mb-4 flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">
                    {company.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1 group-hover:text-blue-600 transition">
                  {company.name}
                </h3>
                <p className="text-sm text-slate-500 mb-2">{company.tagline}</p>
                <p className="text-slate-600 text-sm mb-4">{company.description}</p>
                <div className="flex flex-wrap gap-2">
                  {company.products.slice(0, 4).map((product) => (
                    <span
                      key={product}
                      className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded"
                    >
                      {product}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help Finding Products?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Our AI-powered product assistant can help you find the right products for your project. 
            Available in Dutch, English, and French.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
            Start Chat with Product Assistant
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">DEMA Group</h3>
              <p className="text-slate-400 text-sm">
                Your unified industrial partner for quality products and expert service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Companies</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                {companies.map((c) => (
                  <li key={c.id}>
                    <Link href={`/${c.id}`} className="hover:text-white transition">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Ovenstraat 11</li>
                <li>8800 Roeselare, Belgium</li>
                <li>+32 (0)51 20 51 41</li>
                <li>info@demagroup.be</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Languages</h4>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-slate-800 rounded text-sm hover:bg-slate-700">NL</button>
                <button className="px-3 py-1 bg-slate-800 rounded text-sm hover:bg-slate-700">EN</button>
                <button className="px-3 py-1 bg-slate-800 rounded text-sm hover:bg-slate-700">FR</button>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-sm">
            © 2024 DEMA Group. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}
