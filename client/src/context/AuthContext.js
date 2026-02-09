import React, { createContext, useContext, useState, useEffect } from 'react';
import LibraryContract from '../contracts/Library.json';
import Web3 from 'web3';
import * as api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [walletAddress, setWalletAddress] = useState(null);
    const [isBlockchainRegistered, setIsBlockchainRegistered] = useState(false);

    useEffect(() => {
        const init = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                } catch (e) {
                    localStorage.removeItem('user');
                }
            }

            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                        await checkBlockchainRegistration(accounts[0]);
                    }

                    window.ethereum.on('accountsChanged', async (accounts) => {
                        if (accounts.length > 0) {
                            setWalletAddress(accounts[0]);
                            await checkBlockchainRegistration(accounts[0]);
                        } else {
                            setWalletAddress(null);
                            setIsBlockchainRegistered(false);
                        }
                    });
                } catch (e) {
                    console.error("MetaMask init error:", e);
                }
            }
            setLoading(false);
        };
        init();
    }, []);

    const checkBlockchainRegistration = async (address) => {
        if (!address || !window.ethereum) return;
        try {
            const web3 = new Web3(window.ethereum);
            const netId = await web3.eth.net.getId();
            const deployedNetwork = LibraryContract.networks[netId.toString()] || LibraryContract.networks['5777'];

            if (deployedNetwork && deployedNetwork.address) {
                const contract = new web3.eth.Contract(LibraryContract.abi, deployedNetwork.address);
                const onChainUser = await contract.methods.users(address).call();
                setIsBlockchainRegistered(onChainUser && onChainUser.email !== "");
            }
        } catch (err) {
            console.error("Check registration error:", err);
            setIsBlockchainRegistered(false);
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("Please install MetaMask!");
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setWalletAddress(accounts[0]);
            await checkBlockchainRegistration(accounts[0]);
            return accounts[0];
        } catch (err) {
            console.error(err);
            throw new Error("Failed to connect wallet");
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const normalizedEmail = (email || '').trim().toLowerCase();
            const data = await api.login(normalizedEmail, password);
            if (data.error) throw new Error(data.error);

            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));

            if (walletAddress) {
                await checkBlockchainRegistration(walletAddress);
            }

            return data.user;
        } catch (err) {
            setError(err.message || 'Login failed');
            throw err;
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const normalizedUserData = {
                ...userData,
                email: (userData?.email || '').trim().toLowerCase(),
            };

            const data = await api.register(normalizedUserData);
            if (data.error) throw new Error(data.error);

            // Automatic blockchain registration attempt
            if (window.ethereum) {
                try {
                    const web3 = new Web3(window.ethereum);
                    const accounts = await web3.eth.getAccounts();
                    const account = accounts[0];
                    if (account) {
                        const netId = await web3.eth.net.getId();
                        const deployedNetwork = LibraryContract.networks[netId.toString()] || LibraryContract.networks['5777'];

                        if (deployedNetwork && deployedNetwork.address) {
                            const contract = new web3.eth.Contract(LibraryContract.abi, deployedNetwork.address);
                            const gradDate = normalizedUserData.grad_or_leave_date || new Date(new Date().setFullYear(new Date().getFullYear() + 4)).toISOString();
                            const gradTimestamp = Math.floor(new Date(gradDate).getTime() / 1000);
                            const roleMap = { 'Student': 1, 'Faculty': 2, 'Librarian': 3 };
                            const roleId = roleMap[normalizedUserData.role] || 1;

                            await contract.methods.registerUser(
                                normalizedUserData.name,
                                normalizedUserData.email,
                                roleId,
                                gradTimestamp,
                                normalizedUserData.student_id || "",
                                normalizedUserData.faculty_id || "",
                                normalizedUserData.library_id || ""
                            ).send({ from: account, gas: 500000 });
                        }
                    }
                } catch (blockchainErr) {
                    console.warn("Blockchain registration failed during signup:", blockchainErr);
                }
            }

            return data;
        } catch (err) {
            setError(err.message || "Registration failed");
            throw err;
        }
    };

    const syncWalletOnBlockchain = async () => {
        if (!user || !walletAddress) {
            throw new Error("Login and connect wallet first");
        }

        try {
            const web3 = new Web3(window.ethereum);
            const netId = await web3.eth.net.getId();
            const deployedNetwork = LibraryContract.networks[netId.toString()] || LibraryContract.networks['5777'];

            if (!deployedNetwork || !deployedNetwork.address) {
                throw new Error("Contract not deployed on this network. Please switch to Ganache (7545).");
            }

            const contract = new web3.eth.Contract(LibraryContract.abi, deployedNetwork.address);

            const gradDate = user.grad_or_leave_date || new Date(new Date().setFullYear(new Date().getFullYear() + 4)).toISOString();
            const gradTimestamp = Math.floor(new Date(gradDate).getTime() / 1000);

            const roleMap = { 'Student': 1, 'Faculty': 2, 'Librarian': 3 };
            const roleId = roleMap[user.role] || 1;

            await contract.methods.registerUser(
                user.name,
                user.email,
                roleId,
                gradTimestamp,
                "", "", ""
            ).send({
                from: walletAddress,
                gas: 500000,
                gasPrice: '20000000000',
            });

            await checkBlockchainRegistration(walletAddress);
            return true;
        } catch (err) {
            console.error("Sync wallet error:", err);
            throw new Error(err.message || "Failed to sync wallet");
        }
    };

    const logout = () => {
        setUser(null);
        setWalletAddress(null);
        setIsBlockchainRegistered(false);
        localStorage.removeItem('user');
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        walletAddress,
        connectWallet,
        isBlockchainRegistered,
        syncWalletOnBlockchain
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
