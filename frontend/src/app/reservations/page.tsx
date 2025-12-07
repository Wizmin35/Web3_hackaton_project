'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '@/components/ui/WalletButton'
import Link from 'next/link'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Check,
  X,
  AlertCircle,
  Wallet,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import clsx from 'clsx'

type ReservationStatus = 'confirmed' | 'completed' | 'cancelled' | 'no_show'

interface Reservation {
  id: string
  service: string
  salon: string
  address: string
  date: Date
  time: string
  duration: number
  price: number
  priceEur: number
  status: ReservationStatus
  transactionHash?: string
  refundAmount?: number
}

// Mock data
const mockReservations: Reservation[] = [
  {
    id: '1',
    service: 'Muško šišanje',
    salon: 'Studio Hair',
    address: 'Ilica 50, Zagreb',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    time: '14:00',
    duration: 30,
    price: 0.1,
    priceEur: 20,
    status: 'confirmed',
    transactionHash: '5xJy7gFoFnZLcZh8UxFh3rN8VKJcL6d2',
  },
  {
    id: '2',
    service: 'Gel lakiranje',
    salon: 'Nail Art Studio',
    address: 'Vlaška 90, Zagreb',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    time: '10:30',
    duration: 60,
    price: 0.12,
    priceEur: 25,
    status: 'completed',
    transactionHash: '3mKx9pQwRtYv8NzBcDfGhJkL7sAe',
  },
  {
    id: '3',
    service: 'Žensko šišanje',
    salon: 'Beauty Lounge',
    address: 'Riva 12, Split',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    time: '16:00',
    duration: 45,
    price: 0.15,
    priceEur: 30,
    status: 'cancelled',
    refundAmount: 0.15,
  },
]

const statusConfig = {
  confirmed: {
    label: 'Potvrđeno',
    color: 'bg-green-100 text-green-800',
    icon: Check,
  },
  completed: {
    label: 'Završeno',
    color: 'bg-blue-100 text-blue-800',
    icon: Check,
  },
  cancelled: {
    label: 'Otkazano',
    color: 'bg-neutral-100 text-neutral-600',
    icon: X,
  },
  no_show: {
    label: 'No-show',
    color: 'bg-red-100 text-red-800',
    icon: AlertCircle,
  },
}

const tabs = [
  { id: 'upcoming', label: 'Nadolazeće' },
  { id: 'past', label: 'Prošle' },
  { id: 'cancelled', label: 'Otkazane' },
]

export default function ReservationsPage() {
  const { connected, publicKey } = useWallet()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  
  // Load reservations from localStorage on mount and merge with mock data
  const loadReservations = (): Reservation[] => {
    if (typeof window === 'undefined') return mockReservations
    
    const savedReservations = localStorage.getItem('reservations')
    const savedCancelled = localStorage.getItem('cancelledReservations')
    
    // Start with mock data (create deep copy to avoid mutating original)
    const allReservations = mockReservations.map(r => ({ ...r, date: new Date(r.date) }))
    
    // Load new reservations from localStorage
    if (savedReservations) {
      try {
        const parsed = JSON.parse(savedReservations)
        // Convert date strings back to Date objects
        const reservationsWithDates = parsed.map((r: any) => ({
          ...r,
          date: new Date(r.date)
        }))
        // Add new reservations (avoid duplicates by ID)
        reservationsWithDates.forEach((newRes: Reservation) => {
          if (!allReservations.find(r => r.id === newRes.id)) {
            allReservations.push(newRes)
          }
        })
      } catch (error) {
        console.error('Error loading reservations from localStorage:', error)
      }
    }
    
    // Update mock reservations with cancelled status from localStorage
    if (savedCancelled) {
      try {
        const cancelledIds = JSON.parse(savedCancelled)
        cancelledIds.forEach((id: string) => {
          const reservation = allReservations.find(r => r.id === id)
          if (reservation) {
            reservation.status = 'cancelled'
          }
        })
      } catch (error) {
        console.error('Error loading cancelled reservations:', error)
      }
    }
    
    return allReservations
  }

  const [reservations, setReservations] = useState<Reservation[]>(loadReservations)

  // Reload reservations when component mounts or when coming from booking
  useEffect(() => {
    setReservations(loadReservations())
  }, [])

  const filteredReservations = reservations.filter(r => {
    const isPast = r.date < new Date()
    switch (activeTab) {
      case 'upcoming':
        return !isPast && r.status === 'confirmed'
      case 'past':
        return isPast && r.status !== 'cancelled'
      case 'cancelled':
        return r.status === 'cancelled'
      default:
        return true
    }
  })

  const handleCancel = async (id: string) => {
    setCancellingId(id)
    try {
      // Simulate cancellation transaction
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Update reservation status to cancelled
      setReservations(prevReservations => {
        const updated = prevReservations.map(reservation => 
          reservation.id === id 
            ? { ...reservation, status: 'cancelled' as ReservationStatus }
            : reservation
        )
        
        // Save cancelled reservation ID to localStorage
        if (typeof window !== 'undefined') {
          try {
            // Update saved reservations if it's a new reservation
            const savedReservations = localStorage.getItem('reservations')
            if (savedReservations) {
              const parsed = JSON.parse(savedReservations)
              const updatedSaved = parsed.map((r: any) => 
                r.id === id ? { ...r, status: 'cancelled' } : r
              )
              localStorage.setItem('reservations', JSON.stringify(updatedSaved))
            }
            
            // Also save cancelled ID to track cancelled mock reservations
            const savedCancelled = localStorage.getItem('cancelledReservations')
            const cancelledIds = savedCancelled ? JSON.parse(savedCancelled) : []
            if (!cancelledIds.includes(id)) {
              cancelledIds.push(id)
              localStorage.setItem('cancelledReservations', JSON.stringify(cancelledIds))
            }
          } catch (error) {
            console.error('Error saving cancelled reservation:', error)
          }
        }
        
        return updated
      })
      
      // Automatically switch to "Otkazane" tab to show the cancelled reservation
      setActiveTab('cancelled')
      
      toast.success('Rezervacija uspješno otkazana!')
    } catch (error) {
      toast.error('Greška pri otkazivanju')
    } finally {
      setCancellingId(null)
    }
  }

  if (!connected) {
    return (
      <div className="min-h-screen pt-28 pb-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-pink-500" />
            </div>
            <h1 className="font-display text-3xl font-bold text-neutral-900 mb-4">
              Povežite wallet
            </h1>
            <p className="text-neutral-500 mb-8">
              Povežite vaš Phantom wallet za pregled rezervacija
            </p>
            <WalletButton />
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-neutral-900 mb-2">
            Moje rezervacije
          </h1>
          <p className="text-neutral-500">
            Pregledajte i upravljajte vašim rezervacijama
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-8 p-1 bg-neutral-100 rounded-xl w-fit"
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'px-5 py-2.5 rounded-lg font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-white text-neutral-900 shadow-soft'
                  : 'text-neutral-500 hover:text-neutral-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Reservations list */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredReservations.map((reservation, index) => {
              const status = statusConfig[reservation.status]
              const StatusIcon = status.icon
              const isPast = reservation.date < new Date()
              const canCancel = !isPast && reservation.status === 'confirmed'

              return (
                <motion.div
                  key={reservation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="card"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900">
                          {reservation.service}
                        </h3>
                        <span className={clsx(
                          'px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1',
                          status.color
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {reservation.salon}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {format(reservation.date, 'd. MMMM yyyy.', { locale: hr })}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {reservation.time} ({reservation.duration} min)
                        </div>
                      </div>

                      {reservation.transactionHash && (
                        <a
                          href={`https://explorer.solana.com/tx/${reservation.transactionHash}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-xs text-pink-600 hover:text-pink-700"
                        >
                          <span className="font-mono">{reservation.transactionHash.slice(0, 16)}...</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {reservation.status === 'cancelled' && reservation.refundAmount && (
                        <div className="mt-2 text-sm text-green-600">
                          Povrat: {reservation.refundAmount} SOL
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-neutral-900">
                          {reservation.price} SOL
                        </div>
                        <div className="text-sm text-neutral-500">
                          ~{reservation.priceEur}€
                        </div>
                      </div>

                      {canCancel && (
                        <button
                          onClick={() => handleCancel(reservation.id)}
                          disabled={cancellingId === reservation.id}
                          className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                        >
                          {cancellingId === reservation.id ? (
                            <div className="w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            'Otkaži'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filteredReservations.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Nema rezervacija
              </h3>
              <p className="text-neutral-500 mb-6">
                {activeTab === 'upcoming'
                  ? 'Nemate nadolazećih rezervacija'
                  : activeTab === 'past'
                    ? 'Nemate prošlih rezervacija'
                    : 'Nemate otkazanih rezervacija'}
              </p>
              {activeTab === 'upcoming' && (
                <Link href="/services" className="btn-primary inline-flex items-center gap-2">
                  Rezerviraj termin
                  <ChevronRight className="w-5 h-5" />
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}


