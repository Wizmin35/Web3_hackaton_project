# SolBook Setup Script for Windows PowerShell
# This script sets up the entire project for development

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 SolBook Setup Script" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check prerequisites
Write-Host "`nChecking prerequisites..." -ForegroundColor Yellow

$missing = $false

if (Test-Command "node") {
    Write-Host "  ✓ node found" -ForegroundColor Green
} else {
    Write-Host "  ✗ node not found" -ForegroundColor Red
    $missing = $true
}

if (Test-Command "npm") {
    Write-Host "  ✓ npm found" -ForegroundColor Green
} else {
    Write-Host "  ✗ npm not found" -ForegroundColor Red
    $missing = $true
}

if (Test-Command "cargo") {
    Write-Host "  ✓ cargo found" -ForegroundColor Green
} else {
    Write-Host "  ✗ cargo not found" -ForegroundColor Red
    $missing = $true
}

if (Test-Command "solana") {
    Write-Host "  ✓ solana found" -ForegroundColor Green
} else {
    Write-Host "  ✗ solana not found" -ForegroundColor Red
    $missing = $true
}

if (Test-Command "anchor") {
    Write-Host "  ✓ anchor found" -ForegroundColor Green
} else {
    Write-Host "  ✗ anchor not found" -ForegroundColor Red
    $missing = $true
}

if ($missing) {
    Write-Host "`nPlease install missing dependencies before continuing." -ForegroundColor Red
    Write-Host "  - Node.js: https://nodejs.org/"
    Write-Host "  - Rust: https://rustup.rs/"
    Write-Host "  - Solana CLI: https://docs.solana.com/cli/install-solana-cli-tools"
    Write-Host "  - Anchor: https://www.anchor-lang.com/docs/installation"
    exit 1
}

# Configure Solana CLI
Write-Host "`nConfiguring Solana CLI for devnet..." -ForegroundColor Yellow
solana config set --url https://api.devnet.solana.com
Write-Host "  ✓ Solana CLI configured" -ForegroundColor Green

# Check/create wallet
Write-Host "`nChecking Solana wallet..." -ForegroundColor Yellow
$walletPath = "$env:USERPROFILE\.config\solana\id.json"
if (Test-Path $walletPath) {
    Write-Host "  ✓ Wallet found" -ForegroundColor Green
    $pubkey = solana-keygen pubkey
    Write-Host "  Address: $pubkey"
} else {
    Write-Host "  Creating new wallet..."
    solana-keygen new --no-bip39-passphrase
    Write-Host "  ✓ Wallet created" -ForegroundColor Green
}

# Airdrop SOL
Write-Host "`nRequesting SOL airdrop..." -ForegroundColor Yellow
try {
    solana airdrop 2
} catch {
    Write-Host "  Airdrop failed (rate limited). Try again later." -ForegroundColor Yellow
}

# Install contract dependencies
Write-Host "`nInstalling contract dependencies..." -ForegroundColor Yellow
Set-Location contracts
npm install
Write-Host "  ✓ Contract dependencies installed" -ForegroundColor Green

# Build contracts
Write-Host "`nBuilding smart contracts..." -ForegroundColor Yellow
anchor build
Write-Host "  ✓ Contracts built" -ForegroundColor Green

# Install backend dependencies
Write-Host "`nInstalling backend dependencies..." -ForegroundColor Yellow
Set-Location ..\backend
npm install
Write-Host "  ✓ Backend dependencies installed" -ForegroundColor Green

# Setup backend env
if (-not (Test-Path ".env")) {
    Write-Host "  Creating .env file..."
    @"
PORT=3001
NODE_ENV=development
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=So1Book111111111111111111111111111111111111
TREASURY_WALLET=
DATABASE_URL=postgresql://user:password@localhost:5432/solbook?schema=public
JWT_SECRET=development-secret-key-change-in-production
ALLOWED_ORIGINS=http://localhost:3000
"@ | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "  ✓ Backend .env created" -ForegroundColor Green
}

# Generate Prisma client
Write-Host "`nGenerating Prisma client..." -ForegroundColor Yellow
npx prisma generate
Write-Host "  ✓ Prisma client generated" -ForegroundColor Green

# Install frontend dependencies
Write-Host "`nInstalling frontend dependencies..." -ForegroundColor Yellow
Set-Location ..\frontend
npm install
Write-Host "  ✓ Frontend dependencies installed" -ForegroundColor Green

# Setup frontend env
if (-not (Test-Path ".env.local")) {
    Write-Host "  Creating .env.local file..."
    @"
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=So1Book111111111111111111111111111111111111
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
"@ | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "  ✓ Frontend .env.local created" -ForegroundColor Green
}

# Go back to root
Set-Location ..

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Deploy the smart contract:"
Write-Host "     cd contracts; anchor deploy"
Write-Host ""
Write-Host "  2. Update PROGRAM_ID in both backend/.env and frontend/.env.local"
Write-Host ""
Write-Host "  3. Set up PostgreSQL and update DATABASE_URL in backend/.env"
Write-Host ""
Write-Host "  4. Run database migrations:"
Write-Host "     cd backend; npx prisma db push"
Write-Host ""
Write-Host "  5. Start the backend:"
Write-Host "     cd backend; npm run dev"
Write-Host ""
Write-Host "  6. Start the frontend:"
Write-Host "     cd frontend; npm run dev"
Write-Host ""
Write-Host "  7. Open http://localhost:3000 and connect your Phantom wallet!"
Write-Host ""
Write-Host "💡 Tip: Install Phantom wallet extension from phantom.app" -ForegroundColor Yellow


