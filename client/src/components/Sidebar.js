import React from 'react';
import { Drawer, List, ListItem, ListItemText, Badge } from '@mui/material';

const Sidebar = ({ onNavigate, cartCount, issuedCount, selectedSection, sections, unreadNotifications }) => (
  <Drawer variant="permanent" anchor="left" sx={{ width: 220, flexShrink: 0 }}>
    <List sx={{ width: 220 }}>
      {sections.map((section) => (
        <ListItem
          button
          key={section}
          selected={selectedSection === section}
          onClick={() => onNavigate(section)}
        >
          <ListItemText primary={section} />
          {section === 'Add to Cart' && (
            <Badge color="primary" badgeContent={cartCount} />
          )}
          {section === 'Issued Books' && (
            <Badge color="secondary" badgeContent={issuedCount} />
          )}
          {section === 'Notifications' && unreadNotifications > 0 && (
            <Badge color="error" badgeContent={unreadNotifications} />
          )}
        </ListItem>
      ))}
    </List>
  </Drawer>
);

export default Sidebar; 