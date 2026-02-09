import React from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import { MenuBook, ShoppingCart, History, Notifications, Dashboard, ExitToApp } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Import sub-components
import BookList from './BookList';
import Cart from './Cart';
import IssuedBooks from './IssuedBooks';
import NotificationsView from './Notifications';
import LibrarianDashboard from './LibrarianDashboard';

const drawerWidth = 240;

const Layout = () => {
    const { user, logout, connectWallet, walletAddress, isBlockchainRegistered, syncWalletOnBlockchain } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Map routes/sections
    const menuItems = [
        { text: 'Library', icon: <MenuBook />, path: '/dashboard' },
        { text: 'Cart', icon: <ShoppingCart />, path: '/cart' },
        { text: 'Issued Books', icon: <History />, path: '/issued' },
        { text: 'Notifications', icon: <Notifications />, path: '/notifications' },
    ];

    if (user?.role === 'Librarian') {
        menuItems.unshift({ text: 'Admin Dashboard', icon: <Dashboard />, path: '/admin-dashboard' });
    }


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: '#1a1a2e' }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        📚 Library Management System ({user?.role})
                    </Typography>
                    <Typography variant="body1" sx={{ mr: 2 }}>
                        {user?.name}
                    </Typography>
                    {walletAddress && !isBlockchainRegistered && (
                        <Button
                            variant="contained"
                            color="warning"
                            size="small"
                            onClick={async () => {
                                try {
                                    await syncWalletOnBlockchain();
                                    alert("Wallet synced successfully!");
                                } catch (e) {
                                    alert(e.message);
                                }
                            }}
                            sx={{ mr: 2, fontWeight: 'bold' }}
                        >
                            ⚠️ Sync Wallet
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={connectWallet}
                        sx={{ mr: 2, color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                    >
                        {walletAddress ? `🔗 ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : "🔌 Connect Wallet"}
                    </Button>
                    <Button color="inherit" onClick={handleLogout} startIcon={<ExitToApp />}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', background: '#16213e', color: 'white' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem
                                button
                                key={item.text}
                                onClick={() => navigate(item.path)}
                                selected={location.pathname === item.path}
                                sx={{ '&.Mui-selected': { background: '#0f3460' }, '&:hover': { background: '#1a1a2e' } }}
                            >
                                <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, background: '#f5f5f5', minHeight: '100vh' }}>
                <Toolbar />
                {/* Content Area */}
                {location.pathname === '/dashboard' && <BookList />}
                {location.pathname === '/cart' && <Cart />}
                {location.pathname === '/issued' && <IssuedBooks />}
                {location.pathname === '/notifications' && <NotificationsView />}
                {location.pathname === '/admin-dashboard' && <LibrarianDashboard />}

                {location.pathname === '/' && <Typography>Welcome to the Library. Select an item from the menu.</Typography>}
            </Box>
        </Box>
    );
};

export default Layout;
