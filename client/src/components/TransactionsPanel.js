import React from 'react';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Card, CardContent, Box } from '@mui/material';

const TransactionsPanel = ({ transactions }) => (
  <Box>
    <Typography variant="h5" mb={2}>All Transactions</Typography>
    <List>
      {transactions.length === 0 && <Typography>No transactions yet.</Typography>}
      {transactions.map((t, idx) => (
        <Card key={idx} sx={{ mb: 2 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={t.image} variant="rounded" sx={{ width: 60, height: 80, mr: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">{t.title}</Typography>
              <Typography variant="body2">Book ID: {t.bookId} | User: {t.user}</Typography>
              <Typography variant="body2">Action: {t.action} | Date: {new Date(t.date * 1000).toLocaleString()}</Typography>
              {t.fine ? <Typography variant="body2" color="error">Fine: ₹{t.fine}</Typography> : null}
            </Box>
          </CardContent>
        </Card>
      ))}
    </List>
  </Box>
);

export default TransactionsPanel; 