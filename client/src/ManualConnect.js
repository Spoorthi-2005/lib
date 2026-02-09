import React, { useState } from 'react';
import { Button, Box, Typography, CircularProgress, Alert } from '@mui/material';
import Web3 from 'web3';
import LibraryContract from './contracts/Library.json';

const ManualConnect = ({ onConnect }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleManualConnect = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('=== MANUAL CONNECTION START ===');
      
      // Step 1: Check MetaMask
      setStep(1);
      if (!window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask extension.');
      }
      console.log('✅ MetaMask found');

      // Step 2: Initialize Web3
      setStep(2);
      const web3 = new Web3(window.ethereum);
      console.log('✅ Web3 initialized');

      // Step 3: Request accounts
      setStep(3);
      console.log('Requesting account access...');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect MetaMask.');
      }
      console.log('✅ Accounts connected:', accounts[0]);

      // Step 4: Check and switch network
      setStep(4);
      const networkId = await web3.eth.net.getId();
      console.log('Current network ID:', networkId);
      
      if (networkId !== 5777) {
        console.log('Switching to Ganache network...');
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1691' }],
        });
        console.log('✅ Switched to Ganache');
      }

      // Step 5: Connect to contract
      setStep(5);
      const deployedNetwork = LibraryContract.networks['5777'];
      if (!deployedNetwork || !deployedNetwork.address) {
        throw new Error('Contract not found on network 5777');
      }
      
      console.log('✅ Contract address:', deployedNetwork.address);
      const contract = new web3.eth.Contract(LibraryContract.abi, deployedNetwork.address);

      // Step 6: Test contract
      setStep(6);
      try {
        const bookCount = await contract.methods.bookCount().call();
        console.log('✅ Contract test successful, book count:', bookCount);
      } catch (testError) {
        console.log('⚠️ Contract test failed, but continuing:', testError);
      }

      // Success!
      setStep(7);
      console.log('=== MANUAL CONNECTION SUCCESS ===');
      
      // Pass connection details to parent
      onConnect({ web3, contract, accounts });

    } catch (error) {
      console.error('=== MANUAL CONNECTION FAILED ===', error);
      setError(error.message);
      setStep(1);
    }
    
    setLoading(false);
  };

  const getStepText = () => {
    switch(step) {
      case 1: return 'Checking MetaMask...';
      case 2: return 'Initializing Web3...';
      case 3: return 'Requesting account access...';
      case 4: return 'Setting up network...';
      case 5: return 'Connecting to contract...';
      case 6: return 'Testing connection...';
      case 7: return 'Connected!';
      default: return 'Ready to connect';
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      p: 4
    }}>
      <Box sx={{ 
        p: 6, 
        maxWidth: 500, 
        width: '100%',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        textAlign: 'center'
      }}>
        <Typography variant="h4" sx={{ color: 'white', mb: 3 }}>
          🔗 Manual MetaMask Connection
        </Typography>
        
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4 }}>
          Click the button below to manually connect to MetaMask. This will guide you through each step.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
              {getStepText()}
            </Typography>
            <CircularProgress size={24} sx={{ color: 'white' }} />
          </Box>
        )}

        <Button 
          variant="contained"
          onClick={handleManualConnect}
          disabled={loading}
          sx={{
            background: 'linear-gradient(45deg, #4CAF50, #45a049)',
            color: 'white',
            padding: '15px 30px',
            borderRadius: '25px',
            fontSize: '1.1rem',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(45deg, #45a049, #4CAF50)',
            },
            '&:disabled': {
              background: 'rgba(255, 255, 255, 0.2)',
            }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : '🔗 Connect to MetaMask'}
        </Button>

        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 3 }}>
          Make sure MetaMask is installed and unlocked
        </Typography>
      </Box>
    </Box>
  );
};

export default ManualConnect;
