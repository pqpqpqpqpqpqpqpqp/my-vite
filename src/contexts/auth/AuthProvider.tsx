import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthProviderProps } from "../../types/login";
import { toast } from "sonner";

export function AuthProvider({ children }: AuthProviderProps) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<number | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("accessToken");
        const storedExpiresAt = localStorage.getItem("expiresAt");

        console.log("실행 확인");

        if (storedToken && storedExpiresAt) {
            if (Date.now() < Number(storedExpiresAt)) {
                setToken(storedToken);
                setExpiresAt(Number(storedExpiresAt));
                setIsLoggedIn(true);
            } else {
                localStorage.clear();
            }
        }
    }, []);

    const login = (data: { accessToken: string; expiresAt: number }) => {
        setIsLoggedIn(true);
        setToken(data.accessToken);
        setExpiresAt(data.expiresAt);

        toast.success("로그인 성공");

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("expiresAt", String(data.expiresAt));
    };

    const logout = async () => {
        /*
        try {
            await fetch("http://localhost:8080/api/user/logout", { method: "POST" });
        } catch (error) {
            if (error instanceof Error) toast.error(`로그아웃 실패: ${error.message}`);
            else toast.error("로그아웃 실패: 알 수 없는 오류");
        }
        */
        setIsLoggedIn(false);
        setToken(null);
        setExpiresAt(null);
        localStorage.clear();
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, token, expiresAt, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
