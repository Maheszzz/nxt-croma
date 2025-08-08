"use client";

import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plus,
  Search,
  Edit3,
  User,
  Trash2,
  Filter,
  X,
  Menu,
  ChevronDown,
  Settings,
} from "lucide-react";
import AddStudentModal from "./AddStudentModal";
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  CssBaseline,
  Drawer as MuiDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Menu as MuiMenu,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Checkbox,
  Pagination,
  CircularProgress,
  Avatar,
  createTheme,
  ThemeProvider,
  styled,
  Alert,
  Tooltip,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  Fab,
  Stack,
  Breadcrumbs,
} from "@mui/material";
import { MenuContext } from "../components/MenuContext";

// --- Types ---
interface MenuItem {
  id: number;
  name: string;
  path: string;
  icon: React.ElementType;
}

interface MenuContextType {
  menuItems: MenuItem[];
}

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

type ApiUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  username?: string;
  website?: string;
  company?: {
    name: string;
    catchPhrase?: string;
    bs?: string;
  };
  address?: {
    street?: string;
    suite?: string;
    city?: string;
    zipcode?: string;
    geo?: {
      lat?: string;
      lng?: string;
    };
  };
};

type MainScreenProps = {
  onLogoutAction: () => void;
  user: { name?: string; email?: string };
  children?: React.ReactNode;
};

// --- Constants ---
const API_BASE_URL = "https://jsonplaceholder.typicode.com/users";
const LOCAL_KEY = "localStudents";
const drawerWidth = 280;

// --- Modern Theme ---
const modernTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6366f1",
      light: "#8b5cf6",
      dark: "#4f46e5",
    },
    secondary: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
    },
    grey: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#047857",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", "Helvetica Neue", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: "2rem",
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.3,
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.4,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "10px 24px",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
        contained: {
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            "&:hover": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#6366f1",
              },
            },
            "&.Mui-focused": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#6366f1",
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

// --- Styled Components ---
const StyledAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ theme, open }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(20px)",
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[1],
  color: theme.palette.text.primary,
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
  }),
  [theme.breakpoints.down("md")]: {
    marginLeft: 0,
    width: "100%",
  },
}));

const StyledDrawer = styled(MuiDrawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    backgroundColor: "#ffffff",
    borderRight: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[2],
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    boxShadow: theme.shadows[2],
    transform: "translateY(-2px)",
  },
}));

const ModernTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[2],
  "& .MuiTableHead-root": {
    backgroundColor: theme.palette.grey[50],
    "& .MuiTableCell-head": {
      backgroundColor: "transparent",
      fontWeight: 600,
      fontSize: "0.875rem",
      color: theme.palette.text.primary,
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  },
  "& .MuiTableRow-root": {
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.grey[50],
    },
  },
  "& .MuiTableCell-root": {
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: "16px",
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

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <Card sx={{ p: 4, maxWidth: 500, textAlign: "center", borderRadius: 4 }}>
            <Typography variant="h5" color="error" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {this.state.error?.message || "An unexpected error occurred"}
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{ borderRadius: 3 }}
            >
              Reload Application
            </Button>
          </Card>
        </Box>
      );
    }
    return this.props.children;
  }
}

// --- Main Component ---
export default function MainScreen({
  onLogoutAction,
  user,
  children,
}: MainScreenProps) {
  const pathname = usePathname();
  const { menuItems } = useContext(MenuContext) as MenuContextType;

  // --- State ---
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "firstname" | "lastname" | "phone" | "age" | "role"
  >("all");
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState("");
  const [rowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const isMobile = useMediaQuery(modernTheme.breakpoints.down("md"));

  // Auto handle drawer state
  useEffect(() => {
    setIsDrawerOpen(!isMobile);
  }, [isMobile]);

  // Set active menu item
  useEffect(() => {
    const currentMenuItem = menuItems.find((item: MenuItem) => item.path === pathname);
    if (currentMenuItem) {
      setActiveMenuItem(currentMenuItem.name);
    }
  }, [pathname, menuItems]);

  // --- Helper Functions ---
  const getLocalStudents = useCallback((): Student[] => {
    if (typeof window === "undefined") return [];
    try {
      const item = localStorage.getItem(LOCAL_KEY);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error("Error parsing local students:", error);
      return [];
    }
  }, []);

  const saveLocalStudent = useCallback(
    (student: Student) => {
      if (typeof window === "undefined") return;
      try {
        const localStudents = getLocalStudents();
        localStudents.unshift(student);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(localStudents));
      } catch (error) {
        console.error("Failed to save student:", error);
      }
    },
    [getLocalStudents]
  );

  const removeLocalStudent = useCallback(
    (id: string) => {
      if (typeof window === "undefined") return;
      try {
        const localStudents = getLocalStudents();
        const updatedStudents = localStudents.filter((s) => s.id !== id);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(updatedStudents));
      } catch (error) {
        console.error("Failed to remove student:", error);
      }
    },
    [getLocalStudents]
  );

  const transformApiUserToStudent = useCallback((user: ApiUser): Student => {
    const fullName = user.name ? user.name.trim() : "N/A";
    const nameParts = fullName.split(" ").filter((part: string) => part.length > 0);

    let firstname = "N/A";
    let lastname = "N/A";

    if (nameParts.length > 0) {
      firstname = nameParts[0];
      if (nameParts.length > 1) {
        lastname = nameParts.slice(1).join(" ");
      } else {
        lastname = "";
      }
    }

    return {
      id: user.id?.toString(),
      mail: user.email || "N/A",
      firstname: firstname,
      lastname: lastname,
      age: Math.floor(Math.random() * 10) + 18,
      phone: user.phone || "N/A",
      role: "Student",
      date: new Date().toISOString(),
    };
  }, []);

  const deduplicateStudents = useCallback((students: Student[]) => {
    return Array.from(
      new Map(
        students.map((s) => [(s.id ? `${s.id}-${s.mail}` : s.mail), s])
      ).values()
    );
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const apiUsers: ApiUser[] = await res.json();
      const apiStudents = apiUsers.map(transformApiUserToStudent);
      const localStudents = getLocalStudents();
      const combined = [...localStudents, ...apiStudents];
      const uniqueStudents = deduplicateStudents(combined);
      setStudents(uniqueStudents);
    } catch (fetchError) {
      console.error("Failed to fetch students:", fetchError);
      setError("Failed to load students. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [getLocalStudents, deduplicateStudents, transformApiUserToStudent]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // --- Filter & Search Logic ---
  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return students;

    if (filterType === "all") {
      return students.filter(
        (s) =>
          (s.firstname ?? "").toLowerCase().includes(term) ||
          (s.lastname ?? "").toLowerCase().includes(term) ||
          (s.phone ?? "").toLowerCase().includes(term) ||
          String(s.age ?? "").toLowerCase().includes(term) ||
          (s.role ?? "").toLowerCase().includes(term) ||
          (s.mail ?? "").toLowerCase().includes(term)
      );
    }

    return students.filter((student) => {
      const value = student[filterType];
      return String(value ?? "").toLowerCase().includes(term);
    });
  }, [students, searchTerm, filterType]);

  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) =>
      (a.firstname ?? "").toLowerCase().localeCompare((b.firstname ?? "").toLowerCase())
    );
  }, [filteredStudents]);

  // Pagination
  const totalPages = Math.ceil(sortedStudents.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedStudents.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  // --- Event Handlers ---
  const handleLogout = useCallback(() => {
    if (typeof window !== "undefined" && window.confirm("Are you sure you want to logout?")) {
      try {
        sessionStorage.clear();
        localStorage.removeItem("userToken");
      } catch (error) {
        console.error("Error clearing storage:", error);
      }
      onLogoutAction();
    }
  }, [onLogoutAction]);

  const handleAddStudent = async (newStudent: Student) => {
    setError("");
    setSuccess("");
    try {
      const studentWithDate = {
        ...newStudent,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      };

      try {
        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(studentWithDate),
        });
        
        if (response.ok) {
          const addedStudent = await response.json();
          saveLocalStudent({ ...studentWithDate, id: addedStudent.id || studentWithDate.id });
        } else {
          saveLocalStudent(studentWithDate);
        }
      } catch (apiError) {
        console.warn("API call failed, saving locally:", apiError);
        saveLocalStudent(studentWithDate);
      }

      setStudents((prev) => deduplicateStudents([studentWithDate, ...prev]));
      setSuccess("Student added successfully! 🎉");
      setAddModalOpen(false);
      setSearchTerm("");
    } catch (error) {
      console.error("Error adding student:", error);
      setError("Failed to add student. Please try again.");
    }
  };

  const handleEditStudent = (student: Student) => {
    setCurrentStudent({ ...student, id: student.id ?? student.mail });
    setEditModalOpen(true);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm("Delete this student? This action cannot be undone.")) return;
    
    setError("");
    setSuccess("");
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
        if (!response.ok && response.status !== 404) {
          console.warn("API delete failed, but continuing with local removal");
        }
      } catch (apiError) {
        console.warn("API delete failed:", apiError);
      }

      setStudents((prev) => deduplicateStudents(prev.filter((s) => s.id !== id)));
      removeLocalStudent(id);
      setSuccess("Student deleted successfully! ✅");
    } catch (error) {
      console.error("Error deleting student:", error);
      setError("Failed to delete student. Please try again.");
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent?.id) return;

    setError("");
    setSuccess("");
    try {
      const updateData = {
        ...currentStudent,
        date: currentStudent.date ?? new Date().toISOString(),
      };

      try {
        const response = await fetch(`${API_BASE_URL}/${currentStudent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });
        
        if (!response.ok) {
          console.warn("API update failed, but continuing with local update");
        }
      } catch (apiError) {
        console.warn("API update failed:", apiError);
      }

      setStudents((prev) =>
        deduplicateStudents(
          prev.map((s) => (s.id === currentStudent.id ? updateData : s))
        )
      );
      setSuccess("Student updated successfully! 🎉");
      setEditModalOpen(false);
      setCurrentStudent(null);
    } catch (error) {
      console.error("Error updating student:", error);
      setError("Failed to update student. Please try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentStudent((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(new Set(currentRows.map((s) => s.id ?? s.mail)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
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
    { key: "all", label: "All Fields" },
    { key: "firstname", label: "First Name" },
    { key: "lastname", label: "Last Name" },
    { key: "phone", label: "Phone" },
    { key: "age", label: "Age" },
    { key: "role", label: "Role" },
  ] as const;

  return (
    <ThemeProvider theme={modernTheme}>
      <ErrorBoundary>
        <Box 
          sx={{ 
            display: "flex", 
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <CssBaseline />

          {/* Modern App Bar */}
          <StyledAppBar position="fixed" open={isDrawerOpen && !isMobile}>
            <Toolbar sx={{ gap: 2 }}>
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                sx={{
                  borderRadius: 2,
                  p: 1.5,
                }}
              >
                <Menu size={20} />
              </IconButton>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h6" sx={{ color: "white", fontSize: "1rem" }}>
                    S
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                  StudyFlow
                </Typography>
              </Box>

              <Box sx={{ flexGrow: 1 }} />

              {/* Top Navigation Pills */}
              <Stack direction="row" spacing={1}>
                {menuItems.slice(0, 3).map((item: MenuItem) => {
                  const Icon = item.icon;
                  const isActive = activeMenuItem === item.name;
                  return (
                    <Button
                      key={item.id}
                      component={Link}
                      href={item.path}
                      startIcon={<Icon size={18} />}
                      variant={isActive ? "contained" : "outlined"}
                      sx={{
                        borderRadius: 3,
                        textTransform: "none",
                        fontWeight: 500,
                        px: 2,
                        ...(isActive && {
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }),
                        ...(!isActive && {
                          borderColor: modernTheme.palette.primary.main + "50",
                          color: "text.primary",
                          "&:hover": {
                            borderColor: modernTheme.palette.primary.main,
                            backgroundColor: modernTheme.palette.primary.main + "10",
                          },
                        }),
                      }}
                    >
                      {item.name}
                    </Button>
                  );
                })}
              </Stack>

              {/* User Menu */}
              <IconButton
                onClick={(e) => setUserMenuAnchorEl(e.currentTarget)}
                sx={{ p: 0.5, borderRadius: 2 }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
              </IconButton>
            </Toolbar>
          </StyledAppBar>

          {/* Modern Sidebar */}
          <StyledDrawer
            variant={isMobile ? "temporary" : "permanent"}
            open={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            ModalProps={{ keepMounted: true }}
          >
            <Box sx={{ height: 64 }} />
            <Box sx={{ p: 3, pb: 2 }}>
              <Typography
                variant="overline"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "text.secondary",
                  letterSpacing: 1.2,
                }}
              >
                NAVIGATION
              </Typography>
            </Box>

            <List sx={{ px: 2 }}>
              {menuItems.map((item: MenuItem) => {
                const Icon = item.icon;
                const isActive = activeMenuItem === item.name;
                return (
                  <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      component={Link}
                      href={item.path}
                      sx={{
                        borderRadius: 3,
                        px: 2,
                        py: 1.5,
                        minHeight: 48,
                        backgroundColor: isActive
                          ? modernTheme.palette.primary.main + "20"
                          : "transparent",
                        color: isActive ? "primary.main" : "text.primary",
                        "&:hover": {
                          backgroundColor: modernTheme.palette.primary.main + "10",
                        },
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: "inherit",
                        }}
                      >
                        <Icon size={20} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 600 : 500,
                          fontSize: "0.875rem",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>

            {/* Sidebar Footer */}
            <Box sx={{ mt: "auto", p: 3 }}>
              <StyledCard sx={{ p: 2, textAlign: "center" }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    mx: "auto",
                    mb: 1,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
                <Typography variant="body2" fontWeight={600}>
                  {user?.name || "John Doe"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email || "john@example.com"}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleLogout}
                  sx={{ mt: 1, borderRadius: 2 }}
                  fullWidth
                >
                  Sign Out
                </Button>
              </StyledCard>
            </Box>
          </StyledDrawer>

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              backgroundColor: "transparent",
              minHeight: "100vh",
            }}
          >
            <Box sx={{ height: 64 }} />
            {children}

            <Container maxWidth="xl" sx={{ py: 3 }}>
              {/* Breadcrumb */}
              <Breadcrumbs sx={{ mb: 3, color: "white" }}>
                <Typography color="rgba(255,255,255,0.8)" variant="body2">
                  Dashboard
                </Typography>
                <Typography color="white" variant="body2" fontWeight={600}>
                  Students
                </Typography>
              </Breadcrumbs>

              {/* Page Header */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    color: "white",
                    fontWeight: 800,
                    mb: 1,
                    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  Student Management
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "rgba(255,255,255,0.8)" }}
                >
                  Manage your students efficiently with our modern interface
                </Typography>
              </Box>

              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid component="div" item xs={12} sm={6} md={3}>
                  <StyledCard>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <User size={24} color="white" />
                        </Box>
                        <Box>
                          <Typography variant="h5" fontWeight={700}>
                            {students.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Students
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
                <Grid component="div" item xs={12} sm={6} md={3}>
                  <StyledCard>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            backgroundColor: modernTheme.palette.success.main,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Plus size={24} color="white" />
                        </Box>
                        <Box>
                          <Typography variant="h5" fontWeight={700}>
                            {students.filter(s => {
                              const studentDate = new Date(s.date || '');
                              const now = new Date();
                              return studentDate.getMonth() === now.getMonth() &&
                                     studentDate.getFullYear() === now.getFullYear();
                            }).length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            This Month
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
                <Grid component="div" item xs={12} sm={6} md={3}>
                  <StyledCard>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            backgroundColor: modernTheme.palette.warning.main,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Search size={24} color="white" />
                        </Box>
                        <Box>
                          <Typography variant="h5" fontWeight={700}>
                            {filteredStudents.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Filtered Results
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
                <Grid component="div" item xs={12} sm={6} md={3}>
                  <StyledCard>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            backgroundColor: modernTheme.palette.error.main,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Settings size={24} color="white" />
                        </Box>
                        <Box>
                          <Typography variant="h5" fontWeight={700}>
                            {selectedRows.size}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Selected Students
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              </Grid>

              {/* Alert Messages */}
              {(error || success) && (
                <Box sx={{ mb: 3 }}>
                  {error && (
                    <Alert
                      severity="error"
                      onClose={() => setError("")}
                      sx={{
                        borderRadius: 3,
                        backgroundColor: "rgba(255,255,255,0.95)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      {error}
                    </Alert>
                  )}
                  {success && (
                    <Alert
                      severity="success"
                      onClose={() => setSuccess("")}
                      sx={{
                        borderRadius: 3,
                        backgroundColor: "rgba(255,255,255,0.95)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      {success}
                    </Alert>
                  )}
                </Box>
              )}

              {/* Search and Controls */}
              <StyledCard sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    alignItems="center"
                  >
                    <TextField
                      placeholder={`Search by ${filterType === "all" ? "any field" : filterType}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search size={20} />
                          </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setSearchTerm("")} size="small">
                              <X size={16} />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ flex: 1, minWidth: 300 }}
                    />

                    <Button
                      variant="contained"
                      startIcon={<Plus />}
                      onClick={() => setAddModalOpen(true)}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      }}
                    >
                      Add Student
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<Filter />}
                      endIcon={<ChevronDown />}
                      onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                      sx={{ borderRadius: 3, minWidth: 120 }}
                    >
                      {filterOptions.find(opt => opt.key === filterType)?.label}
                    </Button>
                  </Stack>
                </CardContent>
              </StyledCard>

              {/* Students Table */}
              <StyledCard>
                <ModernTableContainer>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={
                              selectedRows.size === currentRows.length &&
                              currentRows.length > 0
                            }
                            onChange={handleSelectAll}
                            sx={{ borderRadius: 1 }}
                          />
                        </TableCell>
                        <TableCell>First Name</TableCell>
                        <TableCell>Last Name</TableCell>
                        <TableCell>Age</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Join Date</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                            <CircularProgress size={40} />
                            <Typography variant="body2" sx={{ mt: 2 }}>
                              Loading students...
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : currentRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                            <Typography color="text.secondary" variant="h6">
                              No students found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Try adjusting your search or filter criteria
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentRows.map((student) => {
                          const idKey = student.id ?? student.mail;
                          return (
                            <TableRow key={idKey} hover>
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={selectedRows.has(idKey)}
                                  onChange={() => handleSelectRow(idKey)}
                                  sx={{ borderRadius: 1 }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {student.firstname ?? "N/A"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {student.lastname ?? "N/A"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={student.age ?? "N/A"}
                                  size="small"
                                  variant="outlined"
                                  sx={{ borderRadius: 2 }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {student.phone ?? "N/A"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="primary">
                                  {student.mail ?? "N/A"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={student.role ?? "N/A"}
                                  size="small"
                                  sx={{
                                    backgroundColor: modernTheme.palette.success.main + "20",
                                    color: modernTheme.palette.success.main,
                                    fontWeight: 600,
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {student.date
                                    ? new Date(student.date).toLocaleDateString()
                                    : "N/A"}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Stack direction="row" spacing={1} justifyContent="center">
                                  <Tooltip title="Edit student">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEditStudent(student)}
                                      sx={{
                                        backgroundColor: modernTheme.palette.primary.main + "20",
                                        color: "primary.main",
                                        "&:hover": {
                                          backgroundColor: modernTheme.palette.primary.main + "30",
                                        },
                                      }}
                                    >
                                      <Edit3 size={16} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete student">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeleteStudent(idKey)}
                                      sx={{
                                        backgroundColor: modernTheme.palette.error.main + "20",
                                        color: "error.main",
                                        "&:hover": {
                                          backgroundColor: modernTheme.palette.error.main + "30",
                                        },
                                      }}
                                    >
                                      <Trash2 size={16} />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </ModernTableContainer>

                {/* Pagination */}
                {!loading && sortedStudents.length > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(_, page) => setCurrentPage(page)}
                      color="primary"
                      size="large"
                      sx={{
                        "& .MuiPaginationItem-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Box>
                )}
              </StyledCard>

              {/* Floating Action Button */}
              <Fab
                color="primary"
                onClick={() => setAddModalOpen(true)}
                sx={{
                  position: "fixed",
                  bottom: 24,
                  right: 24,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  width: 64,
                  height: 64,
                  zIndex: 1000,
                }}
              >
                <Plus size={24} />
              </Fab>

              {/* Menus */}
              <MuiMenu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={() => setFilterAnchorEl(null)}
                PaperProps={{
                  sx: {
                    borderRadius: 3,
                    minWidth: 200,
                    boxShadow: modernTheme.shadows[8],
                  },
                }}
              >
                {filterOptions.map(({ key, label }) => (
                  <MenuItem
                    key={key}
                    selected={filterType === key}
                    onClick={() => {
                      setFilterType(key);
                      setFilterAnchorEl(null);
                    }}
                    sx={{ borderRadius: 2, mx: 1 }}
                  >
                    {label}
                  </MenuItem>
                ))}
              </MuiMenu>

              <MuiMenu
                anchorEl={userMenuAnchorEl}
                open={Boolean(userMenuAnchorEl)}
                onClose={() => setUserMenuAnchorEl(null)}
                PaperProps={{
                  sx: {
                    borderRadius: 3,
                    minWidth: 200,
                    boxShadow: modernTheme.shadows[8],
                  },
                }}
              >
                <MenuItem onClick={() => setUserMenuAnchorEl(null)}>
                  <Settings size={16} />
                  <Box sx={{ ml: 2 }}>Settings</Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                  <User size={16} />
                  <Box sx={{ ml: 2 }}>Sign Out</Box>
                </MenuItem>
              </MuiMenu>

              {/* Edit Modal */}
              <Dialog
                open={editModalOpen}
                onClose={() => {
                  setEditModalOpen(false);
                  setCurrentStudent(null);
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                  sx: {
                    borderRadius: 4,
                    boxShadow: modernTheme.shadows[24],
                  },
                }}
              >
                <DialogTitle sx={{ pb: 1 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Edit Student Details
                  </Typography>
                </DialogTitle>
                <DialogContent>
                  <Box
                    component="form"
                    onSubmit={handleUpdateStudent}
                    sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    <Grid container spacing={2}>
                      {(["firstname", "lastname", "age", "phone", "mail", "role"] as const).map(
                        (field) => (
                          <Grid item xs={12} sm={field === "age" ? 6 : 12} key={field}>
                            <TextField
                              name={field}
                              label={
                                field === "mail"
                                  ? "Email Address"
                                  : field.charAt(0).toUpperCase() + field.slice(1)
                              }
                              type={
                                field === "age"
                                  ? "number"
                                  : field === "mail"
                                  ? "email"
                                  : "text"
                              }
                              value={(currentStudent as Student)?.[field as keyof Student] ?? ""}
                              onChange={handleInputChange}
                              required={field !== "role"}
                              fullWidth
                              variant="outlined"
                            />
                          </Grid>
                        )
                      )}
                    </Grid>
                  </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 2 }}>
                  <Button
                    onClick={() => {
                      setEditModalOpen(false);
                      setCurrentStudent(null);
                    }}
                    variant="outlined"
                    sx={{ borderRadius: 3 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateStudent}
                    variant="contained"
                    sx={{
                      borderRadius: 3,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                    disabled={
                      loading ||
                      !currentStudent ||
                      (["firstname", "lastname", "age", "phone", "mail"] as (keyof Student)[]).some(
                        (f) => !currentStudent?.[f]
                      )
                    }
                  >
                    Save Changes
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Add Student Modal */}
              <AddStudentModal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAddStudent={handleAddStudent}
              />
            </Container>
          </Box>
        </Box>
      </ErrorBoundary>
    </ThemeProvider>
  );
}