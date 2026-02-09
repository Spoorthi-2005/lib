import Web3 from 'web3';
import LibraryContract from './contracts/Library.json';

let web3;
let contract;
let accounts;

export const initWeb3Working = async () => {
  try {
    console.log('=== WORKING WEB3 CONNECTION ===');
    
    // Check for MetaMask
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask extension from https://metamask.io/');
    }

    console.log('✅ MetaMask found');

    // Enable MetaMask
    try {
      await window.ethereum.enable();
      console.log('✅ MetaMask enabled');
    } catch (enableError) {
      console.log('Enable failed, trying alternative method...');
    }

    // Create Web3 instance
    web3 = new Web3(window.ethereum);
    console.log('✅ Web3 instance created');

    // Get accounts
    try {
      accounts = await web3.eth.getAccounts();
      console.log('✅ Accounts retrieved:', accounts);
    } catch (accountError) {
      console.log('Getting accounts failed, requesting access...');
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('✅ Accounts requested:', accounts);
    }

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock MetaMask and try again.');
    }

    // Accept both Ganache IDs:
    // - 1337 (0x539) is common in Ganache GUI
    // - 5777 (0x1691) is common in Truffle/Ganache
    const supportedChainIds = ['0x539', '0x1691'];
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('✅ Chain ID:', currentChainId);

    if (!supportedChainIds.includes(currentChainId)) {
      console.log('Switching to a supported Ganache network...');
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x539' }],
        });
        console.log('✅ Switched to Ganache (1337)');
      } catch (e1) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1691' }],
          });
          console.log('✅ Switched to Ganache (5777)');
        } catch (e2) {
          throw new Error('Please switch MetaMask to your Ganache network (Chain ID 1337 or 5777) and retry.');
        }
      }
    }

    // Get network ID AFTER any switch
    const networkId = await web3.eth.net.getId();
    console.log('✅ Network ID:', networkId);

    // Get contract for the currently connected network.
    // IMPORTANT: do not fall back to a different network's address.
    // If we use an address from another network, transactions may succeed in MetaMask
    // but the contract code won't exist at that address on this chain, resulting in
    // missing/incorrect receipts and failures.
    const contractData = LibraryContract.networks?.[String(networkId)];

    if (!contractData || !contractData.address) {
      const available = LibraryContract.networks ? Object.keys(LibraryContract.networks) : [];
      throw new Error(
        `Contract not deployed on your current MetaMask network (networkId: ${networkId}, chainId: ${currentChainId}). ` +
        `Available networks in Library.json: ${available.join(', ')}. ` +
        `Fix: switch MetaMask to the Ganache network that matches the deployed contract (likely 5777 / 0x1691), ` +
        `or redeploy the contract to your current Ganache network (1337 / 0x539).`
      );
    }

    console.log('✅ Contract address:', contractData.address);

    // Create contract instance
    contract = new web3.eth.Contract(LibraryContract.abi, contractData.address);
    console.log('✅ Contract created');

    // Test contract
    try {
      const bookCount = await contract.methods.bookCount().call();
      console.log('✅ Contract test successful:', bookCount);
    } catch (testError) {
      console.log('⚠️ Contract test failed:', testError.message);
    }

    console.log('=== WORKING CONNECTION SUCCESS ===');
    return { web3, contract, accounts, networkId };

  } catch (error) {
    console.error('=== WORKING CONNECTION FAILED ===', error);
    throw error;
  }
};

export const getWeb3 = () => web3;
export const getContract = () => contract;
export const getAccounts = () => accounts;
