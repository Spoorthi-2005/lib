import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  TrendingUp,
  Book,
  Person,
  Assessment,
  QrCode,
  Notifications,
  Analytics,
  School,
  Work,
  AdminPanelSettings,
  Timeline,
  PieChart,
  BarChart,
  ShowChart,
  Download,
  Print,
  Share,
  Favorite,
  Star,
  Visibility,
} from '@mui/icons-material';

const AdvancedFeatures = ({ books, users, transactions, userRole }) => {
  const [analytics, setAnalytics] = useState({
    totalBooks: books?.length || 0,
    totalUsers: users?.length || 0,
    totalTransactions: transactions?.length || 0,
    popularBooks: [],
    activeUsers: 0,
    overdueBooks: 0,
    revenue: 0,
  });

  const [recommendations, setRecommendations] = useState([]);
  const [qrCodeDialog, setQrCodeDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [reportType, setReportType] = useState('monthly');

  // Generate analytics data
  useEffect(() => {
    if (books && users && transactions) {
      const popularBooks = books
        .sort((a, b) => (b.totalCopies - b.availableCopies) - (a.totalCopies - a.availableCopies))
        .slice(0, 5);

      const activeUsers = users.filter(u => u.isActive).length;
      const overdueBooks = transactions.filter(t => 
        t.action === 'Borrowed' && 
        new Date(t.date * 1000) < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      ).length;

      const revenue = transactions
        .filter(t => t.fine)
        .reduce((sum, t) => sum + (t.fine || 0), 0);

      setAnalytics({
        totalBooks: books.length,
        totalUsers: users.length,
        totalTransactions: transactions.length,
        popularBooks,
        activeUsers,
        overdueBooks,
        revenue,
      });
    }
  }, [books, users, transactions]);

  // Generate AI recommendations
  useEffect(() => {
    if (books && userRole) {
      const recommendations = generateRecommendations(books, userRole);
      setRecommendations(recommendations);
    }
  }, [books, userRole]);

  const generateRecommendations = (books, role) => {
    // Simple recommendation algorithm based on role and popularity
    const rolePreferences = {
      '1': ['Computer Science', 'Engineering', 'Mathematics'], // Student
      '2': ['Research', 'Academic', 'Professional'], // Faculty
      '3': ['Management', 'Administration', 'All'], // Librarian
    };

    const preferences = rolePreferences[role] || ['All'];
    
    return books
      .filter(book => 
        preferences.includes('All') || 
        preferences.some(pref => 
          book.domain.toLowerCase().includes(pref.toLowerCase())
        )
      )
      .sort((a, b) => (b.totalCopies - b.availableCopies) - (a.totalCopies - a.availableCopies))
      .slice(0, 3);
  };

  const generateQRCode = (book) => {
    const qrData = JSON.stringify({
      bookId: book.id,
      title: book.title,
      isbn: book.isbn,
      timestamp: Date.now(),
    });
    
    // In a real implementation, you would use a QR code library
    // For now, we'll show the data that would be encoded
    return qrData;
  };

  const exportReport = (type) => {
    const reportData = {
      type,
      timestamp: new Date().toISOString(),
      analytics,
      transactions: transactions?.slice(0, 100) || [],
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library-report-${type}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getChartData = () => {
    const domains = books?.reduce((acc, book) => {
      acc[book.domain] = (acc[book.domain] || 0) + 1;
      return acc;
    }, {}) || {};

    return Object.entries(domains).map(([domain, count]) => ({
      name: domain,
      value: count,
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 3 }}>
        🚀 Advanced Features Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Analytics Overview */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                📊 Real-time Analytics
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Book sx={{ fontSize: 40, color: '#4CAF50' }} />
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      {analytics.totalBooks}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Total Books
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Person sx={{ fontSize: 40, color: '#2196F3' }} />
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      {analytics.totalUsers}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Registered Users
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Assessment sx={{ fontSize: 40, color: '#FF9800' }} />
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      {analytics.totalTransactions}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Transactions
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <TrendingUp sx={{ fontSize: 40, color: '#E91E63' }} />
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      ₹{analytics.revenue}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Revenue
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Recommendations */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                🤖 AI Recommendations
              </Typography>
              
              <List>
                {recommendations.map((book, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Star sx={{ color: '#FFD700' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={book.title}
                      secondary={`${book.author} • ${book.domain}`}
                      sx={{ color: 'white' }}
                    />
                    <Chip 
                      label="Recommended" 
                      size="small" 
                      sx={{ 
                        background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                        color: 'white'
                      }} 
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Popular Books Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                📈 Popular Books
              </Typography>
              
              {analytics.popularBooks.map((book, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      {book.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {book.totalCopies - book.availableCopies}/{book.totalCopies}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={((book.totalCopies - book.availableCopies) / book.totalCopies) * 100}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                      }
                    }} 
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                ⚡ Quick Actions
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    startIcon={<QrCode />}
                    fullWidth
                    onClick={() => setQrCodeDialog(true)}
                    sx={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                      }
                    }}
                  >
                    Generate QR
                  </Button>
                </Grid>
                
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    fullWidth
                    onClick={() => exportReport(reportType)}
                    sx={{
                      background: 'linear-gradient(45deg, #f093fb, #f5576c)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #e085e7, #e54b5f)',
                      }
                    }}
                  >
                    Export Report
                  </Button>
                </Grid>
                
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    startIcon={<Print />}
                    fullWidth
                    sx={{
                      background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #46a0e5, #00e6e6)',
                      }
                    }}
                  >
                    Print Report
                  </Button>
                </Grid>
                
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    startIcon={<Share />}
                    fullWidth
                    sx={{
                      background: 'linear-gradient(45deg, #43e97b, #38f9d7)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #3dd870, #33e6c4)',
                      }
                    }}
                  >
                    Share Data
                  </Button>
                </Grid>
              </Grid>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Report Type</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  sx={{ color: 'white' }}
                >
                  <MenuItem value="monthly">Monthly Report</MenuItem>
                  <MenuItem value="quarterly">Quarterly Report</MenuItem>
                  <MenuItem value="annual">Annual Report</MenuItem>
                  <MenuItem value="custom">Custom Report</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* QR Code Dialog */}
      <Dialog open={qrCodeDialog} onClose={() => setQrCodeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white' }}>
          📱 QR Code Generator
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Select a book to generate a QR code for quick check-in/check-out:
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Book</InputLabel>
            <Select
              value={selectedBook?.id || ''}
              onChange={(e) => {
                const book = books?.find(b => b.id === e.target.value);
                setSelectedBook(book);
              }}
            >
              {books?.map((book) => (
                <MenuItem key={book.id} value={book.id}>
                  {book.title} - {book.author}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {selectedBook && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                QR Code Data:
              </Typography>
              <Paper sx={{ p: 2, background: '#f5f5f5', fontFamily: 'monospace' }}>
                {generateQRCode(selectedBook)}
              </Paper>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Scan this QR code to quickly access book information
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrCodeDialog(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              if (selectedBook) {
                // In a real app, you would generate and display an actual QR code
                alert('QR Code generated successfully!');
                setQrCodeDialog(false);
              }
            }}
            disabled={!selectedBook}
          >
            Generate QR Code
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedFeatures; 