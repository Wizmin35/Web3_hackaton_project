import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Solana
  solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  programId: process.env.PROGRAM_ID || 'So1Book111111111111111111111111111111111111',
  treasuryWallet: process.env.TREASURY_WALLET || '',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'development-secret-key',
  
  // CORS
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  
  // Pricing
  eurToLamports: 50_000_000, // Approximate EUR to lamports conversion
  appCommissionBps: 300, // 3% = 300 basis points
};


