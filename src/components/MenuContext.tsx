// MenuContext.jsx
import React,{ useState, useEffect, useMemo, createContext } from 'react';
import { Home, User, DollarSign, Plane, GraduationCap } from 'lucide-react';

// Create the MenuContext here
const MenuContext = createContext();

export { MenuContext };

export function MenuProvider({ children }) {
    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await fetch('/menu.json');
                if (!response.ok) throw new Error(`Failed to fetch menu: ${response.status}`);
                const data = await response.json();
                const mappedData = menuMap(data);
                setMenuItems(mappedData);
            } catch (error) {
                console.error(error);
                setMenuItems(defaultMenu);
            }
        };
        fetchMenu();
    }, []);

    // Memoize the mapping function and default menu
    const menuMap = useMemo(() => (data) =>
        data.map((item) => ({
            ...item,
            icon: {
                Home,
                User,
                DollarSign,
                Plane,
                GraduationCap,
            }[item.icon] || User,
        }))
        , []);

    const defaultMenu = useMemo(() => [
        { id: 1, name: 'Home', icon: Home, path: '/' },
        { id: 2, name: 'About', icon: User, path: '/about' },
        { id: 3, name: 'Finance', icon: DollarSign, path: '/finance' },
        { id: 4, name: 'Travel', icon: Plane, path: '/travel' },
        { id: 5, name: 'Academic', icon: GraduationCap, path: '/academic' },
    ], []);

    const value = useMemo(() => ({ menuItems }), [menuItems]);

    return (
        <MenuContext.Provider value={value}>
            {children}
        </MenuContext.Provider>
    );
}