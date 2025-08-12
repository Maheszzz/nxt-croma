"use client";

import React, { useState, useEffect, useMemo, createContext } from 'react';
import { Home, User, DollarSign, Plane, GraduationCap } from 'lucide-react';

// --- Types ---
interface MenuItem {
  id: number;
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  path: string;
}

interface RawMenuItem {
  id: number;
  name: string;
  icon: keyof typeof iconMap;
  path: string;
}

interface MenuContextType {
  menuItems: MenuItem[];
}

interface MenuProviderProps {
  children: React.ReactNode;
}

// Icon map for mapping string names to components
const iconMap = {
  Home,
  User,
  DollarSign,
  Plane,
  GraduationCap,
};

// Create the MenuContext with a default value
const MenuContext = createContext<MenuContextType>({
  menuItems: [],
});

export { MenuContext };

export function MenuProvider({ children }: MenuProviderProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Memoize the mapping function
  const menuMap = useMemo(
    () => (data: RawMenuItem[]): MenuItem[] =>
      data.map((item) => ({
        ...item,
        icon: iconMap[item.icon] || User,
      })),
    []
  );

  // Memoize the default menu
  const defaultMenu = useMemo<MenuItem[]>(
    () => [
      { id: 1, name: 'Home', icon: Home, path: '/' },
      { id: 2, name: 'About', icon: User, path: '/about' },
      { id: 3, name: 'Finance', icon: DollarSign, path: '/finance' },
      { id: 4, name: 'Travel', icon: Plane, path: '/travel' },
      { id: 5, name: 'Academic', icon: GraduationCap, path: '/academic' }, // <-- correct spelling
    ],
    []
  );

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('/menu.json');
        if (!response.ok) throw new Error(`Failed to fetch menu: ${response.status}`);
        const data: RawMenuItem[] = await response.json();
        const mappedData = menuMap(data);
        setMenuItems(mappedData);
      } catch (error) {
        console.error(error);
        setMenuItems(defaultMenu);
      }
    };
    fetchMenu();
  }, [defaultMenu, menuMap]);

  const value = useMemo(() => ({ menuItems }), [menuItems]);

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}