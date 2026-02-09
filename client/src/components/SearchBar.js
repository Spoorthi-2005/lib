import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Box, 
  InputAdornment, 
  IconButton, 
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Autocomplete,
  Popper,
} from '@mui/material';
import {
  Search,
  Clear,
  Book,
  Person,
  Category,
  TrendingUp,
} from '@mui/icons-material';

const SearchBar = ({ query, setQuery, books }) => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get unique domains for suggestions
  const domains = [...new Set(books.map(book => book.domain))];
  const authors = [...new Set(books.map(book => book.author))];

  // Search suggestions based on current query
  const getSuggestions = () => {
    if (!query) return [];
    
    const suggestions = [];
    const lowerQuery = query.toLowerCase();
    
    // Add matching titles
    books.forEach(book => {
      if (book.title.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          type: 'title',
          text: book.title,
          icon: <Book />,
          color: '#4CAF50'
        });
      }
    });
    
    // Add matching authors
    authors.forEach(author => {
      if (author.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          type: 'author',
          text: author,
          icon: <Person />,
          color: '#2196F3'
        });
      }
    });
    
    // Add matching domains
    domains.forEach(domain => {
      if (domain.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          type: 'domain',
          text: domain,
          icon: <Category />,
          color: '#FF9800'
        });
      }
    });
    
    return suggestions.slice(0, 8); // Limit to 8 suggestions
  };

  const handleSearch = (newQuery) => {
    setQuery(newQuery);
    if (newQuery && !searchHistory.includes(newQuery)) {
      setSearchHistory(prev => [newQuery, ...prev.slice(0, 4)]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSearch(suggestion.text);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
  };

  const suggestions = getSuggestions();

  return (
    <Box sx={{ mb: 3, position: 'relative' }}>
      {/* Search Statistics */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'white' }}>
          📚 Available Books ({books.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label={`${domains.length} Domains`} 
            size="small" 
            icon={<Category />}
            sx={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
          />
          <Chip 
            label={`${authors.length} Authors`} 
            size="small" 
            icon={<Person />}
            sx={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
          />
        </Box>
      </Box>

      {/* Enhanced Search Bar */}
      <TextField
        label="Search books by title, author, domain, or ISBN..."
        variant="outlined"
        fullWidth
        value={query}
        onChange={(e) => {
          handleSearch(e.target.value);
          setShowSuggestions(e.target.value.length > 0);
        }}
        onFocus={() => setShowSuggestions(query.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: 'rgba(255,255,255,0.7)' }} />
            </InputAdornment>
          ),
          endAdornment: query && (
            <InputAdornment position="end">
              <IconButton onClick={clearSearch} size="small">
                <Clear sx={{ color: 'rgba(255,255,255,0.7)' }} />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            color: 'white',
            '& .MuiOutlinedInput-root': {
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
              '&:hover': {
                border: '1px solid rgba(255, 255, 255, 0.4)',
              },
              '&.Mui-focused': {
                border: '2px solid #667eea',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255,255,255,0.7)',
              '&.Mui-focused': {
                color: '#667eea',
              },
            },
            '& .MuiInputBase-input': {
              color: 'white',
              '&::placeholder': {
                color: 'rgba(255,255,255,0.5)',
                opacity: 1,
              },
            },
          },
        }}
        placeholder="Try: 'Machine Learning', 'Andrew Ng', 'Programming'..."
      />

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 2,
            mt: 1,
            maxHeight: 300,
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <List>
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: suggestion.color }}>
                  {suggestion.icon}
                </ListItemIcon>
                <ListItemText
                  primary={suggestion.text}
                  secondary={`${suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}`}
                  primaryTypographyProps={{ fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: '0.8rem' }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Search History */}
      {!query && searchHistory.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
            Recent Searches:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {searchHistory.map((term, index) => (
              <Chip
                key={index}
                label={term}
                size="small"
                onClick={() => handleSearch(term)}
                sx={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.3)',
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Quick Filters */}
      {!query && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
            Popular Domains:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {domains.slice(0, 8).map((domain, index) => (
              <Chip
                key={index}
                label={domain}
                size="small"
                onClick={() => handleSearch(domain)}
                icon={<Category />}
                sx={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.3)',
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SearchBar; 