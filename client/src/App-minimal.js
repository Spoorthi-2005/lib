import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';

const MinimalApp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState('');

  const connectMetaMask = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Starting minimal connection...');
      
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask extension.');
      }
      
      console.log('MetaMask found, requesting accounts...');
      
      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Accounts received:', accounts);
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }
      
      // Get network ID
      const networkId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Network ID:', networkId);
      
      // Check if we're on the right network
      if (networkId !== '0x1691') { // 5777 in hex
        console.log('Wrong network, switching to Ganache...');
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1691' }],
        });
        console.log('Switched to Ganache');
      }
      
      setAccount(accounts[0]);
      setConnected(true);
      console.log('Connection successful!');
      
    } catch (error) {
      console.error('Connection failed:', error);
      setError(error.message);
    }
    
    setLoading(false);
  };

  if (connected) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: 'green', mb: 2 }}>
          ✅ MetaMask Connected Successfully!
        </Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Account: {account}
        </Typography>
        <Typography variant="body1">
          You can now use the Library Management System.
        </Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 3 }}
          onClick={() => window.location.reload()}
        >
          Continue to Library
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
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
        textAlign: 'center'
      }}>
        <Typography variant="h4" sx={{ color: 'white', mb: 3 }}>
          🔗 Connect MetaMask
        </Typography>
        
        {error && (
          <Box sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: 'rgba(255, 0, 0, 0.1)', 
            borderRadius: 1,
            border: '1px solid rgba(255, 0, 0, 0.3)'
          }}>
            <Typography variant="body2" sx={{ color: 'white' }}>
              {error}
            </Typography>
          </Box>
        )}

        <Button 
          variant="contained"
          onClick={connectMetaMask}
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
          {loading ? <CircularProgress size={24} color="inherit" /> : '🔗 Connect MetaMask'}
        </Button>

        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 3 }}>
          Make sure MetaMask is installed and unlocked
        </Typography>
      </Box>
    </Box>
  );
};

export default MinimalApp;
