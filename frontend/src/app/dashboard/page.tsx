'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '@/components/ui/WalletButton'
import { 
  Calendar, 
  Clock, 
  TrendingUp,
  Users,
  Wallet,
  DollarSign,
  Check,
  X,
  AlertCircle,
  Plus,
  Settings,
  BarChart3,
  Star
} from 'lucide-react'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'
import clsx from 'clsx'

// Mock data
const stats = [
  { label: 'Ukupna zarada', value: '12.5 SOL', change: '+15%', icon: TrendingUp },
  { label: 'Rezervacije', value: '47', change: '+8', icon: Calendar },
  { label: 'Klijenti', value: '32', change: '+5', icon: Users },
  { label: 'Ocjena', value: '4.9', change: '+0.1', icon: Star },
]

const upcomingReservations = [
  {
    id: '1',
    client: '7Xj...9Kp',
    service: 'Muško šišanje',
    date: new Date(Date.now() + 2 * 60 * 60 * 1000),
    time: '14:00',
    amount: 0.1,
    status: 'confirmed',
  },
  {
    id: '2',
    client: '3Mn...2Lq',
    service: 'Gel lakiranje',
    date: new Date(Date.now() + 5 * 60 * 60 * 1000),
    time: '17:00',
    amount: 0.12,
    status: 'confirmed',
  },
  {
    id: '3',
    client: '9Pq...4Rs',
    service: 'Žensko šišanje',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    time: '10:30',
    amount: 0.15,
    status: 'confirmed',
  },
]

const recentTransactions = [
  { id: '1', type: 'payment', amount: 0.097, date: new Date(Date.now() - 2 * 60 * 60 * 1000), description: 'Muško šišanje - završeno' },
  { id: '2', type: 'refund', amount: -0.08, date: new Date(Date.now() - 5 * 60 * 60 * 1000), description: 'Gel lakiranje - otkazano (80%)' },
  { id: '3', type: 'payment', amount: 0.145, date: new Date(Date.now() - 24 * 60 * 60 * 1000), description: 'Žensko šišanje - završeno' },
  { id: '4', type: 'payment', amount: 0.097, date: new Date(Date.now() - 48 * 60 * 60 * 1000), description: 'Muško šišanje - završeno' },
]

const tabs = ['Pregled', 'Rezervacije', 'Usluge', 'Postavke']

export default function DashboardPage() {
  const { connected, publicKey } = useWallet()
  const [activeTab, setActiveTab] = useState('Pregled')
  const [salonRegistered] = useState(true) // In production, check from backend

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
              Salon Dashboard
            </h1>
            <p className="text-neutral-500 mb-8">
              Povežite vaš Phantom wallet za pristup dashboardu
            </p>
            <WalletButton />
          </motion.div>
        </div>
      </div>
    )
  }

  if (!salonRegistered) {
    return (
      <div className="min-h-screen pt-28 pb-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 rounded-full bg-accent-50 flex items-center justify-center mx-auto mb-6">
              <Plus className="w-10 h-10 text-accent-500" />
            </div>
            <h1 className="font-display text-3xl font-bold text-neutral-900 mb-4">
              Registrirajte salon
            </h1>
            <p className="text-neutral-500 mb-8">
              Registrirajte svoj salon na platformi i počnite primati rezervacije
            </p>
            <button className="btn-accent">
              Registriraj salon
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-neutral-900 mb-1">
              Dashboard
            </h1>
            <p className="text-neutral-500">
              Dobrodošli natrag, Studio Hair
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Postavke
            </button>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova usluga
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-8 overflow-x-auto pb-2"
        >
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all',
                activeTab === tab
                  ? 'bg-white text-neutral-900 shadow-soft'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50'
              )}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-pink-500" />
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-neutral-500">{stat.label}</div>
              </div>
            )
          })}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming reservations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Nadolazeće rezervacije
                </h2>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Vidi sve
                </button>
              </div>

              <div className="space-y-4">
                {upcomingReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-medium text-sm">
                        {reservation.client.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">
                          {reservation.service}
                        </div>
                        <div className="text-sm text-neutral-500 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {format(reservation.date, 'd. MMM', { locale: hr })}
                          <Clock className="w-3 h-3 ml-2" />
                          {reservation.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-neutral-900">
                          {reservation.amount} SOL
                        </div>
                        <div className="text-xs text-neutral-500">
                          ~{Math.round(reservation.amount * 200)}€
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors">
                          <Check className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Posljednje transakcije
                </h2>
                <BarChart3 className="w-5 h-5 text-neutral-400" />
              </div>

              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
                  >
                    <div>
                      <div className="text-sm font-medium text-neutral-900 mb-0.5">
                        {tx.description}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {format(tx.date, 'd. MMM HH:mm', { locale: hr })}
                      </div>
                    </div>
                    <div className={clsx(
                      'font-bold',
                      tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} SOL
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-2 text-sm text-pink-600 hover:text-pink-700 font-medium">
                Vidi sve transakcije
              </button>
            </div>
          </motion.div>
        </div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <div className="card bg-gradient-to-r from-pink-500 to-rose-500 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Povucite sredstva na wallet
                </h3>
                <p className="text-white/80">
                  Imate 12.5 SOL dostupno za podizanje
                </p>
              </div>
              <button className="px-6 py-3 bg-white text-pink-600 font-semibold rounded-xl hover:bg-white/90 transition-colors flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Povuci sredstva
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}


