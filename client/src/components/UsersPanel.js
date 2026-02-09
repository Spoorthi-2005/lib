import React from 'react';
import { List, ListItem, ListItemText, Typography, Chip, Box } from '@mui/material';

const roleLabels = {
  '1': 'Student',
  '2': 'Faculty',
  '3': 'Librarian',
};

const UsersPanel = ({ users }) => (
  <Box>
    <Typography variant="h5" mb={2}>All Users</Typography>
    <List>
      {users.length === 0 && <Typography>No users found.</Typography>}
      {users.map((u, idx) => (
        <ListItem key={idx}>
          <ListItemText
            primary={`${u.username} (${roleLabels[u.role] || u.role})`}
            secondary={`Email: ${u.email} | Graduation/Leave: ${new Date(u.gradOrLeaveDate * 1000).toLocaleDateString()} | Active: ${u.isActive ? 'Yes' : 'No'}`}
          />
          <Chip label={roleLabels[u.role] || u.role} color={u.role === '3' ? 'primary' : 'default'} />
        </ListItem>
      ))}
    </List>
  </Box>
);

export default UsersPanel; 