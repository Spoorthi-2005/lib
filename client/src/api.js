const API_URL = 'http://localhost:5001/api';

const headers = {
    'Content-Type': 'application/json',
};

// Auth
export const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password }),
    });
    return res.json();
};

export const register = async (userData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify(userData),
    });
    return res.json();
};

// Books
export const getBooks = async (search = '') => {
    const res = await fetch(`${API_URL}/books?search=${search}`);
    return res.json();
};

export const addBook = async (bookData) => {
    const res = await fetch(`${API_URL}/books`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bookData),
    });
    return res.json();
};

// Transactions
export const checkEligibility = async (userId, bookId) => {
    const res = await fetch(`${API_URL}/transactions/check-eligibility/${userId}/${bookId}`);
    return res.json();
};

export const recordIssue = async (data) => {
    const res = await fetch(`${API_URL}/transactions/issue`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });
    return res.json();
};

export const recordReturn = async (data) => {
    const res = await fetch(`${API_URL}/transactions/return`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });
    return res.json();
};

export const getHistory = async (userId) => {
    const res = await fetch(`${API_URL}/transactions/history/${userId}`);
    return res.json();
};

// Notifications
export const getNotifications = async (userId) => {
    const res = await fetch(`${API_URL}/notifications/${userId}`);
    return res.json();
};

export const markRead = async (id) => {
    await fetch(`${API_URL}/notifications/read/${id}`, { method: 'PUT' });
};

// Mock Alert (to trigger from UI if needed for demo)
export const sendMockAlert = async (to, message) => {
    await fetch(`${API_URL}/alert`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ to, message })
    });
};
