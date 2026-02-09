// META MASK CONNECTION TEST
// Copy and paste this into your browser console (F12) to test MetaMask

console.log('=== TESTING META MASK ===');

// Test 1: Check if MetaMask is installed
if (typeof window.ethereum !== 'undefined') {
    console.log('✅ MetaMask is installed');
    console.log('MetaMask object:', window.ethereum);
    
    // Test 2: Check if it's really MetaMask
    if (window.ethereum.isMetaMask) {
        console.log('✅ This is MetaMask');
    } else {
        console.log('⚠️ ethereum detected but may not be MetaMask');
    }
    
    // Test 3: Try to get accounts
    window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => {
            console.log('✅ Successfully connected to MetaMask!');
            console.log('Accounts:', accounts);
            
            // Test 4: Get chain ID
            window.ethereum.request({ method: 'eth_chainId' })
                .then(chainId => {
                    console.log('✅ Current chain ID:', chainId);
                    console.log('Expected: 0x1691 (Ganache)');
                    
                    if (chainId === '0x1691') {
                        console.log('✅ Already on correct network!');
                    } else {
                        console.log('⚠️ Not on Ganache network');
                    }
                })
                .catch(chainError => {
                    console.log('❌ Failed to get chain ID:', chainError);
                });
        })
        .catch(error => {
            console.log('❌ Failed to connect to MetaMask:', error);
            if (error.code === 4001) {
                console.log('❌ User rejected the connection request');
            }
        });
        
} else {
    console.log('❌ MetaMask is NOT installed');
    console.log('Please install MetaMask from https://metamask.io/');
}

console.log('=== TEST COMPLETE ===');
console.log('If you see "✅ Successfully connected to MetaMask!" above, then MetaMask is working properly.');
