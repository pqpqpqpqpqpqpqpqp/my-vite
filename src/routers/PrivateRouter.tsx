import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRouter({ children }: PropsWithChildren) {
    const { isLoggedIn } = useAuth();
    const location = useLocation();

    if (!isLoggedIn) {
        return <Navigate to="/sign/required" state={{ from: location }} replace />;
    }

    return children;
}
