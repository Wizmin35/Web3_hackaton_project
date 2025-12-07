import { Router } from 'express';
import { prisma } from '../services/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const salonRouter = Router();

// Get all active salons
salonRouter.get('/', async (req, res) => {
  const { city, search } = req.query;

  const salons = await prisma.salon.findMany({
    where: {
      isActive: true,
      ...(city && { city: city as string }),
      ...(search && {
        OR: [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      services: {
        where: { isActive: true },
      },
      availability: true,
    },
    orderBy: { name: 'asc' },
  });

  res.json({
    success: true,
    data: salons,
  });
});

// Get salon by ID
salonRouter.get('/:id', async (req, res) => {
  const { id } = req.params;

  const salon = await prisma.salon.findUnique({
    where: { id },
    include: {
      services: {
        where: { isActive: true },
      },
      availability: true,
    },
  });

  if (!salon) {
    throw new AppError('Salon not found', 404);
  }

  res.json({
    success: true,
    data: salon,
  });
});

// Get salon by wallet address
salonRouter.get('/wallet/:walletAddress', async (req, res) => {
  const { walletAddress } = req.params;

  const salon = await prisma.salon.findUnique({
    where: { walletAddress },
    include: {
      services: true,
      availability: true,
    },
  });

  if (!salon) {
    throw new AppError('Salon not found', 404);
  }

  res.json({
    success: true,
    data: salon,
  });
});

// Register a new salon (requires auth)
salonRouter.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { name, description, address, city, phone, email, imageUrl } = req.body;
  const walletAddress = req.walletAddress!;

  // Check if salon already exists for this wallet
  const existing = await prisma.salon.findUnique({
    where: { walletAddress },
  });

  if (existing) {
    throw new AppError('Salon already registered for this wallet', 400);
  }

  const salon = await prisma.salon.create({
    data: {
      walletAddress,
      name,
      description,
      address,
      city,
      phone,
      email,
      imageUrl,
    },
  });

  res.status(201).json({
    success: true,
    data: salon,
  });
});

// Update salon (owner only)
salonRouter.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const walletAddress = req.walletAddress!;
  const { name, description, address, city, phone, email, imageUrl, isActive } = req.body;

  const salon = await prisma.salon.findUnique({ where: { id } });

  if (!salon) {
    throw new AppError('Salon not found', 404);
  }

  if (salon.walletAddress !== walletAddress) {
    throw new AppError('Unauthorized', 403);
  }

  const updated = await prisma.salon.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  res.json({
    success: true,
    data: updated,
  });
});

// Set salon availability
salonRouter.post('/:id/availability', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const walletAddress = req.walletAddress!;
  const { availability } = req.body; // Array of { dayOfWeek, startTime, endTime }

  const salon = await prisma.salon.findUnique({ where: { id } });

  if (!salon) {
    throw new AppError('Salon not found', 404);
  }

  if (salon.walletAddress !== walletAddress) {
    throw new AppError('Unauthorized', 403);
  }

  // Delete existing and create new
  await prisma.salonAvailability.deleteMany({ where: { salonId: id } });

  const created = await prisma.salonAvailability.createMany({
    data: availability.map((a: { dayOfWeek: number; startTime: string; endTime: string }) => ({
      salonId: id,
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
    })),
  });

  res.json({
    success: true,
    data: { created: created.count },
  });
});

// Get salon reservations (owner only)
salonRouter.get('/:id/reservations', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const walletAddress = req.walletAddress!;
  const { status, from, to } = req.query;

  const salon = await prisma.salon.findUnique({ where: { id } });

  if (!salon) {
    throw new AppError('Salon not found', 404);
  }

  if (salon.walletAddress !== walletAddress) {
    throw new AppError('Unauthorized', 403);
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      salonId: id,
      ...(status && { status: status as any }),
      ...(from && { appointmentTime: { gte: new Date(from as string) } }),
      ...(to && { appointmentTime: { lte: new Date(to as string) } }),
    },
    include: {
      service: true,
    },
    orderBy: { appointmentTime: 'asc' },
  });

  res.json({
    success: true,
    data: reservations,
  });
});

// Get salon earnings summary
salonRouter.get('/:id/earnings', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const walletAddress = req.walletAddress!;

  const salon = await prisma.salon.findUnique({ where: { id } });

  if (!salon) {
    throw new AppError('Salon not found', 404);
  }

  if (salon.walletAddress !== walletAddress) {
    throw new AppError('Unauthorized', 403);
  }

  const [completedStats, pendingStats] = await Promise.all([
    prisma.reservation.aggregate({
      where: {
        salonId: id,
        status: 'COMPLETED',
      },
      _sum: { amountLamports: true },
      _count: true,
    }),
    prisma.reservation.aggregate({
      where: {
        salonId: id,
        status: 'CONFIRMED',
      },
      _sum: { amountLamports: true },
      _count: true,
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalEarnings: salon.totalEarnings.toString(),
      completedReservations: completedStats._count,
      completedAmount: completedStats._sum.amountLamports?.toString() || '0',
      pendingReservations: pendingStats._count,
      pendingAmount: pendingStats._sum.amountLamports?.toString() || '0',
    },
  });
});


