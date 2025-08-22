import type { ReactNode } from "react";

export interface AuthContextType {
    isLoggedIn: boolean;
    token: string | null;
    expiresAt: number | null;
    login: (data: { accessToken: string; expiresAt: number; }) => void;
    logout: () => Promise<void>;
}

export interface AuthProviderProps {
    children: ReactNode;
}

export interface PrivateRouteProps {
    children: ReactNode;
}