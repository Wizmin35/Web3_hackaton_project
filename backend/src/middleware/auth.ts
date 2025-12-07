import { Request, Response, NextFunction } from 'express';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { AppError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  walletAddress?: string;
}

// Simple nonce store (in production, use Redis)
const nonceStore = new Map<string, { nonce: string; expires: number }>();

export const generateNonce = (walletAddress: string): string => {
  const nonce = `SolBook authentication: ${Date.now()}-${Math.random().toString(36).substring(7)}`;
  nonceStore.set(walletAddress, {
    nonce,
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes
  });
  return nonce;
};

export const verifySignature = (
  walletAddress: string,
  signature: string,
  message: string
): boolean => {
  try {
    const publicKey = bs58.decode(walletAddress);
    const signatureBytes = bs58.decode(signature);
    const messageBytes = new TextEncoder().encode(message);
    
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey);
  } catch {
    return false;
  }
};

export const validateNonce = (walletAddress: string, nonce: string): boolean => {
  const stored = nonceStore.get(walletAddress);
  if (!stored) return false;
  if (Date.now() > stored.expires) {
    nonceStore.delete(walletAddress);
    return false;
  }
  if (stored.nonce !== nonce) return false;
  
  nonceStore.delete(walletAddress); // One-time use
  return true;
};

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Wallet ')) {
    throw new AppError('No authentication provided', 401);
  }

  const walletAddress = authHeader.substring(7);
  
  // Basic validation of wallet address format
  try {
    const decoded = bs58.decode(walletAddress);
    if (decoded.length !== 32) {
      throw new Error('Invalid length');
    }
  } catch {
    throw new AppError('Invalid wallet address', 401);
  }

  req.walletAddress = walletAddress;
  next();
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Wallet ')) {
    try {
      const walletAddress = authHeader.substring(7);
      const decoded = bs58.decode(walletAddress);
      if (decoded.length === 32) {
        req.walletAddress = walletAddress;
      }
    } catch {
      // Ignore invalid auth, continue without wallet
    }
  }
  
  next();
};


