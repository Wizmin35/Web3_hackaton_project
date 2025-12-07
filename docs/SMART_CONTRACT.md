# 📜 Smart Contract Documentation

## Overview

The GlamBook smart contract is built using the Anchor framework for Solana. It handles:

1. **Platform Management** - Admin initialization and treasury
2. **Salon Registration** - On-chain salon and service data
3. **Reservations** - Booking, payment escrow, and lifecycle
4. **Refunds** - Automatic calculation and distribution

## Program Structure

```
programs/solbook/src/lib.rs
├── State Accounts
│   ├── Platform      - Global platform config
│   ├── Salon         - Salon info and services
│   └── Reservation   - Booking details and status
├── Instructions
│   ├── initialize_platform
│   ├── register_salon
│   ├── create_reservation
│   ├── cancel_reservation
│   ├── complete_reservation
│   └── mark_no_show
└── Events
    ├── PlatformInitialized
    ├── SalonRegistered
    ├── ReservationCreated
    ├── ReservationCancelled
    ├── RefundProcessed
    ├── ReservationCompleted
    └── ReservationNoShow
```

## Account Structures

### Platform
```rust
pub struct Platform {
    pub admin: Pubkey,           // Platform admin
    pub treasury_wallet: Pubkey, // Commission receiver
    pub total_reservations: u64, // Total bookings
    pub total_volume: u64,       // Total lamports processed
    pub bump: u8,                // PDA bump
}
```

**PDA Seeds**: `["platform"]`

### Salon
```rust
pub struct Salon {
    pub owner: Pubkey,           // Wallet that owns salon
    pub name: String,            // Salon name (max 64 chars)
    pub is_active: bool,         // Accepting bookings?
    pub total_earnings: u64,     // Lifetime earnings
    pub reservation_count: u64,  // Total reservations
    pub services: Vec<Service>,  // Available services (max 10)
    pub bump: u8,
}

pub struct Service {
    pub id: u8,
    pub name: String,            // Max 32 chars
    pub price_lamports: u64,
    pub duration_minutes: u16,
    pub is_active: bool,
}
```

**PDA Seeds**: `["salon", owner_pubkey]`

### Reservation
```rust
pub struct Reservation {
    pub client: Pubkey,
    pub salon: Pubkey,
    pub salon_owner: Pubkey,
    pub service_id: u8,
    pub service_name: String,
    pub amount: u64,             // Locked payment
    pub appointment_time: i64,   // Unix timestamp
    pub created_at: i64,
    pub status: ReservationStatus,
    pub cancelled_at: Option<i64>,
    pub completed_at: Option<i64>,
    pub bump: u8,
}

pub enum ReservationStatus {
    Confirmed,
    Cancelled,
    Completed,
    NoShow,
}
```

**PDA Seeds**: `["reservation", client_pubkey, salon_pda, appointment_time_le_bytes]`

## Instructions

### initialize_platform

Initializes the platform. Can only be called once.

```rust
pub fn initialize_platform(
    ctx: Context<InitializePlatform>,
    treasury_wallet: Pubkey,
) -> Result<()>
```

**Accounts**:
- `platform` - Platform PDA (init)
- `admin` - Signer, becomes admin
- `system_program`

### register_salon

Registers a new salon with services.

```rust
pub fn register_salon(
    ctx: Context<RegisterSalon>,
    name: String,
    services: Vec<ServiceInput>,
) -> Result<()>
```

**Validations**:
- Name ≤ 64 characters
- Services ≤ 10

### create_reservation

Creates a booking and locks payment.

```rust
pub fn create_reservation(
    ctx: Context<CreateReservation>,
    service_id: u8,
    appointment_time: i64,
) -> Result<()>
```

**Flow**:
1. Validate appointment is in future
2. Find service and verify active
3. Transfer payment from client to reservation PDA
4. Initialize reservation state
5. Update platform stats

### cancel_reservation

Cancels a reservation and processes refund.

```rust
pub fn cancel_reservation(ctx: Context<CancelReservation>) -> Result<()>
```

**Refund Calculation**:
```
time_until = appointment_time - now

if time_until > 48 hours:
    client_refund = 100%
    salon_fee = 0
elif time_until > 24 hours:
    client_refund = 80%
    salon_fee = 2€ equivalent
elif time_until > 0:
    client_refund = 50%
    salon_fee = 5€ equivalent
else:
    client_refund = 0%
    salon_fee = 10€ equivalent

app_commission = salon_fee * 3%
```

**Transfers**:
1. Refund → Client wallet
2. Fee (minus commission) → Salon owner
3. Commission → Treasury

### complete_reservation

Marks service as completed and releases payment.

```rust
pub fn complete_reservation(ctx: Context<CompleteReservation>) -> Result<()>
```

**Requirements**:
- Only salon owner can call
- Must be after appointment time
- Status must be Confirmed

**Transfers**:
- 97% of amount → Salon owner
- 3% commission → Treasury

### mark_no_show

Marks client as no-show after grace period.

```rust
pub fn mark_no_show(ctx: Context<MarkNoShow>) -> Result<()>
```

**Requirements**:
- Only salon owner can call
- Must be 15+ minutes after appointment
- Status must be Confirmed

**Transfers**:
- Full amount (minus 3%) → Salon owner

## Events

All instructions emit events for off-chain indexing:

```rust
#[event]
pub struct ReservationCreated {
    pub reservation: Pubkey,
    pub client: Pubkey,
    pub salon: Pubkey,
    pub service_id: u8,
    pub amount: u64,
    pub appointment_time: i64,
}

#[event]
pub struct ReservationCancelled {
    pub reservation: Pubkey,
    pub client: Pubkey,
    pub refund_amount: u64,
    pub salon_fee: u64,
    pub app_commission: u64,
    pub time_until_appointment: i64,
}
```

## Security Considerations

### Reentrancy Protection
- All state updates before transfers
- PDAs hold funds (no direct wallet access)

### Authorization
- Client can only cancel their own reservations
- Only salon owner can complete/no-show
- Only admin can update platform

### Validation
- Future appointment times required
- Service must be active
- Status checks on all operations

## Testing

```bash
cd contracts
anchor test
```

Tests cover:
- Platform initialization
- Salon registration
- Reservation creation
- Cancellation with refunds
- Completion flow
- No-show handling

## Deployment

```bash
# Build
anchor build

# Deploy to devnet
anchor deploy

# Get program ID
solana address -k target/deploy/solbook-keypair.json

# Update Anchor.toml and lib.rs with new ID
# Rebuild and redeploy
```

## Upgradeability

The program is **not** upgradeable by default. For production:

1. Consider using upgradeable BPF loader
2. Implement proper upgrade authority management
3. Add migration instructions for state changes

## Gas Optimization

- Minimal account sizes
- Efficient PDA derivation
- Batched operations where possible
- Fixed-size arrays for services


