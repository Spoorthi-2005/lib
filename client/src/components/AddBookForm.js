import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Avatar,
  Paper,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Book,
  Person,
  Category,
  Image,
  Save,
  Clear,
  AutoStories,
  Numbers,
  CalendarToday,
} from '@mui/icons-material';

const AddBookForm = ({ onAddBook, user }) => {
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    category: '',
    isbn: '',
    publishYear: '',
    description: '',
    imageUrl: '',
    total: 1,
    available: 1,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const categories = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Engineering',
    'Literature',
    'History',
    'Philosophy',
    'Psychology',
    'Economics',
    'Business',
    'Art',
    'Music',
    'Other'
  ];

  const handleInputChange = (field, value) => {
    setBookData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!bookData.title || !bookData.author || !bookData.category) {
        setError('Please fill in all required fields (Title, Author, Category)');
        setLoading(false);
        return;
      }

      // Generate unique ID
      const newBook = {
        ...bookData,
        id: Date.now(),
        dateAdded: new Date().toISOString(),
        addedBy: user?.username || 'Librarian',
        total: parseInt(bookData.total) || 1,
        available: parseInt(bookData.available) || parseInt(bookData.total) || 1,
        publishYear: parseInt(bookData.publishYear) || new Date().getFullYear(),
      };

      // Add book via parent component
      await onAddBook(newBook);
      
      setSuccess(`Successfully added "${bookData.title}" to the library!`);
      
      // Reset form
      setBookData({
        title: '',
        author: '',
        category: '',
        isbn: '',
        publishYear: '',
        description: '',
        imageUrl: '',
        total: 1,
        available: 1,
      });

    } catch (err) {
      setError('Failed to add book. Please try again.');
      console.error('Error adding book:', err);
    }

    setLoading(false);
  };

  const handleClear = () => {
    setBookData({
      title: '',
      author: '',
      category: '',
      isbn: '',
      publishYear: '',
      description: '',
      imageUrl: '',
      total: 1,
      available: 1,
    });
    setError('');
    setSuccess('');
  };

  if (user?.role !== '3') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info">
          Book management is only available for librarian accounts.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar sx={{ bgcolor: '#667eea', width: 48, height: 48 }}>
          <Add />
        </Avatar>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
            📚 Add New Book
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Expand the library collection
          </Typography>
        </Box>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoStories /> Basic Information
                </Typography>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Book Title *"
                  value={bookData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <Book sx={{ color: 'rgba(255,255,255,0.7)', mr: 1 }} />
                  }}
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

              <Grid item xs={12} md={6}>
                <TextField
                  label="Author *"
                  value={bookData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <Person sx={{ color: 'rgba(255,255,255,0.7)', mr: 1 }} />
                  }}
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

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.8)', '&.Mui-focused': { color: '#667eea' } }}>
                    Category *
                  </InputLabel>
                  <Select
                    value={bookData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    startAdornment={<Category sx={{ color: 'rgba(255,255,255,0.7)', mr: 1 }} />}
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                      '& .MuiSvgIcon-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    }}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Publication Year"
                  type="number"
                  value={bookData.publishYear}
                  onChange={(e) => handleInputChange('publishYear', e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: <CalendarToday sx={{ color: 'rgba(255,255,255,0.7)', mr: 1 }} />
                  }}
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

              {/* Additional Details */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Numbers /> Additional Details
                </Typography>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="ISBN"
                  value={bookData.isbn}
                  onChange={(e) => handleInputChange('isbn', e.target.value)}
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

              <Grid item xs={12} md={6}>
                <TextField
                  label="Image URL"
                  value={bookData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: <Image sx={{ color: 'rgba(255,255,255,0.7)', mr: 1 }} />
                  }}
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

              <Grid item xs={12} md={6}>
                <TextField
                  label="Total Copies"
                  type="number"
                  value={bookData.total}
                  onChange={(e) => {
                    const total = parseInt(e.target.value) || 1;
                    handleInputChange('total', total);
                    handleInputChange('available', total); // Set available = total initially
                  }}
                  fullWidth
                  inputProps={{ min: 1 }}
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

              <Grid item xs={12} md={6}>
                <TextField
                  label="Available Copies"
                  type="number"
                  value={bookData.available}
                  onChange={(e) => handleInputChange('available', parseInt(e.target.value) || 1)}
                  fullWidth
                  inputProps={{ min: 0, max: bookData.total }}
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

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={bookData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
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

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={handleClear}
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      borderColor: 'rgba(255,255,255,0.3)',
                      '&:hover': {
                        borderColor: 'rgba(255,255,255,0.5)',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Clear Form
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8, #6b46c1)',
                      }
                    }}
                  >
                    {loading ? 'Adding Book...' : 'Add Book'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddBookForm;
