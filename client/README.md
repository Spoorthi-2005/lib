# GVPCEW Decentralized E-Library Portal

## Prerequisites
- Node.js & npm
- MetaMask browser extension
- Ganache (for local blockchain)
- Truffle

## Setup Instructions

### 1. Start Ganache
Open Ganache and start a new workspace (default port: 7545).

### 2. Deploy Smart Contract
```
cd LIBRARY
truffle migrate --reset
```

### 3. Install React App Dependencies
```
cd client
npm install
```

### 4. Start the React App
```
npm start
```

### 5. Open the Website
Go to [http://localhost:3000](http://localhost:3000) in your browser.

- Connect MetaMask to the local Ganache network.
- Register or login as Student, Faculty, or Librarian.
- Use the sidebar to navigate Library, Add to Cart, Issued Books, etc.
- Borrow, return, and pay fines for books. Digital receipts are generated for each transaction.

---

## Features
- Blockchain-based user authentication and book management
- Borrow, return, and fine payment flows
- Digital receipts (PDF)
- Real book images
- Notifications for due/overdue books
- Fully responsive Material-UI design

---

For any issues, check the browser console and Ganache/Truffle logs.
