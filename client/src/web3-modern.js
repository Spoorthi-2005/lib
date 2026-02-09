import Web3 from 'web3';
import LibraryContract from './contracts/Library.json';

let web3;
let contract;
let accounts;

export const initWeb3Modern = async () => {
  try {
    console.log('=== MODERN WEB3 CONNECTION ===');
    
    // Check for modern MetaMask
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed. Please install MetaMask browser extension from metamask.io');
    }

    // Check if it's MetaMask
    if (window.ethereum.isMetaMask !== true) {
      console.log('Warning: ethereum detected but may not be MetaMask');
    }

    console.log('✅ MetaMask detected');

    // Try to get accounts first (without requesting)
    try {
      const currentAccounts = await window.ethereum.request({ method: 'eth_accounts' });
      console.log('Current accounts:', currentAccounts);
      
      if (currentAccounts && currentAccounts.length > 0) {
        accounts = currentAccounts;
        console.log('✅ Using existing accounts');
      } else {
        console.log('No existing accounts, requesting access...');
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('✅ Account access granted');
      }
    } catch (accountError) {
      console.log('Account access failed, trying alternative method...');
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('✅ Alternative account access successful');
    }

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please make sure MetaMask is unlocked and has at least one account.');
    }

    // Create Web3 instance
    web3 = new Web3(window.ethereum);
    console.log('✅ Web3 instance created');

    // Get chain ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('✅ Current chain ID:', chainId);

    // Check if we need to switch networks
    if (chainId !== '0x1691') { // 5777 in hex
      console.log('Switching to Ganache network...');
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1691' }],
        });
        console.log('✅ Switched to Ganache network');
      } catch (switchError) {
        console.log('Switch error:', switchError);
        if (switchError.code === 4902) {
          console.log('Adding Ganache network...');
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x1691',
              chainName: 'Ganache Local',
              rpcUrls: ['http://127.0.0.1:7545'],
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
            }],
          });
          console.log('✅ Ganache network added');
          
          // Try switching again
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1691' }],
          });
          console.log('✅ Switched to Ganache after adding');
        } else {
          throw new Error('Please manually switch to Ganache network (Chain ID: 5777) in MetaMask');
        }
      }
    }

    // Get contract address
    const contractAddress = LibraryContract.networks['5777']?.address;
    if (!contractAddress) {
      throw new Error('Smart contract not found on network 5777. Please deploy the contract first.');
    }

    console.log('✅ Contract address:', contractAddress);

    // Create contract instance
    contract = new web3.eth.Contract(LibraryContract.abi, contractAddress);
    console.log('✅ Contract instance created');

    // Test contract with timeout
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Contract test timeout')), 5000)
      );
      
      const contractPromise = contract.methods.bookCount().call();
      const result = await Promise.race([contractPromise, timeoutPromise]);
      console.log('✅ Contract test successful:', result);
    } catch (testError) {
      console.log('⚠️ Contract test failed:', testError.message);
      // Continue anyway - contract might work even if test fails
    }

    console.log('=== MODERN CONNECTION SUCCESS ===');
    return { web3, contract, accounts };

  } catch (error) {
    console.error('=== MODERN CONNECTION FAILED ===', error);
    throw error;
  }
};

export const getWeb3 = () => web3;
export const getContract = () => contract;
export const getAccounts = () => accounts;
