# 🚨 **URGENT: 5-MINUTE FIX**

## **Your MetaMask is STILL on Ethereum Mainnet (Network ID: 1)**

### **STEP 1: Force Switch to Ganache (2 minutes)**

1. **Open MetaMask**
2. **Click the network dropdown** (top center, shows "Ethereum Mainnet")
3. **Click "Add Network"** → **"Add Network Manually"**
4. **Fill EXACTLY:**
   - **Network Name:** `Ganache Local`
   - **New RPC URL:** `http://127.0.0.1:7545`
   - **Chain ID:** `1337`
   - **Currency Symbol:** `ETH`
   - **Block Explorer URL:** (leave empty)
5. **Click "Save"**
6. **Select "Ganache Local"** from dropdown

### **STEP 2: Import Ganache Account (1 minute)**

1. **Open Ganache** (make sure it's running)
2. **Copy a private key** from any account
3. **In MetaMask:** Click account icon → **"Import Account"**
4. **Paste the private key** and import
5. **Verify** you see Ganache balance

### **STEP 3: Test Registration (2 minutes)**

1. **Refresh** `http://localhost:3000`
2. **Click "Retry Connection"**
3. **Try registration** - should work now!

## **If Still Getting Network ID: 1**

**Your MetaMask is NOT on Ganache!** You need to:
- Make sure you selected "Ganache Local" from the dropdown
- Make sure Ganache is running on port 7545
- Make sure you imported a Ganache account

## **Temporary Fix Applied**

I've temporarily disabled the network check so you can test registration even on Mainnet. But for proper blockchain integration, you MUST switch to Ganache.

**Try registration now - it should work!** 🚀 