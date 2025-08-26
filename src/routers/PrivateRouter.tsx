import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/auth/useAuth";
import type { PrivateRouteProps } from "../types/login";

function PrivateRoute({ children }: PrivateRouteProps) {
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        if (!isLoggedIn) {
            toast.warning('로그인이 필요한 기능입니다.');
        }
    }, [isLoggedIn]);

    if (!isLoggedIn) {
        return <Navigate to="/sign/required" replace />;
    }

    return children;
}

export default PrivateRoute;