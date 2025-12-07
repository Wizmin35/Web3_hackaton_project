'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '@/components/ui/WalletButton'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  ArrowLeft,
  ArrowRight,
  Check,
  Wallet,
  Shield,
  AlertCircle
} from 'lucide-react'
import { format, addDays, startOfDay, isSameDay } from 'date-fns'
import { hr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// Mock service data
const serviceData = {
  '1': {
    id: '1',
    name: 'Muško šišanje',
    description: 'Klasično muško šišanje s pranjem kose i stiliziranjem. Uključuje konzultacije o stilu i savjete za održavanje.',
    price: 0.1,
    priceEur: 20,
    duration: 30,
    salon: {
      id: 's1',
      name: 'Studio Hair',
      address: 'Ilica 50',
      city: 'Zagreb',
      rating: 4.9,
      walletAddress: 'Salon111111111111111111111111111111111111111',
    },
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
  },
  '2': {
    id: '2',
    name: 'Žensko šišanje',
    description: 'Profesionalno žensko šišanje i oblikovanje frizure. Uključuje pranje, šišanje i stiliziranje.',
    price: 0.15,
    priceEur: 30,
    duration: 45,
    salon: {
      id: 's2',
      name: 'Beauty Lounge',
      address: 'Riva 12',
      city: 'Split',
      rating: 4.8,
      walletAddress: 'Salon222222222222222222222222222222222222222',
    },
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
  },
  '3': {
    id: '3',
    name: 'Gel lakiranje',
    description: 'Trajno gel lakiranje noktiju s pripremom i oblikovanjem. Dugotrajna zaštita i sjajan izgled.',
    price: 0.12,
    priceEur: 25,
    duration: 60,
    salon: {
      id: 's3',
      name: 'Nail Art Studio',
      address: 'Vlaška 90',
      city: 'Zagreb',
      rating: 5.0,
      walletAddress: 'Salon333333333333333333333333333333333333333',
    },
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800',
  },
  '4': {
    id: '4',
    name: 'Manikura',
    description: 'Kompletna njega noktiju s lakiranjem po izboru. Uključuje oblikovanje, njegu i lakiranje.',
    price: 0.08,
    priceEur: 15,
    duration: 30,
    salon: {
      id: 's3',
      name: 'Nail Art Studio',
      address: 'Vlaška 90',
      city: 'Zagreb',
      rating: 5.0,
      walletAddress: 'Salon333333333333333333333333333333333333333',
    },
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800',
  },
  '5': {
    id: '5',
    name: 'Pramenovi',
    description: 'Profesionalni pramenovi s kvalitetnim bojama. Prirodan izgled i dugotrajna boja.',
    price: 0.3,
    priceEur: 60,
    duration: 120,
    salon: {
      id: 's4',
      name: 'Color Studio',
      address: 'Korzo 15',
      city: 'Rijeka',
      rating: 4.7,
      walletAddress: 'Salon444444444444444444444444444444444444444',
    },
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
  },
  '6': {
    id: '6',
    name: 'Balayage',
    description: 'Moderna tehnika bojanja za prirodan izgled. Ombre efekt s prirodnim prijelazom boja.',
    price: 0.4,
    priceEur: 80,
    duration: 150,
    salon: {
      id: 's5',
      name: 'Hair Boutique',
      address: 'Ilica 100',
      city: 'Zagreb',
      rating: 4.9,
      walletAddress: 'Salon555555555555555555555555555555555555555',
    },
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800',
  },
  '7': {
    id: '7',
    name: 'Frizura za svečanost',
    description: 'Elegantna frizura za posebne prigode. Profesionalno stiliziranje za vaš poseban dan.',
    price: 0.25,
    priceEur: 50,
    duration: 60,
    salon: {
      id: 's6',
      name: 'Glamour Salon',
      address: 'Europska avenija 15',
      city: 'Osijek',
      rating: 4.6,
      walletAddress: 'Salon666666666666666666666666666666666666666',
    },
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
  },
  '8': {
    id: '8',
    name: 'Pedikura',
    description: 'Profesionalna pedikura s masažom stopala. Kompletna njega stopala i noktiju.',
    price: 0.1,
    priceEur: 20,
    duration: 45,
    salon: {
      id: 's3',
      name: 'Nail Art Studio',
      address: 'Vlaška 90',
      city: 'Zagreb',
      rating: 5.0,
      walletAddress: 'Salon333333333333333333333333333333333333333',
    },
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800',
  },
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
]

const refundPolicy = [
  { time: '> 48 sati', refund: '100%', fee: '0€' },
  { time: '24-48 sati', refund: '80%', fee: '2€' },
  { time: '< 24 sata', refund: '50%', fee: '5€' },
  { time: 'No-show', refund: '0%', fee: '10€' },
]

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const { connected, publicKey, signTransaction } = useWallet()
  
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Get base service data
  const baseService = serviceData[params.id as string] || serviceData['1']
  const [service, setService] = useState(baseService)

  // Salon data mapping - maps salon IDs to their details
  const salonDataMap: Record<string, { name: string; address: string; city: string }> = {
    '1': { name: 'Studio Hair', address: 'Ilica 50', city: 'Zagreb' },
    '2': { name: 'Beauty Lounge', address: 'Riva 12', city: 'Split' },
    '3': { name: 'Nail Art Studio', address: 'Vlaška 90', city: 'Zagreb' },
    '4': { name: 'Color Studio', address: 'Korzo 15', city: 'Rijeka' },
    '5': { name: 'Hair Boutique', address: 'Tkalčićeva 25', city: 'Zagreb' },
    '6': { name: 'Glamour Salon', address: 'Europska avenija 8', city: 'Osijek' },
  }

  // Override salon data and service name from URL params or sessionStorage if available (from salon selection)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // First try to get salon ID and service name from URL params
      const urlParams = new URLSearchParams(window.location.search)
      const salonIdFromUrl = urlParams.get('salon')
      const serviceNameFromUrl = urlParams.get('service')
      
      // If not in URL, try sessionStorage
      const selectedSalon = salonIdFromUrl 
        ? null 
        : sessionStorage.getItem('selectedSalon')
      
      let salon: { id: string; name: string; address: string; city: string; selectedService?: string } | null = null
      let selectedServiceName: string | null = null
      
      if (salonIdFromUrl && salonDataMap[salonIdFromUrl]) {
        // Use salon data from mapping
        salon = {
          id: salonIdFromUrl,
          ...salonDataMap[salonIdFromUrl]
        }
        selectedServiceName = serviceNameFromUrl ? decodeURIComponent(serviceNameFromUrl) : null
      } else if (selectedSalon) {
        // Parse from sessionStorage
        try {
          salon = JSON.parse(selectedSalon)
          selectedServiceName = salon.selectedService || null
        } catch (error) {
          console.error('Error parsing selected salon:', error)
        }
      }
      
      if (salon) {
        setService(prev => {
          // If we have a selected service name, update the service name and description
          const updatedService = selectedServiceName 
            ? {
                ...prev,
                name: selectedServiceName,
                // Keep the description from the original service or use a generic one
                description: prev.description,
                salon: {
                  ...prev.salon,
                  id: salon.id,
                  name: salon.name,
                  address: salon.address,
                  city: salon.city,
                }
              }
            : {
                ...prev,
                salon: {
                  ...prev.salon,
                  id: salon.id,
                  name: salon.name,
                  address: salon.address,
                  city: salon.city,
                }
              }
          return updatedService
        })
        // Clear sessionStorage after use
        if (selectedSalon) {
          sessionStorage.removeItem('selectedSalon')
        }
      }
    }
  }, [params.id])

  // Generate next 14 days
  const availableDates = useMemo(() => {
    const dates = []
    for (let i = 1; i <= 14; i++) {
      dates.push(addDays(startOfDay(new Date()), i))
    }
    return dates
  }, [])

  // Mock available times (in production, fetch from API)
  const availableTimes = useMemo(() => {
    if (!selectedDate) return []
    // Simulate some slots being taken
    const takenSlots = ['10:00', '14:00', '15:30']
    return timeSlots.map(time => ({
      time,
      available: !takenSlots.includes(time),
    }))
  }, [selectedDate])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleNextStep = () => {
    if (step === 1 && selectedDate && selectedTime) {
      setStep(2)
    }
  }

  const handleBooking = async () => {
    if (!connected || !publicKey) {
      toast.error('Povežite Phantom wallet za nastavak')
      return
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Odaberite datum i vrijeme')
      return
    }

    setIsProcessing(true)

    try {
      // In production, this would:
      // 1. Create reservation in backend
      // 2. Build Solana transaction
      // 3. Sign with wallet
      // 4. Submit to blockchain
      // 5. Confirm and update backend

      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create new reservation object
      const newReservation = {
        id: Date.now().toString(),
        service: service.name,
        salon: service.salon.name,
        address: `${service.salon.address}, ${service.salon.city}`,
        date: selectedDate,
        time: selectedTime,
        duration: service.duration,
        price: service.price,
        priceEur: service.priceEur,
        status: 'confirmed' as const,
        transactionHash: `tx${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      }

      // Save to localStorage
      const existingReservations = JSON.parse(localStorage.getItem('reservations') || '[]')
      existingReservations.push(newReservation)
      localStorage.setItem('reservations', JSON.stringify(existingReservations))

      toast.success('Rezervacija uspješna!')
      router.push('/reservations')
    } catch (error) {
      toast.error('Greška pri rezervaciji. Pokušajte ponovno.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Natrag
        </motion.button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Progress steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-4">
                <div className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all',
                  step >= 1 ? 'bg-pink-500 text-white' : 'bg-neutral-200 text-neutral-500'
                )}>
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Odaberi termin</span>
                  <span className="sm:hidden">1</span>
                </div>
                <div className="h-px flex-grow bg-neutral-200" />
                <div className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all',
                  step >= 2 ? 'bg-pink-500 text-white' : 'bg-neutral-200 text-neutral-500'
                )}>
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">Potvrdi i plati</span>
                  <span className="sm:hidden">2</span>
                </div>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* Date selection */}
                  <div className="card mb-6">
                    <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-pink-500" />
                      Odaberite datum
                    </h2>
                    
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
                      {availableDates.map((date) => (
                        <button
                          key={date.toISOString()}
                          onClick={() => handleDateSelect(date)}
                          className={clsx(
                            'flex-shrink-0 w-20 py-3 rounded-xl text-center transition-all',
                            selectedDate && isSameDay(date, selectedDate)
                              ? 'bg-pink-500 text-white shadow-glow'
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          )}
                        >
                          <div className="text-xs font-medium opacity-75">
                            {format(date, 'EEE', { locale: hr })}
                          </div>
                          <div className="text-2xl font-bold">
                            {format(date, 'd')}
                          </div>
                          <div className="text-xs">
                            {format(date, 'MMM', { locale: hr })}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time selection */}
                  {selectedDate && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card"
                    >
                      <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-pink-500" />
                        Odaberite vrijeme
                      </h2>

                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {availableTimes.map(({ time, available }) => (
                          <button
                            key={time}
                            onClick={() => available && handleTimeSelect(time)}
                            disabled={!available}
                            className={clsx(
                              'py-3 px-4 rounded-xl font-medium transition-all',
                              !available
                                ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
                                : selectedTime === time
                                  ? 'bg-primary-500 text-white shadow-glow'
                                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                            )}
                          >
                            {time}
                          </button>
                        ))}
                      </div>

                      {selectedTime && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6"
                        >
                          <button
                            onClick={handleNextStep}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                          >
                            Nastavi na plaćanje
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* Booking summary */}
                  <div className="card mb-6">
                    <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                      Pregled rezervacije
                    </h2>

                    <div className="space-y-4">
                      <div className="flex justify-between py-3 border-b border-neutral-100">
                        <span className="text-neutral-500">Usluga</span>
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-neutral-100">
                        <span className="text-neutral-500">Salon</span>
                        <span className="font-medium">{service.salon.name}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-neutral-100">
                        <span className="text-neutral-500">Datum</span>
                        <span className="font-medium">
                          {selectedDate && format(selectedDate, 'EEEE, d. MMMM yyyy.', { locale: hr })}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-neutral-100">
                        <span className="text-neutral-500">Vrijeme</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-neutral-100">
                        <span className="text-neutral-500">Trajanje</span>
                        <span className="font-medium">{service.duration} min</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-neutral-900 font-semibold">Ukupno</span>
                        <div className="text-right">
                          <div className="text-xl font-bold text-neutral-900">{service.price} SOL</div>
                          <div className="text-sm text-neutral-500">~{service.priceEur}€</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wallet connection / Payment */}
                  <div className="card">
                    {!connected ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mx-auto mb-4">
                          <Wallet className="w-8 h-8 text-pink-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                          Povežite wallet
                        </h3>
                        <p className="text-neutral-500 mb-6">
                          Povežite vaš Phantom wallet za dovršetak rezervacije
                        </p>
                        <WalletButton />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl mb-6">
                          <Check className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="font-medium text-green-800">Wallet povezan</div>
                            <div className="text-sm text-green-600 font-mono">
                              {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-pink-50 rounded-xl mb-6">
                          <Shield className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-pink-800">
                            Vaša uplata bit će sigurno pohranjena u smart contractu do završetka usluge. 
                            U slučaju otkazivanja, automatski ćete dobiti povrat prema politici otkazivanja.
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button
                            onClick={() => setStep(1)}
                            className="btn-secondary flex-1"
                          >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Natrag
                          </button>
                          <button
                            onClick={handleBooking}
                            disabled={isProcessing}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                          >
                            {isProcessing ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Obrada...
                              </>
                            ) : (
                              <>
                                Potvrdi i plati
                                <Check className="w-5 h-5" />
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Service info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card sticky top-28"
            >
              {/* Service image */}
              <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-2xl">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                {service.name}
              </h2>
              <p className="text-neutral-500 text-sm mb-4">
                {service.description}
              </p>

              {/* Salon info */}
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium text-neutral-900">{service.salon.name}</div>
                  <div className="text-sm text-neutral-500">{service.salon.address}, {service.salon.city}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{service.salon.rating}</span>
                <span>•</span>
                <Clock className="w-4 h-4" />
                <span>{service.duration} min</span>
              </div>

              {/* Refund policy */}
              <div className="border-t border-neutral-100 pt-4">
                <h3 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-pink-500" />
                  Pravila otkazivanja
                </h3>
                <div className="space-y-2">
                  {refundPolicy.map((policy, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-neutral-500">{policy.time}</span>
                      <span className="font-medium text-neutral-700">{policy.refund} povrat</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}


