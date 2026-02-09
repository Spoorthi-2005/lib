import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Close,
  Download,
  Print,
  Share,
  Book,
  Receipt,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';

const ReceiptModal = ({ open, onClose, receipt }) => {
  if (!receipt) return null;

  const generatePDF = () => {
    const doc = new jsPDF();
    const ts = receipt.timestamp || receipt.issueDate || receipt.returnDate || receipt.date;
    const dateString = ts ? new Date(ts * 1000).toLocaleString() : 'N/A';
    
    // Header
    doc.setFontSize(20);
    doc.text('Digital Library Receipt', 105, 20, { align: 'center' });
    
    // Library Info
    doc.setFontSize(12);
    doc.text('GVPCEW Library Management System', 105, 35, { align: 'center' });
    doc.text('Blockchain-Powered Library', 105, 45, { align: 'center' });
    
    // Receipt Details
    doc.setFontSize(14);
    doc.text('Transaction Details:', 20, 65);
    
    doc.setFontSize(10);
    let yPos = 80;
    doc.text(`Transaction ID: ${receipt.transactionId || 'N/A'}`, 20, yPos);
    yPos += 10;
    doc.text(`Book ID: ${receipt.bookId || 'N/A'}`, 20, yPos);
    yPos += 10;
    doc.text(`Book Name: ${receipt.bookName || receipt.title || 'N/A'}`, 20, yPos);
    yPos += 10;
    doc.text(`Student Name: ${receipt.studentName || receipt.username || 'N/A'}`, 20, yPos);
    yPos += 10;
    doc.text(`Roll Number: ${receipt.rollNumber || 'N/A'}`, 20, yPos);
    yPos += 10;
    doc.text(`Action: ${receipt.action || 'N/A'}`, 20, yPos);
    yPos += 10;
    doc.text(`Date: ${dateString}`, 20, yPos);
    yPos += 10;
    doc.text(`User Role: ${receipt.userRole || 'N/A'}`, 20, yPos);
    yPos += 10;
    doc.text(`User ID: ${receipt.userId || 'N/A'}`, 20, yPos);
    yPos += 10;
    
    if (receipt.fine) {
      doc.text(`Fine Paid: ₹${receipt.fine}`, 20, yPos);
      yPos += 10;
    }
    
    // Blockchain Info
    doc.setFontSize(12);
    doc.text('Blockchain Information:', 20, yPos + 10);
    doc.setFontSize(10);
    yPos = yPos + 25;
    doc.text(`Transaction Hash: ${receipt.txHash || 'N/A (Local-Only)'}`, 20, yPos);
    yPos += 10;
    doc.text(`Block Number: ${receipt.blockNumber ?? 'N/A'}`, 20, yPos);
    yPos += 10;
    doc.text(`Gas Used: ${receipt.gasUsed ?? 'N/A'}`, 20, yPos);
    yPos += 10;
    doc.text(`From: ${receipt.from || 'N/A'}`, 20, yPos);
    yPos += 10;
    doc.text(`To (Contract): ${receipt.to || receipt.contractAddress || 'N/A'}`, 20, yPos);
    yPos += 10;
    doc.text(`Contract Address: ${receipt.contractAddress || receipt.to || 'N/A'}`, 20, yPos);
    yPos += 10;
    doc.text(`Network: ${receipt.network || 'Ganache Local'}`, 20, yPos);
    yPos += 10;
    doc.text(`Status: ${receipt.status || 'Confirmed'}`, 20, yPos);
    
    // Footer
    doc.setFontSize(8);
    doc.text('This receipt is digitally signed and stored on the blockchain', 105, 270, { align: 'center' });
    doc.text('Generated on: ' + new Date().toLocaleString(), 105, 280, { align: 'center' });
    
    const safeAction = (receipt.action || 'receipt').toString().toLowerCase().replace(/\s+/g, '-');
    doc.save(`library-receipt-${receipt.bookId || 'na'}-${safeAction}.pdf`);
  };

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

  const getActionIcon = (action) => {
    return action === 'Borrowed' ? <Book color="primary" /> : <CheckCircle color="success" />;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea, #764ba2)', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Receipt sx={{ mr: 1 }} />
          <Typography variant="h6">
            Digital Receipt - {receipt.action}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {/* Receipt Header */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ color: 'white' }}>
                  GVPCEW Library Management System
                </Typography>
                <Chip 
                  label={receipt.status || 'Confirmed'} 
                  color={receipt.status === 'Confirmed' ? 'success' : 'warning'}
                  icon={getActionIcon(receipt.action)}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Blockchain-Powered Library Transaction Receipt
              </Typography>
            </Paper>
          </Grid>

          {/* Transaction Details */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                📚 Book Information
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Book ID
                </Typography>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  #{receipt.bookId}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Book Title
                </Typography>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  {receipt.title}
                </Typography>
              </Box>
              
              {receipt.image && (
                <Box sx={{ mb: 2 }}>
                  <img 
                    src={receipt.image} 
                    alt={receipt.title}
                    style={{ 
                      width: '100px', 
                      height: '150px', 
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid rgba(255,255,255,0.2)'
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>

          {/* User & Transaction Details */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                👤 Transaction Details
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  User
                </Typography>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  {receipt.studentName || receipt.username}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  {receipt.userRole} - ID: {receipt.userId}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Action
                </Typography>
                <Chip 
                  label={receipt.action} 
                  color={receipt.action === 'Borrowed' ? 'primary' : 'success'}
                  sx={{ fontSize: '1rem', fontWeight: 'bold' }}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Date & Time
                </Typography>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  {new Date((receipt.timestamp || receipt.date) * 1000).toLocaleString()}
                </Typography>
              </Box>
              
              {receipt.fine && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Fine Paid
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                    ₹{receipt.fine}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Blockchain Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                ⛓️ Blockchain Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Transaction Hash
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: 'white', 
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      wordBreak: 'break-all'
                    }}>
                      {receipt.txHash || 'N/A (Local-Only)'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Block Number
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      {receipt.blockNumber ?? 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      From
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white', fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                      {receipt.from || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      To (Contract)
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white', fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                      {receipt.to || receipt.contractAddress || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Contract Address
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white', fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                      {receipt.contractAddress || receipt.to || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Network
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      {receipt.network || 'Ganache Local (Chain ID: 1337)'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Gas Used
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      {receipt.gasUsed != null ? `${Number(receipt.gasUsed).toLocaleString()} units` : 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Timestamp
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      {new Date(receipt.timestamp * 1000).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      User Role
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      {receipt.userRole}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Status
                    </Typography>
                    <Chip 
                      label={receipt.status || 'Confirmed'} 
                      sx={{ 
                        backgroundColor: getStatusColor(receipt.status || 'Confirmed'),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Book Status Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                📖 Book Status Update
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircle sx={{ color: '#4CAF50', mr: 1 }} />
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      Book {receipt.action === 'Borrowed' ? 'issued' : 'returned'} successfully
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Info sx={{ color: '#2196F3', mr: 1 }} />
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      Status updated on blockchain
                    </Typography>
                  </Box>
                </Grid>
                
                {receipt.action === 'Borrowed' && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Warning sx={{ color: '#FF9800', mr: 1 }} />
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        Due date: {new Date((receipt.date + 14 * 24 * 60 * 60) * 1000).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, background: 'rgba(255, 255, 255, 0.05)' }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
        >
          Close
        </Button>
        
        <Tooltip title="Download PDF Receipt">
          <Button 
            onClick={generatePDF}
            variant="contained"
            startIcon={<Download />}
            sx={{
              background: 'linear-gradient(45deg, #4CAF50, #45a049)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #45a049, #4CAF50)',
              }
            }}
          >
            Download PDF
          </Button>
        </Tooltip>
        
        <Tooltip title="Print Receipt">
          <Button 
            onClick={() => window.print()}
            variant="contained"
            startIcon={<Print />}
            sx={{
              background: 'linear-gradient(45deg, #2196F3, #1976D2)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2, #2196F3)',
              }
            }}
          >
            Print
          </Button>
        </Tooltip>
        
        <Tooltip title="Share Receipt">
          <Button 
            onClick={() => {
              const receiptData = {
                bookId: receipt.bookId,
                title: receipt.title,
                action: receipt.action,
                date: new Date(receipt.date * 1000).toLocaleString(),
                txHash: receipt.txHash,
                status: receipt.status
              };
              navigator.clipboard.writeText(JSON.stringify(receiptData, null, 2));
              alert('Receipt data copied to clipboard!');
            }}
            variant="contained"
            startIcon={<Share />}
            sx={{
              background: 'linear-gradient(45deg, #FF9800, #F57C00)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #F57C00, #FF9800)',
              }
            }}
          >
            Share
          </Button>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptModal; 