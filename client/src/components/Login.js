import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Link
} from '@mui/material';

const roles = [
  { label: 'STUDENT', value: 'Student' },
  { label: 'FACULTY', value: 'Faculty' },
  { label: 'LIBRARIAN', value: 'Librarian' },
];

const Login = () => {
  const { login, connectWallet, walletAddress } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('Student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== role) {
        setError(`Please login with the correct role. Account is registered as ${user.role}.`);
        setLoading(false);
        return;
      }
      if (user.role === 'Librarian') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <Box sx={{
      p: 4,
      maxWidth: 400,
      mx: 'auto',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      mt: 8
    }}>
      <Typography variant="h4" mb={3} sx={{
        textAlign: 'center',
        color: 'white',
        fontWeight: 700,
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
      }}>
        🔐 Login
      </Typography>

      <ToggleButtonGroup
        value={role}
        exclusive
        onChange={(_, val) => val && setRole(val)}
        sx={{
          mb: 3,
          '& .MuiToggleButton-root': {
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            '&.Mui-selected': {
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              fontWeight: 600
            }
          }
        }}
        fullWidth
      >
        {roles.map((roleOption) => (
          <ToggleButton value={roleOption.value} key={roleOption.value}>
            {roleOption.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Button
        variant="outlined"
        fullWidth
        onClick={connectWallet}
        sx={{ mb: 3, color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
      >
        {walletAddress ? `Wallet: ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : "🔌 Connect MetaMask"}
      </Button>

      <form onSubmit={handleSubmit}>
        <TextField
          label="College Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth
          required
          sx={{ mb: 3 }}
          InputLabelProps={{ style: { color: 'white' } }}
          InputProps={{ style: { color: 'white' } }}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          fullWidth
          required
          sx={{ mb: 3 }}
          InputLabelProps={{ style: { color: 'white' } }}
          InputProps={{ style: { color: 'white' } }}
        />
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            padding: '12px',
            borderRadius: '25px',
            fontWeight: 600,
          }}
        >
          {loading ? 'Logging in...' : 'LOGIN'}
        </Button>
      </form>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Link component={RouterLink} to="/register" sx={{ color: 'white' }}>
          Don't have an account? Register here
        </Link>
      </Box>
    </Box>
  );
};

export default Login;