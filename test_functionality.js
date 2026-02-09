// Test Script for Library Management System
// This script tests all the required functionality

console.log('=== LIBRARY MANAGEMENT SYSTEM TEST ===');

// Test 1: Check if localStorage is working
console.log('\n1. Testing localStorage functionality...');
try {
    localStorage.setItem('test', 'value');
    const value = localStorage.getItem('test');
    console.log('✓ localStorage working:', value);
    localStorage.removeItem('test');
} catch (e) {
    console.log('✗ localStorage error:', e);
}

// Test 2: Check if registered users are stored
console.log('\n2. Testing user registration storage...');
try {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    console.log('✓ Registered users count:', users.length);
    if (users.length > 0) {
        console.log('✓ Sample user:', users[0]);
    }
} catch (e) {
    console.log('✗ User storage error:', e);
}

// Test 3: Check if book issues are stored
console.log('\n3. Testing book issues storage...');
try {
    const issues = JSON.parse(localStorage.getItem('bookIssues') || '[]');
    console.log('✓ Book issues count:', issues.length);
    if (issues.length > 0) {
        console.log('✓ Sample issue:', issues[0]);
    }
} catch (e) {
    console.log('✗ Book issues storage error:', e);
}

// Test 4: Check if receipts are stored
console.log('\n4. Testing receipts storage...');
try {
    const receipts = JSON.parse(localStorage.getItem('receipts') || '[]');
    console.log('✓ Receipts count:', receipts.length);
    if (receipts.length > 0) {
        console.log('✓ Sample receipt:', receipts[0]);
    }
} catch (e) {
    console.log('✗ Receipts storage error:', e);
}

// Test 5: Check if books are stored
console.log('\n5. Testing books storage...');
try {
    const books = JSON.parse(localStorage.getItem('libraryBooks') || '[]');
    console.log('✓ Books count:', books.length);
    if (books.length > 0) {
        console.log('✓ Sample book:', books[0]);
    }
} catch (e) {
    console.log('✗ Books storage error:', e);
}

// Test 6: Check if MetaMask/Web3 is available
console.log('\n6. Testing Web3 connectivity...');
if (typeof window !== 'undefined' && window.ethereum) {
    console.log('✓ MetaMask detected');
    window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
        console.log('✓ Connected accounts:', accounts.length);
    }).catch(e => {
        console.log('✗ MetaMask connection error:', e);
    });
} else {
    console.log('⚠ MetaMask not detected - will use localStorage only');
}

// Test 7: Check role-based ID system
console.log('\n7. Testing role-based ID system...');
try {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    users.forEach(user => {
        if (user.role === '1' && user.rollNumber) {
            console.log('✓ Student with rollNumber:', user.rollNumber);
        } else if (user.role === '2' && user.facultyId) {
            console.log('✓ Faculty with facultyId:', user.facultyId);
        } else if (user.role === '3' && user.libraryId) {
            console.log('✓ Librarian with libraryId:', user.libraryId);
        }
    });
} catch (e) {
    console.log('✗ Role-based ID test error:', e);
}

console.log('\n=== TEST COMPLETE ===');
console.log('Open the browser preview to test the full functionality!');
console.log('URL: http://localhost:3000');
