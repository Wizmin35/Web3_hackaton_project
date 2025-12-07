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
  MapPin
} from 'lucide-react'
import clsx from 'clsx'

const categories = [
  { id: 'all', name: 'Sve', icon: Sparkles },
  { id: 'haircut', name: 'Šišanje', icon: Scissors },
  { id: 'nails', name: 'Nokti', icon: Sparkles },
  { id: 'styling', name: 'Styling', icon: Scissors },
  { id: 'coloring', name: 'Bojanje', icon: Sparkles },
]

const services = [
  {
    id: '1',
    name: 'Muško šišanje',
    description: 'Klasično muško šišanje s pranjem kose i stiliziranjem',
    category: 'haircut',
    price: '0.1 SOL',
    priceEur: '~20€',
    duration: 30,
    salon: { name: 'Studio Hair', city: 'Zagreb', rating: 4.9 },
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
    popular: true,
  },
  {
    id: '2',
    name: 'Žensko šišanje',
    description: 'Profesionalno žensko šišanje i oblikovanje frizure',
    category: 'haircut',
    price: '0.15 SOL',
    priceEur: '~30€',
    duration: 45,
    salon: { name: 'Beauty Lounge', city: 'Split', rating: 4.8 },
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    popular: true,
  },
  {
    id: '3',
    name: 'Gel lakiranje',
    description: 'Trajno gel lakiranje noktiju s pripremom i oblikovanjem',
    category: 'nails',
    price: '0.12 SOL',
    priceEur: '~25€',
    duration: 60,
    salon: { name: 'Nail Art Studio', city: 'Zagreb', rating: 5.0 },
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
    popular: true,
  },
  {
    id: '4',
    name: 'Manikura',
    description: 'Kompletna njega noktiju s lakiranjem po izboru',
    category: 'nails',
    price: '0.08 SOL',
    priceEur: '~15€',
    duration: 30,
    salon: { name: 'Nail Art Studio', city: 'Zagreb', rating: 5.0 },
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400',
    popular: false,
  },
  {
    id: '5',
    name: 'Pramenovi',
    description: 'Profesionalni pramenovi s kvalitetnim bojama',
    category: 'coloring',
    price: '0.3 SOL',
    priceEur: '~60€',
    duration: 120,
    salon: { name: 'Color Studio', city: 'Rijeka', rating: 4.7 },
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
    popular: false,
  },
  {
    id: '6',
    name: 'Balayage',
    description: 'Moderna tehnika bojanja za prirodan izgled',
    category: 'coloring',
    price: '0.4 SOL',
    priceEur: '~80€',
    duration: 150,
    salon: { name: 'Hair Boutique', city: 'Zagreb', rating: 4.9 },
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400',
    popular: true,
  },
  {
    id: '7',
    name: 'Frizura za svečanost',
    description: 'Elegantna frizura za posebne prigode',
    category: 'styling',
    price: '0.25 SOL',
    priceEur: '~50€',
    duration: 60,
    salon: { name: 'Glamour Salon', city: 'Osijek', rating: 4.6 },
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
    popular: false,
  },
  {
    id: '8',
    name: 'Pedikura',
    description: 'Profesionalna pedikura s masažom stopala',
    category: 'nails',
    price: '0.1 SOL',
    priceEur: '~20€',
    duration: 45,
    salon: { name: 'Nail Art Studio', city: 'Zagreb', rating: 5.0 },
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400',
    popular: false,
  },
]

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
            Pronađite savršenu uslugu
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Pregledajte sve dostupne usluge i rezervirajte termin koji vam odgovara
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          {/* Search */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-900" />
            <input
              type="text"
              placeholder="Pretraži usluge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12 text-lg"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={clsx(
                    'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200',
                    selectedCategory === category.id
                      ? 'bg-pink-500 text-neutral-900 shadow-glow'
                      : 'bg-white text-neutral-900 border border-pink-200 hover:border-pink-300 hover:text-pink-600'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/book/${service.id}`}>
                <div className="card service-card group cursor-pointer h-full overflow-hidden p-0">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {service.popular && (
                      <span className="absolute top-3 right-3 px-3.5 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-neutral-900 text-xs font-bold rounded-full z-20 shadow-xl border-2 border-white">
                        Popularno
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-pink-600 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-neutral-500 text-sm mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    {/* Salon info */}
                    <div className="flex items-center gap-2 mb-4 text-sm text-neutral-500">
                      <MapPin className="w-4 h-4" />
                      <span>{service.salon.name}</span>
                      <span>•</span>
                      <span>{service.salon.city}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{service.salon.rating}</span>
                      </div>
                    </div>

                    {/* Price & Duration */}
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                      <div>
                        <div className="text-lg font-bold text-neutral-900">{service.price}</div>
                        <div className="text-xs text-neutral-400">{service.priceEur}</div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-neutral-500">
                        <Clock className="w-4 h-4" />
                        {service.duration} min
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-neutral-900" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Nema rezultata
            </h3>
            <p className="text-neutral-900">
              Pokušajte s drugim pojmom za pretraživanje ili kategorijom
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}


