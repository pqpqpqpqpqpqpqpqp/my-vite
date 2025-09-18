import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/login/Login';
import Signup from '../pages/login/Signup';
import LoginRequired from '../pages/login/LoginRequired';

export default function SignRouter() {
    const { isLoggedIn } = useAuth();

    if (isLoggedIn) {
        return <Navigate to="/" replace />;
    }

    return (
        <div
            className="flex items-center justify-center min-h-screen bg-cover bg-center"
            style={{ backgroundImage: "url('/bluesky.jpg')" }}
        >
            <Routes>
                <Route path="/sign/login" element={<Login />} />
                <Route path="/sign/signup" element={<Signup />} />
                <Route path="/sign/required" element={<LoginRequired />} />
            </Routes>
        </div>
    )
}