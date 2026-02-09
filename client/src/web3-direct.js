import Web3 from 'web3';
import LibraryContract from './contracts/Library.json';

let web3;
let contract;
let accounts;

export const initWeb3Direct = async () => {
  try {
    console.log('=== DIRECT WEB3 CONNECTION ===');
    
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed. Please install MetaMask extension.');
    }

    // Create Web3 instance
    web3 = new Web3(window.ethereum);
    console.log('✅ Web3 instance created');

    // Request accounts
    console.log('Requesting accounts...');
    accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log('✅ Accounts received:', accounts);

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please make sure MetaMask is unlocked.');
    }

    // Get network ID
    const networkId = await web3.eth.net.getId();
    console.log('✅ Network ID:', networkId);

    // Check if we're on the correct network
    if (networkId !== 5777) {
      console.log('Switching to Ganache network...');
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1691' }],
        });
        console.log('✅ Switched to Ganache network');
      } catch (switchError) {
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
          
          // Switch to the added network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1691' }],
          });
          console.log('✅ Switched to Ganache network');
        } else {
          throw new Error('Please switch to Ganache network (Chain ID: 5777) in MetaMask.');
        }
      }
    }

    // Get contract address
    const contractAddress = LibraryContract.networks['5777']?.address;
    if (!contractAddress) {
      throw new Error('Contract not found on network 5777. Please deploy the contract.');
    }

    console.log('✅ Contract address:', contractAddress);

    // Create contract instance
    contract = new web3.eth.Contract(LibraryContract.abi, contractAddress);
    console.log('✅ Contract instance created');

    // Test contract connection
    try {
      const bookCount = await contract.methods.bookCount().call();
      console.log('✅ Contract test successful, book count:', bookCount);
    } catch (testError) {
      console.log('⚠️ Contract test failed:', testError);
      // Don't throw error, continue anyway
    }

    console.log('=== DIRECT CONNECTION SUCCESS ===');
    return { web3, contract, accounts };

  } catch (error) {
    console.error('=== DIRECT CONNECTION FAILED ===', error);
    throw error;
  }
};

export const getWeb3 = () => web3;
export const getContract = () => contract;
export const getAccounts = () => accounts;
