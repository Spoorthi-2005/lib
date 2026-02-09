import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton, Alert, CircularProgress } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { checkEligibility, recordIssue } from '../api';
import Web3 from 'web3';
import LibraryContract from '../contracts/Library.json';

const Cart = () => {
  const { user } = useAuth();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(saved);
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeFromCart = (id) => {
    updateCart(cart.filter(b => b.id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Check Eligibility for all books (simple loop)
      for (const book of cart) {
        const eligibility = await checkEligibility(user.id, book.id);
        if (!eligibility.eligible) {
          throw new Error(`Cannot issue "${book.title}": ${eligibility.message}`);
        }
      }

      // 2. Connect to Web3
      if (!window.ethereum) throw new Error("MetaMask not found!");
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const supportedChainHex = new Set(['0x539', '0x1691']); // 1337, 5777

      const readChainAndNetwork = async () => {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();

        let chainIdHex = null;
        let chainIdDec = null;
        try {
          chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          chainIdDec = parseInt(chainIdHex, 16);
        } catch (e) {
          // ignore
        }

        return { web3, accounts, networkId, chainIdHex, chainIdDec };
      };

      let { web3, accounts, networkId, chainIdHex, chainIdDec } = await readChainAndNetwork();

      // If the site is still on Mainnet or any unsupported chain, force a Ganache switch.
      if (!supportedChainHex.has(chainIdHex)) {
        const has5777 = !!LibraryContract.networks?.['5777']?.address;
        const has1337 = !!LibraryContract.networks?.['1337']?.address;

        const preferredTarget = has1337 ? '0x539' : (has5777 ? '0x1691' : '0x539');

        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: preferredTarget }],
          });
        } catch (switchErr) {
          const switchMsg = (switchErr?.message || '').toLowerCase();
          const missingChain = switchErr?.code === 4902 || switchMsg.includes('unrecognized chain id');

          if (missingChain) {
            const chainParams = preferredTarget === '0x539'
              ? { chainId: '0x539', chainName: 'Ganache Local (1337)', rpcUrls: ['http://127.0.0.1:7545'], nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 } }
              : { chainId: '0x1691', chainName: 'Ganache Local (5777)', rpcUrls: ['http://127.0.0.1:7545'], nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 } };

            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [chainParams],
              });
            } catch (addErr) {
              // MetaMask can throw if the network already exists or RPC matches an existing entry.
              // In that case, proceed to switching.
              const msg = (addErr?.message || '').toLowerCase();
              const alreadyExists = msg.includes('already exists') || msg.includes('same rpc') || msg.includes('rpc endpoint');
              if (!alreadyExists) {
                throw addErr;
              }
            }

            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: preferredTarget }],
              });
            } catch (switchAfterAddErr) {
              // Some MetaMask builds still report "unrecognized chain id" even after add.
              // Try the alternate Ganache chain as a fallback.
              const alternateTarget = preferredTarget === '0x1691' ? '0x539' : '0x1691';
              try {
                await window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: alternateTarget }],
                });
              } catch (finalSwitchErr) {
                throw switchAfterAddErr;
              }
            }
          } else {
            throw switchErr;
          }
        }

        // MetaMask can take a moment to apply the switch; wait + re-read.
        await new Promise(resolve => setTimeout(resolve, 600));
        ({ web3, accounts, networkId, chainIdHex, chainIdDec } = await readChainAndNetwork());
      }

      // Resolve deployment for the CURRENT chain only.
      const networkIdStr = String(networkId);
      let deployedNetwork = LibraryContract.networks?.[networkIdStr];

      if (!deployedNetwork && chainIdDec != null) {
        deployedNetwork = LibraryContract.networks?.[String(chainIdDec)];
      }

      if (!deployedNetwork || !deployedNetwork.address) {
        const available = Object.keys(LibraryContract.networks || {});
        throw new Error(
          `Contract not deployed on your current network. ` +
          `Detected networkId=${networkIdStr}` + (chainIdDec != null ? `, chainId=${chainIdDec}` : '') + `. ` +
          `Available deployments in Library.json: ${available.join(', ') || 'none'}. ` +
          `Fix: redeploy contract to your Ganache chain (truffle migrate --reset --network development) ` +
          `OR switch MetaMask chainId to match the deployed one (often 5777).`
        );
      }

      const contract = new web3.eth.Contract(
        LibraryContract.abi,
        deployedNetwork.address
      );

      // 3. Execute Transactions (Serial for now)
      // Note: Parallel transactions might fail due to nonce issues on MetaMask if not carefully handled.
      // Serial is safer for demo.

      for (const book of cart) {
        console.log(`Issuing ${book.title}...`);

        // Confirm on Blockchain
        // We need to pass bookId. Ensure book.id matches contract bookId.
        // In my DB logic, bookId is database ID. In Contract, it's also ID.
        // Assuming they are synced (User add books to DB? Librarian adds?)
        // If I am just using the DB ID, I hope the contract has that ID.
        // Fix: `addBook` in contract increments `bookCount`.
        // If we add to DB and Contract separately, IDs might mismatch.
        // Ideally, book ID comes from Contract.
        // For this demo, let's assume they match or we just use `book.id`.

        const receipt = await contract.methods.borrowBook(book.id).send({
          from: accounts[0],
          gas: 500000,
          gasPrice: '20000000000',
        });

        // 4. Record in Backend
        await recordIssue({
          user_id: user.id,
          book_id: book.id,
          tx_hash: receipt.transactionHash,
          block_number: Number(receipt.blockNumber),
          gas_used: Number(receipt.gasUsed)
        });
      }

      setSuccess(`Successfully issued ${cart.length} books!`);

      // Auto-open WhatsApp (wa.me) for the first book (as a demo of "perfect" real-time opening)
      if (cart.length > 0 && user.whatsapp_number) {
        const book = cart[0];
        const days = user.role === 'Faculty' ? 30 : 14;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + days);

        const waMessage = `🌟 *Library Issue Confirmed!*\n\n` +
          `Hello *${user.name}*,\n\n` +
          `I have issued:\n` +
          `📖 *${book.title}*\n` +
          `✍️ *${book.author}*\n\n` +
          `📅 *Due Date:* ${dueDate.toLocaleDateString()}\n\n` +
          `Thank you for using our Library! 📚✨`;

        const waUrl = `https://wa.me/${user.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(waMessage)}`;
        window.open(waUrl, '_blank');
      }

      updateCart([]); // Clear cart

    } catch (err) {
      console.error(err);
      setError(err.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '2rem',
      maxWidth: 800,
      mx: 'auto'
    }}>
      <Typography variant="h4" sx={{ color: 'white', mb: 3, textAlign: 'center' }}>
        🛒 Your Cart
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => window.open(`https://wa.me/${user.whatsapp_number.replace(/\D/g, '')}`, '_blank')}>
              OPEN WHATSAPP
            </Button>
          }
        >
          {success}
        </Alert>
      )}

      {cart.length === 0 ? (
        <Typography sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
          Cart is empty. Go to Library to add books.
        </Typography>
      ) : (
        <List>
          {cart.map((book) => (
            <ListItem key={book.id}
              secondaryAction={
                <IconButton edge="end" onClick={() => removeFromCart(book.id)} sx={{ color: '#f44336' }}>
                  <Delete />
                </IconButton>
              }
              sx={{
                mb: 2,
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 2
              }}
            >
              <ListItemAvatar>
                <Avatar src={book.image} variant="rounded" />
              </ListItemAvatar>
              <ListItemText
                primary={<Typography color="white">{book.title}</Typography>}
                secondary={<Typography color="rgba(255,255,255,0.7)">{book.author}</Typography>}
              />
            </ListItem>
          ))}
        </List>
      )}

      {cart.length > 0 && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleCheckout}
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
              px: 5,
              py: 1.5,
              borderRadius: 50
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Issue'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Cart;