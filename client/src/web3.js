import Web3 from 'web3';
import LibraryContract from './contracts/Library.json';

let web3;
let contract;
let accounts;

export const initWeb3 = async () => {
  try {
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      
      // Add account change listener
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('Accounts changed:', accounts);
        if (accounts.length === 0) {
          console.log('Please connect to MetaMask.');
        } else {
          console.log('Account switched to:', accounts[0]);
          // Trigger page reload to reinitialize
          window.location.reload();
        }
      });
      
      // Add chain change listener
      window.ethereum.on('chainChanged', (chainId) => {
        console.log('Chain changed:', chainId);
        // Reload the page when chain changes
        window.location.reload();
      });
      
      console.log('Checking for existing accounts...');
      
      // First try to get accounts without requesting
      try {
        const currentAccounts = await web3.eth.getAccounts();
        console.log('Current accounts found:', currentAccounts);
        
        if (currentAccounts && currentAccounts.length > 0) {
          accounts = currentAccounts;
          console.log('Using existing accounts:', accounts);
        } else {
          console.log('No existing accounts, requesting access...');
          // Request account access
          accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          console.log('Successfully requested accounts:', accounts);
        }
      } catch (accountError) {
        console.log('Error getting accounts, requesting access:', accountError);
        // Request account access
        try {
          accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          console.log('Successfully requested accounts after error:', accounts);
        } catch (permissionError) {
          console.error('Permission error:', permissionError);
          if (permissionError.code === 4001) {
            throw new Error('User rejected the connection request. Please connect MetaMask and try again.');
          } else if (permissionError.message.includes('already pending')) {
            throw new Error('MetaMask permission request is pending. Please check MetaMask and approve the connection.');
          } else {
            throw new Error('Failed to connect to MetaMask. Please check if MetaMask is installed and unlocked.');
          }
        }
      }
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect MetaMask.');
      }
      
      console.log('Accounts available:', accounts);
      
      // Get current network
      const networkId = await web3.eth.net.getId();
      console.log('Current network ID:', networkId);
      
      // Try to switch to Ganache network if needed
      if (networkId !== 5777) {
        console.log('Need to switch to Ganache network...');
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1691' }], // 5777 in hex
          });
          console.log('Successfully switched to Ganache network (5777)');
          
          // Wait a moment for the switch to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Re-check network after switch
          const newNetworkId = await web3.eth.net.getId();
          console.log('Network after switch:', newNetworkId);
        } catch (switchError) {
          console.log('Network switch error:', switchError);
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            console.log('Chain not found, adding Ganache network...');
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x1691', // 5777 in hex
                    chainName: 'Ganache Local',
                    rpcUrls: ['http://127.0.0.1:7545'],
                    nativeCurrency: {
                      name: 'ETH',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                  },
                ],
              });
              console.log('Successfully added Ganache network to MetaMask');
              
              // Wait a moment for the network to be added
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Try switching again after adding
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x1691' }],
              });
              console.log('Successfully switched to Ganache after adding');
              
              // Wait for switch to complete
              await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (addError) {
              console.error('Failed to add Ganache network:', addError);
              throw new Error('Please manually add Ganache network to MetaMask (Chain ID: 5777, RPC URL: http://127.0.0.1:7545)');
            }
          } else {
            console.error('Failed to switch to Ganache network:', switchError);
            throw new Error('Please switch to Ganache network (Chain ID: 5777) in MetaMask');
          }
        }
      }
      
      // Final network check
      const finalNetworkId = await web3.eth.net.getId();
      console.log('Final network ID:', finalNetworkId);
      
      if (finalNetworkId !== 5777) {
        throw new Error(`Please switch to Ganache network (ID: 5777). Current network ID: ${finalNetworkId}`);
      }
      
      // Check if we have the contract deployed on this network
      let deployedNetwork = LibraryContract.networks[finalNetworkId];
      console.log(`Looking for contract on network ${finalNetworkId}:`, deployedNetwork);
      
      if (!deployedNetwork || !deployedNetwork.address) {
        console.error(`Contract not deployed on network ${finalNetworkId}. Available networks:`, Object.keys(LibraryContract.networks));
        throw new Error(`Contract not deployed on network ${finalNetworkId}. Please redeploy the contract.`);
      }
      
      console.log(`SUCCESS: Using contract at address: ${deployedNetwork.address} on network ${finalNetworkId}`);
      contract = new web3.eth.Contract(
        LibraryContract.abi,
        deployedNetwork.address
      );
      
      // Test contract connection with retry
      let contractTestSuccess = false;
      for (let i = 0; i < 3; i++) {
        try {
          console.log(`Testing contract connection (attempt ${i + 1})...`);
          const bookCount = await contract.methods.bookCount().call();
          console.log('Contract test successful - book count:', bookCount);
          contractTestSuccess = true;
          break;
        } catch (contractError) {
          console.error(`Contract test failed (attempt ${i + 1}):`, contractError);
          if (i < 2) {
            console.log('Waiting 1 second before retry...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      if (!contractTestSuccess) {
        throw new Error('Failed to connect to the smart contract after multiple attempts. Please check the contract address.');
      }
      
      return { web3, contract, accounts };
    } else {
      throw new Error('MetaMask not found. Please install MetaMask extension.');
    }
  } catch (error) {
    console.error('Web3 initialization error:', error);
    throw error;
  }
};

export const getWeb3 = () => web3;
export const getContract = () => contract;
export const getAccounts = () => accounts;