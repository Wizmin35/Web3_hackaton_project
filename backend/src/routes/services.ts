import { Router } from 'express';
import { prisma } from '../services/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const serviceRouter = Router();

// Get all services (with optional filters)
serviceRouter.get('/', async (req, res) => {
  const { category, salonId } = req.query;

  const services = await prisma.service.findMany({
    where: {
      isActive: true,
      ...(category && { category: category as any }),
      ...(salonId && { salonId: salonId as string }),
    },
    include: {
      salon: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  res.json({
    success: true,
    data: services,
  });
});

// Get service by ID
serviceRouter.get('/:id', async (req, res) => {
  const { id } = req.params;

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      salon: true,
    },
  });

  if (!service) {
    throw new AppError('Service not found', 404);
  }

  res.json({
    success: true,
    data: service,
  });
});

// Create service (salon owner only)
serviceRouter.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const walletAddress = req.walletAddress!;
  const {
    salonId,
    name,
    description,
    priceLamports,
    priceDisplay,
    durationMinutes,
    category,
    imageUrl,
  } = req.body;

  // Verify salon ownership
  const salon = await prisma.salon.findUnique({ where: { id: salonId } });

  if (!salon) {
    throw new AppError('Salon not found', 404);
  }

  if (salon.walletAddress !== walletAddress) {
    throw new AppError('Unauthorized', 403);
  }

  // Get next on-chain ID for this salon
  const lastService = await prisma.service.findFirst({
    where: { salonId },
    orderBy: { onChainId: 'desc' },
  });
  const onChainId = (lastService?.onChainId ?? 0) + 1;

  const service = await prisma.service.create({
    data: {
      salonId,
      onChainId,
      name,
      description,
      priceLamports: BigInt(priceLamports),
      priceDisplay,
      durationMinutes,
      category,
      imageUrl,
    },
  });

  res.status(201).json({
    success: true,
    data: {
      ...service,
      priceLamports: service.priceLamports.toString(),
    },
  });
});

// Update service
serviceRouter.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const walletAddress = req.walletAddress!;
  const { name, description, priceLamports, priceDisplay, durationMinutes, category, imageUrl, isActive } = req.body;

  const service = await prisma.service.findUnique({
    where: { id },
    include: { salon: true },
  });

  if (!service) {
    throw new AppError('Service not found', 404);
  }

  if (service.salon.walletAddress !== walletAddress) {
    throw new AppError('Unauthorized', 403);
  }

  const updated = await prisma.service.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(priceLamports && { priceLamports: BigInt(priceLamports) }),
      ...(priceDisplay && { priceDisplay }),
      ...(durationMinutes && { durationMinutes }),
      ...(category && { category }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  res.json({
    success: true,
    data: {
      ...updated,
      priceLamports: updated.priceLamports.toString(),
    },
  });
});

// Delete service (soft delete)
serviceRouter.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const walletAddress = req.walletAddress!;

  const service = await prisma.service.findUnique({
    where: { id },
    include: { salon: true },
  });

  if (!service) {
    throw new AppError('Service not found', 404);
  }

  if (service.salon.walletAddress !== walletAddress) {
    throw new AppError('Unauthorized', 403);
  }

  await prisma.service.update({
    where: { id },
    data: { isActive: false },
  });

  res.json({
    success: true,
    message: 'Service deleted',
  });
});


