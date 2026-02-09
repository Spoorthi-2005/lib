import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import BookCard from './BookCard';
import { getBooks } from '../api';

import { useNavigate } from 'react-router-dom';

const BookList = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sortBy, setSortBy] = useState('title');
  const [filterDomain, setFilterDomain] = useState('all');

  // Cart state managed locally or in context? 
  // For now simple local state passed to BookCard won't work across navigations.
  // Ideally CartContext. But for this refactor, I'll use localStorage or just a simple state if only adding.
  // The original App.js had Cart state.
  // I should probably Implement a CartContext too, or just use localStorage for cart.
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (book) => {
    if (!cart.some(b => b.id === book.id)) {
      setCart([...cart, book]);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const data = await getBooks();
      // Map API data to expected format if needed
      const mapped = data.map(b => ({
        ...b,
        availableCopies: b.available_copies,
        totalCopies: b.total_copies,
        publicationYear: 2024, // Mock if missing
        domain: b.category,
        image: b.image_url || 'https://via.placeholder.com/150'
      }));
      setBooks(mapped);
    } catch (err) {
      setError('Failed to load books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique domains
  const domains = ['all', ...new Set(books.map(book => book.domain))];

  // Filter and sort
  const getFilteredAndSortedBooks = () => {
    let filtered = books;
    if (filterDomain !== 'all') {
      filtered = filtered.filter(book => book.domain === filterDomain);
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title': return a.title.localeCompare(b.title);
        case 'author': return a.author.localeCompare(b.author);
        case 'domain': return a.domain.localeCompare(b.domain);
        case 'available': return b.availableCopies - a.availableCopies;
        default: return 0;
      }
    });
    return filtered;
  };

  const filteredBooks = getFilteredAndSortedBooks();

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
    }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', mb: 2, textAlign: 'center', fontWeight: 700 }}>
          📚 Library Catalog ({filteredBooks.length} books)
        </Typography>

        {/* Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Sort By</InputLabel>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} sx={{ color: 'white' }}>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="author">Author</MenuItem>
                <MenuItem value="domain">Domain</MenuItem>
                <MenuItem value="available">Availability</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Filter Domain</InputLabel>
              <Select value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)} sx={{ color: 'white' }}>
                {domains.map((d) => <MenuItem key={d} value={d}>{d === 'all' ? 'All Domains' : d}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {filteredBooks.map((book) => (
          <Grid item key={book.id} xs={12} sm={6} md={4} lg={3}>
            <BookCard
              book={book}
              onAddToCart={addToCart}
              onIssue={(book) => {
                addToCart(book);
                navigate('/cart');
              }}
              issued={false}
              cart={cart.some(c => c.id === book.id)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BookList;