import React from 'react';
import { Button, Card, CardMedia, CardContent, Typography, Box, Chip } from '@mui/material';

const BookCard = ({ book, onAddToCart, onIssue, issued }) => (
  <Card sx={{ 
    maxWidth: 280,
    minHeight: 400,
    m: 1,
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    transition: 'all 0.3s ease',
    transform: 'translateY(0px)',
    '&:hover': {
      transform: 'translateY(-10px) scale(1.02)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.4)'
    }
  }}>
    <CardMedia 
      component="img" 
      height="200" 
      image={book.image} 
      alt={book.title}
      sx={{
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        objectFit: 'cover'
      }}
    />
    <CardContent sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ 
        fontSize: 18, 
        fontWeight: 600,
        color: 'white',
        mb: 1,
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
      }}>
        {book.title}
      </Typography>
      
      <Typography variant="body2" sx={{ 
        color: 'rgba(255, 255, 255, 0.8)',
        mb: 0.5
      }}>
        <strong>Author:</strong> {book.author}
      </Typography>
      
      <Typography variant="body2" sx={{ 
        color: 'rgba(255, 255, 255, 0.8)',
        mb: 0.5
      }}>
        <strong>Year:</strong> {book.publicationYear}
      </Typography>
      
      <Typography variant="body2" sx={{ 
        color: 'rgba(255, 255, 255, 0.8)',
        mb: 0.5
      }}>
        <strong>Domain:</strong> {book.domain}
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Chip 
          label={`Available: ${book.availableCopies}/${book.totalCopies}`}
          sx={{
            background: book.availableCopies > 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
            color: book.availableCopies > 0 ? '#4CAF50' : '#f44336',
            fontWeight: 600,
            border: `1px solid ${book.availableCopies > 0 ? '#4CAF50' : '#f44336'}`
          }}
        />
        <Typography variant="body2" sx={{ 
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.8rem'
        }}>
          ID: {book.id}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button 
          onClick={() => onAddToCart(book)} 
          disabled={issued}
          sx={{ 
            flex: 1,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            borderRadius: '15px',
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8, #6a4190)',
              transform: 'translateY(-2px)',
              boxShadow: '0 5px 15px rgba(102, 126, 234, 0.4)'
            },
            '&:disabled': {
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.3)'
            }
          }}
          size="small"
        >
          {issued ? 'In Cart' : '🛒 Add to Cart'}
        </Button>
        
        <Button 
          onClick={() => onIssue(book)} 
          disabled={issued || book.availableCopies === 0}
          sx={{ 
            flex: 1,
            background: 'linear-gradient(135deg, #f093fb, #f5576c)',
            color: 'white',
            borderRadius: '15px',
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            '&:hover': {
              background: 'linear-gradient(135deg, #e085e7, #e04a5c)',
              transform: 'translateY(-2px)',
              boxShadow: '0 5px 15px rgba(240, 147, 251, 0.4)'
            },
            '&:disabled': {
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.3)'
            }
          }}
          size="small"
        >
          {book.availableCopies === 0 ? 'Out of Stock' : '📖 Issue'}
        </Button>
      </Box>
    </CardContent>
  </Card>
);

export default BookCard; 