import { Router } from 'express';
import { SolanaService } from '../services/solana';
import { prisma } from '../services/database';

export const webhookRouter = Router();

// Webhook for Solana transaction notifications (from Helius, etc.)
webhookRouter.post('/solana', async (req, res) => {
  try {
    const { type, transaction, signature } = req.body;

    console.log('Received Solana webhook:', type, signature);

    // Process different event types
    switch (type) {
      case 'TRANSACTION':
        // Verify and process transaction
        const solanaService = SolanaService.getInstance();
        const isValid = await solanaService.verifyTransaction(signature);
        
        if (isValid) {
          console.log('Transaction verified:', signature);
          // Update relevant reservations
        }
        break;

      default:
        console.log('Unknown webhook type:', type);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: 'Internal error' });
  }
});

// Manual sync endpoint for development
webhookRouter.post('/sync/:reservationId', async (req, res) => {
  const { reservationId } = req.params;

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    if (reservation.transactionHash) {
      const solanaService = SolanaService.getInstance();
      const isValid = await solanaService.verifyTransaction(reservation.transactionHash);

      if (isValid && reservation.status === 'PENDING') {
        await prisma.reservation.update({
          where: { id: reservationId },
          data: { status: 'CONFIRMED' },
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ success: false, error: 'Internal error' });
  }
});


