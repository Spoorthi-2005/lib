import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  CheckCircle,
  Pending,
  Error,
  Refresh,
  ExpandMore,
  ExpandLess,
  Book,
  Person,
  Schedule,
  Block,
  TrendingUp,
  Visibility,
} from '@mui/icons-material';

const BlockchainStatus = ({ books, issued, user }) => {
  const [blockchainStatus, setBlockchainStatus] = useState({
    isConnected: true,
    networkId: 1337,
    currentBlock: 0,
    pendingTransactions: [],
    confirmedTransactions: [],
    lastUpdate: Date.now(),
  });

  const [expanded, setExpanded] = useState(false);

  // Load real transaction data from localStorage
  useEffect(() => {
    const updateTransactionStatus = () => {
      try {
        // Get all receipts from localStorage
        const receipts = JSON.parse(localStorage.getItem('receipts') || '[]');
        const bookIssues = JSON.parse(localStorage.getItem('bookIssues') || '[]');
        
        // Count confirmed transactions (all completed receipts)
        const confirmedCount = receipts.length;
        
        // For demo purposes, we'll show 0 pending since our system processes immediately
        const pendingCount = 0;
        
        console.log('Transaction status update:', {
          confirmedCount,
          pendingCount,
          receipts: receipts.length,
          bookIssues: bookIssues.length
        });
        
        setBlockchainStatus(prev => ({
          ...prev,
          confirmedTransactions: receipts,
          pendingTransactions: [],
          currentBlock: prev.currentBlock + (confirmedCount > (prev.confirmedTransactions?.length || 0) ? 1 : 0),
          lastUpdate: Date.now(),
        }));
      } catch (error) {
        console.error('Error updating transaction status:', error);
      }
    };
    
    // Update immediately
    updateTransactionStatus();
    
    // Update every 5 seconds
    const interval = setInterval(updateTransactionStatus, 5000);
    
    return () => clearInterval(interval);
  }, [issued]); // Re-run when issued books change

  // Simulate blockchain block updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockchainStatus(prev => ({
        currentBlock: prev.currentBlock + 1,
        lastUpdate: Date.now(),
        pendingTransactions: prev.pendingTransactions.map(tx => ({
          ...tx,
          status: Math.random() > 0.7 ? 'Confirmed' : 'Pending',
          blockNumber: tx.status === 'Confirmed' ? prev.currentBlock + 1 : null,
        })),
      }));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return '#4CAF50';
      case 'Pending':
        return '#FF9800';
      case 'Failed':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmed':
        return <CheckCircle color="success" />;
      case 'Pending':
        return <Pending color="warning" />;
      case 'Failed':
        return <Error color="error" />;
      default:
        return <Schedule color="info" />;
    }
  };

  const refreshStatus = () => {
    setBlockchainStatus(prev => ({
      ...prev,
      lastUpdate: Date.now(),
    }));
  };

  const getBookStatus = (bookId) => {
    const issuedBook = issued.find(iss => iss.bookId === bookId);
    if (issuedBook) {
      return {
        status: 'Borrowed',
        user: user?.username || 'Unknown',
        date: new Date(issuedBook.issueDate * 1000).toLocaleDateString(),
        dueDate: new Date(issuedBook.dueDate * 1000).toLocaleDateString(),
        isOverdue: Date.now() > issuedBook.dueDate * 1000,
      };
    }
    return {
      status: 'Available',
      user: null,
      date: null,
      dueDate: null,
      isOverdue: false,
    };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 3 }}>
        ⛓️ Blockchain Status Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Network Status */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  Network Status
                </Typography>
                <IconButton onClick={refreshStatus} sx={{ color: 'white' }}>
                  <Refresh />
                </IconButton>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Connection Status
                </Typography>
                <Chip 
                  label={blockchainStatus.isConnected ? 'Connected' : 'Disconnected'} 
                  color={blockchainStatus.isConnected ? 'success' : 'error'}
                  icon={blockchainStatus.isConnected ? <CheckCircle /> : <Error />}
                  sx={{ mt: 1 }}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Network ID
                </Typography>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  {blockchainStatus.networkId} (Ganache Local)
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Current Block
                </Typography>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  #{blockchainStatus.currentBlock}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Last Update
                </Typography>
                <Typography variant="body1" sx={{ color: 'white' }}>
                  {new Date(blockchainStatus.lastUpdate).toLocaleTimeString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction Status */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  Recent Transactions
                </Typography>
                <IconButton onClick={() => setExpanded(!expanded)} sx={{ color: 'white' }}>
                  {expanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Pending Transactions
                </Typography>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  0
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Confirmed Transactions
                </Typography>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  {blockchainStatus.confirmedTransactions?.length || 0}
                </Typography>
              </Box>
              
              <Collapse in={expanded}>
                <List>
                  {(blockchainStatus.confirmedTransactions || []).slice(0, 5).map((receipt, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        {getStatusIcon('Confirmed')}
                      </ListItemIcon>
                      <ListItemText
                        primary={`${receipt.action || 'Transaction'} - ${receipt.bookName || receipt.title || 'Book'}`}
                        secondary={`TX: ${receipt.transactionId || receipt.txHash?.substring(0, 10) || 'N/A'} • Block: ${receipt.blockNumber || 'N/A'} • Confirmed`}
                        sx={{ color: 'white' }}
                      />
                      <Chip 
                        label="Confirmed" 
                        size="small"
                        sx={{ 
                          backgroundColor: getStatusColor('Confirmed'),
                          color: 'white'
                        }}
                      />
                    </ListItem>
                  ))}
                  {(!blockchainStatus.confirmedTransactions || blockchainStatus.confirmedTransactions.length === 0) && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary="No transactions yet"
                        secondary="Issue or return a book to see transactions here"
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        {/* Book Status Overview */}
        <Grid item xs={12}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                📚 Book Status on Blockchain
              </Typography>
              
              <Grid container spacing={2}>
                {books.slice(0, 6).map((book) => {
                  const bookStatus = getBookStatus(book.id);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={book.id}>
                      <Paper sx={{ 
                        p: 2, 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        borderRadius: 2,
                        border: bookStatus.isOverdue ? '2px solid #F44336' : '1px solid rgba(255,255,255,0.2)'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Book sx={{ color: 'white', mr: 1 }} />
                          <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
                            #{book.id}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                          {book.title}
                        </Typography>
                        
                        <Chip 
                          label={bookStatus.status} 
                          size="small"
                          color={bookStatus.status === 'Available' ? 'success' : 'warning'}
                          sx={{ mb: 1 }}
                        />
                        
                        {bookStatus.user && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              Borrowed by: {bookStatus.user}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>
                              Due: {bookStatus.dueDate}
                            </Typography>
                            {bookStatus.isOverdue && (
                              <Typography variant="caption" sx={{ color: '#F44336', display: 'block' }}>
                                ⚠️ OVERDUE
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Real-time Updates */}
        <Grid item xs={12}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                🔄 Real-time Blockchain Updates
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Block Mining Progress
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(blockchainStatus.currentBlock % 10) * 10}
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
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <TrendingUp sx={{ fontSize: 40, color: '#4CAF50' }} />
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      {books.filter(b => getBookStatus(b.id).status === 'Available').length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Available Books
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Person sx={{ fontSize: 40, color: '#2196F3' }} />
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      {issued.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Borrowed Books
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Visibility sx={{ fontSize: 40, color: '#FF9800' }} />
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      {blockchainStatus.pendingTransactions.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Total Transactions
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BlockchainStatus; 