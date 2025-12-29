'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { companies } from '@/config/brands'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-slate-900 text-slate-100 py-12" role="contentinfo" aria-label="Footer">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">DEMA Group</h3>
            <p className="text-slate-200 text-sm">
              {t.footer.description}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t.footer.companies}</h4>
            <ul className="space-y-2 text-slate-300 text-sm">
              {companies.map((c) => (
                <li key={c.id}>
                  <Link href={`/company/${c.id}`} className="hover:text-white focus:text-white transition underline">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t.footer.contact}</h4>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>Ovenstraat 11</li>
              <li>8800 Roeselare, Belgium</li>
              <li>+32 (0)51 20 51 41</li>
              <li>info@demagroup.be</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t.common.languages}</h4>
            <LanguageSwitcher />
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-200 text-sm">
          © {new Date().getFullYear()} DEMA Group. {t.footer.allRightsReserved}
        </div>
      </div>
    </footer>
  )
}
