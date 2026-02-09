// CONNECTION TEST SCRIPT
// Run this in browser console (F12) to debug MetaMask connection

console.log('=== META MASK CONNECTION TEST ===');

// Test 1: Check if MetaMask is installed
if (typeof window.ethereum !== 'undefined') {
    console.log('✅ MetaMask is installed');
    
    // Test 2: Check current accounts
    window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
            console.log('✅ Current accounts:', accounts);
            if (accounts.length > 0) {
                console.log('✅ Already connected to account:', accounts[0]);
            } else {
                console.log('⚠️ No accounts connected, requesting access...');
                
                // Test 3: Request account access
                window.ethereum.request({ method: 'eth_requestAccounts' })
                    .then(newAccounts => {
                        console.log('✅ Successfully connected to accounts:', newAccounts);
                        
                        // Test 4: Check network
                        window.ethereum.request({ method: 'eth_chainId' })
                            .then(chainId => {
                                console.log('✅ Current chain ID:', chainId);
                                console.log('Expected chain ID: 0x1691 (5777)');
                                
                                if (chainId === '0x1691') {
                                    console.log('✅ Already on correct network (Ganache)');
                                } else {
                                    console.log('⚠️ Need to switch to Ganache network...');
                                    
                                    // Test 5: Switch to Ganache
                                    window.ethereum.request({
                                        method: 'wallet_switchEthereumChain',
                                        params: [{ chainId: '0x1691' }],
                                    })
                                    .then(() => {
                                        console.log('✅ Successfully switched to Ganache');
                                    })
                                    .catch(switchError => {
                                        console.log('❌ Failed to switch:', switchError);
                                        
                                        if (switchError.code === 4902) {
                                            console.log('⚠️ Network not found, adding Ganache...');
                                            
                                            window.ethereum.request({
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
                                            })
                                            .then(() => {
                                                console.log('✅ Ganache network added');
                                            })
                                            .catch(addError => {
                                                console.log('❌ Failed to add network:', addError);
                                            });
                                        }
                                    });
                                }
                            })
                            .catch(chainError => {
                                console.log('❌ Failed to get chain ID:', chainError);
                            });
                    })
                    .catch(requestError => {
                        console.log('❌ Failed to request accounts:', requestError);
                        if (requestError.code === 4001) {
                            console.log('❌ User rejected connection request');
                        }
                    });
            }
        })
        .catch(accountError => {
            console.log('❌ Failed to get accounts:', accountError);
        });
} else {
    console.log('❌ MetaMask is not installed');
}

console.log('=== TEST COMPLETE ===');
console.log('Check the console output above for connection status');
