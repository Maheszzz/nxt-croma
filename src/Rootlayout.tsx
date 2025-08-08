"use client";

import React, { useContext, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { MenuContext, MenuProvider } from "./components/MenuContext";

// Dummy session check function (replace with real logic)
function useSession() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    // Replace with real session check
    const session = localStorage.getItem("session");
    setIsAuthenticated(!!session);
  }, []);
  return isAuthenticated;
}

// Dummy page components (replace with real ones)
const Home = () => <div>Home Page</div>;
const About = () => <div>About Page</div>;
const Finance = () => <div>Finance Page</div>;
const Travel = () => <div>Travel Page</div>;
const Academic = () => <div>Academic Page</div>;
const NotFound = () => <div>404 - Not Found</div>;

// Define ValidPaths as string literal union
type ValidPath = "/" | "/about" | "/finance" | "/travel" | "/academic";

// MenuItem interface with icon prop typed without empty object type
interface MenuItem {
  path: ValidPath | string; // allow string for flexibility if needed
  name: string;
  icon?: React.ComponentType; // <-- updated here
}

// Map menu paths to components strictly typed by ValidPath
const componentMap: Record<ValidPath, React.FC> = {
  "/": Home,
  "/about": About,
  "/finance": Finance,
  "/travel": Travel,
  "/academic": Academic,
};

function AppRoutes() {
  const { menuItems } = useContext(MenuContext);
  const isAuthenticated = useSession();
  const location = useLocation();

  if (!isAuthenticated && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {menuItems.map((item: MenuItem) => {
        // Type cast item.path for safe access to componentMap and fallback
        const Component =
          (componentMap as Record<string, React.FC>)[item.path] || NotFound;
        return <Route key={item.path} path={item.path} element={<Component />} />;
      })}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function Rootlayout() {
  return (
    <MenuProvider>
      <Router>
        <AppRoutes />
      </Router>
    </MenuProvider>
  );
}
