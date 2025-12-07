import { Connection, PublicKey, Commitment } from '@solana/web3.js';
import { config } from '../config';
import { prisma } from './database';

export class SolanaService {
  private static instance: SolanaService;
  private connection: Connection;
  private programId: PublicKey;
  private subscriptionId: number | null = null;

  private constructor() {
    this.connection = new Connection(config.solanaRpcUrl, 'confirmed');
    this.programId = new PublicKey(config.programId);
  }

  static getInstance(): SolanaService {
    if (!SolanaService.instance) {
      SolanaService.instance = new SolanaService();
    }
    return SolanaService.instance;
  }

  async initialize(): Promise<void> {
    try {
      const version = await this.connection.getVersion();
      console.log('Connected to Solana:', version);
    } catch (error) {
      console.error('Failed to connect to Solana:', error);
      throw error;
    }
  }

  getConnection(): Connection {
    return this.connection;
  }

  getProgramId(): PublicKey {
    return this.programId;
  }

  // Derive PDA for platform
  getPlatformPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('platform')],
      this.programId
    );
  }

  // Derive PDA for salon
  getSalonPDA(ownerPubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('salon'), ownerPubkey.toBuffer()],
      this.programId
    );
  }

  // Derive PDA for reservation
  getReservationPDA(
    clientPubkey: PublicKey,
    salonPDA: PublicKey,
    appointmentTime: number
  ): [PublicKey, number] {
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigInt64LE(BigInt(appointmentTime));
    
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('reservation'),
        clientPubkey.toBuffer(),
        salonPDA.toBuffer(),
        timeBuffer,
      ],
      this.programId
    );
  }

  // Start listening to program events
  startEventListener(): void {
    if (this.subscriptionId !== null) {
      console.log('Event listener already running');
      return;
    }

    this.subscriptionId = this.connection.onLogs(
      this.programId,
      async (logs) => {
        await this.processLogs(logs);
      },
      'confirmed' as Commitment
    );

    console.log('Solana event listener started with ID:', this.subscriptionId);
  }

  stopEventListener(): void {
    if (this.subscriptionId !== null) {
      this.connection.removeOnLogsListener(this.subscriptionId);
      this.subscriptionId = null;
      console.log('Solana event listener stopped');
    }
  }

  private async processLogs(logs: { signature: string; logs: string[] }): Promise<void> {
    try {
      const logString = logs.logs.join('\n');
      
      // Parse events from logs
      if (logString.includes('ReservationCreated')) {
        await this.handleReservationCreated(logs.signature);
      } else if (logString.includes('ReservationCancelled')) {
        await this.handleReservationCancelled(logs.signature);
      } else if (logString.includes('ReservationCompleted')) {
        await this.handleReservationCompleted(logs.signature);
      } else if (logString.includes('ReservationNoShow')) {
        await this.handleReservationNoShow(logs.signature);
      }
    } catch (error) {
      console.error('Error processing logs:', error);
    }
  }

  private async handleReservationCreated(signature: string): Promise<void> {
    console.log('Reservation created on-chain:', signature);
    // Update database based on transaction
    // In production, parse the transaction to get details
  }

  private async handleReservationCancelled(signature: string): Promise<void> {
    console.log('Reservation cancelled on-chain:', signature);
    // Find reservation by transaction and update status
    const reservation = await prisma.reservation.findFirst({
      where: { transactionHash: signature },
    });
    
    if (reservation) {
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });
    }
  }

  private async handleReservationCompleted(signature: string): Promise<void> {
    console.log('Reservation completed on-chain:', signature);
  }

  private async handleReservationNoShow(signature: string): Promise<void> {
    console.log('Reservation marked as no-show on-chain:', signature);
  }

  // Verify a transaction exists and is confirmed
  async verifyTransaction(signature: string): Promise<boolean> {
    try {
      const tx = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
      });
      return tx !== null;
    } catch {
      return false;
    }
  }

  // Get account data
  async getAccountInfo(pubkey: PublicKey) {
    return this.connection.getAccountInfo(pubkey);
  }
}


