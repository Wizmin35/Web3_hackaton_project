'use client'

import Link from 'next/link'
import { Sparkles, Github, Twitter, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-2xl font-bold gradient-text">
                GlamBook
              </span>
            </Link>
            <p className="text-neutral-600 max-w-sm">
              Budućnost rezervacija. Rezervirajte frizerske i kozmetičke usluge 
              i plaćajte kriptovalutama na Solana blockchainu.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-pink-50 hover:text-pink-600 transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-pink-50 hover:text-pink-600 transition-all"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:info@glambook.hr"
                className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-pink-50 hover:text-pink-600 transition-all"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">Brzi linkovi</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/services" className="text-neutral-600 hover:text-pink-600 transition-colors">
                  Usluge
                </Link>
              </li>
              <li>
                <Link href="/salons" className="text-neutral-600 hover:text-pink-600 transition-colors">
                  Saloni
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="text-neutral-600 hover:text-pink-600 transition-colors">
                  Moje rezervacije
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-neutral-600 hover:text-pink-600 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">Informacije</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-neutral-600 hover:text-pink-600 transition-colors">
                  O nama
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-neutral-600 hover:text-pink-600 transition-colors">
                  Pravila otkazivanja
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-neutral-600 hover:text-pink-600 transition-colors">
                  Privatnost
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-neutral-600 hover:text-pink-600 transition-colors">
                  Uvjeti korištenja
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-sm">
            © 2024 GlamBook. Sva prava pridržana.
          </p>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span>Powered by</span>
            <span className="font-semibold text-neutral-700">Solana</span>
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195]" />
          </div>
        </div>
      </div>
    </footer>
  )
}
