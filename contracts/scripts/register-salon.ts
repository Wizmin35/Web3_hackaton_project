import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  console.log("🏪 Registering a test salon...");

  // Load IDL
  const idl = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../target/idl/solbook.json"),
      "utf8"
    )
  );

  const programId = new PublicKey(idl.metadata.address);
  const program = new anchor.Program(idl, programId, provider);

  // Derive salon PDA
  const [salonPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("salon"), provider.wallet.publicKey.toBuffer()],
    programId
  );

  console.log("📍 Salon PDA:", salonPDA.toBase58());

  // Define services
  const services = [
    {
      id: 1,
      name: "Muško šišanje",
      priceLamports: new anchor.BN(0.1 * LAMPORTS_PER_SOL),
      durationMinutes: 30,
    },
    {
      id: 2,
      name: "Žensko šišanje",
      priceLamports: new anchor.BN(0.15 * LAMPORTS_PER_SOL),
      durationMinutes: 45,
    },
    {
      id: 3,
      name: "Gel lakiranje",
      priceLamports: new anchor.BN(0.12 * LAMPORTS_PER_SOL),
      durationMinutes: 60,
    },
    {
      id: 4,
      name: "Manikura",
      priceLamports: new anchor.BN(0.08 * LAMPORTS_PER_SOL),
      durationMinutes: 30,
    },
  ];

  try {
    const tx = await program.methods
      .registerSalon("Studio Hair Demo", services)
      .accounts({
        salon: salonPDA,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Salon registered! TX:", tx);
    console.log("\n📋 Salon Info:");
    console.log("   Name: Studio Hair Demo");
    console.log("   Owner:", provider.wallet.publicKey.toBase58());
    console.log("   PDA:", salonPDA.toBase58());
    console.log("   Services:", services.length);

    // Fetch and display salon data
    const salonAccount = await program.account.salon.fetch(salonPDA);
    console.log("\n🔍 On-chain data:");
    console.log("   Name:", salonAccount.name);
    console.log("   Active:", salonAccount.isActive);
    console.log("   Services:", salonAccount.services.length);
    salonAccount.services.forEach((s: any, i: number) => {
      console.log(`      ${i + 1}. ${s.name} - ${s.priceLamports.toNumber() / LAMPORTS_PER_SOL} SOL (${s.durationMinutes} min)`);
    });
  } catch (error: any) {
    if (error.message?.includes("already in use")) {
      console.log("ℹ️  Salon already registered for this wallet");
    } else {
      console.error("❌ Error:", error);
    }
  }
}

main().catch(console.error);


