'use client'

import React, { useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Plus, Search, Edit3, User, LogOut, Trash2, Filter, X, Menu, ChevronLeft
} from 'lucide-react';
import AddStudentModal from './AddStudentModal';
import {
  AppBar as MuiAppBar, Toolbar, Typography, Button, Container, Box, CssBaseline,
  Drawer as MuiDrawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  IconButton, Menu as MuiMenu, MenuItem, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, InputAdornment, Checkbox, Pagination, CircularProgress, Avatar,
  createTheme, ThemeProvider, styled
} from '@mui/material';
import { CSSObject, Theme } from '@mui/material/styles';
import { MenuContext } from '../components/MenuContext';
import type { LucideIcon } from 'lucide-react';

// --- Types ---
interface Student {
  id?: string;
  firstname: string;
  lastname: string;
  age: number | string;
  phone: string;
  mail: string;
  role: string;
  date: string;
}

type UnknownObject = { [key: string]: unknown };

interface MenuItemType {
  id: number;
  name: string;
  path: string;
  icon: LucideIcon;
}

interface MainScreenProps {
  onLogout: () => void;
  user: { name?: string; email?: string } | null;
  children: ReactNode;
}

// --- Field Mapping Utility ---
const normalizeStudentData = (rawStudent: UnknownObject): Student => {
  const normalizeField = (obj: UnknownObject, possibleKeys: string[], defaultValue: string = ''): string => {
    for (const key of possibleKeys) {
      const value = obj[key];
      if (typeof value === 'string' && value.trim() !== '') {
        return value.trim();
      }
      if (typeof value === 'number' && !isNaN(value)) {
        return String(value);
      }
    }
    return defaultValue;
  };

  const normalizeAge = (obj: UnknownObject): number => {
    const ageKeys = ['age', 'Age', 'studentAge', 'ageValue'];
    for (const key of ageKeys) {
      const value = obj[key];
      if (typeof value === 'number' && !isNaN(value)) {
        return value;
      }
      if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return 0;
  };

  const normalized = {
    id: (rawStudent['id'] as string) || (rawStudent['_id'] as string) || (rawStudent['studentId'] as string) || '',
    firstname: normalizeField(rawStudent, ['firstname', 'firstName', 'first_name', 'fname', 'FirstName', 'first', 'name']),
    lastname: normalizeField(rawStudent, ['lastname', 'lastName', 'last_name', 'lname', 'LastName', 'last']),
    age: normalizeAge(rawStudent),
    phone: normalizeField(rawStudent, ['phone', 'phoneNumber', 'phone_number', 'mobile', 'contact', 'Phone', 'telephone']),
    mail: normalizeField(rawStudent, ['mail', 'email', 'emailAddress', 'email_address', 'Email', 'eMail']),
    role: normalizeField(rawStudent, ['role', 'position', 'designation', 'Role', 'studentRole']),
    date: (rawStudent['date'] as string) || (rawStudent['createdAt'] as string) || (rawStudent['created_at'] as string) || new Date().toISOString()
  };

  // Debug: Log normalized data to verify firstname and phone
  console.log('Normalized student:', normalized);

  return normalized;
};

// --- Styled Components ---
const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const StyledAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ theme, open }) => ({
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

const StyledDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

// --- Error Boundary ---
class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
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
              {(this.state.error && (this.state.error as Error).message) || 'Unknown error'}
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
    primary: { main: '#1a73e8' },
    secondary: { main: '#d32f2f' },
    background: { default: '#f5f5f5' },
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
  const { menuItems } = useContext(MenuContext) as { menuItems: MenuItemType[] };
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('Academic');
  const [rowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const LOCAL_KEY = 'localStudents';

  // Update activeMenuItem based on current route
  useEffect(() => {
    const currentMenuItem = menuItems.find((item) => item.path === pathname);
    if (currentMenuItem) {
      setActiveMenuItem(currentMenuItem.name);
    }
  }, [pathname, menuItems]);

  const getLocalStudents = useCallback(() => {
    try {
      const localData = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') as Student[];
      console.log('Local students:', localData); // Debug: Log local storage data
      return localData;
    } catch {
      console.error('MainScreen: Error parsing local students');
      return [];
    }
  }, []);

  const saveLocalStudent = useCallback((student: Student) => {
    const localStudents = getLocalStudents();
    localStudents.unshift(student);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(localStudents));
  }, [getLocalStudents]);

  const removeLocalStudent = useCallback((id: string) => {
    const localStudents = getLocalStudents();
    const updatedStudents = localStudents.filter((s) => s.id !== id);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updatedStudents));
  }, [getLocalStudents]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('https://688c9175cd9d22dda5cda115.mockapi.io/rem', {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        console.error('MainScreen: API Error:', errorMessage);

        // Use local data as fallback
        const localStudents = getLocalStudents();
        if (localStudents.length > 0) {
          console.log('MainScreen: Using local storage data as fallback');
          setStudents(localStudents);
        }

        throw new Error(`Failed to fetch students: ${errorMessage}`);
      }

      const rawData = await response.json() as UnknownObject[];
      console.log('Raw API data:', rawData); // Debug: Log raw API response
      const normalizedApiData = rawData.map(normalizeStudentData);

      const localStudents = getLocalStudents();
      const localIds = new Set(localStudents.map((s) => s.id || s.mail));

      // Filter out API students that already exist locally
      const filteredApi = normalizedApiData.filter((s) => !localIds.has(s.id || s.mail));

      const allStudents = [...localStudents, ...filteredApi];

      // Remove duplicates by id+mail key
      const uniqueStudents = Array.from(
        new Map(allStudents.map((student) => {
          const key = student.id ? `${student.id}-${student.mail}` : student.mail;
          return [key, student];
        })).values()
      ) as Student[];

      console.log('Final students list:', uniqueStudents); // Debug: Log final student list
      setStudents(uniqueStudents);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('MainScreen: Request timeout - API took too long to respond');
        } else {
          console.error('MainScreen: Error fetching students:', error.message);
        }
      } else {
        console.error('MainScreen: Unknown error fetching students:', error);
      }

      // Always ensure we have some data to display
      const localStudents = getLocalStudents();
      if (localStudents.length > 0) {
        setStudents(localStudents);
      }
    } finally {
      setLoading(false);
    }
  }, [getLocalStudents]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    if (filterType === 'all' || filterType === 'firstname') {
      const value = String(s.firstname || '').toLowerCase();
      return value.startsWith(term);
    }
    const value = String(s[filterType as keyof Student] || '').toLowerCase();
    return value.includes(term);
  });

  const sortStudents = (studentsToSort: Student[]) => {
    return [...studentsToSort].sort((a, b) => {
      const valueA = String(a.firstname || '').toLowerCase();
      const valueB = String(b.firstname || '').toLowerCase();
      return valueA.localeCompare(valueB, undefined, { sensitivity: 'base' });
    });
  };

  const sortedStudents = searchTerm ? sortStudents(filteredStudents) : filteredStudents;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      sessionStorage.removeItem('isLoggedIn');
      onLogout();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleAddStudent = async (newStudent: Omit<Student, 'id'>) => {
    try {
      const response = await fetch('https://688c9175cd9d22dda5cda115.mockapi.io/rem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      });
      if (!response.ok) throw new Error('Failed to add student');
      const addedRaw = await response.json() as UnknownObject;
      const addedStudent = normalizeStudentData(addedRaw);

      saveLocalStudent(addedStudent);
      setStudents((prev) => {
        const updated = [addedStudent, ...prev];
        const unique = Array.from(
          new Map(updated.map((student) => [student.id ? `${student.id}-${student.mail}` : student.mail, student])).values()
        ) as Student[];
        return unique;
      });
      setCurrentPage(1);
      setSearchTerm('');
    } catch (error) {
      console.error('MainScreen: Error adding student:', error);
      await fetchStudents();
    }
  };

  const handleEditStudent = (student: Student) => {
    setCurrentStudent({ ...student });
    setEditModalOpen(true);
  };

  const handleDeleteStudent = async (id?: string) => {
    if (!id) {
      console.error('No ID for deletion');
      return;
    }
    if (!window.confirm('Delete this student?')) return;
    try {
      const response = await fetch(`https://688c9175cd9d22dda5cda115.mockapi.io/rem/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        if (response.status === 404) {
          // Remove locally if not found on server
          setStudents((prev) => {
            const updated = prev.filter((s) => s.id !== id);
            return Array.from(new Map(updated.map((student) => [student.id ? `${student.id}-${student.mail}` : student.mail, student])).values()) as Student[];
          });
          removeLocalStudent(id);
        } else {
          throw new Error('Delete failed');
        }
      } else {
        setStudents((prev) => {
          const updated = prev.filter((s) => s.id !== id);
          return Array.from(new Map(updated.map((student) => [student.id ? `${student.id}-${student.mail}` : student.mail, student])).values()) as Student[];
        });
        removeLocalStudent(id);
      }
    } catch (error) {
      console.error('MainScreen: Error deleting student:', error);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent?.id) {
      console.error('MainScreen: Invalid student ID for update');
      return;
    }

    const studentExists = students.some((s) => s.id === currentStudent.id);
    if (!studentExists) {
      console.warn(`MainScreen: Student with ID ${currentStudent.id} not found in local list. Refreshing students.`);
      await fetchStudents();
      return;
    }

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

      const response = await fetch(
        `https://688c9175cd9d22dda5cda115.mockapi.io/rem/${currentStudent.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        }
      );
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`MainScreen: Student with ID ${currentStudent.id} not found on server. Removing from local list.`);
          setStudents((prev) => prev.filter((s) => s.id !== currentStudent.id));
          removeLocalStudent(currentStudent.id);
          setEditModalOpen(false);
          setCurrentStudent(null);
          return;
        }
        const errorText = await response.text();
        console.error('MainScreen: Update failed with status', response.status, errorText);
        throw new Error('Update failed');
      }
      const updatedRaw = await response.json() as UnknownObject;
      const updatedStudent = normalizeStudentData(updatedRaw);
      setStudents((prev) => {
        const updated = prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
        return Array.from(new Map(updated.map((student) => [student.id ? `${student.id}-${student.mail}` : student.mail, student])).values()) as Student[];
      });
      setEditModalOpen(false);
      setCurrentStudent(null);
    } catch (error) {
      console.error('MainScreen: Error updating student:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentStudent((prev) => prev ? ({ ...prev, [name]: value }) : null);
  };

  const filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'firstname', label: 'First Name' },
    { key: 'lastname', label: 'Last Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'age', label: 'Age' },
    { key: 'role', label: 'Role' },
  ];

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedStudents.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(sortedStudents.length / rowsPerPage);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <CssBaseline />
          <StyledAppBar position="fixed" open={isDrawerOpen} elevation={1} sx={{ bgcolor: 'white', color: 'text.primary' }}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                edge="start"
                sx={{ marginRight: 5, ...(isDrawerOpen && { display: 'none' }) }}
              >
                <Menu />
              </IconButton>
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                Students Dashboard
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mx: 2, display: { xs: 'none', sm: 'block' } }}>
                {activeMenuItem}
              </Typography>
              <IconButton onClick={(e) => setProfileAnchorEl(e.currentTarget)}>
                <User />
              </IconButton>
              <MuiMenu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={() => setProfileAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <LogOut size={16} style={{ marginRight: 8 }} /> Logout
                </MenuItem>
              </MuiMenu>
            </Toolbar>
          </StyledAppBar>

          <StyledDrawer variant="permanent" open={isDrawerOpen}>
            <DrawerHeader sx={{ bgcolor: 'grey.900', justifyContent: 'space-between', px: 2 }}>
              {isDrawerOpen && (
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                  MyApp
                </Typography>
              )}
              <IconButton onClick={() => setIsDrawerOpen(false)} sx={{ color: 'white' }}>
                <ChevronLeft />
              </IconButton>
            </DrawerHeader>

            <Box sx={{ bgcolor: 'grey.900', color: 'white', flexGrow: 1, position: 'relative' }}>
              <List sx={{ p: 1 }}>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenuItem === item.name;
                  return (
                    <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
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
                      >
                        <ListItemIcon
                          sx={{ minWidth: 0, mr: isDrawerOpen ? 3 : 'auto', justifyContent: 'center', color: 'inherit' }}
                        >
                          <Icon />
                        </ListItemIcon>
                        <ListItemText primary={item.name} sx={{ opacity: isDrawerOpen ? 1 : 0, color: 'white' }} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>

              <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', p: 2, borderTop: 1, borderColor: 'grey.800' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.600', flexShrink: 0 }}>
                    <User />
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

          <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
            <DrawerHeader />
            {children}
            <Container maxWidth={false} sx={{ p: 3 }}>
              <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder={`Search students${filterType !== 'all' ? ` by ${filterType}` : ''}...`}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Search size={20} /></InputAdornment>,
                    endAdornment: searchTerm && (
                      <IconButton onClick={() => setSearchTerm('')} edge="end">
                        <X size={20} />
                      </IconButton>
                    ),
                  }}
                  sx={{ maxWidth: { md: 400 } }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Plus />}
                  onClick={() => setAddModalOpen(true)}
                  sx={{ minWidth: 150 }}
                >
                  Add Student
                </Button>
                <IconButton onClick={(e) => setFilterAnchorEl(e.currentTarget)}>
                  <Filter />
                </IconButton>
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
                      onClick={() => { setFilterType(key); setFilterAnchorEl(null); }}
                      selected={filterType === key}
                      sx={{ '&.Mui-selected': { bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.light' } } }}
                    >
                      {label}
                    </MenuItem>
                  ))}
                </MuiMenu>
              </Box>

              <Paper elevation={2} sx={{ mb: 2 }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: 'grey.100' }}>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox color="primary" />
                        </TableCell>
                        <TableCell>First Name</TableCell>
                        <TableCell>Last Name</TableCell>
                        <TableCell>Age</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="center">Actions</TableCell>
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
                              {searchTerm ? `No students found matching "${searchTerm}"` : 'No students found'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentRows.map((student) => (
                          <TableRow
                            key={student.id || student.mail}
                            hover
                            sx={{ '&:nth-of-type(odd)': { bgcolor: 'grey.50' }, '&:hover': { bgcolor: 'action.hover' } }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox color="primary" />
                            </TableCell>
                            <TableCell>{student.firstname?.trim() || '-'}</TableCell>
                            <TableCell>{student.lastname?.trim() || '-'}</TableCell>
                            <TableCell>{student.age && student.age !== 0 ? student.age : '-'}</TableCell>
                            <TableCell>{student.phone?.trim() || '-'}</TableCell>
                            <TableCell>{student.mail?.trim() || '-'}</TableCell>
                            <TableCell>
                              <Typography
                                component="span"
                                variant="body2"
                                sx={{
                                  bgcolor: 'primary.light',
                                  color: 'primary.contrastText',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                }}
                              >
                                {student.role?.trim() || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>{student.date ? new Date(student.date).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell align="center">
                              <IconButton onClick={() => handleEditStudent(student)}>
                                <Edit3 size={20} />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteStudent(student.id)} color="error">
                                <Trash2 size={20} />
                              </IconButton>
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
                    onChange={handlePageChange}
                    color="primary"
                    siblingCount={1}
                    boundaryCount={1}
                  />
                </Box>
              )}
            </Container>

            <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogContent>
                <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {['firstname', 'lastname', 'age', 'phone', 'mail', 'role'].map((field) => (
                    <TextField
                      key={field}
                      name={field}
                      label={field === 'mail' ? 'Email' : field.charAt(0).toUpperCase() + field.slice(1)}
                      type={field === 'age' ? 'number' : field === 'mail' ? 'email' : 'text'}
                      value={currentStudent?.[field as keyof Student] || ''}
                      onChange={handleInputChange}
                      required
                      fullWidth
                      variant="outlined"
                      error={currentStudent?.[field as keyof Student] === '' && field !== 'role'}
                      helperText={currentStudent?.[field as keyof Student] === '' && field !== 'role' ? 'This field is required' : ''}
                    />
                  ))}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setEditModalOpen(false)} color="inherit">
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateStudent}
                  variant="contained"
                  color="primary"
                  disabled={!currentStudent || !currentStudent.firstname || !currentStudent.lastname || !currentStudent.age || !currentStudent.phone || !currentStudent.mail}
                >
                  Save Changes
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