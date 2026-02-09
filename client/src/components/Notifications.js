import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, IconButton } from '@mui/material';
import { Notifications as NotificationsIcon, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markRead } from '../api';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await getNotifications(user.id);
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  }, [user.id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await markRead(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '2rem',
      maxWidth: 600,
      mx: 'auto',
      color: 'white'
    }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        🔔 Notifications
      </Typography>

      <List>
        {notifications.length === 0 && <Typography align="center" variant="body2" sx={{ opacity: 0.6 }}>No new notifications</Typography>}

        {notifications.map((notif) => (
          <ListItem
            key={notif.id}
            sx={{
              background: notif.is_read ? 'rgba(0,0,0,0.1)' : 'rgba(100, 255, 218, 0.1)',
              mb: 1,
              borderRadius: 1,
              borderLeft: notif.is_read ? 'none' : '4px solid #64ffda'
            }}
            secondaryAction={
              !notif.is_read && (
                <IconButton onClick={() => handleMarkRead(notif.id)} edge="end" title="Mark as Read">
                  <CheckCircle sx={{ color: '#64ffda' }} />
                </IconButton>
              )
            }
          >
            <ListItemIcon>
              <NotificationsIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText
              primary={notif.message}
              secondary={new Date(notif.created_at).toLocaleString()}
              primaryTypographyProps={{ fontWeight: notif.is_read ? 400 : 700 }}
              secondaryTypographyProps={{ color: 'rgba(255,255,255,0.6)' }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Notifications;