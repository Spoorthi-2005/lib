import Web3 from 'web3';
import LibraryContract from './contracts/Library.json';

let web3;
let contract;
let accounts;

export const initWeb3Basic = async () => {
  try {
    console.log('=== BASIC WEB3 CONNECTION ===');
    
    // Check if MetaMask exists
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask browser extension.');
    }

    // Enable ethereum provider
    await window.ethereum.enable();
    console.log('✅ MetaMask enabled');

    // Create Web3 instance
    web3 = new Web3(window.ethereum);
    console.log('✅ Web3 created');

    // Get accounts
    accounts = await web3.eth.getAccounts();
    console.log('✅ Accounts:', accounts);

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock MetaMask and try again.');
    }

    // Get network
    const networkId = await web3.eth.net.getId();
    console.log('✅ Network ID:', networkId);

    // Check contract
    const contractData = LibraryContract.networks[networkId];
    if (!contractData) {
      throw new Error(`Contract not found on network ${networkId}. Please switch to Ganache network (ID: 5777).`);
    }

    console.log('✅ Contract address:', contractData.address);

    // Create contract
    contract = new web3.eth.Contract(LibraryContract.abi, contractData.address);
    console.log('✅ Contract created');

    // Test contract
    try {
      const result = await contract.methods.bookCount().call();
      console.log('✅ Contract test successful:', result);
    } catch (testError) {
      console.log('⚠️ Contract test failed:', testError.message);
    }

    console.log('=== BASIC CONNECTION SUCCESS ===');
    return { web3, contract, accounts };

  } catch (error) {
    console.error('=== BASIC CONNECTION FAILED ===', error);
    throw error;
  }
};

export const getWeb3 = () => web3;
export const getContract = () => contract;
export const getAccounts = () => accounts;
