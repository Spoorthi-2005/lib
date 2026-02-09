import React from 'react';
import { List, ListItem, ListItemText, Button, Typography, Box } from '@mui/material';

const getReceiptTs = (r) => r.timestamp || r.issueDate || r.returnDate || r.date;
const getBookTitle = (r) => r.bookName || r.title || 'N/A';

const History = ({ receipts, onDownload, onView }) => (
  <Box>
    <Typography variant="h5" mb={2}>Digital Receipts History</Typography>
    <List>
      {receipts.length === 0 && <Typography>No receipts yet.</Typography>}
      {receipts.map((r, idx) => {
        const ts = getReceiptTs(r);
        return (
          <ListItem key={idx}>
            <ListItemText
              primary={`${r.action || 'Receipt'} - ${getBookTitle(r)}`}
              secondary={`Book ID: ${r.bookId ?? 'N/A'} | Date: ${ts ? new Date(ts * 1000).toLocaleString() : 'N/A'}${r.fine ? ' | Fine: ₹' + r.fine : ''}`}
            />
            {onView && (
              <Button onClick={() => onView(r)} variant="contained" sx={{ mr: 1 }}>
                View
              </Button>
            )}
            <Button onClick={() => onDownload(r)} variant="outlined">Download PDF</Button>
          </ListItem>
        );
      })}
    </List>
  </Box>
);

export default History;