use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("So1Book111111111111111111111111111111111111");

// Constants for refund calculations (in lamports, 1 SOL = 1_000_000_000 lamports)
// Using approximate EUR to SOL conversion (assuming 1 EUR ≈ 0.05 SOL for devnet testing)
pub const EUR_TO_LAMPORTS: u64 = 50_000_000; // 0.05 SOL per EUR
pub const APP_COMMISSION_BPS: u64 = 300; // 3% = 300 basis points

// Time thresholds in seconds
pub const HOURS_48: i64 = 48 * 60 * 60;
pub const HOURS_24: i64 = 24 * 60 * 60;

#[program]
pub mod solbook {
    use super::*;

    /// Initialize the platform with admin and treasury wallets
    pub fn initialize_platform(
        ctx: Context<InitializePlatform>,
        treasury_wallet: Pubkey,
    ) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        platform.admin = ctx.accounts.admin.key();
        platform.treasury_wallet = treasury_wallet;
        platform.total_reservations = 0;
        platform.total_volume = 0;
        platform.bump = ctx.bumps.platform;

        emit!(PlatformInitialized {
            admin: platform.admin,
            treasury_wallet: platform.treasury_wallet,
        });

        Ok(())
    }

    /// Register a new salon on the platform
    pub fn register_salon(
        ctx: Context<RegisterSalon>,
        name: String,
        services: Vec<ServiceInput>,
    ) -> Result<()> {
        require!(name.len() <= 64, GlamBookError::NameTooLong);
        require!(services.len() <= 10, GlamBookError::TooManyServices);

        let salon = &mut ctx.accounts.salon;
        salon.owner = ctx.accounts.owner.key();
        salon.name = name.clone();
        salon.is_active = true;
        salon.total_earnings = 0;
        salon.reservation_count = 0;
        salon.bump = ctx.bumps.salon;

        // Store services
        salon.services = services
            .iter()
            .map(|s| Service {
                id: s.id,
                name: s.name.clone(),
                price_lamports: s.price_lamports,
                duration_minutes: s.duration_minutes,
                is_active: true,
            })
            .collect();

        emit!(SalonRegistered {
            salon: salon.key(),
            owner: salon.owner,
            name,
        });

        Ok(())
    }

    /// Create a new reservation with payment
    pub fn create_reservation(
        ctx: Context<CreateReservation>,
        service_id: u8,
        appointment_time: i64,
    ) -> Result<()> {
        let salon = &ctx.accounts.salon;
        let clock = Clock::get()?;
        
        // Validate appointment time is in the future
        require!(
            appointment_time > clock.unix_timestamp,
            GlamBookError::InvalidAppointmentTime
        );

        // Find the service and get its price
        let service = salon
            .services
            .iter()
            .find(|s| s.id == service_id && s.is_active)
            .ok_or(GlamBookError::ServiceNotFound)?;

        let amount = service.price_lamports;

        // Transfer payment from client to escrow (reservation PDA)
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.client.to_account_info(),
                to: ctx.accounts.reservation.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;

        // Initialize reservation account
        let reservation = &mut ctx.accounts.reservation;
        reservation.client = ctx.accounts.client.key();
        reservation.salon = salon.key();
        reservation.salon_owner = salon.owner;
        reservation.service_id = service_id;
        reservation.service_name = service.name.clone();
        reservation.amount = amount;
        reservation.appointment_time = appointment_time;
        reservation.created_at = clock.unix_timestamp;
        reservation.status = ReservationStatus::Confirmed;
        reservation.bump = ctx.bumps.reservation;

        // Update platform stats
        let platform = &mut ctx.accounts.platform;
        platform.total_reservations += 1;
        platform.total_volume += amount;

        // Update salon stats
        let salon_mut = &mut ctx.accounts.salon;
        salon_mut.reservation_count += 1;

        emit!(ReservationCreated {
            reservation: reservation.key(),
            client: reservation.client,
            salon: reservation.salon,
            service_id,
            amount,
            appointment_time,
        });

        Ok(())
    }

    /// Cancel a reservation and process refund
    pub fn cancel_reservation(ctx: Context<CancelReservation>) -> Result<()> {
        let reservation = &mut ctx.accounts.reservation;
        let clock = Clock::get()?;

        // Only client can cancel their own reservation
        require!(
            ctx.accounts.client.key() == reservation.client,
            GlamBookError::UnauthorizedCancellation
        );

        // Can only cancel confirmed reservations
        require!(
            reservation.status == ReservationStatus::Confirmed,
            GlamBookError::InvalidReservationStatus
        );

        let time_until_appointment = reservation.appointment_time - clock.unix_timestamp;
        
        // Calculate refund based on cancellation policy
        let (client_refund, salon_fee, app_commission) = 
            calculate_refund(reservation.amount, time_until_appointment)?;

        // Update reservation status
        reservation.status = ReservationStatus::Cancelled;
        reservation.cancelled_at = Some(clock.unix_timestamp);

        // Transfer refund to client
        if client_refund > 0 {
            **ctx.accounts.reservation.to_account_info().try_borrow_mut_lamports()? -= client_refund;
            **ctx.accounts.client.to_account_info().try_borrow_mut_lamports()? += client_refund;
        }

        // Transfer fee to salon owner
        if salon_fee > 0 {
            **ctx.accounts.reservation.to_account_info().try_borrow_mut_lamports()? -= salon_fee;
            **ctx.accounts.salon_owner.to_account_info().try_borrow_mut_lamports()? += salon_fee;
        }

        // Transfer commission to platform treasury
        if app_commission > 0 {
            **ctx.accounts.reservation.to_account_info().try_borrow_mut_lamports()? -= app_commission;
            **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? += app_commission;
        }

        emit!(ReservationCancelled {
            reservation: reservation.key(),
            client: reservation.client,
            refund_amount: client_refund,
            salon_fee,
            app_commission,
            time_until_appointment,
        });

        emit!(RefundProcessed {
            reservation: reservation.key(),
            client: reservation.client,
            amount: client_refund,
        });

        Ok(())
    }

    /// Mark reservation as completed (by salon owner)
    pub fn complete_reservation(ctx: Context<CompleteReservation>) -> Result<()> {
        let reservation = &mut ctx.accounts.reservation;
        let clock = Clock::get()?;

        // Only salon owner can complete
        require!(
            ctx.accounts.salon_owner.key() == reservation.salon_owner,
            GlamBookError::UnauthorizedCompletion
        );

        // Must be confirmed status
        require!(
            reservation.status == ReservationStatus::Confirmed,
            GlamBookError::InvalidReservationStatus
        );

        // Can only complete after appointment time
        require!(
            clock.unix_timestamp >= reservation.appointment_time,
            GlamBookError::AppointmentNotYetDue
        );

        let amount = reservation.amount;
        let app_commission = (amount * APP_COMMISSION_BPS) / 10000;
        let salon_payment = amount - app_commission;

        reservation.status = ReservationStatus::Completed;
        reservation.completed_at = Some(clock.unix_timestamp);

        // Transfer payment to salon owner
        **ctx.accounts.reservation.to_account_info().try_borrow_mut_lamports()? -= salon_payment;
        **ctx.accounts.salon_owner.to_account_info().try_borrow_mut_lamports()? += salon_payment;

        // Transfer commission to platform treasury
        **ctx.accounts.reservation.to_account_info().try_borrow_mut_lamports()? -= app_commission;
        **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? += app_commission;

        // Update salon earnings
        let salon = &mut ctx.accounts.salon;
        salon.total_earnings += salon_payment;

        emit!(ReservationCompleted {
            reservation: reservation.key(),
            salon_payment,
            app_commission,
        });

        Ok(())
    }

    /// Mark reservation as no-show (by salon owner after appointment time)
    pub fn mark_no_show(ctx: Context<MarkNoShow>) -> Result<()> {
        let reservation = &mut ctx.accounts.reservation;
        let clock = Clock::get()?;

        // Only salon owner can mark no-show
        require!(
            ctx.accounts.salon_owner.key() == reservation.salon_owner,
            GlamBookError::UnauthorizedNoShow
        );

        // Must be confirmed status
        require!(
            reservation.status == ReservationStatus::Confirmed,
            GlamBookError::InvalidReservationStatus
        );

        // Can only mark no-show after appointment time + 15 min grace period
        require!(
            clock.unix_timestamp >= reservation.appointment_time + (15 * 60),
            GlamBookError::TooEarlyForNoShow
        );

        let amount = reservation.amount;
        // No-show: 0% refund, 100% to salon minus commission
        let app_commission = (amount * APP_COMMISSION_BPS) / 10000;
        let salon_payment = amount - app_commission;

        reservation.status = ReservationStatus::NoShow;

        // Transfer payment to salon owner
        **ctx.accounts.reservation.to_account_info().try_borrow_mut_lamports()? -= salon_payment;
        **ctx.accounts.salon_owner.to_account_info().try_borrow_mut_lamports()? += salon_payment;

        // Transfer commission to platform treasury
        **ctx.accounts.reservation.to_account_info().try_borrow_mut_lamports()? -= app_commission;
        **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? += app_commission;

        // Update salon earnings
        let salon = &mut ctx.accounts.salon;
        salon.total_earnings += salon_payment;

        emit!(ReservationNoShow {
            reservation: reservation.key(),
            client: reservation.client,
            salon_payment,
            app_commission,
        });

        Ok(())
    }
}

/// Calculate refund amounts based on cancellation policy
fn calculate_refund(amount: u64, time_until_appointment: i64) -> Result<(u64, u64, u64)> {
    let (client_percentage, salon_fee_eur) = if time_until_appointment > HOURS_48 {
        // > 48 hours: 100% refund
        (100u64, 0u64)
    } else if time_until_appointment > HOURS_24 {
        // 24-48 hours: 80% refund, €2 salon fee
        (80u64, 2u64)
    } else if time_until_appointment > 0 {
        // < 24 hours: 50% refund, €5 salon fee
        (50u64, 5u64)
    } else {
        // No-show (past appointment time): 0% refund, €10 salon fee
        (0u64, 10u64)
    };

    let client_refund = (amount * client_percentage) / 100;
    let salon_fee = salon_fee_eur * EUR_TO_LAMPORTS;
    
    // Ensure we don't exceed the amount
    let actual_salon_fee = salon_fee.min(amount - client_refund);
    let app_commission = (actual_salon_fee * APP_COMMISSION_BPS) / 10000;

    Ok((client_refund, actual_salon_fee - app_commission, app_commission))
}

// ============== ACCOUNTS ==============

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + Platform::INIT_SPACE,
        seeds = [b"platform"],
        bump
    )]
    pub platform: Account<'info, Platform>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct RegisterSalon<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + Salon::INIT_SPACE,
        seeds = [b"salon", owner.key().as_ref()],
        bump
    )]
    pub salon: Account<'info, Salon>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(service_id: u8, appointment_time: i64)]
pub struct CreateReservation<'info> {
    #[account(
        mut,
        seeds = [b"platform"],
        bump = platform.bump
    )]
    pub platform: Account<'info, Platform>,
    
    #[account(
        mut,
        seeds = [b"salon", salon.owner.as_ref()],
        bump = salon.bump
    )]
    pub salon: Account<'info, Salon>,
    
    #[account(
        init,
        payer = client,
        space = 8 + Reservation::INIT_SPACE,
        seeds = [
            b"reservation",
            client.key().as_ref(),
            salon.key().as_ref(),
            &appointment_time.to_le_bytes()
        ],
        bump
    )]
    pub reservation: Account<'info, Reservation>,
    
    #[account(mut)]
    pub client: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelReservation<'info> {
    #[account(
        mut,
        seeds = [
            b"reservation",
            reservation.client.as_ref(),
            reservation.salon.as_ref(),
            &reservation.appointment_time.to_le_bytes()
        ],
        bump = reservation.bump,
        constraint = reservation.client == client.key() @ GlamBookError::UnauthorizedCancellation
    )]
    pub reservation: Account<'info, Reservation>,
    
    #[account(mut)]
    pub client: Signer<'info>,
    
    /// CHECK: Validated against reservation.salon_owner
    #[account(
        mut,
        constraint = salon_owner.key() == reservation.salon_owner @ GlamBookError::InvalidSalonOwner
    )]
    pub salon_owner: AccountInfo<'info>,
    
    #[account(
        seeds = [b"platform"],
        bump = platform.bump
    )]
    pub platform: Account<'info, Platform>,
    
    /// CHECK: Validated against platform.treasury_wallet
    #[account(
        mut,
        constraint = treasury.key() == platform.treasury_wallet @ GlamBookError::InvalidTreasury
    )]
    pub treasury: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompleteReservation<'info> {
    #[account(
        mut,
        seeds = [
            b"reservation",
            reservation.client.as_ref(),
            reservation.salon.as_ref(),
            &reservation.appointment_time.to_le_bytes()
        ],
        bump = reservation.bump
    )]
    pub reservation: Account<'info, Reservation>,
    
    #[account(
        mut,
        seeds = [b"salon", salon_owner.key().as_ref()],
        bump = salon.bump
    )]
    pub salon: Account<'info, Salon>,
    
    #[account(
        mut,
        constraint = salon_owner.key() == reservation.salon_owner @ GlamBookError::UnauthorizedCompletion
    )]
    pub salon_owner: Signer<'info>,
    
    #[account(
        seeds = [b"platform"],
        bump = platform.bump
    )]
    pub platform: Account<'info, Platform>,
    
    /// CHECK: Validated against platform.treasury_wallet
    #[account(
        mut,
        constraint = treasury.key() == platform.treasury_wallet @ GlamBookError::InvalidTreasury
    )]
    pub treasury: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MarkNoShow<'info> {
    #[account(
        mut,
        seeds = [
            b"reservation",
            reservation.client.as_ref(),
            reservation.salon.as_ref(),
            &reservation.appointment_time.to_le_bytes()
        ],
        bump = reservation.bump
    )]
    pub reservation: Account<'info, Reservation>,
    
    #[account(
        mut,
        seeds = [b"salon", salon_owner.key().as_ref()],
        bump = salon.bump
    )]
    pub salon: Account<'info, Salon>,
    
    #[account(
        mut,
        constraint = salon_owner.key() == reservation.salon_owner @ GlamBookError::UnauthorizedNoShow
    )]
    pub salon_owner: Signer<'info>,
    
    #[account(
        seeds = [b"platform"],
        bump = platform.bump
    )]
    pub platform: Account<'info, Platform>,
    
    /// CHECK: Validated against platform.treasury_wallet
    #[account(
        mut,
        constraint = treasury.key() == platform.treasury_wallet @ GlamBookError::InvalidTreasury
    )]
    pub treasury: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

// ============== STATE ==============

#[account]
#[derive(InitSpace)]
pub struct Platform {
    pub admin: Pubkey,
    pub treasury_wallet: Pubkey,
    pub total_reservations: u64,
    pub total_volume: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Salon {
    pub owner: Pubkey,
    #[max_len(64)]
    pub name: String,
    pub is_active: bool,
    pub total_earnings: u64,
    pub reservation_count: u64,
    #[max_len(10)]
    pub services: Vec<Service>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Service {
    pub id: u8,
    #[max_len(32)]
    pub name: String,
    pub price_lamports: u64,
    pub duration_minutes: u16,
    pub is_active: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ServiceInput {
    pub id: u8,
    pub name: String,
    pub price_lamports: u64,
    pub duration_minutes: u16,
}

#[account]
#[derive(InitSpace)]
pub struct Reservation {
    pub client: Pubkey,
    pub salon: Pubkey,
    pub salon_owner: Pubkey,
    pub service_id: u8,
    #[max_len(32)]
    pub service_name: String,
    pub amount: u64,
    pub appointment_time: i64,
    pub created_at: i64,
    pub status: ReservationStatus,
    pub cancelled_at: Option<i64>,
    pub completed_at: Option<i64>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum ReservationStatus {
    Confirmed,
    Cancelled,
    Completed,
    NoShow,
}

// ============== EVENTS ==============

#[event]
pub struct PlatformInitialized {
    pub admin: Pubkey,
    pub treasury_wallet: Pubkey,
}

#[event]
pub struct SalonRegistered {
    pub salon: Pubkey,
    pub owner: Pubkey,
    pub name: String,
}

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

#[event]
pub struct RefundProcessed {
    pub reservation: Pubkey,
    pub client: Pubkey,
    pub amount: u64,
}

#[event]
pub struct ReservationCompleted {
    pub reservation: Pubkey,
    pub salon_payment: u64,
    pub app_commission: u64,
}

#[event]
pub struct ReservationNoShow {
    pub reservation: Pubkey,
    pub client: Pubkey,
    pub salon_payment: u64,
    pub app_commission: u64,
}

// ============== ERRORS ==============

#[error_code]
pub enum GlamBookError {
    #[msg("Name exceeds maximum length of 64 characters")]
    NameTooLong,
    #[msg("Maximum 10 services allowed per salon")]
    TooManyServices,
    #[msg("Service not found or inactive")]
    ServiceNotFound,
    #[msg("Appointment time must be in the future")]
    InvalidAppointmentTime,
    #[msg("Only the client can cancel their reservation")]
    UnauthorizedCancellation,
    #[msg("Invalid reservation status for this operation")]
    InvalidReservationStatus,
    #[msg("Invalid salon owner")]
    InvalidSalonOwner,
    #[msg("Invalid treasury wallet")]
    InvalidTreasury,
    #[msg("Only salon owner can complete reservations")]
    UnauthorizedCompletion,
    #[msg("Appointment time has not passed yet")]
    AppointmentNotYetDue,
    #[msg("Only salon owner can mark no-shows")]
    UnauthorizedNoShow,
    #[msg("Too early to mark as no-show")]
    TooEarlyForNoShow,
}


