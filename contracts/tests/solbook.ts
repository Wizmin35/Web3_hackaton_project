import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Solbook } from "../target/types/solbook";
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";

describe("solbook", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Solbook as Program<Solbook>;
  
  const admin = Keypair.generate();
  const treasuryWallet = Keypair.generate();
  const salonOwner = Keypair.generate();
  const client = Keypair.generate();

  let platformPDA: PublicKey;
  let salonPDA: PublicKey;
  let reservationPDA: PublicKey;

  const appointmentTime = Math.floor(Date.now() / 1000) + 72 * 60 * 60; // 72 hours from now

  before(async () => {
    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(admin.publicKey, 10 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(salonOwner.publicKey, 10 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(client.publicKey, 10 * LAMPORTS_PER_SOL);
    
    // Wait for confirmations
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Derive PDAs
    [platformPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform")],
      program.programId
    );

    [salonPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("salon"), salonOwner.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Initializes the platform", async () => {
    await program.methods
      .initializePlatform(treasuryWallet.publicKey)
      .accounts({
        platform: platformPDA,
        admin: admin.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin])
      .rpc();

    const platform = await program.account.platform.fetch(platformPDA);
    expect(platform.admin.toString()).to.equal(admin.publicKey.toString());
    expect(platform.treasuryWallet.toString()).to.equal(treasuryWallet.publicKey.toString());
    expect(platform.totalReservations.toNumber()).to.equal(0);
  });

  it("Registers a salon", async () => {
    const services = [
      {
        id: 1,
        name: "Men's Haircut",
        priceLamports: new anchor.BN(0.1 * LAMPORTS_PER_SOL),
        durationMinutes: 30,
      },
      {
        id: 2,
        name: "Nail Polish",
        priceLamports: new anchor.BN(0.15 * LAMPORTS_PER_SOL),
        durationMinutes: 45,
      },
    ];

    await program.methods
      .registerSalon("Beauty Studio", services)
      .accounts({
        salon: salonPDA,
        owner: salonOwner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([salonOwner])
      .rpc();

    const salon = await program.account.salon.fetch(salonPDA);
    expect(salon.name).to.equal("Beauty Studio");
    expect(salon.owner.toString()).to.equal(salonOwner.publicKey.toString());
    expect(salon.services.length).to.equal(2);
    expect(salon.isActive).to.be.true;
  });

  it("Creates a reservation", async () => {
    const serviceId = 1;
    
    [reservationPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("reservation"),
        client.publicKey.toBuffer(),
        salonPDA.toBuffer(),
        new anchor.BN(appointmentTime).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const clientBalanceBefore = await provider.connection.getBalance(client.publicKey);

    await program.methods
      .createReservation(serviceId, new anchor.BN(appointmentTime))
      .accounts({
        platform: platformPDA,
        salon: salonPDA,
        reservation: reservationPDA,
        client: client.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([client])
      .rpc();

    const reservation = await program.account.reservation.fetch(reservationPDA);
    expect(reservation.client.toString()).to.equal(client.publicKey.toString());
    expect(reservation.serviceId).to.equal(serviceId);
    expect(reservation.status.confirmed).to.not.be.undefined;

    const clientBalanceAfter = await provider.connection.getBalance(client.publicKey);
    expect(clientBalanceBefore - clientBalanceAfter).to.be.greaterThan(0.1 * LAMPORTS_PER_SOL);
  });

  it("Cancels a reservation with full refund (>48h)", async () => {
    const reservationBalanceBefore = await provider.connection.getBalance(reservationPDA);
    const clientBalanceBefore = await provider.connection.getBalance(client.publicKey);

    await program.methods
      .cancelReservation()
      .accounts({
        reservation: reservationPDA,
        client: client.publicKey,
        salonOwner: salonOwner.publicKey,
        platform: platformPDA,
        treasury: treasuryWallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([client])
      .rpc();

    const reservation = await program.account.reservation.fetch(reservationPDA);
    expect(reservation.status.cancelled).to.not.be.undefined;

    const clientBalanceAfter = await provider.connection.getBalance(client.publicKey);
    // Client should receive most of the refund (>48h = 100% refund)
    expect(clientBalanceAfter).to.be.greaterThan(clientBalanceBefore);
  });

  it("Creates another reservation for completion test", async () => {
    const newAppointmentTime = Math.floor(Date.now() / 1000) + 1; // Just 1 second ahead
    const serviceId = 2;
    
    const [newReservationPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("reservation"),
        client.publicKey.toBuffer(),
        salonPDA.toBuffer(),
        new anchor.BN(newAppointmentTime).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    await program.methods
      .createReservation(serviceId, new anchor.BN(newAppointmentTime))
      .accounts({
        platform: platformPDA,
        salon: salonPDA,
        reservation: newReservationPDA,
        client: client.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([client])
      .rpc();

    // Wait for appointment time to pass
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Complete the reservation
    await program.methods
      .completeReservation()
      .accounts({
        reservation: newReservationPDA,
        salon: salonPDA,
        salonOwner: salonOwner.publicKey,
        platform: platformPDA,
        treasury: treasuryWallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([salonOwner])
      .rpc();

    const reservation = await program.account.reservation.fetch(newReservationPDA);
    expect(reservation.status.completed).to.not.be.undefined;

    const salon = await program.account.salon.fetch(salonPDA);
    expect(salon.totalEarnings.toNumber()).to.be.greaterThan(0);
  });
});


