import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { salonRouter } from './routes/salons';
import { reservationRouter } from './routes/reservations';
import { serviceRouter } from './routes/services';
import { webhookRouter } from './routes/webhooks';
import { SolanaService } from './services/solana';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/salons', salonRouter);
app.use('/api/services', serviceRouter);
app.use('/api/reservations', reservationRouter);
app.use('/api/webhooks', webhookRouter);

// Error handler
app.use(errorHandler);

// Initialize Solana service and start server
async function main() {
  try {
    // Initialize Solana connection
    await SolanaService.getInstance().initialize();
    console.log('✅ Solana service initialized');

    // Start event listener
    SolanaService.getInstance().startEventListener();
    console.log('✅ Solana event listener started');

    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📡 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Solana RPC: ${config.solanaRpcUrl}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();


