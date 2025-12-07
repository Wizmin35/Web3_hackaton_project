'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Scissors, 
  Sparkles, 
  Clock, 
  Search,
  Filter,
  Star,
  MapPin,
  ChevronRight
} from 'lucide-react'
import clsx from 'clsx'

const categories = [
  { id: 'haircut', name: 'Šišanje', icon: Scissors, description: 'Muško i žensko šišanje' },
  { id: 'nails', name: 'Nokti', icon: Sparkles, description: 'Manikura, pedikura i gel lakiranje' },
  { id: 'styling', name: 'Styling', icon: Scissors, description: 'Frizure za svečanosti i styling' },
  { id: 'coloring', name: 'Bojanje', icon: Sparkles, description: 'Bojanje kose, pramenovi i balayage' },
]

// Salons grouped by category
const salonsByCategory = {
  haircut: [
    {
      id: '1',
      name: 'Studio Hair',
      description: 'Moderni frizerski salon s vrhunskim majstorima i najnovijim tehnikama',
      address: 'Ilica 50',
      city: 'Zagreb',
      rating: 4.9,
      reviewCount: 124,
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
      services: ['Muško šišanje', 'Žensko šišanje'],
      openNow: true,
      priceRange: '€€',
    },
    {
      id: '2',
      name: 'Beauty Lounge',
      description: 'Luksuzni salon za njegu kose i noktiju u srcu grada',
      address: 'Riva 12',
      city: 'Split',
      rating: 4.8,
      reviewCount: 89,
      image: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=600',
      services: ['Žensko šišanje', 'Styling'],
      openNow: true,
      priceRange: '€€€',
    },
    {
      id: '5',
      name: 'Hair Boutique',
      description: 'Ekskluzivni salon s personaliziranim pristupom svakom klijentu',
      address: 'Tkalčićeva 25',
      city: 'Zagreb',
      rating: 4.9,
      reviewCount: 98,
      image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600',
      services: ['Muško šišanje', 'Žensko šišanje', 'Styling'],
      openNow: true,
      priceRange: '€€€',
    },
  ],
  nails: [
    {
      id: '3',
      name: 'Nail Art Studio',
      description: 'Specijalizirani salon za umjetnost na noktima i gel tehnike',
      address: 'Vlaška 90',
      city: 'Zagreb',
      rating: 5.0,
      reviewCount: 67,
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600',
      services: ['Gel lakiranje', 'Manikura', 'Pedikura'],
      openNow: false,
      priceRange: '€€',
    },
    {
      id: '2',
      name: 'Beauty Lounge',
      description: 'Luksuzni salon za njegu kose i noktiju u srcu grada',
      address: 'Riva 12',
      city: 'Split',
      rating: 4.8,
      reviewCount: 89,
      image: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=600',
      services: ['Manikura', 'Pedikura'],
      openNow: true,
      priceRange: '€€€',
    },
  ],
  styling: [
    {
      id: '6',
      name: 'Glamour Salon',
      description: 'Profesionalni tim za frizure za svečanosti i vjenčanja',
      address: 'Europska avenija 8',
      city: 'Osijek',
      rating: 4.6,
      reviewCount: 43,
      image: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=600',
      services: ['Frizura za svečanost', 'Styling'],
      openNow: false,
      priceRange: '€€',
    },
    {
      id: '2',
      name: 'Beauty Lounge',
      description: 'Luksuzni salon za njegu kose i noktiju u srcu grada',
      address: 'Riva 12',
      city: 'Split',
      rating: 4.8,
      reviewCount: 89,
      image: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=600',
      services: ['Styling', 'Frizure za svečanost'],
      openNow: true,
      priceRange: '€€€',
    },
    {
      id: '5',
      name: 'Hair Boutique',
      description: 'Ekskluzivni salon s personaliziranim pristupom svakom klijentu',
      address: 'Tkalčićeva 25',
      city: 'Zagreb',
      rating: 4.9,
      reviewCount: 98,
      image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600',
      services: ['Styling', 'Frizure za svečanost'],
      openNow: true,
      priceRange: '€€€',
    },
  ],
  coloring: [
    {
      id: '4',
      name: 'Color Studio',
      description: 'Eksperti za bojanje kose i moderne tehnike kao balayage i ombre',
      address: 'Korzo 15',
      city: 'Rijeka',
      rating: 4.7,
      reviewCount: 52,
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
      services: ['Pramenovi', 'Balayage', 'Bojanje'],
      openNow: true,
      priceRange: '€€€',
    },
    {
      id: '5',
      name: 'Hair Boutique',
      description: 'Ekskluzivni salon s personaliziranim pristupom svakom klijentu',
      address: 'Tkalčićeva 25',
      city: 'Zagreb',
      rating: 4.9,
      reviewCount: 98,
      image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600',
      services: ['Balayage', 'Pramenovi'],
      openNow: true,
      priceRange: '€€€',
    },
  ],
}

// Service mapping for booking
const serviceMapping: Record<string, Record<string, string>> = {
  '1': { // Studio Hair
    'Muško šišanje': '1',
    'Žensko šišanje': '2',
  },
  '2': { // Beauty Lounge
    'Žensko šišanje': '2',
    'Manikura': '4',
    'Pedikura': '8',
    'Styling': '7',
  },
  '3': { // Nail Art Studio
    'Gel lakiranje': '3',
    'Manikura': '4',
    'Pedikura': '8',
  },
  '4': { // Color Studio
    'Pramenovi': '5',
    'Balayage': '6',
    'Bojanje': '6',
  },
  '5': { // Hair Boutique
    'Muško šišanje': '1',
    'Žensko šišanje': '2',
    'Styling': '7',
    'Balayage': '6',
    'Pramenovi': '5',
  },
  '6': { // Glamour Salon
    'Frizura za svečanost': '7',
    'Styling': '7',
  },
}

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleSalonClick = (salonId: string, serviceName: string) => {
    // Find the service ID from mapping
    const serviceId = serviceMapping[salonId]?.[serviceName]
    if (serviceId) {
      // Store salon info and selected service in sessionStorage for booking page
      const salon = salonsByCategory[selectedCategory as keyof typeof salonsByCategory]?.find(s => s.id === salonId)
      if (salon) {
        const salonData = {
          id: salon.id,
          name: salon.name,
          address: salon.address,
          city: salon.city,
          selectedService: serviceName, // Store the selected service name
        }
        sessionStorage.setItem('selectedSalon', JSON.stringify(salonData))
      }
      // Navigate to booking page with salon ID and service name
      window.location.href = `/book/${serviceId}?salon=${salonId}&service=${encodeURIComponent(serviceName)}`
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            Odaberite opciju i salon
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Pronađite salon koji nudi uslugu koju tražite i rezervirajte termin
          </p>
        </motion.div>

        {/* Category Options */}
        {!selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {categories.map((category, index) => {
              const Icon = category.icon
              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className="card group cursor-pointer hover:shadow-soft-lg transition-all text-left"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2 group-hover:text-pink-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-neutral-500 text-sm mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center gap-2 text-pink-600 font-medium">
                    <span>Pregledaj salone</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        )}

        {/* Salons for selected category */}
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Back button */}
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
              Natrag na opcije
            </button>

            {/* Category header */}
            <div className="mb-8">
              {(() => {
                const category = categories.find(c => c.id === selectedCategory)
                const Icon = category?.icon
                return (
                  <div className="flex items-center gap-4">
                    {Icon && (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-3xl font-bold text-neutral-900">{category?.name}</h2>
                      <p className="text-neutral-500">{category?.description}</p>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Salons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {salonsByCategory[selectedCategory as keyof typeof salonsByCategory]?.map((salon, index) => (
                <motion.div
                  key={salon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card group cursor-pointer h-full overflow-hidden p-0"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={salon.image}
                      alt={salon.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Status badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        salon.openNow 
                          ? 'bg-green-500 text-white' 
                          : 'bg-neutral-800 text-white'
                      }`}>
                        {salon.openNow ? 'Otvoreno' : 'Zatvoreno'}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-sm">{salon.rating}</span>
                        <span className="text-neutral-500 text-sm">({salon.reviewCount})</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-pink-600 transition-colors">
                        {salon.name}
                      </h3>
                      <span className="text-neutral-500 font-medium">{salon.priceRange}</span>
                    </div>
                    
                    <p className="text-neutral-500 text-sm mb-4 line-clamp-2">
                      {salon.description}
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>{salon.address}, {salon.city}</span>
                    </div>

                    {/* Services */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-neutral-900 mb-2">Dostupne usluge:</p>
                      <div className="flex flex-wrap gap-2">
                        {salon.services.map((service, i) => (
                          <button
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSalonClick(salon.id, service)
                            }}
                            className="px-3 py-1.5 bg-pink-50 text-pink-600 text-xs rounded-full hover:bg-pink-100 transition-colors font-medium"
                          >
                            {service}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Book button */}
                    <button
                      onClick={() => {
                        // Book first available service
                        if (salon.services.length > 0) {
                          handleSalonClick(salon.id, salon.services[0])
                        }
                      }}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      Rezerviraj termin
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}


