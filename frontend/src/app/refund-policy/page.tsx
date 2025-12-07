'use client'

import { motion } from 'framer-motion'
import { Shield, Clock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const refundTiers = [
  {
    time: '> 48 sati prije termina',
    refund: '100%',
    salonFee: '0€',
    appCommission: '0€',
    description: 'Puni povrat novca bez ikakvih naknada',
    color: 'from-green-500 to-emerald-500',
  },
  {
    time: '24-48 sati prije termina',
    refund: '80%',
    salonFee: '2€',
    appCommission: '0.06€',
    description: '80% povrata klijentu, 2€ naknada salonu',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    time: '< 24 sata prije termina',
    refund: '50%',
    salonFee: '5€',
    appCommission: '0.15€',
    description: '50% povrata klijentu, 5€ naknada salonu',
    color: 'from-amber-500 to-orange-500',
  },
  {
    time: 'No-show',
    refund: '0%',
    salonFee: '10€',
    appCommission: '0.30€',
    description: 'Bez povrata, puna naknada salonu',
    color: 'from-red-500 to-rose-500',
  },
]

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-primary-500" />
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            Politika otkazivanja i povrata
          </h1>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
            Transparentna pravila za zaštitu i klijenata i salona. 
            Smart contract automatski provodi povrate prema ovim pravilima.
          </p>
        </motion.div>

        {/* Refund tiers */}
        <div className="space-y-6 mb-16">
          {refundTiers.map((tier, index) => (
            <motion.div
              key={tier.time}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className={`w-full md:w-32 h-24 md:h-auto flex items-center justify-center bg-gradient-to-br ${tier.color} rounded-xl md:-ml-6 md:-my-6 md:rounded-l-none`}>
                  <Clock className="w-8 h-8 text-white" />
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                    {tier.time}
                  </h3>
                  <p className="text-neutral-500 mb-4">
                    {tier.description}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{tier.refund}</div>
                      <div className="text-xs text-neutral-500">Povrat klijentu</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-neutral-900">{tier.salonFee}</div>
                      <div className="text-xs text-neutral-500">Naknada salonu</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary-600">{tier.appCommission}</div>
                      <div className="text-xs text-neutral-500">Provizija (3%)</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="font-display text-2xl font-bold text-neutral-900 mb-8 text-center">
            Kako funkcionira povrat?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Otkazivanje</h3>
              <p className="text-neutral-500 text-sm">
                Klijent pokreće otkazivanje kroz aplikaciju
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Smart Contract</h3>
              <p className="text-neutral-500 text-sm">
                Automatski izračun povrata prema pravilima na blockchainu
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Isplata</h3>
              <p className="text-neutral-500 text-sm">
                Instant prijenos na wallet klijenta i salona
              </p>
            </div>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card bg-gradient-to-br from-primary-50 to-accent-50 mb-16"
        >
          <h2 className="font-display text-2xl font-bold text-neutral-900 mb-6">
            Zašto je ovo dobro za sve?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Za klijente
              </h3>
              <ul className="space-y-2 text-neutral-600">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-primary-500 mt-1 flex-shrink-0" />
                  Transparentna pravila bez skrivenih naknada
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-primary-500 mt-1 flex-shrink-0" />
                  Automatski povrat bez čekanja
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-primary-500 mt-1 flex-shrink-0" />
                  Puni povrat kod pravovremenog otkazivanja
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Za salone
              </h3>
              <ul className="space-y-2 text-neutral-600">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-primary-500 mt-1 flex-shrink-0" />
                  Zaštita od kasnih otkazivanja i no-show
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-primary-500 mt-1 flex-shrink-0" />
                  Pravedna kompenzacija za izgubljeno vrijeme
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-primary-500 mt-1 flex-shrink-0" />
                  Automatska isplata na wallet
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-2xl font-bold text-neutral-900 mb-8 text-center">
            Česta pitanja
          </h2>
          
          <div className="space-y-4">
            {[
              {
                q: 'Što ako salon otkaže termin?',
                a: 'U slučaju da salon otkaže termin, klijent dobiva 100% povrat sredstava bez obzira na vrijeme otkazivanja.',
              },
              {
                q: 'Koliko traje prijenos sredstava?',
                a: 'Na Solana mreži transakcije se potvrđuju u roku od nekoliko sekundi. Sredstva su dostupna odmah.',
              },
              {
                q: 'Zašto postoji naknada za kasno otkazivanje?',
                a: 'Kasno otkazivanje šteti salonu jer ne mogu popuniti termin. Naknada kompenzira izgubljeni prihod i motivira pravovremeno otkazivanje.',
              },
              {
                q: 'Mogu li vidjeti transakcije na blockchainu?',
                a: 'Da! Sve transakcije su transparentne i vidljive na Solana Explorer. Link na transakciju dobivate uz svaku rezervaciju.',
              },
            ].map((faq, index) => (
              <div key={index} className="card">
                <h3 className="font-semibold text-neutral-900 mb-2 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  {faq.q}
                </h3>
                <p className="text-neutral-500 ml-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Link href="/services" className="btn-primary inline-flex items-center gap-2">
            Rezerviraj termin
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}


