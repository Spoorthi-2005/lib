import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, Tabs, Tab,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, TextField, IconButton, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, Stack
} from '@mui/material';
import {
    MenuBook, People, ReceiptLong, Add, Edit, Delete,
    TrendingUp, LibraryBooks, MonetizationOn
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5001/api';

const LibrarianDashboard = () => {
    useAuth();
    const [tabIndex, setTabIndex] = useState(0);
    const [analytics, setAnalytics] = useState({});
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);

    // Book Form State
    const [openBookDialog, setOpenBookDialog] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [bookForm, setBookForm] = useState({
        title: '', author: '', category: '', total_copies: 5, image_url: ''
    });

    const fetchData = useCallback(async () => {
        try {
            const headers = { 'Content-Type': 'application/json' };

            const [analyticsRes, booksRes, usersRes, txRes] = await Promise.all([
                fetch(`${API_URL}/transactions/analytics`, { headers }),
                fetch(`${API_URL}/books`, { headers }),
                fetch(`${API_URL}/auth/users`, { headers }),
                fetch(`${API_URL}/transactions/all`, { headers })
            ]);

            setAnalytics(await analyticsRes.json());
            setBooks(await booksRes.json());
            setUsers(await usersRes.json());
            setTransactions(await txRes.json());
        } catch (err) {
            console.error("Dashboard Feed Error:", err);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTabChange = (event, newValue) => setTabIndex(newValue);

    // Book Handlers
    const handleBookAction = async (e) => {
        e.preventDefault();
        const url = editingBook ? `${API_URL}/books/${editingBook.id}` : `${API_URL}/books`;
        const method = editingBook ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookForm)
            });
            if (res.ok) {
                setOpenBookDialog(false);
                setEditingBook(null);
                setBookForm({ title: '', author: '', category: '', total_copies: 5, image_url: '' });
                fetchData();
            }
        } catch (err) {
            console.error("Book Save Error:", err);
        }
    };

    const deleteBook = async (id) => {
        if (!window.confirm("Are you sure you want to delete this book?")) return;
        try {
            await fetch(`${API_URL}/books/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (err) {
            console.error("Book Delete Error:", err);
        }
    };

    const StatCard = ({ title, value, icon, color }) => (
        <Card sx={{ background: 'white', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Box sx={{ p: 1, borderRadius: '10px', backgroundColor: `${color}15`, color, mr: 2 }}>
                    {icon}
                </Box>
                <Box>
                    <Typography variant="body2" color="textSecondary">{title}</Typography>
                    <Typography variant="h5" fontWeight="bold">{value || 0}</Typography>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#1a1a2e' }}>
                    Librarian Command Center
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => { setEditingBook(null); setOpenBookDialog(true); }}
                    sx={{ borderRadius: '10px', background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                >
                    Add New Book
                </Button>
            </Box>

            {/* Overview Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Books" value={analytics.totalStock} icon={<LibraryBooks />} color="#4e73df" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Active Issues" value={analytics.activeIssues} icon={<TrendingUp />} color="#1cc88a" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Users" value={analytics.totalUsers} icon={<People />} color="#36b9cc" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Fines Collected" value={`₹${analytics.totalFines || 0}`} icon={<MonetizationOn />} color="#f6c23e" />
                </Grid>
            </Grid>

            <Box sx={{ width: '100%', mb: 4 }}>
                <Tabs value={tabIndex} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tab icon={<MenuBook />} label="Book Inventory" iconPosition="start" />
                    <Tab icon={<People />} label="Library Users" iconPosition="start" />
                    <Tab icon={<ReceiptLong />} label="Transaction History" iconPosition="start" />
                </Tabs>

                {/* Inventory Tab */}
                {tabIndex === 0 && (
                    <TableContainer component={Paper} sx={{ borderRadius: '15px', overflow: 'hidden' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f8f9fc' }}>
                                <TableRow>
                                    <TableCell>Book</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Author</TableCell>
                                    <TableCell>Stock</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {books.map((book) => (
                                    <TableRow key={book.id}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <img src={book.image_url} alt="" style={{ width: 40, height: 55, borderRadius: 4, objectFit: 'cover' }} />
                                                <Typography fontWeight="500">{book.title}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell><Chip label={book.category} size="small" variant="outlined" /></TableCell>
                                        <TableCell>{book.author}</TableCell>
                                        <TableCell>{book.available_copies} / {book.total_copies}</TableCell>
                                        <TableCell align="right">
                                            <IconButton color="primary" onClick={() => { setEditingBook(book); setBookForm(book); setOpenBookDialog(true); }}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => deleteBook(book.id)}>
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Users Tab */}
                {tabIndex === 1 && (
                    <TableContainer component={Paper} sx={{ borderRadius: '15px' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f8f9fc' }}>
                                <TableRow>
                                    <TableCell>User</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Contact</TableCell>
                                    <TableCell>Joined Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell fontWeight="500">{u.name}</TableCell>
                                        <TableCell>
                                            <Chip label={u.role} size="small" color={u.role === 'Faculty' ? 'secondary' : 'default'} />
                                        </TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>{u.whatsapp_number}</TableCell>
                                        <TableCell>{new Date(u.joined_date).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Transactions Tab */}
                {tabIndex === 2 && (
                    <TableContainer component={Paper} sx={{ borderRadius: '15px' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f8f9fc' }}>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>User</TableCell>
                                    <TableCell>Book</TableCell>
                                    <TableCell>Action</TableCell>
                                    <TableCell>Fine</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell>{new Date(tx.issue_date).toLocaleString()}</TableCell>
                                        <TableCell>{tx.user_name}</TableCell>
                                        <TableCell>{tx.title}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={tx.type}
                                                size="small"
                                                color={tx.type === 'ISSUE' ? 'warning' : 'success'}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: tx.fine_amount > 0 ? '#ff1744' : 'inherit' }}>
                                            {tx.fine_amount > 0 ? `₹${tx.fine_amount}` : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            {/* Add/Edit Book Dialog */}
            <Dialog open={openBookDialog} onClose={() => setOpenBookDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editingBook ? "Edit Book" : "Add New Library Book"}</DialogTitle>
                <form onSubmit={handleBookAction}>
                    <DialogContent>
                        <Stack spacing={3} mt={1}>
                            <TextField label="Title" fullWidth required value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} />
                            <TextField label="Author" fullWidth required value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} />
                            <TextField label="Category" fullWidth required value={bookForm.category} onChange={e => setBookForm({ ...bookForm, category: e.target.value })} />
                            <TextField label="Total Copies" type="number" fullWidth required value={bookForm.total_copies} onChange={e => setBookForm({ ...bookForm, total_copies: e.target.value })} />
                            <TextField label="Image URL" fullWidth required value={bookForm.image_url} onChange={e => setBookForm({ ...bookForm, image_url: e.target.value })} />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setOpenBookDialog(false)}>Cancel</Button>
                        <Button type="submit" variant="contained" sx={{ borderRadius: '8px' }}>
                            {editingBook ? "Update Book" : "Create Book"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default LibrarianDashboard;
