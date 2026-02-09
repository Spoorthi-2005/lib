# 🚀 Library Management System - Connection Guide

## ✅ **FIXED ISSUES**
- ✅ Network ID corrected from 1337 to 5777 (your Ganache network)
- ✅ Contract address updated to match deployed contract
- ✅ Gas limits increased for successful transactions
- ✅ MetaMask auto-connection to correct network

## 🔧 **CONNECTION STEPS**

### **1. Start Ganache**
```bash
# Make sure Ganache is running on default port 7545
# The contract is deployed on network ID: 5777
```

### **2. Setup MetaMask**
1. **Install MetaMask** if not already installed
2. **Add Ganache Network** (auto-added by the app):
   - **Network Name**: Ganache Local
   - **Chain ID**: 5777
   - **RPC URL**: http://127.0.0.1:7545
   - **Currency**: ETH

### **3. Connect Account**
1. **Open the app**: http://localhost:3000
2. **Click "Connect MetaMask"** when prompted
3. **Approve the connection** in MetaMask
4. **Select an account** from your Ganache accounts

### **4. Verify Connection**
- ✅ You should see "Connected to MetaMask successfully!"
- ✅ Network should show "Ganache Local (5777)"
- ✅ Contract address: 0xbFd8C8f76d846d870C4263A1421230398263EEf5

## 🎯 **TESTING THE SYSTEM**

### **1. Register Users**
- **Student**: Uses Roll Number field
- **Faculty**: Uses Faculty ID field  
- **Librarian**: Uses Library ID field

### **2. Test Blockchain Features**
- **Issue a book** → See transaction in Ganache
- **Return a book** → See transaction details
- **Check receipts** → View block number, gas used, tx hash

### **3. Verify localStorage**
- **Open browser console** → F12 → Application → Local Storage
- **Check**: `registeredUsers`, `bookIssues`, `receipts`, `libraryBooks`

## 🔍 **TROUBLESHOOTING**

### **If connection fails:**
1. **Check Ganache is running** on port 7545
2. **Refresh the page** and try again
3. **Check MetaMask is unlocked**
4. **Verify network** is set to Ganache Local (5777)

### **If transactions fail:**
1. **Check account balance** in Ganache
2. **Ensure you're on correct network** (5777)
3. **Try refreshing** the page

### **If contract not found:**
```bash
# Redeploy contract if needed
cd "c:\Users\Spoorthi Garikipati\Downloads\LIBRARY\LIBRARY"
truffle migrate --reset
```

## 📊 **SYSTEM STATUS**
- ✅ **React App**: http://localhost:3000
- ✅ **Smart Contract**: 0xbFd8C8f76d846d870C4263A1421230398263EEf5
- ✅ **Network**: Ganache Local (5777)
- ✅ **Gas Price**: 20 gwei
- ✅ **Gas Limit**: 300,000-500,000

## 🎉 **READY TO USE!**
The system is now fully configured and ready for testing. All blockchain features, localStorage integration, and role-based IDs are working correctly!
