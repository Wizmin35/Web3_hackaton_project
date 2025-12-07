# 🌟 GlamBook - Web3 Booking Platform

<div align="center">
  <img src="https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana" />
  <img src="https://img.shields.io/badge/React-Next.js%2014-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Rust-Anchor-DEA584?style=for-the-badge&logo=rust" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" />
</div>

<br />

A decentralized booking platform for salon services (haircuts, nail treatments, styling, coloring) built on Solana blockchain. Pay with crypto through Phantom wallet with automatic smart contract-managed refunds.

**Inspired by [buker.hr](https://buker.hr)** - Clean, minimal design with intuitive UX and beautiful light mode interface.

---

## 📸 Features

### For Clients
- 🔐 **Phantom Wallet Login** - Secure Web3 authentication
- 🎯 **Category-Based Booking** - Browse services by category (Haircuts, Nails, Styling, Coloring)
- 🏪 **Salon Selection** - Choose from salons offering specific services
- 📅 **Easy Booking** - Pick dates/times, book instantly
- 💳 **Crypto Payments** - Pay in SOL with instant confirmation on Solana network
- 🔄 **Smart Refunds** - Automatic refunds based on cancellation time (transparent blockchain rules)
- 📋 **Reservation Management** - View upcoming, past, and cancelled reservations
- ❌ **Easy Cancellation** - Cancel reservations with automatic status updates
- 📱 **Mobile Ready** - Fully responsive design with beautiful light mode
- 🎨 **Modern UI** - Clean, bright interface with pink/rose accents

### For Salons
- 🏪 **Register Salon** - On-chain registration with services
- 📊 **Dashboard** - Track reservations and earnings
- 💰 **Auto Payouts** - Receive payments directly to wallet
- ⚡ **No-Show Protection** - Fair compensation for missed appointments

---

## 💰 Refund Policy

All refunds are automatically processed by the smart contract:

| Cancellation Time | Client Refund | Salon Fee | App Commission (3%) |
|-------------------|---------------|-----------|---------------------|
| > 48 hours        | 100%          | €0        | €0                  |
| 24-48 hours       | 80%           | €2        | €0.06               |
| < 24 hours        | 50%           | €5        | €0.15               |
| No-show           | 0%            | €10       | €0.30               |

---

## 🏗️ Architecture

```
Web3_hackaton_project-main/
├── contracts/          # Solana smart contract (Anchor/Rust)
│   ├── programs/       # Program source code
│   │   └── solbook/    # Main booking program
│   ├── tests/          # Integration tests
│   └── scripts/        # Deployment scripts
├── backend/            # Node.js API server
│   ├── src/
│   │   ├── routes/     # API endpoints (auth, salons, services, reservations)
│   │   ├── services/   # Business logic (Solana, database)
│   │   └── middleware/ # Auth, error handling
│   └── prisma/         # Database schema (SQLite by default)
└── frontend/           # Next.js 14 frontend
    ├── src/
    │   ├── app/        # Pages & routes
    │   │   ├── page.tsx              # Homepage with hero section
    │   │   ├── services/             # Category-based service selection
    │   │   ├── salons/               # Salon listing
    │   │   ├── book/[id]/            # Booking page
    │   │   ├── reservations/         # Reservation management
    │   │   ├── dashboard/            # Salon owner dashboard
    │   │   └── refund-policy/        # Refund policy page
    │   ├── components/ # React components
    │   │   ├── layout/  # Header, Footer
    │   │   ├── ui/      # WalletButton, ThemeToggle
    │   │   └── providers/ # Wallet, Theme providers
    │   └── lib/        # Utilities & hooks (API client, Solana helpers)
    └── public/         # Static assets
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([nodejs.org](https://nodejs.org))
- **Rust** & Cargo ([rustup.rs](https://rustup.rs))
- **Solana CLI** ([docs.solana.com](https://docs.solana.com/cli/install-solana-cli-tools))
- **Anchor Framework** ([anchor-lang.com](https://www.anchor-lang.com))
- **Phantom Wallet** ([phantom.app](https://phantom.app))
- **SQLite** for backend database (or PostgreSQL for production)

### Setup

#### Windows (PowerShell)
```powershell
cd Web3_hackaton_project-main
.\scripts\setup.ps1
```

#### macOS/Linux
```bash
cd Web3_hackaton_project-main
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Manual Setup

#### 1. Smart Contract

```bash
cd contracts

# Install dependencies
npm install

# Configure Solana CLI for devnet
solana config set --url https://api.devnet.solana.com

# Create wallet if needed
solana-keygen new

# Get devnet SOL
solana airdrop 2

# Build contract
anchor build

# Deploy to devnet
anchor deploy

# Note the Program ID from output!
```

#### 2. Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file (optional, uses SQLite by default)
# Edit .env with your settings:
# - PROGRAM_ID from deployment
# - DATABASE_URL for PostgreSQL (optional, defaults to SQLite)

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Start development server
npm run dev
```

Backend runs on `http://localhost:3001`

#### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:3001/api
# Set NEXT_PUBLIC_PROGRAM_ID from deployment

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and connect your Phantom wallet!

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/nonce` - Get nonce for wallet signature
- `POST /api/auth/verify` - Verify signature and authenticate

### Salons
- `GET /api/salons` - List all salons
- `GET /api/salons/:id` - Get salon details
- `GET /api/salons/wallet/:walletAddress` - Get salon by wallet address
- `POST /api/salons` - Register new salon (auth required)
- `PUT /api/salons/:id` - Update salon (owner only)
- `GET /api/salons/:id/reservations` - Get salon reservations (owner only)
- `GET /api/salons/:id/earnings` - Get salon earnings (owner only)

### Services
- `GET /api/services` - List all services (with optional filters: category, salonId)
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create service (salon owner)

### Reservations
- `GET /api/reservations/my` - Get user's reservations (with optional status filter)
- `GET /api/reservations/slots` - Get available time slots
- `POST /api/reservations` - Create reservation
- `POST /api/reservations/:id/confirm` - Confirm with transaction
- `POST /api/reservations/:id/cancel` - Cancel reservation (auto-calculates refund)
- `POST /api/reservations/:id/complete` - Mark as completed (salon owner)
- `POST /api/reservations/:id/no-show` - Mark as no-show (salon owner)

---

## 🔐 Smart Contract

### Program Instructions

```rust
// Initialize platform (admin only)
initialize_platform(treasury_wallet: Pubkey)

// Register a salon
register_salon(name: String, services: Vec<ServiceInput>)

// Create a reservation (locks payment)
create_reservation(service_id: u8, appointment_time: i64)

// Cancel reservation (auto-calculates refund)
cancel_reservation()

// Complete reservation (salon owner)
complete_reservation()

// Mark no-show (salon owner, after appointment time)
mark_no_show()
```

### Events Emitted

- `PlatformInitialized` - Platform setup complete
- `SalonRegistered` - New salon registered
- `ReservationCreated` - New booking confirmed
- `ReservationCancelled` - Booking cancelled with refund details
- `RefundProcessed` - Refund sent to client
- `ReservationCompleted` - Service completed, payment released
- `ReservationNoShow` - Client didn't show up

### Account Structures

**Platform**: Stores global stats and treasury wallet
**Salon**: Stores salon info, owner, services, and stats
**Reservation**: Stores booking details, payment, and status

See [docs/SMART_CONTRACT.md](docs/SMART_CONTRACT.md) for detailed documentation.

---

## 🎯 User Flow

### Booking a Service

1. **Select Category** - Choose from: Šišanje, Nokti, Styling, or Bojanje
2. **Choose Salon** - Browse salons offering services in selected category
3. **Select Service** - Click on specific service or "Rezerviraj termin" button
4. **Pick Date & Time** - Select from available slots
5. **Connect Wallet** - Connect Phantom wallet if not already connected
6. **Confirm & Pay** - Review booking and confirm payment
7. **View Reservation** - Check "Nadolazeće" tab in Reservations page

### Cancelling a Reservation

1. **Go to Reservations** - Navigate to "Moje rezervacije"
2. **Select Reservation** - Find reservation in "Nadolazeće" tab
3. **Click "Otkaži"** - Cancel the reservation
4. **Auto-Update** - Reservation automatically moves to "Otkazane" tab
5. **Refund Processed** - Smart contract automatically calculates and processes refund

---

## 🧪 Testing

### Smart Contract Tests

```bash
cd contracts
anchor test
```

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

## 🚢 Deployment

### Smart Contract (Devnet → Mainnet)

1. Update `Anchor.toml`:
```toml
[provider]
cluster = "mainnet"
```

2. Get mainnet SOL in your wallet

3. Deploy:
```bash
anchor deploy --provider.cluster mainnet
```

### Backend (Example: Railway)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=3001
NODE_ENV=production
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PROGRAM_ID=<your-program-id>
TREASURY_WALLET=<treasury-pubkey>
DATABASE_URL=file:./prisma/dev.db  # SQLite (default) or postgresql://... for PostgreSQL
JWT_SECRET=<secure-random-string>
ALLOWED_ORIGINS=https://yourdomain.com
EUR_TO_LAMPORTS=100000000  # 1 EUR = 0.1 SOL (adjust based on SOL price)
APP_COMMISSION_BPS=300  # 3% commission
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_PROGRAM_ID=<your-program-id>
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SOLANA_CLUSTER=mainnet-beta
NEXT_PUBLIC_APP_URL=https://yourdomain.com  # For metadata
```

---

## 🎨 Design System

### Colors
- **Primary**: Pink (#ec4899) - Beauty, elegance
- **Accent**: Rose (#f43f5e) - Warmth, passion
- **Neutral**: Neutral grays - Clean, professional
- **Background**: Light pink gradients - Soft, inviting

### Typography
- **Display**: Outfit - Modern, geometric
- **Body**: DM Sans - Clean, readable

### Components
- Cards with soft shadows and rounded corners
- Pink/rose gradient accents
- Smooth animations (Framer Motion)
- Light mode optimized with bright, clean design
- Responsive mobile-first layout

---

## 📦 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Smooth animations
- **Solana Wallet Adapter** - Wallet integration
- **date-fns** - Date formatting
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **SQLite/PostgreSQL** - Database
- **Anchor** - Solana program interaction
- **@solana/web3.js** - Solana SDK

### Smart Contract
- **Rust** - Programming language
- **Anchor Framework** - Solana development framework
- **Solana Program Library** - Core Solana functionality

---

## 🔄 Data Flow

### Booking Flow
1. User selects category → Views salons → Chooses service
2. Frontend stores salon info in sessionStorage
3. User picks date/time → Frontend calls booking page
4. Booking page reads salon info and service details
5. User connects wallet → Confirms payment
6. Frontend creates reservation in localStorage
7. Backend creates reservation in database
8. Smart contract locks payment in escrow
9. Reservation appears in "Nadolazeće" tab

### Cancellation Flow
1. User clicks "Otkaži" on reservation
2. Frontend updates reservation status to "cancelled" in localStorage
3. Frontend saves cancelled reservation ID to localStorage
4. Reservation automatically moves to "Otkazane" tab
5. Smart contract calculates refund based on time
6. Refund processed automatically

---

## 🐛 Troubleshooting

### Common Issues

**Wallet not connecting:**
- Ensure Phantom wallet is installed and unlocked
- Check if you're on the correct network (Devnet/Mainnet)

**Reservations not showing:**
- Clear browser localStorage and try again
- Check browser console for errors

**Transaction failing:**
- Ensure you have enough SOL in wallet
- Check Solana network status
- Verify program ID is correct

**Backend not starting:**
- Check if port 3001 is available
- Verify database connection
- Check environment variables

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 🆘 Support

- 📧 Email: support@glambook.hr
- 🐦 Twitter: @glambook_hr
- 💬 Discord: discord.gg/glambook

---

## 🎉 Features Highlights

### Recent Updates
- ✅ Category-based service browsing (Šišanje, Nokti, Styling, Bojanje)
- ✅ Direct salon selection and booking
- ✅ Improved reservation management with tabs (Nadolazeće, Prošle, Otkazane)
- ✅ Automatic reservation status updates
- ✅ Persistent reservation storage (localStorage)
- ✅ Enhanced booking flow with salon context
- ✅ Beautiful light mode UI with pink/rose accents

---

<div align="center">
  <br />
  <p>Built with ❤️ on Solana</p>
  <img src="https://img.shields.io/badge/Powered%20by-Solana-9945FF?style=flat-square&logo=solana" />
</div>
