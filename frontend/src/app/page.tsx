'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { 
  Scissors, 
  Sparkles, 
  Shield, 
  Zap, 
  Clock, 
  ArrowRight,
  Star,
  CheckCircle2,
  Wallet
} from 'lucide-react'

const services = [
  {
    id: 1,
    name: 'Šišanje',
    description: 'Profesionalno muško i žensko šišanje',
    price: '0.1 SOL',
    priceEur: '~20€',
    duration: '30 min',
    icon: Scissors,
    color: 'from-blue-500 to-cyan-500',
    popular: true,
  },
  {
    id: 2,
    name: 'Lakiranje noktiju',
    description: 'Gel lakiranje i nail art dizajn',
    price: '0.15 SOL',
    priceEur: '~30€',
    duration: '45 min',
    icon: Sparkles,
    color: 'from-pink-500 to-rose-500',
    popular: true,
  },
  {
    id: 3,
    name: 'Manikura',
    description: 'Kompletna njega noktiju',
    price: '0.08 SOL',
    priceEur: '~15€',
    duration: '30 min',
    icon: Sparkles,
    color: 'from-purple-500 to-violet-500',
    popular: false,
  },
  {
    id: 4,
    name: 'Bojanje kose',
    description: 'Profesionalno bojanje i pramenovi',
    price: '0.25 SOL',
    priceEur: '~50€',
    duration: '90 min',
    icon: Scissors,
    color: 'from-amber-500 to-orange-500',
    popular: false,
  },
]

const features = [
  {
    icon: Wallet,
    title: 'Phantom Wallet',
    description: 'Sigurna prijava putem vašeg kripto novčanika',
  },
  {
    icon: Shield,
    title: 'Siguran escrow',
    description: 'Sredstva su zaštićena smart contractom do završetka usluge',
  },
  {
    icon: Zap,
    title: 'Instant transakcije',
    description: 'Brze i jeftine transakcije na Solana mreži',
  },
  {
    icon: Clock,
    title: 'Fleksibilno otkazivanje',
    description: 'Transparentna pravila povrata sredstava',
  },
]

const refundPolicy = [
  { time: '> 48 sati', refund: '100%', fee: '0€' },
  { time: '24-48 sati', refund: '80%', fee: '2€' },
  { time: '< 24 sata', refund: '50%', fee: '5€' },
  { time: 'No-show', refund: '0%', fee: '10€' },
]

export default function HomePage() {
  const { connected } = useWallet()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 hero-bg overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-200 rounded-full blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-600 font-medium text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                Budućnost rezervacija je tu
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-neutral-900 mb-6"
            >
              Rezervirajte usluge,{' '}
              <span className="gradient-text">platite kriptom</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto"
            >
              Moderna platforma za rezervaciju frizerskih i kozmetičkih usluga. 
              Plaćajte sigurno putem Solana blockchaina s automatskim povratom sredstava.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {connected ? (
                <Link href="/services" className="btn-primary flex items-center gap-2">
                  Pregledaj usluge
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <WalletMultiButton />
              )}
              <Link href="/salons" className="btn-secondary flex items-center gap-2">
                Pronađi salon
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-neutral-900">50+</div>
                <div className="text-sm text-neutral-500">Salona</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-neutral-900">1000+</div>
                <div className="text-sm text-neutral-500">Rezervacija</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-neutral-900">4.9</div>
                <div className="text-sm text-neutral-500 flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  Ocjena
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
              Popularne usluge
            </h2>
            <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
              Odaberite uslugu i rezervirajte termin u samo nekoliko klikova
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/services/${service.id}`}>
                    <div className="card service-card group cursor-pointer h-full">
                      {service.popular && (
                        <span className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs font-semibold rounded-full">
                          Popularno
                        </span>
                      )}
                      
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                        {service.name}
                      </h3>
                      <p className="text-neutral-500 text-sm mb-4">
                        {service.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                        <div>
                          <div className="text-lg font-bold text-neutral-900">{service.price}</div>
                          <div className="text-xs text-neutral-400">{service.priceEur}</div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-neutral-500">
                          <Clock className="w-4 h-4" />
                          {service.duration}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/services" className="btn-secondary inline-flex items-center gap-2">
              Vidi sve usluge
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
              Zašto SolBook?
            </h2>
            <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
              Kombinacija Web3 tehnologije i jednostavnog korisničkog iskustva
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-soft flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-500">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Refund Policy Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
                Transparentna pravila{' '}
                <span className="gradient-text">povrata</span>
              </h2>
              <p className="text-xl text-neutral-500 mb-8">
                Smart contract automatski izračunava i provodi povrat sredstava 
                prema jasno definiranim pravilima. Bez skrivenih naknada.
              </p>
              
              <ul className="space-y-4">
                {[
                  'Automatski povrat na vaš wallet',
                  'Transparentni izračun na blockchainu',
                  'Pravedna naknada za salon',
                  'Samo 3% provizija platforme',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-neutral-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="card overflow-hidden">
                <div className="bg-gradient-to-r from-primary-500 to-accent-500 -mx-6 -mt-6 px-6 py-4 mb-6">
                  <h3 className="text-white font-semibold text-lg">Politika otkazivanja</h3>
                </div>
                
                <div className="space-y-4">
                  {refundPolicy.map((policy, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
                    >
                      <div className="font-medium text-neutral-700">{policy.time}</div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{policy.refund}</div>
                          <div className="text-xs text-neutral-400">Povrat</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-neutral-900">{policy.fee}</div>
                          <div className="text-xs text-neutral-400">Naknada</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-neutral-900 to-neutral-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-6">
              Spremni za budućnost rezervacija?
            </h2>
            <p className="text-xl text-neutral-300 mb-10 max-w-2xl mx-auto">
              Povežite svoj Phantom wallet i rezervirajte prvi termin danas. 
              Jednostavno, sigurno, decentralizirano.
            </p>
            
            {connected ? (
              <Link href="/services" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
                Započni rezervaciju
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <WalletMultiButton />
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}


