"use client";

import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Plus, Search, Edit3, User, LogOut, Trash2, Filter, X, Menu, ChevronLeft,
} from 'lucide-react';
import AddStudentModal from './AddStudentModal';
import {
  AppBar as MuiAppBar, Toolbar, Typography, Button, Container, Box, CssBaseline,
  Drawer as MuiDrawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  IconButton, Menu as MuiMenu, MenuItem, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, InputAdornment, Checkbox, Pagination, CircularProgress, Avatar,
  createTheme, ThemeProvider, styled, Alert, Tooltip, useMediaQuery,
} from '@mui/material';
import { MenuContext } from '../components/MenuContext';

// --- Constants ---
const API_BASE_URL = 'https://687b2e57b4bc7cfbda84e292.mockapi.io/users';
const LOCAL_KEY = 'localStudents';
const drawerWidth = 280;
const miniDrawerWidth = 72;

// --- Styled Components ---
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  boxShadow: theme.shadows[8],
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: theme.spacing(7) + 1,
  [theme.breakpoints.up('sm')]: {
    width: miniDrawerWidth,
  },
  boxShadow: theme.shadows[2],
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 2),
  ...theme.mixins.toolbar,
  minHeight: '72px !important',
}));

const StyledAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin', 'box-shadow'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin', 'box-shadow'], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
  }),
  ...(!open && {
    marginLeft: miniDrawerWidth,
    width: `calc(100% - ${miniDrawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin', 'box-shadow'], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
  }),
  '@media (max-width: 600px)': {
    width: '100%',
    marginLeft: 0,
  },
}));

const StyledDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    borderRight: `1px solid ${theme.palette.divider}`,
    background: `linear-gradient(180deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`,
    color: theme.palette.common.white,
    transition: theme.transitions.create(['width', 'transform'], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': {
        ...openedMixin(theme),
        background: `linear-gradient(180deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`,
      },
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': {
        ...closedMixin(theme),
        background: `linear-gradient(180deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`,
      },
    }),
  },
  '@media (max-width: 600px)': {
    '& .MuiDrawer-paper': {
      width: '100%',
      maxWidth: drawerWidth,
    },
  },
}));

// --- Error Boundary ---
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    console.error('ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
          <Paper elevation=6 sx={{ p: 3, maxWidth: 400, width: '100%', borderRadius: 2 }}>
            <Typography variant="h6" color="error" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {this.state.error?.message || 'Unknown error'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}

// --- Theme ---
const theme = createTheme({
  palette: {
    primary: { main: '#1a73e8', light: '#4fc3f7', dark: '#0d47a1' },
    secondary: { main: '#d32f2f', light: '#ff6659', dark: '#9a0007' },
    background: { default: '#fafafa', paper: '#ffffff' },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  typography: {
    h6: { fontWeight: 600 },
    body2: { fontSize: '0.875rem' },
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

// --- Types ---
type MainScreenProps = {
  onLogout: () => void;
  user: { name?: string; email?: string };
  children?: React.ReactNode;
};

// --- Component ---
export default function MainScreen({ onLogout, user, children }: MainScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { menuItems } = useContext(MenuContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('Academic');
  const [rowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Update activeMenuItem based on route
  useEffect(() => {
    const currentMenuItem = menuItems.find((item) => item.path === pathname);
    if (currentMenuItem) {
      setActiveMenuItem(currentMenuItem.name);
    }
  }, [pathname, menuItems]);

  // Auto-collapse drawer on mobile
  useEffect(() => {
    if (isMobile) {
      setIsDrawerOpen(false);
    }
  }, [isMobile]);

  // Session storage helper
  const setSession = useCallback((key, value) => {
    try {
      sessionStorage.setItem(key, value);
    } catch (err) {
      console.warn('MainScreen: Failed to set session storage:', err);
    }
  }, []);

  // Local storage helpers
  const getLocalStudents = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
    } catch {
      console.error('MainScreen: Error parsing local students');
      return [];
    }
  }, []);

  const saveLocalStudent = useCallback((student) => {
    const localStudents = getLocalStudents();
    localStudents.unshift(student);
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(localStudents));
    } catch {
      console.error('MainScreen: Error saving local student');
    }
  }, []);

  const removeLocalStudent = useCallback((id) => {
    const localStudents = getLocalStudents();
    const updatedStudents = localStudents.filter((s) => s.id !== id);
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updatedStudents));
    } catch {
      console.error('MainScreen: Error removing local student');
    }
  }, []);

  // Deduplicate students
  const deduplicateStudents = useCallback((students) => {
    return Array.from(
      new Map(students.map((s) => [s.id ? `${s.id}-${s.mail}` : s.mail, s])).values()
    );
  }, []);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      const localStudents = getLocalStudents();
      const allStudents = [...localStudents, ...data];
      const uniqueStudents = deduplicateStudents(allStudents);
      setStudents(uniqueStudents);
    } catch (err) {
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [getLocalStudents, deduplicateStudents]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;
      if (filterType === 'all' || filterType === 'firstname') {
        return String(s.firstname || '').toLowerCase().startsWith(term);
      }
      return String(s[filterType] || '').toLowerCase().includes(term);
    });
  }, [students, searchTerm, filterType]);

  const sortedStudents = useMemo(() => {
    if (!searchTerm) return filteredStudents;
    return [...filteredStudents].sort((a, b) =>
      String(a.firstname || '').toLowerCase().localeCompare(String(b.firstname || '').toLowerCase())
    );
  }, [filteredStudents, searchTerm]);

  // Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedStudents.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(sortedStudents.length / rowsPerPage);

  // Reset pagination on search/filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  // Handlers
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      setSession('isLoggedIn', '');
      setSession('userEmail', '');
      setSession('userName', '');
      onLogout();
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddStudent = async (newStudent) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newStudent, date: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error('Failed to add student');
      const addedStudent = await response.json();
      saveLocalStudent(addedStudent);
      setStudents((prev) => deduplicateStudents([addedStudent, ...prev]));
      setSuccess('Student added successfully!');
      setAddModalOpen(false);
      setSearchTerm('');
    } catch (err) {
      setError('Failed to add student. Please try again.');
    }
  };

  const handleEditStudent = (student) => {
    setCurrentStudent({ ...student, id: student.id || student.mail });
    setEditModalOpen(true);
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok && response.status !== 404) {
        throw new Error('Delete failed');
      }
      setStudents((prev) => deduplicateStudents(prev.filter((s) => s.id !== id)));
      removeLocalStudent(id);
      setSuccess('Student deleted successfully!');
    } catch (err) {
      setError('Failed to delete student. Please try again.');
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!currentStudent?.id) return;
    setError('');
    setSuccess('');
    try {
      const updateData = {
        firstname: currentStudent.firstname || '',
        lastname: currentStudent.lastname || '',
        age: currentStudent.age || '',
        phone: currentStudent.phone || '',
        mail: currentStudent.mail || '',
        role: currentStudent.role || '',
        date: currentStudent.date || new Date().toISOString(),
      };
      const response = await fetch(`${API_BASE_URL}/${currentStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error('Update failed');
      const updatedStudent = await response.json();
      setStudents((prev) =>
        deduplicateStudents(prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)))
      );
      setSuccess('Student updated successfully!');
      setEditModalOpen(false);
      setCurrentStudent(null);
    } catch (err) {
      setError('Failed to update student. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(currentRows.map((s) => s.id || s.mail)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'firstname', label: 'First Name' },
    { key: 'lastname', label: 'Last Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'age', label: 'Age' },
    { key: 'role', label: 'Role' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <CssBaseline />
          <StyledAppBar
            position="fixed"
            open={isDrawerOpen}
            elevation={isDrawerOpen ? 2 : 1}
            sx={{ 
              bgcolor: 'background.paper', 
              color: 'text.primary',
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            }}
          >
            <Toolbar>
              <Tooltip title={isDrawerOpen ? 'Close drawer' : 'Open drawer'}>
                <IconButton
                  color="inherit"
                  aria-label={isDrawerOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
                  onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                  edge="start"
                  sx={{ 
                    mr: 2, 
                    ...(isDrawerOpen && isMobile && { display: 'none' }),
                    '&:hover': {
                      bgcolor: 'action.hover',
                    }
                  }}
                >
                  <Menu />
                </IconButton>
              </Tooltip>
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                Students Dashboard
                  const isActive = activeMenuItem === item.name;
                  return (
                    <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
                      <Tooltip title={isDrawerOpen ? '' : item.name} placement="right">
                        <ListItemButton
                          onClick={() => {
                            setActiveMenuItem(item.name);
                            router.push(item.path);
                          }}
                          sx={{
                            minHeight: 48,
                            justifyContent: isDrawerOpen ? 'initial' : 'center',
                            px: 2.5,
                            borderRadius: 2,
                            bgcolor: isActive ? 'primary.main' : 'transparent',
                            '&:hover': { bgcolor: isActive ? 'primary.dark' : 'grey.800' },
                            mb: 0.5,
                          }}
                          aria-label={`Navigate to ${item.name}`}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: isDrawerOpen ? 3 : 'auto',
                              justifyContent: 'center',
                              color: 'inherit',
                            }}
                          >
                            <Icon size={24} />
                          </ListItemIcon>
                          <ListItemText
                            primary={item.name}
                            sx={{ opacity: isDrawerOpen ? 1 : 0, color: 'white' }}
                          />
                        </ListItemButton>
                      </Tooltip>
                    </ListItem>
                  );
                })}
              </List>

              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  p: 2,
                  borderTop: 1,
                  borderColor: 'grey.800',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.600', flexShrink: 0 }}>
                    <User size={20} />
                  </Avatar>
                  {isDrawerOpen && (
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" color="white" fontWeight={500} noWrap>
                        {user?.name || 'John Doe'}
                      </Typography>
                      <Typography variant="caption" color="grey.400" noWrap>
                        {user?.email || 'john@example.com'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </StyledDrawer>

          <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
            <DrawerHeader />
            {children}
            <Container maxWidth={false} sx={{ py: 3 }}>
              {(error || success) && (
                <Box sx={{ mb: 3, maxWidth: 600, mx: 'auto' }} aria-live="polite">
                  {error && (
                    <Alert
                      severity="error"
                      onClose={() => setError('')}
                      id="error-alert"
                      sx={{ mb: success ? 2 : 0 }}
                    >
                      {error}
                    </Alert>
                  )}
                  {success && (
                    <Alert severity="success" onClose={() => setSuccess('')} id="success-alert">
                      {success}
                    </Alert>
                  )}
                </Box>
              )}

              <Box
                sx={{
                  mb: 3,
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 2,
                  alignItems: { xs: 'stretch', md: 'center' },
                }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder={`Search by ${filterType === 'all' ? 'first name' : filterType}...`}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={20} />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <Tooltip title="Clear search">
                        <IconButton
                          onClick={() => setSearchTerm('')}
                          edge="end"
                          aria-label="Clear search input"
                        >
                          <X size={20} />
                        </IconButton>
                      </Tooltip>
                    ),
                  }}
                  sx={{ maxWidth: { md: 400 } }}
                  aria-label={`Search students by ${filterType}`}
                  inputProps={{ 'aria-describedby': error ? 'error-alert' : undefined }}
                />
                <Tooltip title="Add new student">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Plus />}
                    onClick={() => setAddModalOpen(true)}
                    sx={{ minWidth: 150 }}
                    disabled={loading}
                    aria-label="Add new student"
                  >
                    Add Student
                  </Button>
                </Tooltip>
                <Tooltip title="Filter options">
                  <IconButton
                    onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                    aria-label="Open filter options"
                    disabled={loading}
                  >
                    <Filter size={20} />
                  </IconButton>
                </Tooltip>
                <MuiMenu
                  anchorEl={filterAnchorEl}
                  open={Boolean(filterAnchorEl)}
                  onClose={() => setFilterAnchorEl(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  {filterOptions.map(({ key, label }) => (
                    <MenuItem
                      key={key}
                      onClick={() => {
                        setFilterType(key);
                        setFilterAnchorEl(null);
                      }}
                      selected={filterType === key}
                      sx={{ '&.Mui-selected': { bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.light' } } }}
                    >
                      {label}
                    </MenuItem>
                  ))}
                </MuiMenu>
              </Box>

              <Paper elevation={2} sx={{ mb: 2, overflow: 'hidden' }}>
                <TableContainer>
                  <Table aria-label="Students table">
                    <TableHead sx={{ bgcolor: 'grey.100' }}>
                      <TableRow>
                        <TableCell padding="checkbox" scope="col">
                          <Checkbox
                            color="primary"
                            checked={selectedRows.size === currentRows.length && currentRows.length > 0}
                            onChange={handleSelectAll}
                            aria-label="Select all students"
                          />
                        </TableCell>
                        <TableCell scope="col">First Name</TableCell>
                        <TableCell scope="col">Last Name</TableCell>
                        <TableCell scope="col">Age</TableCell>
                        <TableCell scope="col">Phone</TableCell>
                        <TableCell scope="col">Email</TableCell>
                        <TableCell scope="col">Role</TableCell>
                        <TableCell scope="col">Date</TableCell>
                        <TableCell scope="col" align="center">
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                              <CircularProgress size={24} />
                              <Typography variant="body2">Loading students...</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : currentRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                            <Typography color="text.secondary">
                              No students found matching your criteria.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentRows.map((student) => (
                          <TableRow
                            key={student.id || student.mail}
                            hover
                            sx={{ '&:nth-of-type(odd)': { bgcolor: 'grey.50' }, '&:hover': { bgcolor: 'action.hover' } }}
                            aria-label={`Student ${student.firstname || 'N/A'} ${student.lastname || ''}`}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                color="primary"
                                checked={selectedRows.has(student.id || student.mail)}
                                onChange={() => handleSelectRow(student.id || student.mail)}
                                aria-label={`Select ${student.firstname || 'student'}`}
                              />
                            </TableCell>
                            <TableCell id={`firstname-${student.id || student.mail}`}>
                              {student.firstname || 'N/A'}
                            </TableCell>
                            <TableCell>{student.lastname || 'N/A'}</TableCell>
                            <TableCell>{student.age || 'N/A'}</TableCell>
                            <TableCell>{student.phone || 'N/A'}</TableCell>
                            <TableCell>{student.mail || 'N/A'}</TableCell>
                            <TableCell>
                              <Typography
                                component="span"
                                variant="body2"
                                sx={{
                                  bgcolor: 'green.100',
                                  color: 'green.800',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.75rem',
                                }}
                              >
                                {student.role || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {student.date ? new Date(student.date).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                <Tooltip title="Edit student">
                                  <IconButton
                                    onClick={() => handleEditStudent(student)}
                                    color="primary"
                                    size="small"
                                    aria-label={`Edit ${student.firstname || 'student'}`}
                                    disabled={loading}
                                  >
                                    <Edit3 size={16} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete student">
                                  <IconButton
                                    onClick={() => handleDeleteStudent(student.id || student.mail)}
                                    color="error"
                                    size="small"
                                    aria-label={`Delete ${student.firstname || 'student'}`}
                                    disabled={loading}
                                  >
                                    <Trash2 size={16} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {!loading && sortedStudents.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(e, page) => setCurrentPage(page)}
                    color="primary"
                    siblingCount={1}
                    boundaryCount={1}
                    aria-label="Table pagination"
                  />
                </Box>
              )}
            </Container>

            <Dialog
              open={editModalOpen}
              onClose={() => {
                setEditModalOpen(false);
                setCurrentStudent(null);
              }}
              maxWidth="sm"
              fullWidth
              aria-labelledby="edit-student-dialog-title"
            >
              <DialogTitle id="edit-student-dialog-title">Edit Student</DialogTitle>
              <DialogContent>
                <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {['firstname', 'lastname', 'age', 'phone', 'mail', 'role'].map((field) => (
                    <TextField
                      key={field}
                      name={field}
                      label={field === 'mail' ? 'Email' : field.charAt(0).toUpperCase() + field.slice(1)}
                      type={field === 'age' ? 'number' : field === 'mail' ? 'email' : 'text'}
                      value={currentStudent?.[field] || ''}
                      onChange={handleInputChange}
                      required={field !== 'role'}
                      fullWidth
                      variant="outlined"
                      error={currentStudent?.[field] === '' && field !== 'role'}
                      helperText={
                        currentStudent?.[field] === '' && field !== 'role' ? 'This field is required' : ''
                      }
                      aria-required={field !== 'role'}
                      disabled={loading}
                      inputProps={{ 'aria-describedby': error ? 'error-alert' : undefined }}
                    />
                  ))}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setEditModalOpen(false);
                    setCurrentStudent(null);
                  }}
                  color="inherit"
                  aria-label="Cancel edit"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateStudent}
                  variant="contained"
                  color="primary"
                  disabled={
                    loading ||
                    !currentStudent ||
                    ['firstname', 'lastname', 'age', 'phone', 'mail'].some(
                      (f) => !currentStudent[f]
                    )
                  }
                  aria-label="Save changes"
                >
                  {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : 'Save Changes'}
                </Button>
              </DialogActions>
            </Dialog>

            <AddStudentModal
              isOpen={addModalOpen}
              onClose={() => setAddModalOpen(false)}
              onAddStudent={handleAddStudent}
            />
          </Box>
        </Box>
      </ErrorBoundary>
    </ThemeProvider>
  );
}