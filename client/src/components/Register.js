import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Button, TextField, Typography, ToggleButton, ToggleButtonGroup, Box, Alert, Link } from '@mui/material';

const roles = [
  { label: 'STUDENT', value: 'Student' },
  { label: 'FACULTY', value: 'Faculty' },
];

const Register = () => {
  const { register, connectWallet, walletAddress } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('Student');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [gradDate, setGradDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Additional fields state
  const [studentId, setStudentId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [libraryId, setLibraryId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        name: username,
        email,
        password,
        role,
        whatsapp_number: whatsappNumber,
        student_id: role === 'Student' ? studentId : null,
        faculty_id: role === 'Faculty' ? facultyId : null,
        library_id: role === 'Librarian' ? libraryId : null,
        grad_or_leave_date: gradDate
      });
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <Box sx={{
      p: 4,
      maxWidth: 450,
      mx: 'auto',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      mt: 4
    }}>
      <Typography variant="h4" mb={3} sx={{
        textAlign: 'center',
        color: 'white',
        fontWeight: 700,
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
      }}>
        📝 Register
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
          label="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          fullWidth
          required
          sx={{ mb: 3 }}
          InputLabelProps={{ style: { color: 'white' } }}
          InputProps={{ style: { color: 'white' } }}
        />
        <TextField
          label="Email"
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
        <TextField
          label="WhatsApp Number (e.g. +919999999999)"
          value={whatsappNumber}
          onChange={e => setWhatsappNumber(e.target.value)}
          fullWidth
          required
          sx={{ mb: 3 }}
          InputLabelProps={{ style: { color: 'white' } }}
          InputProps={{ style: { color: 'white' } }}
        />

        <TextField
          label="Graduation / Leave Date"
          type="date"
          value={gradDate}
          onChange={e => setGradDate(e.target.value)}
          fullWidth
          required={role === 'Student'}
          sx={{ mb: 3 }}
          InputLabelProps={{ shrink: true, style: { color: 'white' } }}
          InputProps={{ style: { color: 'white' } }}
        />

        {role === 'Student' && (
          <TextField
            label="Student ID / Roll Number"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            fullWidth
            required
            sx={{ mb: 3 }}
            InputLabelProps={{ style: { color: 'white' } }}
            InputProps={{ style: { color: 'white' } }}
          />
        )}
        {role === 'Faculty' && (
          <TextField
            label="Faculty ID"
            value={facultyId}
            onChange={e => setFacultyId(e.target.value)}
            fullWidth
            required
            sx={{ mb: 3 }}
            InputLabelProps={{ style: { color: 'white' } }}
            InputProps={{ style: { color: 'white' } }}
          />
        )}

        {role === 'Librarian' && (
          <TextField
            label="Library ID"
            value={libraryId}
            onChange={e => setLibraryId(e.target.value)}
            fullWidth
            required
            sx={{ mb: 3 }}
            InputLabelProps={{ style: { color: 'white' } }}
            InputProps={{ style: { color: 'white' } }}
          />
        )}

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
          {loading ? 'Registering...' : 'REGISTER'}
        </Button>
      </form>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Link component={RouterLink} to="/login" sx={{ color: 'white' }}>
          Already have an account? Login here
        </Link>
      </Box>
    </Box>
  );
};

export default Register;