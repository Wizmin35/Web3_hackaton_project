import { Router } from 'express';
import { generateNonce, verifySignature, validateNonce } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const authRouter = Router();

// Get nonce for wallet authentication
authRouter.post('/nonce', (req, res) => {
  const { walletAddress } = req.body;
  
  if (!walletAddress) {
    throw new AppError('Wallet address required', 400);
  }

  const nonce = generateNonce(walletAddress);
  
  res.json({
    success: true,
    data: { nonce },
  });
});

// Verify signature and authenticate
authRouter.post('/verify', (req, res) => {
  const { walletAddress, signature, nonce } = req.body;

  if (!walletAddress || !signature || !nonce) {
    throw new AppError('Missing required fields', 400);
  }

  // Validate nonce
  if (!validateNonce(walletAddress, nonce)) {
    throw new AppError('Invalid or expired nonce', 401);
  }

  // Verify signature
  if (!verifySignature(walletAddress, signature, nonce)) {
    throw new AppError('Invalid signature', 401);
  }

  res.json({
    success: true,
    data: {
      authenticated: true,
      walletAddress,
    },
  });
});

// Check authentication status
authRouter.get('/status', (req, res) => {
  const authHeader = req.headers.authorization;
  
  res.json({
    success: true,
    data: {
      authenticated: !!authHeader && authHeader.startsWith('Wallet '),
    },
  });
});


