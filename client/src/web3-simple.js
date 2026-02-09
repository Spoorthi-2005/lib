import Web3 from 'web3';
import LibraryContract from './contracts/Library.json';

let web3;
let contract;
let accounts;

export const initWeb3Simple = async () => {
  try {
    console.log('=== SIMPLE WEB3 CONNECTION ===');
    
    if (!window.ethereum) {
      throw new Error('MetaMask not found. Please install MetaMask extension.');
    }

    // Simple Web3 initialization
    web3 = new Web3(window.ethereum);
    console.log('Web3 initialized');

    // Request accounts directly
    console.log('Requesting accounts...');
    accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log('Accounts received:', accounts);

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please connect MetaMask.');
    }

    // Get network ID
    const networkId = await web3.eth.net.getId();
    console.log('Network ID:', networkId);

    // Check if we're on the right network
    if (networkId !== 5777) {
      console.log('Wrong network, switching to Ganache...');
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1691' }],
      });
      console.log('Switched to Ganache');
    }

    // Get contract
    const deployedNetwork = LibraryContract.networks['5777'];
    if (!deployedNetwork || !deployedNetwork.address) {
      throw new Error('Contract not found on network 5777');
    }

    console.log('Contract address:', deployedNetwork.address);
    contract = new web3.eth.Contract(LibraryContract.abi, deployedNetwork.address);

    // Simple test
    try {
      const bookCount = await contract.methods.bookCount().call();
      console.log('Contract test successful, book count:', bookCount);
    } catch (testError) {
      console.log('Contract test failed, but continuing:', testError);
    }

    console.log('=== SIMPLE CONNECTION SUCCESS ===');
    return { web3, contract, accounts };

  } catch (error) {
    console.error('=== SIMPLE CONNECTION FAILED ===', error);
    throw error;
  }
};

export const getWeb3 = () => web3;
export const getContract = () => contract;
export const getAccounts = () => accounts;
