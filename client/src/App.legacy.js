import React, { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import BookList from './components/BookList';
import Cart from './components/Cart';
import IssuedBooks from './components/IssuedBooks';
import Login from './components/Login';
import Register from './components/Register';
import ReceiptModal from './components/ReceiptModal';
import SearchBar from './components/SearchBar';
import History from './components/History';
import Notifications from './components/Notifications';
import LibrarianPanel from './components/LibrarianPanel';
import TransactionsPanel from './components/TransactionsPanel';
import UsersPanel from './components/UsersPanel';
import AdvancedFeatures from './components/AdvancedFeatures';
import BlockchainStatus from './components/BlockchainStatus';
import LibrarianNotifications from './components/LibrarianNotifications';
import AddBookForm from './components/AddBookForm';
import FinePaymentModal from './components/FinePaymentModal';
import AdvancedNotificationSystem from './components/AdvancedNotificationSystem';
import { books as localBooks } from './data/books';
import { initWeb3Working } from './web3-working';
import { pinToIpfsJson } from './pinata';
import LibraryContract from './contracts/Library.json';
import { Snackbar, Alert, Box, Typography, Button, CircularProgress } from '@mui/material';

const STUDENT_SECTIONS = [
  'Academics',
  'Attendance',
  'Library',
  'Leave Request',
  'Achievements',
  'Add to Cart',
  'Issued Books',
  'History',
  'Notifications',
  'Advanced Notifications',
  'Advanced Features',
  'Blockchain Status',
];

const FACULTY_SECTIONS = [
  'Academics',
  'Library',
  'Add to Cart',
  'Issued Books',
  'History',
  'Notifications',
  'Advanced Notifications',
  'Advanced Features',
  'Blockchain Status',
];

const LIBRARIAN_SECTIONS = [
  'Library',
  'Add to Cart',
  'Issued Books',
  'History',
  'Librarian Notifications',
  'Advanced Notifications',
  'Add New Books',
  'Librarian Panel',
  'All Transactions',
  'All Users',
  'Advanced Features',
  'Blockchain Status',
];

function App() {
  // UI State
  const [selectedSection, setSelectedSection] = useState('Library');
  const [showLogin, setShowLogin] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [lastTxDetails, setLastTxDetails] = useState(null);
  const [books, setBooks] = useState(() => {
    try {
      const savedBooks = localStorage.getItem('libraryBooks');
      return savedBooks ? JSON.parse(savedBooks) : localBooks;
    } catch {
      return localBooks;
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lastTxDetails');
      if (saved) setLastTxDetails(JSON.parse(saved));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (lastTxDetails) localStorage.setItem('lastTxDetails', JSON.stringify(lastTxDetails));
    } catch (e) {
      // ignore
    }
  }, [lastTxDetails]);
  const [cart, setCart] = useState([]);
  const [issued, setIssued] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [fineToPay, setFineToPay] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [payingFine, setPayingFine] = useState(false);
  const [showFinePayment, setShowFinePayment] = useState(false);
  const [web3Ready, setWeb3Ready] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState('');
  const [networkId, setNetworkId] = useState('');
  const [query, setQuery] = useState('');
  const [receipts, setReceipts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('receipts') || '[]');
    } catch {
      return [];
    }
  });
  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('notifications') || '[]');
    } catch {
      return [];
    }
  });
  const [allUsers, setAllUsers] = useState([]);

  const savePinataCidLocal = (eventType, cid, payload) => {
    try {
      const key = 'pinataRecords';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.unshift({ eventType, cid, timestamp: Math.floor(Date.now() / 1000), payload });
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 1000)));
    } catch {}
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const getTxReceiptWithRetry = async (w3, hash, attempts = 10, delayMs = 500) => {
    if (!w3 || !hash) return null;
    for (let i = 0; i < attempts; i++) {
      // eslint-disable-next-line no-await-in-loop
      const r = await w3.eth.getTransactionReceipt(hash);
      if (r) return r;
      // eslint-disable-next-line no-await-in-loop
      await sleep(delayMs);
    }
    return null;
  };

  const getOnChainUserStatus = async () => {
    if (!contract || !account) return null;
    try {
      const u = await contract.methods.users(account).call();
      return {
        isActive: Boolean(u?.isActive),
        gradOrLeaveDate: u?.gradOrLeaveDate != null ? Number(u.gradOrLeaveDate) : null,
        role: u?.role != null ? String(u.role) : null,
      };
    } catch (e) {
      return null;
    }
  };

  const handleViewReceipt = (r) => {
    setReceipt(r);
    setShowReceipt(true);
    const ts = r.timestamp || r.issueDate || r.returnDate || r.date || null;
    setLastTxDetails({
      action: r.receiptType === 'return' ? 'return' : 'issue',
      txHash: r.txHash || null,
      blockNumber: r.blockNumber ?? null,
      gasUsed: r.gasUsed ?? null,
      status: r.txStatus ?? null,
      from: r.from ?? null,
      to: r.to ?? null,
      contractAddress: r.contractAddress ?? null,
      chainId: (r.network && r.network.includes('Chain ID:')) ? r.network.split('Chain ID:')[1].trim().replace(')', '') : chainId,
      timestamp: ts,
    });
  };

  const uploadAuditToPinata = async ({ eventType, data, name, keyvalues }) => {
    try {
      const cid = await pinToIpfsJson({
        data,
        name,
        keyvalues: {
          eventType,
          ...(keyvalues || {}),
        },
      });
      savePinataCidLocal(eventType, cid, data);
      return cid;
    } catch (e) {
      console.log('Pinata upload failed (non-blocking):', e);
      return null;
    }
  };

  // On mount: connect to web3 and contract
  useEffect(() => {
      const setup = async () => {
    setLoading(true);
    setError('');
    
    // First check if MetaMask is even available
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask browser extension from metamask.io and refresh the page.');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Starting Web3 connection...');
      const { web3, contract, accounts, networkId } = await initWeb3Working();
        try {
          const cid = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(cid);
        } catch {}
        try {
          setNetworkId(String(networkId ?? ''));
        } catch {}
        setWeb3(web3);
        setContract(contract);
        setAccount(accounts[0]);
        setWeb3Ready(true);
        setNotification('Connected to MetaMask successfully!');
        console.log('Web3 connection successful!');
      } catch (e) {
        console.error('Web3 setup error:', e);
        setError(`Connection failed: ${e.message}`);
        setWeb3Ready(false);
      }
      setLoading(false);
    };
    
    setup();
  }, []);

  // Fetch books from blockchain (if available)
  useEffect(() => {
    const fetchBooks = async () => {
      if (contract && web3Ready) {
        try {
          const chainBooks = await contract.methods.getBooks().call();
          if (!chainBooks || chainBooks.length === 0) {
            setBooks(localBooks);
            return;
          }
          // Merge blockchain book data with local images
          const merged = chainBooks.map((b, i) => ({
            ...b,
            id: Number(b.id),
            totalCopies: Number(b.totalCopies),
            availableCopies: Number(b.availableCopies),
            image: localBooks[i] ? localBooks[i].image : b.image,
            publicationYear: localBooks[i] ? localBooks[i].publicationYear : 2024,
          }));
          setBooks(merged);
        } catch (e) {
          console.log('Using local books data - blockchain not available');
          setBooks(localBooks);
        }
      } else {
        setBooks(localBooks);
      }
    };
    fetchBooks();
  }, [contract, web3Ready]);

  // Fetch issued books for user
  useEffect(() => {
    const fetchIssued = async () => {
      if (user) {
        console.log('=== FETCHING ISSUED BOOKS ===');
        console.log('User:', user);
        
        // Try blockchain first if available
        if (contract && account && web3Ready) {
          try {
            const issues = await contract.methods.getUserIssuedBooks(account).call();
            if (!issues || issues.length === 0) {
              console.log('Blockchain issued list empty; falling back to localStorage');
            } else {
            // Attach book title and image
            const issuedBooks = issues.map((iss) => {
              const book = books.find((b) => b.id === Number(iss.bookId));
              return {
                ...iss,
                bookId: Number(iss.bookId),
                dueDate: Number(iss.dueDate),
                issueDate: Number(iss.issueDate),
                title: book ? book.title : '',
                image: book ? book.image : '',
              };
            });
            console.log('Blockchain issued books:', issuedBooks);
            setIssued(issuedBooks);
            return;
            }
          } catch (e) {
            console.log('Blockchain fetch failed, trying localStorage:', e);
          }
        }
        
        // Fallback: Load from localStorage
        try {
          const bookIssues = JSON.parse(localStorage.getItem('bookIssues') || '[]');
          console.log('All book issues from localStorage:', bookIssues);
          
          // Filter issues for current user that haven't been returned
          const userIssues = bookIssues.filter(issue => 
            issue.studentEmail === user.email && !issue.returned
          );
          
          console.log('User issues (not returned):', userIssues);
          
          // Attach book details
          const issuedBooks = userIssues.map(issue => {
            const book = books.find(b => b.id === issue.bookId);
            return {
              ...issue,
              title: issue.bookName || (book ? book.title : 'Unknown Book'),
              image: book ? book.image : '',
              bookId: Number(issue.bookId),
              dueDate: Number(issue.dueDate),
              issueDate: Number(issue.issueDate)
            };
          });
          
          console.log('Final issued books to display:', issuedBooks);
          setIssued(issuedBooks);
          
        } catch (e) {
          console.error('Error loading issued books from localStorage:', e);
          setIssued([]);
        }
      } else {
        setIssued([]);
      }
    };
    fetchIssued();
  }, [contract, user, books, account, web3Ready]);

  // Fetch all users for librarian
  useEffect(() => {
    const fetchUsers = async () => {
      if (contract && user && user.role === '3') {
        // Assume user addresses are sequential for demo; in production, store addresses in contract
        const usersArr = [];
        for (let i = 0; i < 100; i++) {
          try {
            const u = await contract.methods.users(contract._address).call(); // Replace with actual address list
            if (u && u.email) usersArr.push({ ...u, gradOrLeaveDate: Number(u.gradOrLeaveDate) });
          } catch { break; }
        }
        setAllUsers(usersArr);
      }
    };
    fetchUsers();
  }, [contract, user]);

  // Notifications for due/overdue books and out-of-stock
  useEffect(() => {
    if (issued.length > 0) {
      const now = Date.now() / 1000;
      issued.forEach((iss) => {
        if (!iss.returned && now > iss.dueDate) {
          setNotification(`Book "${iss.title}" is overdue! Please return or pay fine.`);
          pushNotification({
            type: 'overdue',
            message: `Book "${iss.title}" is overdue!`,
            timestamp: Math.floor(Date.now() / 1000),
          });
        } else if (!iss.returned && now > iss.dueDate - 2 * 24 * 3600) {
          setNotification(`Book "${iss.title}" is due soon!`);
          pushNotification({
            type: 'due',
            message: `Book "${iss.title}" is due soon!`,
            timestamp: Math.floor(Date.now() / 1000),
          });
        }
      });
    }
    // Out-of-stock notification for librarian
    if (user && user.role === '3') {
      books.forEach((b) => {
        if (b.availableCopies === 0) {
          setNotification(`Book "${b.title}" is out of stock!`);
          pushNotification({
            type: 'out-of-stock',
            message: `Book "${b.title}" is out of stock!`,
            timestamp: Math.floor(Date.now() / 1000),
          });
        }
      });
    }
    // eslint-disable-next-line
  }, [issued, books, user]);

  // Handlers
  const handleNavigate = (section) => setSelectedSection(section);

  const handleLogin = async ({ email, password, role }) => {
    setLoading(true);
    setError('');
    
    console.log('=== STARTING LOGIN ===');
    console.log('Login attempt with:', { email: email.toLowerCase(), role: String(role) });
    
    try {
      // Simple localStorage-only authentication
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      console.log('All registered users:', registeredUsers);
      console.log('Total users found:', registeredUsers.length);
      
      // Find user by email and role
      const user = registeredUsers.find(u => {
        const emailMatch = u.email.toLowerCase() === email.toLowerCase();
        const roleMatch = u.role === String(role);
        console.log(`Checking user ${u.email}: email match=${emailMatch}, role match=${roleMatch}`);
        return emailMatch && roleMatch;
      });
      
      console.log('Found matching user:', user);
      
      if (user) {
        // Check if graduation/leave date has passed
        const now = Math.floor(Date.now() / 1000);
        if (user.gradOrLeaveDate && Number(user.gradOrLeaveDate) < now) {
          console.log('User graduation/leave date has passed');
          setError('Access denied: Graduation/leave date passed.');
          setLoading(false);
          return;
        }
        
        console.log('Login successful! Setting user data...');
        setUser({ ...user, isActive: true });
        setShowLogin(false);
        setShowRegister(false);
        setNotification(`Welcome back, ${user.username}! Login successful.`);

        try {
          const loginAudits = JSON.parse(localStorage.getItem('loginAudits') || '[]');
          loginAudits.unshift({
            email: user.email,
            role: user.role,
            timestamp: Math.floor(Date.now() / 1000),
          });
          localStorage.setItem('loginAudits', JSON.stringify(loginAudits.slice(0, 1000)));
        } catch {}

        await uploadAuditToPinata({
          eventType: 'login',
          name: `login-${user.email}-${Date.now()}`,
          keyvalues: {
            email: user.email,
            role: user.role,
          },
          data: {
            email: user.email,
            role: user.role,
            timestamp: Math.floor(Date.now() / 1000),
          },
        });
        
      } else {
        console.log('No matching user found');
        console.log('Available users:', registeredUsers.map(u => ({ email: u.email, role: u.role })));
        setError('Invalid email or role. Please check your credentials or register first.');
      }
      
    } catch (e) {
      console.error('Login error:', e);
      setError('Login failed. Please try again.');
    }
    
    setLoading(false);
    console.log('=== LOGIN COMPLETE ===');
  };

  const handleRegister = async ({ username, email, password, role, gradOrLeaveDate, yearOfJoining, employeeId, rollNumber, facultyId, libraryId }) => {
    setLoading(true);
    setError('');
    
    console.log('=== STARTING REGISTRATION ===');
    console.log('Registration data:', { username, email, role, gradOrLeaveDate, yearOfJoining, employeeId, rollNumber, facultyId, libraryId });
    
    try {
      // Simple localStorage-only registration
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      console.log('Current registered users:', registeredUsers);
      
      // Check if user already exists
      const existingUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        console.log('User already exists:', existingUser);
        setError('User with this email already registered.');
        setLoading(false);
        return;
      }
      
      // Create new user
      const gradDateUnix = gradOrLeaveDate ? Math.floor(new Date(gradOrLeaveDate).getTime() / 1000) : Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // 1 year from now if not provided
      
      const newUser = {
        username: username || 'User',
        email: email.toLowerCase(),
        password, // In a real app, this should be hashed
        role: String(role),
        gradOrLeaveDate: role === '1' ? gradDateUnix : null, // Only for students
        employeeId: role !== '1' ? employeeId : null, // Only for faculty and librarians
        yearOfJoining: yearOfJoining || new Date().getFullYear(),
        isActive: true,
        registrationDate: Math.floor(Date.now() / 1000),
        // Add role-specific IDs
        rollNumber: role === '1' ? rollNumber : null,
        facultyId: role === '2' ? facultyId : null,
        libraryId: role === '3' ? libraryId : null
      };
      
      // Save to localStorage immediately
      registeredUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

      await uploadAuditToPinata({
        eventType: 'register',
        name: `register-${newUser.email}-${Date.now()}`,
        keyvalues: {
          email: newUser.email,
          role: newUser.role,
        },
        data: {
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          registrationDate: newUser.registrationDate,
          rollNumber: newUser.rollNumber,
          facultyId: newUser.facultyId,
          libraryId: newUser.libraryId,
        },
      });
      
      // Try blockchain registration (if available)
      let blockchainTxHash = null;
      if (contract && account && web3Ready) {
        // Get current network to check if we can do blockchain transaction
        try {
          const currentNetworkId = await window.ethereum.request({ method: 'eth_chainId' });
          console.log('Current MetaMask network ID (hex):', currentNetworkId);
          
          // Convert hex to decimal for comparison
          const decimalNetworkId = parseInt(currentNetworkId, 16);
          console.log('Current MetaMask network ID (decimal):', decimalNetworkId);
          
          // Check if contract exists on this network
          const deployedNetwork = LibraryContract.networks[decimalNetworkId.toString()];
          console.log('Contract on current network:', deployedNetwork);
          
          // Only attempt blockchain transaction if contract exists on current network
          if (deployedNetwork && deployedNetwork.address) {
            // Confirm before blockchain registration
            const confirmed = window.confirm('Confirm registration on the blockchain? This will send a transaction.');
            if (confirmed) {
              try {
                console.log('Attempting blockchain registration...');
                console.log('Contract address:', contract.options.address);
                console.log('Account:', account);
                console.log('Network ID:', decimalNetworkId);
                
                const result = await contract.methods.registerUser(
                  newUser.username,
                  newUser.email,
                  parseInt(newUser.role),
                  newUser.gradOrLeaveDate || Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
                  newUser.rollNumber || '',
                  newUser.facultyId || '',
                  newUser.libraryId || ''
                ).send({ 
                  from: account,
                  gas: 500000,
                  gasPrice: '20000000000'
                });
                blockchainTxHash = result.transactionHash;
                console.log('Blockchain registration successful:', blockchainTxHash);
                
                // Update user with blockchain transaction hash
                newUser.blockchainTxHash = blockchainTxHash;
                const updatedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                const userIndex = updatedUsers.findIndex(u => u.email === email);
                if (userIndex !== -1) {
                  updatedUsers[userIndex] = newUser;
                  localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
                }
              } catch (blockchainError) {
                console.log('Blockchain registration failed:', blockchainError);
                // Continue with localStorage only
              }
            }
          } else {
            console.log(`No contract found on network ${decimalNetworkId}. Skipping blockchain registration.`);
          }
        } catch (networkError) {
          console.log('Network check failed, skipping blockchain registration:', networkError);
        }
      }
      
      // Verify it was saved
      const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      console.log('Users after saving:', savedUsers);
      console.log('Registration successful! User count:', savedUsers.length);
      
      setNotification(`Registration successful! You can now login with ${email}`);
      setShowRegister(false);
      setShowLogin(true);
      
    } catch (e) {
      console.error('Registration error:', e);
      setError(`Registration failed: ${e.message}`);
    }
    
    setLoading(false);
    console.log('=== REGISTRATION COMPLETE ===');
  };

  const handleAddToCart = (book) => {
    if (!cart.some((b) => b.id === book.id)) setCart([...cart, book]);
  };

  const handleRemoveFromCart = (bookId) => {
    setCart(cart.filter((b) => b.id !== bookId));
  };

  const handleIssue = async (book) => {
    if (!user || (user.role !== '1' && user.role !== '2')) return;
    
    if (!contract || !account || !web3Ready || !web3) {
      setError('Blockchain not connected. Please connect MetaMask to the Ganache network where the contract is deployed and retry.');
      return;
    }

    // Confirm before proceeding
    const confirmed = window.confirm(`Confirm issuing "${book.title}"? This will send a transaction to the blockchain.`);
    if (!confirmed) return;
    
    setLoading(true);
    setError('');
    
    console.log('=== ISSUING BOOK ===');
    console.log('Book:', book);
    console.log('User:', user);
    
    try {
      const onChain = await getOnChainUserStatus();
      if (!onChain?.isActive) {
        setError('Blockchain user not active for this MetaMask account. Please register on blockchain using this same account, then login again.');
        setLoading(false);
        return;
      }
      if (onChain?.gradOrLeaveDate && onChain.gradOrLeaveDate <= Math.floor(Date.now() / 1000)) {
        setError('Blockchain access denied: Graduation/leave date passed for this MetaMask account.');
        setLoading(false);
        return;
      }

      // Check if book is available
      if (book.availableCopies <= 0) {
        setError('Book is not available for issue.');
        setLoading(false);
        return;
      }
      
      // Generate transaction ID
      const transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
      const issueDate = Math.floor(Date.now() / 1000);
      
      // Role-based due dates
      const dueDays = user.role === '1' ? 14 : 30; // Students: 14 days, Faculty/Librarian: 30 days
      const dueDate = issueDate + (dueDays * 24 * 60 * 60);
      
      // Try blockchain transaction first (if available)
      let blockchainTxHash = null;
      let blockNumber = null;
      let gasUsed = null;
      let txStatus = null;
      let txFrom = null;
      let txTo = null;
      let contractAddress = null;
      
      if (contract && account && web3Ready && web3) {
        try {
          const result = await contract.methods.borrowBook(book.id).send({ from: account, gas: 300000, gasPrice: '20000000000' });
          blockchainTxHash = result?.transactionHash ?? null;
          blockNumber = result?.blockNumber ?? null;
          gasUsed = result?.gasUsed ?? null;
          txStatus = result?.status ?? null;
          txFrom = result?.from ?? null;
          txTo = result?.to ?? null;
          contractAddress = contract?.options?.address ?? result?.to ?? null;
          console.log('Blockchain transaction successful:', blockchainTxHash);
          console.log('Block Number:', blockNumber);
          console.log('Gas Used:', gasUsed);
          
          // If anything critical is missing, retry fetching the mined receipt
          if (!blockNumber || gasUsed == null || txStatus == null || !txFrom || !txTo) {
            const txReceipt = await getTxReceiptWithRetry(web3, blockchainTxHash);
            console.log('Transaction Receipt (retry):', txReceipt);
            blockNumber = txReceipt?.blockNumber ?? blockNumber;
            gasUsed = txReceipt?.gasUsed ?? gasUsed;
            txStatus = txReceipt?.status ?? txStatus;
            txFrom = txReceipt?.from ?? txFrom;
            txTo = txReceipt?.to ?? txTo;
            contractAddress = contract?.options?.address ?? txReceipt?.to ?? contractAddress;
          }
          
        } catch (blockchainError) {
          console.log('Blockchain transaction failed:', blockchainError);
          const msg = blockchainError?.message || 'Blockchain transaction failed';
          setError(`Issue failed on blockchain: ${msg}`);
          setLoading(false);
          return;
        }
      }
      
      // Update book count (reduce available copies)
      const updatedBooks = books.map(b => {
        if (b.id === book.id) {
          return { ...b, availableCopies: b.availableCopies - 1 };
        }
        return b;
      });
      setBooks(updatedBooks);
      
      // Create comprehensive issue record for database
      const issueRecord = {
        transactionId,
        bookId: book.id,
        bookName: book.title,
        studentName: user.username,
        studentEmail: user.email,
        rollNumber: user.rollNumber || user.email.split('@')[0], // Use email prefix as roll number if not available
        issueDate,
        dueDate,
        status: 'issued',
        issuedBy: 'System', // Could be librarian name in real system
        blockchainTxHash,
        returned: false,
        returnDate: null,
        fine: 0
      };
      
      console.log('Creating issue record:', issueRecord);
      
      // Save to localStorage database
      const existingIssues = JSON.parse(localStorage.getItem('bookIssues') || '[]');
      existingIssues.push(issueRecord);
      localStorage.setItem('bookIssues', JSON.stringify(existingIssues));
      
      // Update issued books state
      const newIssuedBook = {
        ...issueRecord,
        title: book.title,
        image: book.image
      };
      setIssued([...issued, newIssuedBook]);
      
      // Create enhanced digital receipt with real blockchain details
      const newReceipt = {
        transactionId,
        bookId: book.id,
        bookName: book.title,
        studentName: user.username,
        rollNumber: user.rollNumber || user.facultyId || user.libraryId || user.email.split('@')[0],
        action: 'Book Issued',
        issueDate,
        dueDate,
        issuedBy: 'System',
        status: blockchainTxHash ? (txStatus ? 'Confirmed' : 'Failed') : 'Local-Only',
        image: book.image,
        txHash: blockchainTxHash || null,
        blockNumber: blockNumber ?? null,
        gasUsed: gasUsed ?? null,
        from: txFrom,
        to: txTo,
        contractAddress,
        timestamp: issueDate,
        network: chainId ? `Ganache Local (Chain ID: ${chainId})` : 'Ganache Local',
        receiptType: 'issue',
        txStatus: txStatus ?? null,
        // Add user role information
        userRole: user.role === '1' ? 'Student' : user.role === '2' ? 'Faculty' : 'Librarian',
        userId: user.rollNumber || user.facultyId || user.libraryId || 'N/A'
      };
      
      console.log('Generated receipt:', newReceipt);
      
      // Show receipt and update receipts
      setReceipt(newReceipt);
      setShowReceipt(true);

      setLastTxDetails({
        action: 'issue',
        txHash: blockchainTxHash,
        blockNumber,
        gasUsed,
        status: txStatus,
        from: txFrom,
        to: txTo,
        contractAddress,
        chainId,
        timestamp: issueDate,
      });
      
      // Remove from cart if it was in cart
      setCart(cart.filter((b) => b.id !== book.id));
      
      // Save receipt to localStorage
      const updatedReceipts = [newReceipt, ...receipts];
      setReceipts(updatedReceipts);
      localStorage.setItem('receipts', JSON.stringify(updatedReceipts));
      
      // Show success notification
      setNotification(`Book "${book.title}" issued successfully! Transaction ID: ${transactionId}`);
      pushNotification({
        type: 'borrow',
        message: `Book "${book.title}" issued successfully! Due date: ${new Date(dueDate * 1000).toLocaleDateString()}`,
        timestamp: issueDate,
      });
      
      console.log('Book issued successfully!');
      
    } catch (e) {
      console.error('Issue failed:', e);
      setError(`Issue failed: ${e.message}`);
    }
    setLoading(false);
  };

  const calculateFine = (issue) => {
    const now = Math.floor(Date.now() / 1000);
    if (now > issue.dueDate) {
      const lateDays = Math.floor((now - issue.dueDate) / (24 * 3600));
      return lateDays * 10; // ₹10 per day
    }
    return 0;
  };

  const handleReturn = async (issue) => {
    const fine = calculateFine(issue);
    const daysLate = fine > 0 ? Math.floor((Math.floor(Date.now() / 1000) - issue.dueDate) / (24 * 3600)) : 0;
    
    if (fine > 0) {
      setFineToPay({ 
        ...issue, 
        fine, 
        daysLate,
        bookName: issue.bookName || issue.title 
      });
      setShowFinePayment(true);
    } else {
      await doReturn(issue, 0);
    }
  };

  const handleFinePayment = async (paymentResult) => {
    console.log('Fine payment completed:', paymentResult);
    setShowFinePayment(false);
    
    // Process the return with fine payment
    if (fineToPay) {
      await doReturn(fineToPay, paymentResult.amount);
      setFineToPay(null);
    }
  };

  const doReturn = async (issue, finePaid) => {
    if (!contract || !account || !web3Ready || !web3) {
      setError('Blockchain not connected. Please connect MetaMask to the Ganache network where the contract is deployed and retry.');
      return;
    }

    // Confirm before proceeding
    const confirmed = window.confirm(`Confirm returning "${issue.bookName || issue.title}"? This will send a transaction to the blockchain.`);
    if (!confirmed) return;
    
    setLoading(true);
    setError('');
    
    console.log('=== RETURNING BOOK ===');
    console.log('Issue record:', issue);
    console.log('Fine paid:', finePaid);
    
    try {
      const onChain = await getOnChainUserStatus();
      if (!onChain?.isActive) {
        setError('Blockchain user not active for this MetaMask account. Please register on blockchain using this same account, then login again.');
        setLoading(false);
        return;
      }
      if (onChain?.gradOrLeaveDate && onChain.gradOrLeaveDate <= Math.floor(Date.now() / 1000)) {
        setError('Blockchain access denied: Graduation/leave date passed for this MetaMask account.');
        setLoading(false);
        return;
      }

      // Generate return transaction ID
      const returnTransactionId = 'RTN' + Date.now() + Math.floor(Math.random() * 1000);
      const returnDate = Math.floor(Date.now() / 1000);
      
      // Try blockchain transaction first (if available)
      let blockchainTxHash = null;
      let blockNumber = null;
      let gasUsed = null;
      let txStatus = null;
      let txFrom = null;
      let txTo = null;
      let contractAddress = null;
      
      if (contract && account && web3Ready && web3) {
        try {
          const result = await contract.methods.returnBook(issue.bookId).send({ from: account, gas: 300000, gasPrice: '20000000000' });
          blockchainTxHash = result?.transactionHash ?? null;
          blockNumber = result?.blockNumber ?? null;
          gasUsed = result?.gasUsed ?? null;
          txStatus = result?.status ?? null;
          txFrom = result?.from ?? null;
          txTo = result?.to ?? null;
          contractAddress = contract?.options?.address ?? result?.to ?? null;
          console.log('Blockchain return transaction successful:', blockchainTxHash);
          console.log('Block Number:', blockNumber);
          console.log('Gas Used:', gasUsed);
          
          if (!blockNumber || gasUsed == null || txStatus == null || !txFrom || !txTo) {
            const txReceipt = await getTxReceiptWithRetry(web3, blockchainTxHash);
            console.log('Transaction Receipt (retry):', txReceipt);
            blockNumber = txReceipt?.blockNumber ?? blockNumber;
            gasUsed = txReceipt?.gasUsed ?? gasUsed;
            txStatus = txReceipt?.status ?? txStatus;
            txFrom = txReceipt?.from ?? txFrom;
            txTo = txReceipt?.to ?? txTo;
            contractAddress = contract?.options?.address ?? txReceipt?.to ?? contractAddress;
          }
          
        } catch (blockchainError) {
          console.log('Blockchain return transaction failed:', blockchainError);
          const msg = blockchainError?.message || 'Blockchain return transaction failed';
          setError(`Return failed on blockchain: ${msg}`);
          setLoading(false);
          return;
        }
      }
      
      // Update book count (increase available copies)
      const updatedBooks = books.map(b => {
        if (b.id === issue.bookId) {
          return { ...b, availableCopies: b.availableCopies + 1 };
        }
        return b;
      });
      setBooks(updatedBooks);
      
      // Update issue record in database
      const existingIssues = JSON.parse(localStorage.getItem('bookIssues') || '[]');
      const updatedIssues = existingIssues.map(issueRecord => {
        if (issueRecord.transactionId === issue.transactionId || 
            (issueRecord.bookId === issue.bookId && issueRecord.studentEmail === user.email && !issueRecord.returned)) {
          return {
            ...issueRecord,
            returned: true,
            returnDate,
            returnTransactionId,
            status: 'returned',
            fine: finePaid,
            blockchainReturnTxHash: blockchainTxHash
          };
        }
        return issueRecord;
      });
      localStorage.setItem('bookIssues', JSON.stringify(updatedIssues));
      
      // Update issued books state (remove returned book)
      const updatedIssued = issued.filter(issuedBook => 
        !(issuedBook.bookId === issue.bookId && issuedBook.studentEmail === user.email)
      );
      setIssued(updatedIssued);
      
      // Create enhanced digital return receipt with real blockchain details
      const returnReceipt = {
        transactionId: returnTransactionId,
        originalTransactionId: issue.transactionId,
        bookId: issue.bookId,
        bookName: issue.title || issue.bookName,
        studentName: user.username,
        rollNumber: user.rollNumber || user.facultyId || user.libraryId || user.email.split('@')[0],
        action: 'Book Returned',
        issueDate: issue.issueDate,
        returnDate,
        dueDate: issue.dueDate,
        fine: finePaid,
        daysLate: finePaid > 0 ? Math.floor((returnDate - issue.dueDate) / (24 * 60 * 60)) : 0,
        returnedBy: 'System',
        status: blockchainTxHash ? (txStatus ? 'Confirmed' : 'Failed') : 'Local-Only',
        image: issue.image,
        txHash: blockchainTxHash || null,
        blockNumber: blockNumber ?? null,
        gasUsed: gasUsed ?? null,
        from: txFrom,
        to: txTo,
        contractAddress,
        timestamp: returnDate,
        network: chainId ? `Ganache Local (Chain ID: ${chainId})` : 'Ganache Local',
        receiptType: 'return',
        txStatus: txStatus ?? null,
        // Add user role information
        userRole: user.role === '1' ? 'Student' : user.role === '2' ? 'Faculty' : 'Librarian',
        userId: user.rollNumber || user.facultyId || user.libraryId || 'N/A'
      };
      
      console.log('Generated return receipt:', returnReceipt);
      
      // Show receipt and update receipts
      setReceipt(returnReceipt);
      setShowReceipt(true);

      setLastTxDetails({
        action: 'return',
        txHash: blockchainTxHash,
        blockNumber,
        gasUsed,
        status: txStatus,
        from: txFrom,
        to: txTo,
        contractAddress,
        chainId,
        timestamp: returnDate,
      });
      
      // Save receipt to localStorage
      const updatedReceipts = [returnReceipt, ...receipts];
      setReceipts(updatedReceipts);
      localStorage.setItem('receipts', JSON.stringify(updatedReceipts));
      
      // Show success notification
      const fineMessage = finePaid > 0 ? ` Fine paid: ₹${finePaid}` : '';
      setNotification(`Book "${issue.title || issue.bookName}" returned successfully! Transaction ID: ${returnTransactionId}${fineMessage}`);
      pushNotification({
        type: 'return',
        message: `Book "${issue.title || issue.bookName}" returned successfully!${fineMessage}`,
        timestamp: returnDate,
      });
      
      setFineToPay(null);
      console.log('Book returned successfully!');
      
    } catch (e) {
      console.error('Return failed:', e);
      setError(`Return failed: ${e.message}`);
    }
    setLoading(false);
  };

  // eslint-disable-next-line no-unused-vars
  const handlePayFine = async () => {
    setPayingFine(true);
    setTimeout(async () => {
      await doReturn(fineToPay, fineToPay.fine);
      setPayingFine(false);
    }, 2000); // Simulate payment
  };

  const pushNotification = (notif) => {
    const newNotif = { ...notif, id: Date.now() + Math.random(), read: false };
    const updated = [...notifications, newNotif];
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  // Debug functions
  // eslint-disable-next-line no-unused-vars
  const clearLocalStorage = () => {
    localStorage.removeItem('registeredUsers');
    console.log('Cleared registered users from localStorage');
    setNotification('Cleared all registered users - you can register again');
  };

  // eslint-disable-next-line no-unused-vars
  const showRegisteredUsers = () => {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    console.log('All registered users:', users);
    alert(`Registered users: ${JSON.stringify(users, null, 2)}`);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    localStorage.setItem('notifications', '[]');
  };
  const handleMarkRead = (id) => {
    const updated = notifications.map((n) => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Search filter
  const filteredBooks = books.filter((b) => {
    const q = query.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.domain.toLowerCase().includes(q)
    );
  });

  // Download PDF for a receipt
  const handleDownloadReceipt = (r) => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      doc.text('Digital Receipt', 10, 10);
      doc.text(`Book ID: ${r.bookId}`, 10, 20);
      doc.text(`Book Title: ${r.title}`, 10, 30);
      doc.text(`User: ${r.username}`, 10, 40);
      doc.text(`Action: ${r.action}`, 10, 50);
      doc.text(`Date: ${new Date(r.date * 1000).toLocaleString()}`, 10, 60);
      if (r.fine) doc.text(`Fine: ₹${r.fine}`, 10, 70);
      doc.save('receipt.pdf');
    });
  };

  // Add Book (Enhanced for Librarians)
  const handleAddBook = async (newBook) => {
    setLoading(true);
    setError('');
    
    console.log('=== ADDING NEW BOOK ===');
    console.log('New book data:', newBook);
    console.log('User:', user);
    
    try {
      // Try blockchain transaction first (if available)
      let blockchainTxHash = null;
      if (contract && account && web3Ready) {
        try {
          const result = await contract.methods.addBook(
            newBook.title, 
            newBook.author, 
            newBook.isbn || '', 
            newBook.imageUrl || '', 
            newBook.category, 
            Number(newBook.total)
          ).send({ from: account });
          blockchainTxHash = result.transactionHash;
          console.log('Blockchain add book transaction successful:', blockchainTxHash);
        } catch (blockchainError) {
          console.log('Blockchain add book transaction failed, using localStorage:', blockchainError);
        }
      }
      
      // Add book to local state and localStorage
      const bookWithDefaults = {
        ...newBook,
        id: newBook.id || Date.now(),
        availableCopies: newBook.available || newBook.total || 1,
        domain: newBook.category || 'General',
        image: newBook.imageUrl || '/api/placeholder/200/300',
        blockchainTxHash,
        dateAdded: new Date().toISOString(),
        addedBy: user?.username || 'Librarian'
      };
      
      // Update books state
      const updatedBooks = [...books, bookWithDefaults];
      setBooks(updatedBooks);
      
      // Save to localStorage for persistence
      localStorage.setItem('libraryBooks', JSON.stringify(updatedBooks));
      
      // Create notification for successful addition
      const notification = {
        id: Date.now(),
        title: 'Book Added Successfully',
        message: `"${newBook.title}" has been added to the library collection`,
        type: 'success',
        timestamp: Date.now(),
        read: false
      };
      
      const updatedNotifications = [notification, ...notifications];
      setNotifications(updatedNotifications);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      
      setNotification(`Successfully added "${newBook.title}" to the library!`);
      // Refresh book list
      const chainBooks = await contract.methods.getBooks().call();
      const merged = chainBooks.map((b, i) => ({
        ...b,
        id: Number(b.id),
        totalCopies: Number(b.totalCopies),
        availableCopies: Number(b.availableCopies),
        image: b.image,
        publicationYear: b.publicationYear || new Date().getFullYear(),
      }));
      setBooks(merged);
    } catch (e) {
      setError('Add book failed.');
    }
    setLoading(false);
  };
  // Update Book
  const handleUpdateBook = async (id, form) => {
    setLoading(true);
    setError('');
    try {
      await contract.methods.updateBook(id, form.title, form.author, form.isbn, form.image, form.domain, Number(form.copies)).send({ from: account });
      setNotification('Book updated successfully!');
      // Refresh book list
      const chainBooks = await contract.methods.getBooks().call();
      const merged = chainBooks.map((b, i) => ({
        ...b,
        id: Number(b.id),
        totalCopies: Number(b.totalCopies),
        availableCopies: Number(b.availableCopies),
        image: b.image,
        publicationYear: b.publicationYear || new Date().getFullYear(),
      }));
      setBooks(merged);
    } catch (e) {
      setError('Update book failed.');
    }
    setLoading(false);
  };
  // Remove Book
  const handleRemoveBook = async (id) => {
    setLoading(true);
    setError('');
    try {
      await contract.methods.removeBook(id).send({ from: account });
      setNotification('Book removed successfully!');
      // Refresh book list
      const chainBooks = await contract.methods.getBooks().call();
      const merged = chainBooks.map((b, i) => ({
        ...b,
        id: Number(b.id),
        totalCopies: Number(b.totalCopies),
        availableCopies: Number(b.availableCopies),
        image: b.image,
      }));
      setBooks(merged);
    } catch (e) {
      setError('Remove book failed.');
    }
    setLoading(false);
  };

  // Connection retry function
  const retryConnection = async () => {
    setLoading(true);
    setError('');
    try {
      const { contract, accounts, networkId } = await initWeb3Working();
      setContract(contract);
      setAccount(accounts[0]);
      setWeb3Ready(true);
      setNetworkId(String(networkId ?? ''));
      setNotification('Connected to MetaMask successfully!');
    } catch (e) {
      console.error('Web3 setup error:', e);
      setError(`Web3/MetaMask connection failed: ${e.message}`);
      setWeb3Ready(false);
    }
    setLoading(false);
  };

  // Main render
  if (loading && !web3Ready) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        mt: 10,
        minHeight: '50vh'
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
          Connecting to MetaMask...
        </Typography>
      </Box>
    );
  }

  // Show connection error with retry button
  if (!web3Ready && !loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        mt: 10,
        minHeight: '50vh',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '3rem',
        margin: '2rem'
      }}>
        <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
          🔗 MetaMask Connection Required
        </Typography>
        <Typography variant="body1" sx={{ color: 'white', mb: 3, textAlign: 'center' }}>
          {error || 'Please connect your MetaMask wallet to continue.'}
        </Typography>
        <Button 
          variant="contained" 
          onClick={retryConnection}
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '1.1rem',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8, #6a4190)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.6)'
            }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : '🔄 Retry Connection'}
        </Button>
        <Typography variant="body2" sx={{ color: 'white', mt: 2, textAlign: 'center', opacity: 0.8 }}>
          Make sure MetaMask is installed and unlocked
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar
        onNavigate={handleNavigate}
        cartCount={cart.length}
        issuedCount={issued.length}
        selectedSection={selectedSection}
        sections={
          user?.role === '3' ? LIBRARIAN_SECTIONS :
          user?.role === '2' ? FACULTY_SECTIONS :
          STUDENT_SECTIONS
        }
        unreadNotifications={unreadCount}
      />
      <Box sx={{ flex: 1, p: 3 }}>
        <Typography variant="h4" mb={2} align="right">Welcome GVPCEW</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Alert severity={web3Ready ? 'success' : 'warning'} sx={{ py: 0 }}>
            <Typography variant="body2">
              {web3Ready ? 'MetaMask Connected' : 'MetaMask Not Connected'}
              {account ? ` | Account: ${account.slice(0, 6)}...${account.slice(-4)}` : ''}
              {chainId ? ` | Chain: ${chainId}` : ''}
              {networkId ? ` | Network ID: ${networkId}` : ''}
            </Typography>
          </Alert>
        </Box>

        {error && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="error" onClose={() => setError('')}>
              <Typography variant="body2">{error}</Typography>
            </Alert>
          </Box>
        )}

        {lastTxDetails && (
          <Box sx={{ mb: 2 }}>
            <Alert severity={lastTxDetails.txHash ? (lastTxDetails.status ? 'success' : 'error') : 'warning'}>
              <Typography variant="subtitle2">
                {lastTxDetails.action === 'issue' ? 'Last Issue Transaction' : 'Last Return Transaction'}
              </Typography>
              <Typography variant="body2">
                Tx Hash: {lastTxDetails.txHash || 'Not available (local-only)'}
              </Typography>
              <Typography variant="body2">
                Block: {lastTxDetails.blockNumber ?? 'N/A'} | Gas Used: {lastTxDetails.gasUsed ?? 'N/A'} | Status: {lastTxDetails.txHash ? (lastTxDetails.status ? 'Confirmed' : 'Failed') : 'Local-Only'}
              </Typography>
              <Typography variant="body2">
                From: {lastTxDetails.from || 'N/A'}
              </Typography>
              <Typography variant="body2">
                To (Contract): {lastTxDetails.to || lastTxDetails.contractAddress || 'N/A'}
              </Typography>
              <Typography variant="body2">
                Contract Address: {lastTxDetails.contractAddress || lastTxDetails.to || 'N/A'}
              </Typography>
            </Alert>
          </Box>
        )}
        {showLogin && (
          <Login onLogin={handleLogin} loading={loading} error={error} onShowRegister={() => { setShowLogin(false); setShowRegister(true); }} />
        )}
        {showRegister && (
          <Register onRegister={handleRegister} loading={loading} error={error} onShowLogin={() => { setShowRegister(false); setShowLogin(true); }} />
        )}
        {!showLogin && !showRegister && selectedSection === 'Library' && (
          <>
            <SearchBar query={query} setQuery={setQuery} books={books} />
            <BookList
              books={filteredBooks}
              onAddToCart={user && (user.role === '1' || user.role === '2') ? handleAddToCart : () => {}}
              onIssue={user && (user.role === '1' || user.role === '2') ? handleIssue : () => {}}
              issuedBooks={issued.map((i) => i.bookId)}
              cart={cart}
            />
          </>
        )}
        {!showLogin && !showRegister && selectedSection === 'Add to Cart' && user && (user.role === '1' || user.role === '2') && (
          <Cart cart={cart} onRemove={handleRemoveFromCart} onIssue={handleIssue} />
        )}
        {!showLogin && !showRegister && selectedSection === 'Issued Books' && user && (user.role === '1' || user.role === '2') && (
          <IssuedBooks issued={issued} onReturn={handleReturn} calculateFine={calculateFine} />
        )}
        {!showLogin && !showRegister && selectedSection === 'History' && (
          <History receipts={receipts} onDownload={handleDownloadReceipt} onView={handleViewReceipt} />
        )}
        {!showLogin && !showRegister && selectedSection === 'Notifications' && (
          <Notifications
            notifications={notifications}
            onClear={handleClearNotifications}
            onMarkRead={handleMarkRead}
          />
        )}
        {!showLogin && !showRegister && selectedSection === 'Advanced Notifications' && user && (
          <AdvancedNotificationSystem
            user={user}
            issued={issued}
            onMarkRead={handleMarkRead}
            onClearAll={handleClearNotifications}
          />
        )}
        {!showLogin && !showRegister && selectedSection === 'Librarian Notifications' && user && user.role === '3' && (
          <LibrarianNotifications
            books={books}
            user={user}
          />
        )}
        {!showLogin && !showRegister && selectedSection === 'Add New Books' && user && user.role === '3' && (
          <AddBookForm
            onAddBook={handleAddBook}
            user={user}
          />
        )}
        {!showLogin && !showRegister && selectedSection === 'Librarian Panel' && user && user.role === '3' && (
          <LibrarianPanel
            books={books}
            onAdd={handleAddBook}
            onUpdate={handleUpdateBook}
            onRemove={handleRemoveBook}
          />
        )}
        {!showLogin && !showRegister && selectedSection === 'All Transactions' && user && user.role === '3' && (
          <TransactionsPanel
            transactions={receipts.map(r => ({ ...r, user: r.username, image: r.image }))}
          />
        )}
        {!showLogin && !showRegister && selectedSection === 'All Users' && user && user.role === '3' && (
          <UsersPanel users={allUsers} />
        )}
        {!showLogin && !showRegister && selectedSection === 'Advanced Features' && user && (
          <AdvancedFeatures 
            books={books}
            users={allUsers}
            transactions={receipts}
            userRole={user.role}
          />
        )}
        {!showLogin && !showRegister && selectedSection === 'Blockchain Status' && user && (
          <BlockchainStatus 
            books={books}
            issued={issued}
            user={user}
          />
        )}
        <Snackbar
          open={!!notification}
          autoHideDuration={4000}
          onClose={() => setNotification('')}
        >
          <Alert severity="info" sx={{ width: '100%' }}>{notification}</Alert>
        </Snackbar>
        <ReceiptModal
          open={showReceipt}
          onClose={() => setShowReceipt(false)}
          receipt={receipt}
        />
        <FinePaymentModal
          open={showFinePayment}
          onClose={() => {
            setShowFinePayment(false);
            setFineToPay(null);
          }}
          fineData={fineToPay}
          onPaymentComplete={handleFinePayment}
        />

      </Box>
    </Box>
  );
}

export default App;
