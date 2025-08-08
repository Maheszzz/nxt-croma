"use client";

import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Plus, Search, Edit3, User, Trash2, Filter, X, Menu,
} from 'lucide-react';
import AddStudentModal from './AddStudentModal';
import {
  AppBar as MuiAppBar, Toolbar, Typography, Button, Container, Box, CssBaseline,
  Drawer as MuiDrawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  IconButton, Menu as MuiMenu, MenuItem, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, InputAdornment, Checkbox, Pagination, CircularProgress, Avatar,
  createTheme, ThemeProvider, styled, Alert, Tooltip, useMediaQuery, Theme,
} from '@mui/material';
import { MenuContext } from '../components/MenuContext';

// --- Constants ---
const API_BASE_URL = 'https://jsonplaceholder.typicode.com/users';
const LOCAL_KEY = 'localStudents';
const drawerWidth = 280;
const miniDrawerWidth = 72;

// --- Types ---
type Student = {
  id?: string;
  mail: string;
  firstname?: string;
  lastname?: string;
  age?: number | string;
  phone?: string;
  role?: string;
  date?: string;
};

type MainScreenProps = {
  onLogout: () => void;
  user: { name?: string; email?: string };
  children?: React.ReactNode;
};

// --- Styled Components ---
const openedMixin = (theme: Theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  boxShadow: theme.shadows[8],
});

const closedMixin = (theme: Theme) => ({
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
})(({ theme, open }: { theme: Theme; open: boolean }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin', 'box-shadow'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
  }),
  ...(!open && {
    marginLeft: miniDrawerWidth,
    width: `calc(100% - ${miniDrawerWidth}px)`,
  }),
  '@media (max-width: 600px)': {
    width: '100%',
    marginLeft: 0,
  },
}));

const StyledDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }: { theme: Theme; open: boolean }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    borderRight: `1px solid ${theme.palette.divider}`,
    background: `linear-gradient(180deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`,
    color: theme.palette.common.white,
    ...(open ? openedMixin(theme) : closedMixin(theme)),
  },
  '@media (max-width: 600px)': {
    '& .MuiDrawer-paper': {
      width: '100%',
      maxWidth: drawerWidth,
    },
  },
}));

// --- Error Boundary ---
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
          <Paper elevation={6} sx={{ p: 3, maxWidth: 400, width: '100%', borderRadius: 2 }}>
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
});

// --- Main Component ---
export default function MainScreen({ onLogout, user, children }: MainScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { menuItems } = useContext(MenuContext);

  // --- State ---
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'firstname' | 'lastname' | 'phone' | 'age' | 'role'>('all');
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('Academic');
  const [rowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // --- Helper Functions: Local Storage ---
  const getLocalStudents = useCallback((): Student[] => {
    try {
      const item = localStorage.getItem(LOCAL_KEY);
      return item ? JSON.parse(item) : [];
    } catch {
      console.error('Error parsing local students');
      return [];
    }
  }, []);

  const saveLocalStudent = useCallback((student: Student) => {
    const localStudents = getLocalStudents();
    localStudents.unshift(student);
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(localStudents));
    } catch {
      console.error('Error saving local student');
    }
  }, [getLocalStudents]);

  const removeLocalStudent = useCallback((id: string) => {
    const localStudents = getLocalStudents();
    const updatedStudents = localStudents.filter(s => s.id !== id);
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updatedStudents));
    } catch {
      console.error('Error removing local student');
    }
  }, [getLocalStudents]);

  // Transform fetched user to Student type
  const transformApiUserToStudent = useCallback((user: any): Student => {
    const [firstname, ...lastnameParts] = user.name ? user.name.split(' ') : ['N/A'];
    const lastname = lastnameParts.join(' ');

    return {
      id: user.id?.toString(),
      mail: user.email || 'N/A',
      firstname: firstname || 'N/A',
      lastname: lastname || 'N/A',
      age: Math.floor(Math.random() * 10) + 18, // random age 18-27
      phone: user.phone || 'N/A',
      role: 'Student',
      date: new Date().toISOString(),
    };
  }, []);

  const deduplicateStudents = useCallback((students: Student[]) => {
    return Array.from(
      new Map(students.map(s => [(s.id ? `${s.id}-${s.mail}` : s.mail), s])).values()
    );
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) throw new Error('Failed to fetch students');
      const apiUsers = await res.json();
      const apiStudents = apiUsers.map(transformApiUserToStudent);
      const localStudents = getLocalStudents();
      const combined = [...localStudents, ...apiStudents];
      const uniqueStudents = deduplicateStudents(combined);
      setStudents(uniqueStudents);
    } catch {
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [getLocalStudents, deduplicateStudents, transformApiUserToStudent]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Auto collapse drawer on mobile
  useEffect(() => {
    setIsDrawerOpen(!isMobile);
  }, [isMobile]);

  // Update activeMenuItem on route change
  useEffect(() => {
    const currentMenuItem = menuItems.find(item => item.path === pathname);
    if (currentMenuItem) setActiveMenuItem(currentMenuItem.name);
  }, [pathname, menuItems]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return students;
    return students.filter(student => {
      if (filterType === 'all' || filterType === 'firstname') {
        return (student.firstname ?? '').toLowerCase().startsWith(term);
      }
      const value = String(student[filterType] ?? '').toLowerCase();
      return value.includes(term);
    });
  }, [students, searchTerm, filterType]);

  const sortedStudents = useMemo(() => {
    if (!searchTerm) return filteredStudents;
    return [...filteredStudents].sort((a, b) =>
      (a.firstname ?? '').toLowerCase().localeCompare((b.firstname ?? '').toLowerCase())
    );
  }, [filteredStudents, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedStudents.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedStudents.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  // Helpers
  const setSession = useCallback((key: string, value: string) => {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      console.warn('Failed to set session storage');
    }
  }, []);

  // Handlers
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      setSession('isLoggedIn', '');
      setSession('userEmail', '');
      setSession('userName', '');
      onLogout();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddStudent = async (newStudent: Student) => {
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
      setStudents(prev => deduplicateStudents([addedStudent, ...prev]));
      setSuccess('Student added successfully!');
      setAddModalOpen(false);
      setSearchTerm('');
    } catch {
      setError('Failed to add student. Please try again.');
    }
  };

  const handleEditStudent = (student: Student) => {
    setCurrentStudent({ ...student, id: student.id ?? student.mail });
    setEditModalOpen(true);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm('Delete this student?')) return;
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok && response.status !== 404) throw new Error('Delete failed');
      setStudents(prev => deduplicateStudents(prev.filter(s => s.id !== id)));
      removeLocalStudent(id);
      setSuccess('Student deleted successfully!');
    } catch {
      setError('Failed to delete student. Please try again.');
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent?.id) return;
    setError('');
    setSuccess('');
    try {
      const updateData = {
        firstname: currentStudent.firstname ?? '',
        lastname: currentStudent.lastname ?? '',
        age: currentStudent.age ?? '',
        phone: currentStudent.phone ?? '',
        mail: currentStudent.mail ?? '',
        role: currentStudent.role ?? '',
        date: currentStudent.date ?? new Date().toISOString(),
      };
      const response = await fetch(`${API_BASE_URL}/${currentStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error('Update failed');
      const updatedStudent = await response.json();
      setStudents(prev =>
        deduplicateStudents(prev.map(s => (s.id === updatedStudent.id ? updatedStudent : s)))
      );
      setSuccess('Student updated successfully!');
      setEditModalOpen(false);
      setCurrentStudent(null);
    } catch {
      setError('Failed to update student. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentStudent(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(new Set(currentRows.map(s => s.id ?? s.mail)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'firstname', label: 'First Name' },
    { key: 'lastname', label: 'Last Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'age', label: 'Age' },
    { key: 'role', label: 'Role' },
  ] as const;

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
              backgroundColor: 'rgba(255,255,255,0.95)',
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
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Menu />
                </IconButton>
              </Tooltip>
              <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                Students Dashboard
              </Typography>
              <List sx={{ display: 'flex', flexDirection: 'row', p: 0, m: 0 }}>
                {menuItems.map(item => {
                  const Icon = item.icon;
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
                            '&:hover': {
                              bgcolor: isActive ? 'primary.dark' : 'grey.800',
                            },
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
            </Toolbar>
          </StyledAppBar>

          <StyledDrawer variant="permanent" open={isDrawerOpen}>
            <DrawerHeader />
            <List>
              {menuItems.map(item => {
                const Icon = item.icon;
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
                          '&:hover': {
                            bgcolor: isActive ? 'primary.dark' : 'grey.800',
                          },
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
                      {user?.name ?? 'John Doe'}
                    </Typography>
                    <Typography variant="caption" color="grey.400" noWrap>
                      {user?.email ?? 'john@example.com'}
                    </Typography>
                  </Box>
                )}
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
                        <IconButton onClick={() => setSearchTerm('')} edge="end" aria-label="Clear search input">
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
                    onClick={e => setFilterAnchorEl(e.currentTarget)}
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
                            <Typography color="text.secondary">No students found matching your criteria.</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentRows.map(student => {
                          const idKey = student.id ?? student.mail;
                          return (
                            <TableRow
                              key={idKey}
                              hover
                              sx={{ '&:nth-of-type(odd)': { bgcolor: 'grey.50' }, '&:hover': { bgcolor: 'action.hover' } }}
                              aria-label={`Student ${student.firstname ?? 'N/A'} ${student.lastname ?? ''}`}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox
                                  color="primary"
                                  checked={selectedRows.has(idKey)}
                                  onChange={() => handleSelectRow(idKey)}
                                  aria-label={`Select ${student.firstname ?? 'student'}`}
                                />
                              </TableCell>
                              <TableCell id={`firstname-${idKey}`}>{student.firstname ?? 'N/A'}</TableCell>
                              <TableCell>{student.lastname ?? 'N/A'}</TableCell>
                              <TableCell>{student.age ?? 'N/A'}</TableCell>
                              <TableCell>{student.phone ?? 'N/A'}</TableCell>
                              <TableCell>{student.mail ?? 'N/A'}</TableCell>
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
                                  {student.role ?? 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell>{student.date ? new Date(student.date).toLocaleDateString() : 'N/A'}</TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                  <Tooltip title="Edit student">
                                    <IconButton
                                      onClick={() => handleEditStudent(student)}
                                      color="primary"
                                      size="small"
                                      aria-label={`Edit ${student.firstname ?? 'student'}`}
                                      disabled={loading}
                                    >
                                      <Edit3 size={16} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete student">
                                    <IconButton
                                      onClick={() => handleDeleteStudent(idKey)}
                                      color="error"
                                      size="small"
                                      aria-label={`Delete ${student.firstname ?? 'student'}`}
                                      disabled={loading}
                                    >
                                      <Trash2 size={16} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })
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
                    onChange={(_, page) => setCurrentPage(page)}
                    color="primary"
                    siblingCount={1}
                    boundaryCount={1}
                    aria-label="Table pagination"
                  />
                </Box>
              )}
            </Container>

            {/* Edit Modal */}
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
                  {['firstname', 'lastname', 'age', 'phone', 'mail', 'role'].map(field => (
                    <TextField
                      key={field}
                      name={field}
                      label={field === 'mail' ? 'Email' : field.charAt(0).toUpperCase() + field.slice(1)}
                      type={field === 'age' ? 'number' : field === 'mail' ? 'email' : 'text'}
                      value={(currentStudent as any)?.[field] ?? ''}
                      onChange={handleInputChange}
                      required={field !== 'role'}
                      fullWidth
                      variant="outlined"
                      error={(currentStudent as any)?.[field] === '' && field !== 'role'}
                      helperText={(currentStudent as any)?.[field] === '' && field !== 'role' ? 'This field is required' : ''}
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
                      (f) => !(currentStudent as any)?.[f]
                    )
                  }
                  aria-label="Save changes"
                >
                  {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : 'Save Changes'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Add Modal */}
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
