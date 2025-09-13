// // src/context/AuthContext.tsx
// import React, { createContext, useState, useEffect, type ReactNode, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';

// interface User {
//     id: number;
//     username: string;
//     role: string;
// }

// interface AuthContextType {
//     user: User | null;
//     token: string | null;
//     login: (userData: User, token: string) => void;
//     logout: () => void;
//     isAuthenticated: boolean;
// }

// export const AuthContext = createContext<AuthContextType | null>(null);

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (!context) {
//         throw new Error("useAuth must be used within an AuthProvider");
//     }
//     return context;
// };

// interface AuthProviderProps {
//     children: ReactNode;
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//     const [user, setUser] = useState<User | null>(null);
//     const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
//     const navigate = useNavigate();

//     useEffect(() => {
//         const storedUser = localStorage.getItem('user');
//         if (storedUser && token) {
//             try {
//                 // ตรวจสอบว่า token มี 3 ส่วนหรือไม่ (Header.Payload.Signature)
//                 if (token.split('.').length !== 3) {
//                     throw new Error("Invalid token format");
//                 }
//                 const payload = JSON.parse(atob(token.split('.')[1]));
//                 if (payload.exp * 1000 < Date.now()) {
//                     console.log("Token has expired, logging out.");
//                     logout();
//                     return;
//                 }
//                 setUser(JSON.parse(storedUser));
//             } catch (error) {
//                 console.error("Failed to parse token or user data, logging out.", error);
//                 logout();
//             }
//         }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [token]);

//     const login = (userData: User, token: string) => {
//         localStorage.setItem('user', JSON.stringify(userData));
//         localStorage.setItem('token', token);
//         setUser(userData);
//         setToken(token);
//     };

//     const logout = () => {
//         localStorage.removeItem('user');
//         localStorage.removeItem('token');
//         setUser(null);
//         setToken(null);
//         navigate('/login');
//     };

//     const isAuthenticated = !!token;

//     return (
//         <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

import React, { createContext, useState, useEffect, type ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    id: number;
    username: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: User, token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean; // เพิ่ม isLoading
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true); // เพิ่ม state สำหรับ loading
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && token) {
            try {
                if (token.split('.').length !== 3) {
                    throw new Error("Invalid token format");
                }
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.exp * 1000 < Date.now()) {
                    console.log("Token has expired, logging out.");
                    logout(); // ใช้ logout function เพื่อความสอดคล้อง
                } else {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Failed to parse token or user data, logging out.", error);
                logout(); // ใช้ logout function เพื่อความสอดคล้อง
            }
        }
        setIsLoading(false); // ตั้งค่าเป็น false เมื่อตรวจสอบเสร็จ
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const login = (userData: User, token: string) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);
        setToken(token);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        navigate('/login');
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
