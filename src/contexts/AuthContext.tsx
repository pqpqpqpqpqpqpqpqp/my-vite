import { useState, useEffect, useContext, createContext, useCallback, useMemo } from "react";
import type { PropsWithChildren } from "react";
import { toast } from "sonner";
import { BASE_URL } from '../config';
import { ClipLoader } from "react-spinners";

export interface User {
    userId: string;
    birth: string;
    email: string;
    gender: string;
    name: string;
    nickname: string | null;
    profileImg: string | "/default_profile.png";
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    login: (credentials: { email: string; pw: string }) => Promise<void>;
    logout: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any | null>(null);

    const checkAuthStatus = useCallback(async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/users/me`, { credentials: 'include' });

            if (response.status === 403) {
                if (isLoggedIn) {
                    toast.info("세션이 만료되어 로그아웃되었습니다.");
                }
                setIsLoggedIn(false);
                setUser(null);
                return;
            }

            if (!response.ok) {
                throw new Error('Not authenticated');
            }

            const userInfo: User = await response.json();
            setIsLoggedIn(true);
            setUser(userInfo);
        } catch (error) {
            if (isLoggedIn) {
                toast.error("인증 상태 확인 중 오류가 발생했습니다.");
            }
            setIsLoggedIn(false);
            setUser(null);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        checkAuthStatus().finally(() => setIsLoading(false));
    }, [checkAuthStatus]);

    const login = useCallback(async (credentials: { email: string; pw: string }) => {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        await checkAuthStatus();
        toast.success("로그인 되었습니다.");
    }, [checkAuthStatus]);

    const logout = useCallback(async () => {
        try {
            await fetch(`${BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
        } finally {
            setIsLoggedIn(false);
            setUser(null);
            toast.info("로그아웃 되었습니다.");
        }
    }, []);

    const value = useMemo(() => ({
        isLoggedIn,
        user,
        login,
        logout,
        checkAuthStatus
    }), [isLoggedIn, user, login, logout, checkAuthStatus]);

    if (isLoading) {
        return (
            <div className="w-full h-screen flex justify-center items-center bg-white">
                <ClipLoader color="#3B82F6" size={50} />
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}