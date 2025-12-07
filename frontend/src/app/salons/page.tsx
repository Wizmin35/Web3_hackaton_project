'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  MapPin, 
  Star, 
  Clock, 
  Phone,
  Search,
  Sparkles,
  ChevronRight
} from 'lucide-react'

const salons = [
  {
    id: '1',
    name: 'Studio Hair',
    description: 'Moderni frizerski salon s vrhunskim majstorima i najnovijim tehnikama',
    address: 'Ilica 50',
    city: 'Zagreb',
    rating: 4.9,
    reviewCount: 124,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
    services: ['Šišanje', 'Bojanje', 'Styling'],
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
    services: ['Šišanje', 'Manikura', 'Pedikura'],
    openNow: true,
    priceRange: '€€€',
  },
  {
    id: '3',
    name: 'Nail Art Studio',
    description: 'Specijalizirani salon za umjetnost na noktima i gel tehnike',
    address: 'Vlaška 90',
    city: 'Zagreb',
    rating: 5.0,
    reviewCount: 67,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600',
    services: ['Manikura', 'Pedikura', 'Gel nokti', 'Nail art'],
    openNow: false,
    priceRange: '€€',
  },
  {
    id: '4',
    name: 'Color Studio',
    description: 'Eksperti za bojanje kose i moderne tehnike kao balayage i ombre',
    address: 'Korzo 15',
    city: 'Rijeka',
    rating: 4.7,
    reviewCount: 52,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
    services: ['Bojanje', 'Pramenovi', 'Balayage'],
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
    services: ['Šišanje', 'Styling', 'Tretmani'],
    openNow: true,
    priceRange: '€€€',
  },
  {
    id: '6',
    name: 'Glamour Salon',
    description: 'Profesionalni tim za frizure za svečanosti i vjenčanja',
    address: 'Europska avenija 8',
    city: 'Osijek',
    rating: 4.6,
    reviewCount: 43,
    image: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=600',
    services: ['Svečane frizure', 'Šminkanje', 'Styling'],
    openNow: false,
    priceRange: '€€',
  },
]

const cities = ['Svi gradovi', 'Zagreb', 'Split', 'Rijeka', 'Osijek']

export default function SalonsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('Svi gradovi')

  const filteredSalons = salons.filter(salon => {
    const matchesSearch = salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         salon.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCity = selectedCity === 'Svi gradovi' || salon.city === selectedCity
    return matchesSearch && matchesCity
  })

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            Pronađite savršen salon
          </h1>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
            Pregledajte najbolje ocijenjene salone u vašoj blizini
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            {/* Search */}
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Pretraži salone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12"
              />
            </div>

            {/* City filter */}
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="input-field pl-12 pr-10 appearance-none cursor-pointer min-w-[180px]"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 rotate-90 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Salons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSalons.map((salon, index) => (
            <motion.div
              key={salon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/salons/${salon.id}`}>
                <div className="card group cursor-pointer h-full overflow-hidden p-0">
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
                      <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
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
                    <div className="flex flex-wrap gap-2">
                      {salon.services.slice(0, 3).map((service, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                      {salon.services.length > 3 && (
                        <span className="px-3 py-1 bg-primary-50 text-primary-600 text-xs rounded-full">
                          +{salon.services.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredSalons.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Nema salona
            </h3>
            <p className="text-neutral-500">
              Pokušajte s drugim gradom ili pojmom za pretraživanje
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}


