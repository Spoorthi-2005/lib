import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Avatar,
  Grid,
  Paper,
} from '@mui/material';
import {
  Payment,
  CreditCard,
  AccountBalance,
  Wallet,
  Receipt,
  Warning,
  CheckCircle,
  Close,
} from '@mui/icons-material';

const FinePaymentModal = ({ open, onClose, fineData, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const paymentMethods = [
    { value: 'card', label: 'Credit/Debit Card', icon: <CreditCard /> },
    { value: 'upi', label: 'UPI Payment', icon: <Wallet /> },
    { value: 'netbanking', label: 'Net Banking', icon: <AccountBalance /> },
  ];

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock payment success
    const paymentResult = {
      transactionId: `TXN${Date.now()}`,
      amount: fineData?.fine || 0,
      method: paymentMethod,
      timestamp: new Date().toISOString(),
      status: 'success'
    };
    
    setPaymentSuccess(true);
    setProcessing(false);
    
    // Wait a moment to show success, then complete
    setTimeout(() => {
      onPaymentComplete(paymentResult);
      handleClose();
    }, 1500);
  };

  const handleClose = () => {
    setPaymentMethod('card');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setUpiId('');
    setProcessing(false);
    setPaymentSuccess(false);
    onClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (!fineData) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        }
      }}
    >
      <DialogTitle sx={{ 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        pb: 1
      }}>
        <Avatar sx={{ bgcolor: '#f44336' }}>
          <Payment />
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            💳 Fine Payment Required
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Complete payment to process book return
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {paymentSuccess ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
            <Typography variant="h5" sx={{ color: 'white', mb: 1 }}>
              Payment Successful! 🎉
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Your fine has been paid. Processing book return...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Fine Details */}
            <Card sx={{
              background: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              borderRadius: '16px',
              mb: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Warning sx={{ color: '#f44336' }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    Fine Details
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Book Title
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                      {fineData.bookName || fineData.title}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Days Overdue
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                      {fineData.daysLate || 0} days
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Fine Rate
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                      ₹10 per day
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Total Fine Amount
                    </Typography>
                    <Typography variant="h5" sx={{ color: '#f44336', fontWeight: 700 }}>
                      {formatCurrency(fineData.fine || 0)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
              Select Payment Method
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {paymentMethods.map((method) => (
                <Grid item xs={12} md={4} key={method.value}>
                  <Paper
                    onClick={() => setPaymentMethod(method.value)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      background: paymentMethod === method.value 
                        ? 'linear-gradient(135deg, #667eea, #764ba2)'
                        : 'rgba(255, 255, 255, 0.1)',
                      border: paymentMethod === method.value 
                        ? '2px solid #667eea'
                        : '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: paymentMethod === method.value 
                          ? 'linear-gradient(135deg, #5a67d8, #6b46c1)'
                          : 'rgba(255, 255, 255, 0.2)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {method.icon}
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                        {method.label}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Payment Form */}
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <CardContent>
                {paymentMethod === 'card' && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Card Number"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                            '&.Mui-focused fieldset': { borderColor: '#667eea' },
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.8)' },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Expiry Date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        placeholder="MM/YY"
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                            '&.Mui-focused fieldset': { borderColor: '#667eea' },
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.8)' },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="CVV"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                            '&.Mui-focused fieldset': { borderColor: '#667eea' },
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.8)' },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
                        }}
                      />
                    </Grid>
                  </Grid>
                )}

                {paymentMethod === 'upi' && (
                  <TextField
                    label="UPI ID"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@paytm"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                        '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                        '&.Mui-focused fieldset': { borderColor: '#667eea' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.8)' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
                    }}
                  />
                )}

                {paymentMethod === 'netbanking' && (
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Select Bank
                    </InputLabel>
                    <Select
                      value=""
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                        '& .MuiSvgIcon-root': { color: 'rgba(255, 255, 255, 0.7)' },
                      }}
                    >
                      <MenuItem value="sbi">State Bank of India</MenuItem>
                      <MenuItem value="hdfc">HDFC Bank</MenuItem>
                      <MenuItem value="icici">ICICI Bank</MenuItem>
                      <MenuItem value="axis">Axis Bank</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </CardContent>
            </Card>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                🔒 Your payment is secure and encrypted. The book return will be processed immediately after successful payment.
              </Typography>
            </Alert>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          startIcon={<Close />}
          disabled={processing}
          sx={{
            color: 'rgba(255,255,255,0.8)',
            borderColor: 'rgba(255,255,255,0.3)',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.5)',
              bgcolor: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          Cancel
        </Button>
        {!paymentSuccess && (
          <Button
            onClick={handlePayment}
            variant="contained"
            startIcon={<Payment />}
            disabled={processing}
            sx={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8, #6b46c1)',
              },
              minWidth: '140px'
            }}
          >
            {processing ? 'Processing...' : `Pay ${formatCurrency(fineData.fine || 0)}`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FinePaymentModal;
