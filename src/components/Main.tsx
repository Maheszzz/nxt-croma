import React, { useState } from 'react';
import {
  User, Mail, Lock, Settings, BarChart3, LogOut, Menu, ChevronLeft,
} from 'lucide-react';
import PropTypes from 'prop-types';
import {
  Box, Typography, IconButton, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, AppBar, Toolbar, Container, styled,
  createTheme, ThemeProvider, CssBaseline,
} from '@mui/material';

// Styled components
const drawerWidth = 240;

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  ...(!open && {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(8),
    },
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const theme = createTheme({
  palette: {
    primary: { main: '#1a73e8' },
    background: { default: '#f5f5f5' },
  },
  typography: {
    h6: { fontWeight: 600 },
  },
});

function MainScreen({ onLogout, user = {} }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const displayName = user.name || 'Guest';
  const lastLogin = user.lastLogin
    ? new Date(user.lastLogin).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const menuItems = [
    { name: 'Profile', icon: User },
    { name: 'Messages', icon: Mail },
    { name: 'Security', icon: Lock },
    { name: 'Settings', icon: Settings },
    { name: 'Analytics', icon: BarChart3 },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* AppBar */}
        <StyledAppBar position="fixed" open={isSidebarOpen} color="transparent" elevation={0}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={toggleSidebar}
              edge="start"
              sx={{ mr: 2, display: { lg: 'none' } }}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Dashboard
            </Typography>
          </Toolbar>
        </StyledAppBar>

        {/* Drawer */}
        <StyledDrawer
          variant="temporary"
          open={isSidebarOpen}
          onClose={toggleSidebar}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          <DrawerHeader>
            <IconButton onClick={toggleSidebar}>
              <ChevronLeft />
            </IconButton>
          </DrawerHeader>
          <List>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <ListItem key={item.name} disablePadding>
                  <ListItemButton href="#" sx={{ '&:hover': { bgcolor: 'grey.100' } }}>
                    <ListItemIcon>
                      <Icon size={20} />
                    </ListItemIcon>
                    <ListItemText primary={item.name} />
                  </ListItemButton>
                </ListItem>
              );
            })}
            <ListItem disablePadding>
              <ListItemButton onClick={onLogout} sx={{ '&:hover': { bgcolor: 'error.light' } }}>
                <ListItemIcon>
                  <LogOut size={20} />
                </ListItemIcon>
                <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </StyledDrawer>

        <StyledDrawer
          variant="permanent"
          open={true}
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: 'white', boxShadow: 2 },
          }}
        >
          <DrawerHeader sx={{ justifyContent: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              MyApp
            </Typography>
          </DrawerHeader>
          <List>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <ListItem key={item.name} disablePadding>
                  <ListItemButton href="#" sx={{ '&:hover': { bgcolor: 'grey.100' } }}>
                    <ListItemIcon>
                      <Icon size={20} />
                    </ListItemIcon>
                    <ListItemText primary={item.name} />
                  </ListItemButton>
                </ListItem>
              );
            })}
            <ListItem disablePadding>
              <ListItemButton onClick={onLogout} sx={{ '&:hover': { bgcolor: 'error.light' } }}>
                <ListItemIcon>
                  <LogOut size={20} />
                </ListItemIcon>
                <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </StyledDrawer>

        {/* Content Area */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, ml: { lg: `${drawerWidth}px` } }}>
          <Toolbar />
          <Container maxWidth="lg">
            <Box sx={{ mt: 4 }}>
              <Typography variant="h4" gutterBottom>
                Welcome back, {displayName}!
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                You last logged in on {lastLogin}
              </Typography>
            </Box>

            <Box sx={{ mt: 6 }}>
              <Typography variant="body1" color="text.secondary">
                Add your dashboard content here.
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

MainScreen.propTypes = {
  onLogout: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    lastLogin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

export default MainScreen;