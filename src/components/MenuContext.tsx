"use client";

import React, { useState, useEffect, createContext } from 'react';
import { Home, User, DollarSign, Plane, GraduationCap } from 'lucide-react';

// Types
interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface MenuContextType {
  menuItems: MenuItem[];
}

// Create context with type
export const MenuContext = createContext<MenuContextType>({
  menuItems: [],
});

interface MenuProviderProps {
  children: React.ReactNode;
}

// Default menu
const defaultMenu: MenuItem[] = [
  { id: '1', name: 'Home', path: '/', icon: Home },
  { id: '2', name: 'About', path: '/about', icon: User },
  { id: '3', name: 'Finance', path: '/finance', icon: DollarSign },
  { id: '4', name: 'Travel', path: '/travel', icon: Plane },
  { id: '5', name: 'Academic', path: '/academic', icon: GraduationCap },
];

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Home,
  User,
  DollarSign,
  Plane,
  GraduationCap,
};

export function MenuProvider({ children }: MenuProviderProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenu);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('/menu.json');
        if (!response.ok) throw new Error(`Failed to fetch menu: ${response.status}`);
        const data: { id: number; name: string; path: string; icon: string }[] = await response.json();
        const mappedData = data.map((item) => ({
          id: String(item.id),
          name: item.name,
          path: item.path,
          icon: iconMap[item.icon] || User,
        }));
        setMenuItems(mappedData);
      } catch (error) {
        console.error('MenuProvider: Failed to fetch menu:', error);
      }
    };
    fetchMenu();
  }, []);

  return <MenuContext.Provider value={{ menuItems }}>{children}</MenuContext.Provider>;
}
