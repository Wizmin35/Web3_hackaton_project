import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

async function main() {
  // Configure the client to use devnet
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  console.log("🚀 Deploying GlamBook to", provider.connection.rpcEndpoint);
  console.log("📝 Using wallet:", provider.wallet.publicKey.toBase58());

  // Get wallet balance
  const balance = await provider.connection.getBalance(provider.wallet.publicKey);
  console.log("💰 Wallet balance:", balance / LAMPORTS_PER_SOL, "SOL");

  if (balance < 0.5 * LAMPORTS_PER_SOL) {
    console.log("⚠️  Low balance! Requesting airdrop...");
    const airdropSig = await provider.connection.requestAirdrop(
      provider.wallet.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);
    console.log("✅ Airdrop received!");
  }

  // Load the program
  const idl = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../target/idl/solbook.json"),
      "utf8"
    )
  );

  const programId = new PublicKey(idl.metadata.address);
  const program = new anchor.Program(idl, programId, provider);

  console.log("\n📋 Program ID:", programId.toBase58());

  // Initialize platform
  console.log("\n🔧 Initializing platform...");

  // Generate treasury wallet
  const treasuryWallet = Keypair.generate();
  console.log("💎 Treasury wallet:", treasuryWallet.publicKey.toBase58());

  // Derive platform PDA
  const [platformPDA, platformBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    programId
  );
  console.log("🏛️  Platform PDA:", platformPDA.toBase58());

  try {
    // Check if platform already initialized
    const platformAccount = await provider.connection.getAccountInfo(platformPDA);
    
    if (platformAccount) {
      console.log("ℹ️  Platform already initialized");
    } else {
      const tx = await program.methods
        .initializePlatform(treasuryWallet.publicKey)
        .accounts({
          platform: platformPDA,
          admin: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Platform initialized! TX:", tx);
    }
  } catch (error) {
    console.error("❌ Error initializing platform:", error);
  }

  // Save deployment info
  const deploymentInfo = {
    network: "devnet",
    programId: programId.toBase58(),
    platformPDA: platformPDA.toBase58(),
    treasuryWallet: treasuryWallet.publicKey.toBase58(),
    admin: provider.wallet.publicKey.toBase58(),
    deployedAt: new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, "../deployment.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📄 Deployment info saved to:", outputPath);

  // Save treasury keypair (KEEP THIS SECURE!)
  const treasuryPath = path.join(__dirname, "../treasury-keypair.json");
  fs.writeFileSync(
    treasuryPath,
    JSON.stringify(Array.from(treasuryWallet.secretKey))
  );
  console.log("🔐 Treasury keypair saved to:", treasuryPath);
  console.log("⚠️  IMPORTANT: Keep the treasury keypair secure!");

  console.log("\n🎉 Deployment complete!");
  console.log("\n📋 Summary:");
  console.log("   Network:", deploymentInfo.network);
  console.log("   Program ID:", deploymentInfo.programId);
  console.log("   Platform PDA:", deploymentInfo.platformPDA);
  console.log("   Treasury:", deploymentInfo.treasuryWallet);
  console.log("   Admin:", deploymentInfo.admin);
}

main().catch(console.error);


