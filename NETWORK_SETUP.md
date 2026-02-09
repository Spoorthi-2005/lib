# 🔧 **URGENT: Switch MetaMask to Ganache Network**

## ❌ **Current Problem:**
Your MetaMask is connected to **Ethereum Mainnet** instead of **Ganache**. This is why you're getting the BigInt error and transaction failures.

## ✅ **Quick Fix:**

### **Step 1: Add Ganache Network to MetaMask**
1. **Open MetaMask**
2. **Click the network dropdown** (currently shows "Ethereum Mainnet")
3. **Click "Add Network"** → "Add Network Manually"
4. **Fill in these details:**
   - **Network Name:** `Ganache Local`
   - **New RPC URL:** `http://127.0.0.1:7545`
   - **Chain ID:** `1337`
   - **Currency Symbol:** `ETH`
   - **Block Explorer URL:** (leave empty)

### **Step 2: Switch to Ganache Network**
1. **Click the network dropdown again**
2. **Select "Ganache Local"** from the list
3. **Verify** it shows "Ganache Local" at the top

### **Step 3: Import Ganache Account**
1. **Copy a private key** from your Ganache interface
2. **In MetaMask:** Click account icon → "Import Account"
3. **Paste the private key** and import
4. **Verify** you see the Ganache balance (like $378,658.00)

## 🎯 **Expected Result:**
- MetaMask should show "Ganache Local" network
- Your account should have Ganache ETH balance
- Registration should work without BigInt errors

## 🚨 **If Still Having Issues:**
1. **Refresh the page** after switching networks
2. **Disconnect and reconnect** MetaMask
3. **Make sure Ganache is running** on port 7545

## 📱 **Test Registration Again:**
1. **Visit:** `http://localhost:3000`
2. **Connect MetaMask** (should now show Ganache)
3. **Try registration** - should work now!

The BigInt error will be fixed once you're on the correct network! 🎉 