'use client'

import { useState, useMemo } from 'react'
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

  const service = serviceData[params.id as string] || serviceData['1']

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


