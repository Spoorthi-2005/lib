# Library Smart Contract Deployment Guide

## Quick Setup for Testing

### 1. Install Truffle (if not already installed)
```bash
npm install -g truffle
```

### 2. Deploy Contract to Ganache
```bash
# Navigate to project root
cd LIBRARY

# Compile contracts
truffle compile

# Deploy to Ganache (make sure Ganache is running on port 7545)
truffle migrate --reset --network development
```

### 3. Update Contract Address
After deployment, copy the contract address from the migration output and update it in:
`client/src/contracts/Library.json` under the networks section.

### 4. Alternative: Use Default Address
The app is configured to work with the default address `0x0000000000000000000000000000000000000000` for testing purposes.

## MetaMask Setup

1. **Network Configuration:**
   - Network Name: `Ganache Local`
   - RPC URL: `http://127.0.0.1:7545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

2. **Import Account:**
   - Use one of your Ganache private keys
   - Make sure MetaMask is unlocked

## Testing the Application

1. **Start the React App:**
   ```bash
   cd client
   npm start
   ```

2. **Visit:** `http://localhost:3000`

3. **Connect MetaMask** when prompted

4. **Register a new user** using the beautiful registration form

5. **Test all features:**
   - Add books to cart
   - Issue books
   - Return books
   - Generate digital receipts

## Troubleshooting

### Registration Issues
- Make sure Ganache is running
- Check MetaMask is connected to the correct network
- Try increasing gas limit in MetaMask settings

### Contract Not Found
- Deploy the contract using the steps above
- Or use the default address for testing

### Gas Issues
- The app now estimates gas automatically
- If issues persist, try increasing gas limit in MetaMask

## Features Working

✅ **Beautiful 3D Dashboard** with glass morphism effects  
✅ **Registration System** with blockchain integration  
✅ **Digital Receipts** with PDF generation  
✅ **Book Management** (Add to Cart, Issue, Return)  
✅ **Automatic Blockchain Updates**  
✅ **MetaMask Integration** with retry functionality  
✅ **Responsive Design** for all devices  

The application is now fully functional with beautiful UI and complete blockchain integration! 🚀 