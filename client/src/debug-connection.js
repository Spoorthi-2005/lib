// DEBUG CONNECTION SCRIPT
// Run this in browser console to debug the MetaMask connection

console.log('=== DEBUGGING META MASK CONNECTION ===');

// Step 1: Check if MetaMask is available
console.log('1. Checking MetaMask availability...');
if (typeof window.ethereum !== 'undefined') {
    console.log('✅ MetaMask is available');
    console.log('MetaMask object:', window.ethereum);
} else {
    console.log('❌ MetaMask is NOT available');
    console.log('Please install MetaMask extension');
}

// Step 2: Check if we can request accounts
console.log('\n2. Testing account request...');
if (window.ethereum) {
    window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => {
            console.log('✅ Account request successful');
            console.log('Accounts:', accounts);
            
            // Step 3: Test Web3 creation
            console.log('\n3. Testing Web3 creation...');
            const Web3 = require('web3');
            const web3 = new Web3(window.ethereum);
            console.log('✅ Web3 created successfully');
            
            // Step 4: Test network ID
            console.log('\n4. Testing network ID...');
            web3.eth.net.getId()
                .then(networkId => {
                    console.log('✅ Network ID:', networkId);
                    console.log('Expected: 5777');
                    
                    // Step 5: Test contract connection
                    console.log('\n5. Testing contract connection...');
                    const LibraryContract = require('./contracts/Library.json');
                    console.log('Contract networks:', Object.keys(LibraryContract.networks));
                    
                    const contractData = LibraryContract.networks[networkId];
                    if (contractData) {
                        console.log('✅ Contract found on network:', networkId);
                        console.log('Contract address:', contractData.address);
                        
                        const contract = new web3.eth.Contract(LibraryContract.abi, contractData.address);
                        console.log('✅ Contract instance created');
                        
                        // Step 6: Test contract method
                        console.log('\n6. Testing contract method...');
                        contract.methods.bookCount().call()
                            .then(result => {
                                console.log('✅ Contract method successful:', result);
                                console.log('=== ALL TESTS PASSED ===');
                            })
                            .catch(error => {
                                console.log('❌ Contract method failed:', error);
                            });
                    } else {
                        console.log('❌ Contract not found on network:', networkId);
                    }
                })
                .catch(error => {
                    console.log('❌ Network ID test failed:', error);
                });
        })
        .catch(error => {
            console.log('❌ Account request failed:', error);
            console.log('Error code:', error.code);
            console.log('Error message:', error.message);
        });
}

console.log('\n=== DEBUG SCRIPT STARTED ===');
console.log('Check the console output above for detailed debugging information');
