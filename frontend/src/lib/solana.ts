import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID || 'So1Book111111111111111111111111111111111111';
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export const connection = new Connection(RPC_URL, 'confirmed');
export const programId = new PublicKey(PROGRAM_ID);

// Derive PDAs
export function getPlatformPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('platform')],
    programId
  );
}

export function getSalonPDA(ownerPubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('salon'), ownerPubkey.toBuffer()],
    programId
  );
}

export function getReservationPDA(
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
    programId
  );
}

// Convert SOL to lamports
export function solToLamports(sol: number): number {
  return Math.round(sol * LAMPORTS_PER_SOL);
}

// Convert lamports to SOL
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

// Format SOL amount for display
export function formatSol(lamports: number, decimals: number = 4): string {
  return lamportsToSol(lamports).toFixed(decimals);
}

// Get account balance
export async function getBalance(pubkey: PublicKey): Promise<number> {
  return connection.getBalance(pubkey);
}

// Build create reservation instruction
export async function buildCreateReservationTx(
  client: PublicKey,
  salonOwner: PublicKey,
  serviceId: number,
  appointmentTime: number,
  amount: number
): Promise<Transaction> {
  const tx = new Transaction();
  
  const [platformPDA] = getPlatformPDA();
  const [salonPDA] = getSalonPDA(salonOwner);
  const [reservationPDA] = getReservationPDA(client, salonPDA, appointmentTime);

  // In production, this would use Anchor to build the instruction properly
  // For now, we'll use a placeholder transfer to demonstrate the flow
  tx.add(
    SystemProgram.transfer({
      fromPubkey: client,
      toPubkey: reservationPDA,
      lamports: amount,
    })
  );

  const latestBlockhash = await connection.getLatestBlockhash();
  tx.recentBlockhash = latestBlockhash.blockhash;
  tx.feePayer = client;

  return tx;
}

// Build cancel reservation instruction
export async function buildCancelReservationTx(
  client: PublicKey,
  reservationPDA: PublicKey
): Promise<Transaction> {
  const tx = new Transaction();
  
  // In production, this would call the cancel_reservation instruction
  const latestBlockhash = await connection.getLatestBlockhash();
  tx.recentBlockhash = latestBlockhash.blockhash;
  tx.feePayer = client;

  return tx;
}

// Verify transaction on chain
export async function verifyTransaction(signature: string): Promise<boolean> {
  try {
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
    });
    return tx !== null;
  } catch {
    return false;
  }
}

// Get transaction explorer URL
export function getExplorerUrl(signature: string, cluster: string = 'devnet'): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}

// Get address explorer URL
export function getAddressExplorerUrl(address: string, cluster: string = 'devnet'): string {
  return `https://explorer.solana.com/address/${address}?cluster=${cluster}`;
}


