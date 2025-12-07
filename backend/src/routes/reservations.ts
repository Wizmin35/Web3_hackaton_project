import { Router } from 'express';
import { prisma } from '../services/database';
import { SolanaService } from '../services/solana';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { PublicKey } from '@solana/web3.js';
import { config } from '../config';

export const reservationRouter = Router();

// Get user's reservations
reservationRouter.get('/my', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const walletAddress = req.walletAddress!;
  const { status } = req.query;

  const reservations = await prisma.reservation.findMany({
    where: {
      clientWallet: walletAddress,
      ...(status && { status: status as any }),
    },
    include: {
      salon: {
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
        },
      },
      service: true,
    },
    orderBy: { appointmentTime: 'desc' },
  });

  res.json({
    success: true,
    data: reservations.map(r => ({
      ...r,
      amountLamports: r.amountLamports.toString(),
      refundAmount: r.refundAmount?.toString(),
      salonFee: r.salonFee?.toString(),
      appCommission: r.appCommission?.toString(),
    })),
  });
});

// Get available time slots for a salon/service
reservationRouter.get('/slots', async (req, res) => {
  const { salonId, serviceId, date } = req.query;

  if (!salonId || !serviceId || !date) {
    throw new AppError('Missing required parameters', 400);
  }

  const salon = await prisma.salon.findUnique({
    where: { id: salonId as string },
    include: {
      availability: true,
    },
  });

  if (!salon) {
    throw new AppError('Salon not found', 404);
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId as string },
  });

  if (!service) {
    throw new AppError('Service not found', 404);
  }

  const requestedDate = new Date(date as string);
  const dayOfWeek = requestedDate.getDay();

  const dayAvailability = salon.availability.find(a => a.dayOfWeek === dayOfWeek && a.isActive);

  if (!dayAvailability) {
    return res.json({
      success: true,
      data: [],
    });
  }

  // Get existing reservations for that day
  const startOfDay = new Date(requestedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(requestedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingReservations = await prisma.reservation.findMany({
    where: {
      salonId: salonId as string,
      appointmentTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
    },
    include: {
      service: true,
    },
  });

  // Generate available slots
  const slots: { time: string; available: boolean }[] = [];
  const [startHour, startMinute] = dayAvailability.startTime.split(':').map(Number);
  const [endHour, endMinute] = dayAvailability.endTime.split(':').map(Number);

  const slotDuration = 30; // 30-minute slots
  let currentTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  while (currentTime + service.durationMinutes <= endTime) {
    const hour = Math.floor(currentTime / 60);
    const minute = currentTime % 60;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    const slotStart = new Date(requestedDate);
    slotStart.setHours(hour, minute, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + service.durationMinutes * 60 * 1000);

    // Check if slot overlaps with any existing reservation
    const isBooked = existingReservations.some(r => {
      const resStart = new Date(r.appointmentTime);
      const resEnd = new Date(resStart.getTime() + r.service.durationMinutes * 60 * 1000);
      return slotStart < resEnd && slotEnd > resStart;
    });

    // Check if slot is in the past
    const isPast = slotStart < new Date();

    slots.push({
      time: timeString,
      available: !isBooked && !isPast,
    });

    currentTime += slotDuration;
  }

  res.json({
    success: true,
    data: slots,
  });
});

// Create a reservation
reservationRouter.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const walletAddress = req.walletAddress!;
  const { salonId, serviceId, appointmentTime, transactionHash } = req.body;

  if (!salonId || !serviceId || !appointmentTime) {
    throw new AppError('Missing required fields', 400);
  }

  const appointmentDate = new Date(appointmentTime);

  // Validate appointment is in the future
  if (appointmentDate <= new Date()) {
    throw new AppError('Appointment must be in the future', 400);
  }

  // Get salon and service
  const salon = await prisma.salon.findUnique({ where: { id: salonId } });
  const service = await prisma.service.findUnique({ where: { id: serviceId } });

  if (!salon || !service) {
    throw new AppError('Salon or service not found', 404);
  }

  if (service.salonId !== salonId) {
    throw new AppError('Service does not belong to this salon', 400);
  }

  // Calculate on-chain PDA
  const solanaService = SolanaService.getInstance();
  const clientPubkey = new PublicKey(walletAddress);
  const [salonPDA] = solanaService.getSalonPDA(new PublicKey(salon.walletAddress));
  const [reservationPDA] = solanaService.getReservationPDA(
    clientPubkey,
    salonPDA,
    Math.floor(appointmentDate.getTime() / 1000)
  );

  // Create reservation
  const reservation = await prisma.reservation.create({
    data: {
      onChainAddress: reservationPDA.toBase58(),
      transactionHash,
      clientWallet: walletAddress,
      salonId,
      serviceId,
      appointmentTime: appointmentDate,
      amountLamports: service.priceLamports,
      status: transactionHash ? 'CONFIRMED' : 'PENDING',
    },
    include: {
      salon: {
        select: {
          id: true,
          name: true,
          walletAddress: true,
        },
      },
      service: true,
    },
  });

  res.status(201).json({
    success: true,
    data: {
      ...reservation,
      amountLamports: reservation.amountLamports.toString(),
      reservationPDA: reservationPDA.toBase58(),
      salonPDA: salonPDA.toBase58(),
    },
  });
});

// Confirm reservation with transaction
reservationRouter.post('/:id/confirm', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { transactionHash } = req.body;
  const walletAddress = req.walletAddress!;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
  });

  if (!reservation) {
    throw new AppError('Reservation not found', 404);
  }

  if (reservation.clientWallet !== walletAddress) {
    throw new AppError('Unauthorized', 403);
  }

  if (reservation.status !== 'PENDING') {
    throw new AppError('Reservation already confirmed or cancelled', 400);
  }

  // Verify transaction on-chain
  const solanaService = SolanaService.getInstance();
  const isValid = await solanaService.verifyTransaction(transactionHash);

  if (!isValid) {
    throw new AppError('Transaction not found or not confirmed', 400);
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: {
      transactionHash,
      status: 'CONFIRMED',
    },
  });

  res.json({
    success: true,
    data: {
      ...updated,
      amountLamports: updated.amountLamports.toString(),
    },
  });
});

// Cancel reservation
reservationRouter.post('/:id/cancel', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { transactionHash } = req.body;
  const walletAddress = req.walletAddress!;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
  });

  if (!reservation) {
    throw new AppError('Reservation not found', 404);
  }

  if (reservation.clientWallet !== walletAddress) {
    throw new AppError('Unauthorized', 403);
  }

  if (reservation.status !== 'CONFIRMED') {
    throw new AppError('Can only cancel confirmed reservations', 400);
  }

  // Calculate refund based on policy
  const timeUntilAppointment = reservation.appointmentTime.getTime() - Date.now();
  const hoursUntil = timeUntilAppointment / (1000 * 60 * 60);

  let refundPercentage: number;
  let salonFeeEur: number;

  if (hoursUntil > 48) {
    refundPercentage = 100;
    salonFeeEur = 0;
  } else if (hoursUntil > 24) {
    refundPercentage = 80;
    salonFeeEur = 2;
  } else if (hoursUntil > 0) {
    refundPercentage = 50;
    salonFeeEur = 5;
  } else {
    refundPercentage = 0;
    salonFeeEur = 10;
  }

  const refundAmount = (reservation.amountLamports * BigInt(refundPercentage)) / BigInt(100);
  const salonFee = BigInt(salonFeeEur) * BigInt(config.eurToLamports);
  const appCommission = (salonFee * BigInt(config.appCommissionBps)) / BigInt(10000);

  const updated = await prisma.reservation.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      transactionHash: transactionHash || reservation.transactionHash,
      refundAmount,
      salonFee: salonFee - appCommission,
      appCommission,
    },
  });

  res.json({
    success: true,
    data: {
      ...updated,
      amountLamports: updated.amountLamports.toString(),
      refundAmount: updated.refundAmount?.toString(),
      salonFee: updated.salonFee?.toString(),
      appCommission: updated.appCommission?.toString(),
      refundPercentage,
      hoursUntilAppointment: hoursUntil,
    },
  });
});

// Complete reservation (salon owner only)
reservationRouter.post('/:id/complete', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { transactionHash } = req.body;
  const walletAddress = req.walletAddress!;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { salon: true },
  });

  if (!reservation) {
    throw new AppError('Reservation not found', 404);
  }

  if (reservation.salon.walletAddress !== walletAddress) {
    throw new AppError('Unauthorized - only salon owner can complete', 403);
  }

  if (reservation.status !== 'CONFIRMED') {
    throw new AppError('Can only complete confirmed reservations', 400);
  }

  if (new Date(reservation.appointmentTime) > new Date()) {
    throw new AppError('Cannot complete reservation before appointment time', 400);
  }

  const appCommission = (reservation.amountLamports * BigInt(config.appCommissionBps)) / BigInt(10000);
  const salonPayment = reservation.amountLamports - appCommission;

  const updated = await prisma.reservation.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      transactionHash: transactionHash || reservation.transactionHash,
      salonFee: salonPayment,
      appCommission,
    },
  });

  // Update salon earnings
  await prisma.salon.update({
    where: { id: reservation.salonId },
    data: {
      totalEarnings: {
        increment: salonPayment,
      },
    },
  });

  res.json({
    success: true,
    data: {
      ...updated,
      amountLamports: updated.amountLamports.toString(),
      salonFee: updated.salonFee?.toString(),
      appCommission: updated.appCommission?.toString(),
    },
  });
});

// Mark as no-show (salon owner only)
reservationRouter.post('/:id/no-show', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { transactionHash } = req.body;
  const walletAddress = req.walletAddress!;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { salon: true },
  });

  if (!reservation) {
    throw new AppError('Reservation not found', 404);
  }

  if (reservation.salon.walletAddress !== walletAddress) {
    throw new AppError('Unauthorized - only salon owner can mark no-show', 403);
  }

  if (reservation.status !== 'CONFIRMED') {
    throw new AppError('Can only mark confirmed reservations as no-show', 400);
  }

  // Must be at least 15 minutes after appointment time
  const gracePeriod = 15 * 60 * 1000;
  if (new Date(reservation.appointmentTime).getTime() + gracePeriod > Date.now()) {
    throw new AppError('Must wait 15 minutes after appointment time', 400);
  }

  const appCommission = (reservation.amountLamports * BigInt(config.appCommissionBps)) / BigInt(10000);
  const salonPayment = reservation.amountLamports - appCommission;

  const updated = await prisma.reservation.update({
    where: { id },
    data: {
      status: 'NO_SHOW',
      transactionHash: transactionHash || reservation.transactionHash,
      refundAmount: BigInt(0),
      salonFee: salonPayment,
      appCommission,
    },
  });

  // Update salon earnings
  await prisma.salon.update({
    where: { id: reservation.salonId },
    data: {
      totalEarnings: {
        increment: salonPayment,
      },
    },
  });

  res.json({
    success: true,
    data: {
      ...updated,
      amountLamports: updated.amountLamports.toString(),
      refundAmount: '0',
      salonFee: updated.salonFee?.toString(),
      appCommission: updated.appCommission?.toString(),
    },
  });
});


