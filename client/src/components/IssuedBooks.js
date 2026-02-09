import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Card, CardContent, Chip, Link, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getHistory, recordReturn } from '../api';
import Web3 from 'web3';
import LibraryContract from '../contracts/Library.json';

const IssuedBooks = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [returnLoading, setReturnLoading] = useState(null); // bookId being returned

  const fetchHistory = useCallback(async () => {
    try {
      const data = await getHistory(user.id);
      setHistory(data);
    } catch (err) {
      setError('Failed to load history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleReturn = async (transaction) => {
    if (!window.ethereum) return alert("MetaMask required");

    try {
      setReturnLoading(transaction.id);
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
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

      const networkIdStr = String(networkId);
      let deployedNetwork = LibraryContract.networks?.[networkIdStr];

      if (!deployedNetwork && chainIdDec != null) {
        deployedNetwork = LibraryContract.networks?.[String(chainIdDec)];
      }

      // If contract is deployed on 5777 but user is on 1337 (or vice versa), try switching.
      if ((!deployedNetwork || !deployedNetwork.address) && window.ethereum) {
        const has5777 = !!LibraryContract.networks?.['5777']?.address;
        const has1337 = !!LibraryContract.networks?.['1337']?.address;
        const currentChainHex = chainIdHex;

        const targetChainHex =
          (has5777 && currentChainHex !== '0x1691') ? '0x1691' :
            (has1337 && currentChainHex !== '0x539') ? '0x539' :
              null;

        if (targetChainHex) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: targetChainHex }],
            });

            const networkIdAfter = await web3.eth.net.getId();
            deployedNetwork = LibraryContract.networks?.[String(networkIdAfter)];
          } catch (switchErr) {
            // If chain isn't added to MetaMask, add it and retry.
            const switchMsg = (switchErr?.message || '').toLowerCase();
            const missingChain = switchErr?.code === 4902 || switchMsg.includes('unrecognized chain id');
            if (missingChain) {
              try {
                const chainParams = targetChainHex === '0x539'
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

                await window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: targetChainHex }],
                });

                const networkIdAfter = await web3.eth.net.getId();
                deployedNetwork = LibraryContract.networks?.[String(networkIdAfter)];
              } catch (addOrSwitchErr) {
                // ignore and fail with a descriptive error below
              }
            }
          }
        }
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

      const contract = new web3.eth.Contract(LibraryContract.abi, deployedNetwork.address);

      // 1. Return on Blockchain
      console.log(`Returning book ID: ${transaction.book_id}`);
      const receipt = await contract.methods.returnBook(transaction.book_id).send({
        from: accounts[0],
        gas: 500000,
        gasPrice: '20000000000',
      });

      // 2. Record in Backend
      const isOverdue = new Date() > new Date(transaction.due_date);
      const estimatedFine = isOverdue ? Math.ceil((new Date() - new Date(transaction.due_date)) / (1000 * 60 * 60 * 24)) * (user.role === 'Faculty' ? 5 : 2) : 0;

      const result = await recordReturn({
        user_id: user.id,
        book_id: transaction.book_id,
        tx_hash: receipt.transactionHash,
        block_number: Number(receipt.blockNumber),
        gas_used: Number(receipt.gasUsed),
        fine_amount: estimatedFine
      });

      // 3. Refresh History
      await fetchHistory();

      // 4. Generate Return Receipt
      const returnReceiptData = {
        ...transaction,
        id: result.transactionId || transaction.id,
        type: 'RETURN',
        tx_hash: receipt.transactionHash,
        block_number: Number(receipt.blockNumber),
        gas_used: Number(receipt.gasUsed),
        return_date: new Date().toISOString(),
        fine_amount: estimatedFine
      };
      downloadReceipt(returnReceiptData);

      alert(`Book returned successfully! ${estimatedFine > 0 ? `Fine Paid: ₹${estimatedFine}.` : ''} Return receipt generated.`);

    } catch (err) {
      console.error(err);
      alert("Return failed: " + err.message);
    } finally {
      setReturnLoading(null);
    }
  };

  const downloadReceipt = (tx) => {
    import('jspdf').then(jsPDF => {
      const doc = new jsPDF.default();

      doc.setFontSize(22);
      doc.setTextColor(40, 44, 52);
      doc.text("GVPCEW Digital Library", 105, 20, null, null, "center");

      doc.setFontSize(16);
      doc.text(`${tx.type === 'RETURN' ? 'Return' : 'Issue'} Transaction Receipt`, 105, 30, null, null, "center");

      doc.setDrawColor(100, 100, 100);
      doc.line(20, 35, 190, 35);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      let y = 50;
      doc.text(`Transaction ID: ${tx.id || 'N/A'}`, 20, y); y += 10;
      doc.text(`Book Title: ${tx.title || 'N/A'}`, 20, y); y += 10;
      doc.text(`Book ID: ${tx.book_id || 'N/A'}`, 20, y); y += 10;
      doc.text(`User Name: ${user.name || 'N/A'}`, 20, y); y += 10;
      doc.text(`Email: ${user.email || 'N/A'}`, 20, y); y += 10;

      const issueDate = tx.issue_date ? new Date(tx.issue_date).toLocaleString() : 'N/A';
      doc.text(`Issue Date: ${issueDate}`, 20, y); y += 10;

      if (tx.type === 'ISSUE') {
        const dueDate = tx.due_date ? new Date(tx.due_date).toLocaleString() : 'N/A';
        doc.text(`Due Date: ${dueDate}`, 20, y); y += 10;
      }

      if (tx.return_date || tx.type === 'RETURN') {
        const returnDate = tx.return_date ? new Date(tx.return_date).toLocaleString() : new Date().toLocaleString();
        doc.text(`Return Date: ${returnDate}`, 20, y); y += 10;
      }

      doc.text(`Status: ${tx.type === 'RETURN' ? 'RETURNED' : 'ISSUED'}`, 20, y); y += 20;

      doc.setFontSize(14);
      doc.text("Blockchain Verification Records:", 20, y); y += 10;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Transaction Hash: ${tx.tx_hash || 'N/A'}`, 20, y); y += 8;
      doc.text(`Block Number: ${tx.block_number || 'N/A'}`, 20, y); y += 8;
      doc.text(`Gas Used: ${tx.gas_used || 'N/A'}`, 20, y); y += 8;
      doc.text(`Network ID: Ganache (5777)`, 20, y); y += 8;
      doc.text(`Receipt ID: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`, 20, y);

      doc.save(`Library_Receipt_${tx.id || 'new'}.pdf`);
    });
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '2rem',
      maxWidth: 900,
      mx: 'auto'
    }}>
      <Typography variant="h4" sx={{ color: 'white', mb: 3, textAlign: 'center' }}>
        📜 Transaction History
      </Typography>

      {history.length === 0 ? (
        <Typography sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
          No history found.
        </Typography>
      ) : (
        history.map((tx) => (
          <Card key={tx.id} sx={{
            mb: 2,
            background: 'rgba(0, 0, 0, 0.3)',
            color: 'white',
            borderLeft: tx.status === 'Issued' ? '4px solid #4CAF50' : '4px solid #9e9e9e'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {tx.title} <span style={{ fontSize: '0.8em', color: '#aaa' }}>(ID: {tx.book_id})</span>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {tx.type === 'ISSUE' ? 'Issue Date' : 'Return Date'}: {new Date(tx.issue_date).toLocaleDateString()}
                  </Typography>
                  {tx.type === 'ISSUE' && (
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Due Date: {new Date(tx.due_date).toLocaleDateString()}
                    </Typography>
                  )}
                  {tx.return_date && tx.type === 'ISSUE' && (
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Returned On: {new Date(tx.return_date).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  {tx.type === 'ISSUE' && !tx.return_date && new Date() > new Date(tx.due_date) && (
                    <Chip label="Overdue" color="error" size="small" sx={{ mb: 1, mr: 1, fontWeight: 'bold' }} />
                  )}
                  <Chip
                    label={tx.type === 'RETURN' ? 'Returned' : (tx.return_date ? 'Closed' : 'Issued')}
                    color={tx.type === 'RETURN' || tx.return_date ? 'default' : 'success'}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  {tx.type === 'ISSUE' && !tx.return_date && (
                    <Box mt={1}>
                      {new Date() > new Date(tx.due_date) && (
                        <Typography variant="caption" sx={{ display: 'block', color: '#ff1744', mb: 1, fontWeight: 'bold' }}>
                          Estimated Fine: ₹{Math.ceil((new Date() - new Date(tx.due_date)) / (1000 * 60 * 60 * 24)) * (user.role === 'Faculty' ? 5 : 2)}
                        </Typography>
                      )}
                      <Chip
                        label={returnLoading === tx.id ? "Returning..." : "Return Book"}
                        onClick={() => handleReturn(tx)}
                        color="primary"
                        variant="outlined"
                        clickable={!returnLoading}
                        disabled={!!returnLoading}
                      />
                    </Box>
                  )}
                  {tx.type === 'RETURN' && tx.fine_amount > 0 && (
                    <Typography variant="caption" sx={{ display: 'block', color: '#ffb74d', mt: 1 }}>
                      Fine Paid: ₹{tx.fine_amount}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ mt: 2, p: 1.5, background: 'rgba(0,0,0,0.2)', borderRadius: 1, fontSize: '0.8rem', fontFamily: 'monospace' }}>
                <Typography variant="caption" display="block" sx={{ color: '#00e5ff' }}>
                  {tx.type === 'ISSUE' ? 'Issue' : 'Return'} TX Hash: {tx.tx_hash ? (
                    <Link href="#" color="inherit" underline="hover">{tx.tx_hash.substring(0, 20)}...</Link>
                  ) : 'Pending'}
                </Typography>
                {tx.block_number && (
                  <Typography variant="caption" display="block" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Block: {tx.block_number} | Gas: {tx.gas_used}
                  </Typography>
                )}

                <Box mt={1}>
                  <Typography
                    variant="caption"
                    sx={{ cursor: 'pointer', color: '#fff', textDecoration: 'underline' }}
                    onClick={() => downloadReceipt(tx)}
                  >
                    📄 Download Digital Receipt
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default IssuedBooks;