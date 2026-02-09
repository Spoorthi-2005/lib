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
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  Schedule,
  Warning,
  NotificationsActive,
  Clear,
  CheckCircle,
  BookmarkBorder,
  AccessTime,
  Person,
  School,
  Refresh,
  Email,
  Sms,
  Notifications,
} from '@mui/icons-material';

const AdvancedNotificationSystem = ({ user, issued, onMarkRead, onClearAll }) => {
  const [notifications, setNotifications] = useState([]);
  const [lastCheck, setLastCheck] = useState(Date.now());

  // Role-based due date periods
  const getDuePeriod = (userRole) => {
    switch (userRole) {
      case '1': // Student
        return 14; // 14 days
      case '2': // Faculty
        return 30; // 30 days
      case '3': // Librarian
        return 30; // 30 days
      default:
        return 14;
    }
  };

  // Get notification day based on role
  const getNotificationDay = (userRole) => {
    switch (userRole) {
      case '1': // Student - notify on 13th day (1 day before due)
        return 13;
      case '2': // Faculty - notify on 29th day (1 day before due)
        return 29;
      case '3': // Librarian
        return 29;
      default:
        return 13;
    }
  };

  useEffect(() => {
    if (!user || !issued || issued.length === 0) {
      setNotifications([]);
      return;
    }

    const checkNotifications = () => {
      const now = Math.floor(Date.now() / 1000);
      const duePeriod = getDuePeriod(user.role);
      const notificationDay = getNotificationDay(user.role);
      const newNotifications = [];

      issued.forEach((issue) => {
        if (issue.returned) return; // Skip returned books

        const issueDate = issue.issueDate;
        const dueDate = issue.dueDate;
        const daysSinceIssue = Math.floor((now - issueDate) / (24 * 60 * 60));
        const daysUntilDue = Math.floor((dueDate - now) / (24 * 60 * 60));
        const hoursUntilDue = Math.floor((dueDate - now) / (60 * 60));

        // Due date reminder (role-based)
        if (daysSinceIssue >= notificationDay && daysUntilDue >= 0 && daysUntilDue <= 1) {
          newNotifications.push({
            id: `due-reminder-${issue.transactionId}`,
            type: 'due-reminder',
            priority: 'high',
            title: '📅 Book Due Tomorrow!',
            message: `"${issue.bookName || issue.title}" is due tomorrow. Please return to avoid fines.`,
            book: issue,
            timestamp: now,
            daysUntilDue,
            hoursUntilDue,
            icon: <Schedule sx={{ color: '#ff9800' }} />,
            action: 'Return Book',
            category: 'Due Date'
          });
        }

        // Overdue notifications
        if (daysUntilDue < 0) {
          const daysOverdue = Math.abs(daysUntilDue);
          const fine = daysOverdue * 10; // ₹10 per day

          newNotifications.push({
            id: `overdue-${issue.transactionId}`,
            type: 'overdue',
            priority: 'critical',
            title: '⚠️ Book Overdue!',
            message: `"${issue.bookName || issue.title}" is ${daysOverdue} day(s) overdue. Fine: ₹${fine}`,
            book: issue,
            timestamp: now,
            daysOverdue,
            fine,
            icon: <Warning sx={{ color: '#f44336' }} />,
            action: 'Pay Fine & Return',
            category: 'Overdue'
          });
        }

        // Early warning (3 days before due date reminder)
        if (daysUntilDue <= 3 && daysUntilDue > 1 && daysSinceIssue < notificationDay) {
          newNotifications.push({
            id: `early-warning-${issue.transactionId}`,
            type: 'early-warning',
            priority: 'medium',
            title: '🔔 Due Date Approaching',
            message: `"${issue.bookName || issue.title}" is due in ${daysUntilDue} days.`,
            book: issue,
            timestamp: now,
            daysUntilDue,
            icon: <AccessTime sx={{ color: '#2196f3' }} />,
            action: 'View Details',
            category: 'Reminder'
          });
        }
      });

      // Sort by priority and timestamp
      const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      newNotifications.sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.timestamp - a.timestamp;
      });

      setNotifications(newNotifications);
      setLastCheck(Date.now());
    };

    // Check immediately
    checkNotifications();

    // Check every minute for real-time updates
    const interval = setInterval(checkNotifications, 60000);

    return () => clearInterval(interval);
  }, [user, issued]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const getPriorityBg = (priority) => {
    switch (priority) {
      case 'critical': return 'rgba(244, 67, 54, 0.1)';
      case 'high': return 'rgba(255, 152, 0, 0.1)';
      case 'medium': return 'rgba(33, 150, 243, 0.1)';
      case 'low': return 'rgba(76, 175, 80, 0.1)';
      default: return 'rgba(117, 117, 117, 0.1)';
    }
  };

  const formatTimeRemaining = (notification) => {
    if (notification.type === 'overdue') {
      return `${notification.daysOverdue} day(s) overdue`;
    } else if (notification.daysUntilDue !== undefined) {
      if (notification.daysUntilDue === 0) {
        return `Due today (${notification.hoursUntilDue}h remaining)`;
      } else if (notification.daysUntilDue === 1) {
        return 'Due tomorrow';
      } else {
        return `Due in ${notification.daysUntilDue} days`;
      }
    }
    return '';
  };

  const getRoleBasedMessage = () => {
    const duePeriod = getDuePeriod(user?.role);
    const notificationDay = getNotificationDay(user?.role);
    const userType = user?.role === '1' ? 'Student' : user?.role === '2' ? 'Faculty' : 'Librarian';
    
    return `As a ${userType}, you get ${duePeriod} days to return books. Reminders are sent on day ${notificationDay}.`;
  };

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info">
          Please login to view notifications.
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
              🔔 Smart Notifications
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Role-based deadline reminders and alerts
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Badge badgeContent={notifications.length} color="error">
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => setLastCheck(Date.now())}
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
              onClick={onClearAll}
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

      {/* Role-based Info */}
      <Alert severity="info" sx={{ mb: 3, bgcolor: 'rgba(33, 150, 243, 0.1)', border: '1px solid rgba(33, 150, 243, 0.3)' }}>
        <Typography variant="body2" sx={{ color: 'white' }}>
          {getRoleBasedMessage()}
        </Typography>
      </Alert>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ 
            p: 2, 
            textAlign: 'center',
            background: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
          }}>
            <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 700 }}>
              {notifications.filter(n => n.priority === 'critical').length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'white' }}>Critical</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ 
            p: 2, 
            textAlign: 'center',
            background: 'rgba(255, 152, 0, 0.1)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
          }}>
            <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 700 }}>
              {notifications.filter(n => n.priority === 'high').length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'white' }}>High Priority</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ 
            p: 2, 
            textAlign: 'center',
            background: 'rgba(33, 150, 243, 0.1)',
            border: '1px solid rgba(33, 150, 243, 0.3)',
          }}>
            <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 700 }}>
              {notifications.filter(n => n.priority === 'medium').length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'white' }}>Medium</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ 
            p: 2, 
            textAlign: 'center',
            background: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
          }}>
            <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 700 }}>
              {issued.filter(i => !i.returned).length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'white' }}>Active Issues</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Notifications List */}
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
            All Caught Up! 🎉
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            No urgent notifications at the moment. All your books are on track!
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 2 }}>
            Last checked: {new Date(lastCheck).toLocaleTimeString()}
          </Typography>
        </Paper>
      ) : (
        <List sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              sx={{
                background: getPriorityBg(notification.priority),
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: `1px solid ${getPriorityColor(notification.priority)}`,
                boxShadow: `0 8px 32px 0 ${getPriorityColor(notification.priority)}20`,
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
                          label={notification.priority.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: getPriorityColor(notification.priority),
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        />
                        <Chip
                          label={notification.category}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: getPriorityColor(notification.priority),
                            color: 'white',
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                      <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
                        {notification.message}
                      </Typography>
                      
                      {/* Book Details */}
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
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                              {notification.book.bookName || notification.book.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              Issued: {new Date(notification.book.issueDate * 1000).toLocaleDateString()} | 
                              Due: {new Date(notification.book.dueDate * 1000).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ color: getPriorityColor(notification.priority), fontWeight: 600 }}>
                              {formatTimeRemaining(notification)}
                            </Typography>
                            {notification.fine && (
                              <Typography variant="caption" sx={{ color: '#f44336' }}>
                                Fine: ₹{notification.fine}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      )}
                      
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {new Date(notification.timestamp * 1000).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Mark as read">
                      <IconButton
                        onClick={() => onMarkRead && onMarkRead(notification.id)}
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        <CheckCircle />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Dismiss">
                      <IconButton
                        onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        <Clear />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>
      )}
    </Box>
  );
};

export default AdvancedNotificationSystem;
