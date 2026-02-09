import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Chip,
  Button,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Warning,
  Inventory,
  NotificationsActive,
  Clear,
  CheckCircle,
  BookmarkBorder,
  TrendingDown,
  Refresh,
} from '@mui/icons-material';

const LibrarianNotifications = ({ books, user }) => {
  const [notifications, setNotifications] = useState([]);
  const [dismissedNotifications, setDismissedNotifications] = useState([]);

  useEffect(() => {
    if (user?.role !== '3') return; // Only for librarians

    const checkBookAvailability = () => {
      const lowStockBooks = books.filter(book => book.available <= 0);
      const criticalStockBooks = books.filter(book => book.available > 0 && book.available <= 2);
      
      const newNotifications = [];

      // Critical notifications for out-of-stock books
      lowStockBooks.forEach(book => {
        const notificationId = `out-of-stock-${book.id}`;
        if (!dismissedNotifications.includes(notificationId)) {
          newNotifications.push({
            id: notificationId,
            type: 'critical',
            title: 'Book Out of Stock',
            message: `"${book.title}" is completely out of stock (0 available)`,
            book: book,
            timestamp: Date.now(),
            icon: <Warning sx={{ color: '#f44336' }} />,
            action: 'Add More Copies'
          });
        }
      });

      // Warning notifications for low stock books
      criticalStockBooks.forEach(book => {
        const notificationId = `low-stock-${book.id}`;
        if (!dismissedNotifications.includes(notificationId)) {
          newNotifications.push({
            id: notificationId,
            type: 'warning',
            title: 'Low Stock Alert',
            message: `"${book.title}" has only ${book.available} copies remaining`,
            book: book,
            timestamp: Date.now(),
            icon: <TrendingDown sx={{ color: '#ff9800' }} />,
            action: 'Consider Restocking'
          });
        }
      });

      setNotifications(newNotifications);
    };

    checkBookAvailability();
    const interval = setInterval(checkBookAvailability, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [books, user, dismissedNotifications]);

  const dismissNotification = (notificationId) => {
    setDismissedNotifications(prev => [...prev, notificationId]);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    const allIds = notifications.map(n => n.id);
    setDismissedNotifications(prev => [...prev, ...allIds]);
    setNotifications([]);
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'critical': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#4caf50';
    }
  };

  const getNotificationBg = (type) => {
    switch (type) {
      case 'critical': return 'rgba(244, 67, 54, 0.1)';
      case 'warning': return 'rgba(255, 152, 0, 0.1)';
      case 'info': return 'rgba(33, 150, 243, 0.1)';
      default: return 'rgba(76, 175, 80, 0.1)';
    }
  };

  if (user?.role !== '3') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info">
          Librarian notifications are only available for librarian accounts.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#667eea', width: 48, height: 48 }}>
            <NotificationsActive />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
              📢 Librarian Notifications
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Real-time alerts for library management
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Badge badgeContent={notifications.length} color="error">
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': { borderColor: 'white' }
              }}
            >
              Refresh
            </Button>
          </Badge>
          {notifications.length > 0 && (
            <Button
              variant="contained"
              startIcon={<Clear />}
              onClick={clearAllNotifications}
              sx={{ 
                bgcolor: 'rgba(244, 67, 54, 0.8)',
                '&:hover': { bgcolor: 'rgba(244, 67, 54, 1)' }
              }}
            >
              Clear All
            </Button>
          )}
        </Box>
      </Box>

      {notifications.length === 0 ? (
        <Paper sx={{ 
          p: 4, 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <CheckCircle sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
            All Good! 🎉
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            No urgent notifications at the moment. All books are adequately stocked.
          </Typography>
        </Paper>
      ) : (
        <List sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              sx={{
                background: getNotificationBg(notification.type),
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: `1px solid ${getNotificationColor(notification.type)}`,
                boxShadow: `0 8px 32px 0 ${getNotificationColor(notification.type)}20`,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
                    <Box sx={{ mt: 0.5 }}>
                      {notification.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.type.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: getNotificationColor(notification.type),
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                      <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
                        {notification.message}
                      </Typography>
                      {notification.book && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2, 
                          p: 2, 
                          bgcolor: 'rgba(255,255,255,0.1)', 
                          borderRadius: '12px',
                          mb: 2
                        }}>
                          <BookmarkBorder sx={{ color: 'rgba(255,255,255,0.7)' }} />
                          <Box>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                              {notification.book.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              Available: {notification.book.available} | Total: {notification.book.total || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {new Date(notification.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Tooltip title="Dismiss notification">
                    <IconButton
                      onClick={() => dismissNotification(notification.id)}
                      sx={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                      <Clear />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>
      )}
    </Box>
  );
};

export default LibrarianNotifications;
