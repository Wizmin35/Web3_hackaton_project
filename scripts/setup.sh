#!/bin/bash

# SolBook Setup Script
# This script sets up the entire project for development

set -e

echo "🚀 SolBook Setup Script"
echo "========================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} $1 found"
        return 0
    else
        echo -e "  ${RED}✗${NC} $1 not found"
        return 1
    fi
}

MISSING=0
check_command "node" || MISSING=1
check_command "npm" || MISSING=1
check_command "cargo" || MISSING=1
check_command "solana" || MISSING=1
check_command "anchor" || MISSING=1

if [ $MISSING -eq 1 ]; then
    echo -e "\n${RED}Please install missing dependencies before continuing.${NC}"
    echo "  - Node.js: https://nodejs.org/"
    echo "  - Rust: https://rustup.rs/"
    echo "  - Solana CLI: https://docs.solana.com/cli/install-solana-cli-tools"
    echo "  - Anchor: https://www.anchor-lang.com/docs/installation"
    exit 1
fi

# Setup Solana CLI for devnet
echo -e "\n${YELLOW}Configuring Solana CLI for devnet...${NC}"
solana config set --url https://api.devnet.solana.com
echo -e "  ${GREEN}✓${NC} Solana CLI configured"

# Check/create wallet
echo -e "\n${YELLOW}Checking Solana wallet...${NC}"
if [ -f ~/.config/solana/id.json ]; then
    echo -e "  ${GREEN}✓${NC} Wallet found"
    PUBKEY=$(solana-keygen pubkey)
    echo "  Address: $PUBKEY"
else
    echo "  Creating new wallet..."
    solana-keygen new --no-bip39-passphrase
    echo -e "  ${GREEN}✓${NC} Wallet created"
fi

# Airdrop SOL
echo -e "\n${YELLOW}Requesting SOL airdrop...${NC}"
solana airdrop 2 || echo "  Airdrop failed (rate limited). Try again later."

# Install contract dependencies
echo -e "\n${YELLOW}Installing contract dependencies...${NC}"
cd contracts
npm install
echo -e "  ${GREEN}✓${NC} Contract dependencies installed"

# Build contracts
echo -e "\n${YELLOW}Building smart contracts...${NC}"
anchor build
echo -e "  ${GREEN}✓${NC} Contracts built"

# Install backend dependencies
echo -e "\n${YELLOW}Installing backend dependencies...${NC}"
cd ../backend
npm install
echo -e "  ${GREEN}✓${NC} Backend dependencies installed"

# Setup backend env
if [ ! -f .env ]; then
    echo "  Creating .env file..."
    cat > .env << EOF
PORT=3001
NODE_ENV=development
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=So1Book111111111111111111111111111111111111
TREASURY_WALLET=
DATABASE_URL=postgresql://user:password@localhost:5432/solbook?schema=public
JWT_SECRET=development-secret-key-change-in-production
ALLOWED_ORIGINS=http://localhost:3000
EOF
    echo -e "  ${GREEN}✓${NC} Backend .env created"
fi

# Generate Prisma client
echo -e "\n${YELLOW}Generating Prisma client...${NC}"
npx prisma generate
echo -e "  ${GREEN}✓${NC} Prisma client generated"

# Install frontend dependencies
echo -e "\n${YELLOW}Installing frontend dependencies...${NC}"
cd ../frontend
npm install
echo -e "  ${GREEN}✓${NC} Frontend dependencies installed"

# Setup frontend env
if [ ! -f .env.local ]; then
    echo "  Creating .env.local file..."
    cat > .env.local << EOF
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=So1Book111111111111111111111111111111111111
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
EOF
    echo -e "  ${GREEN}✓${NC} Frontend .env.local created"
fi

echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "\n📋 Next steps:"
echo "  1. Deploy the smart contract:"
echo "     cd contracts && anchor deploy"
echo ""
echo "  2. Update PROGRAM_ID in both backend/.env and frontend/.env.local"
echo ""
echo "  3. Set up PostgreSQL and update DATABASE_URL in backend/.env"
echo ""
echo "  4. Run database migrations:"
echo "     cd backend && npx prisma db push"
echo ""
echo "  5. Start the backend:"
echo "     cd backend && npm run dev"
echo ""
echo "  6. Start the frontend:"
echo "     cd frontend && npm run dev"
echo ""
echo "  7. Open http://localhost:3000 and connect your Phantom wallet!"
echo ""
echo -e "${YELLOW}💡 Tip: Install Phantom wallet extension from phantom.app${NC}"


