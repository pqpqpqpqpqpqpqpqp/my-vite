import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { HiMenu } from "react-icons/hi";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
    const [bgColor, setBgColor] = useState("transparent");
    const [menuOpen, setMenuOpen] = useState(false);
    const { isLoggedIn, logout, user } = useAuth();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll("main section");
            let currentBg = "transparent";

            sections.forEach((section) => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 80 && rect.bottom >= 80) {
                    const bg = window.getComputedStyle(section).backgroundColor;
                    currentBg = bg;
                }
            });

            setBgColor(currentBg);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header
            className="fixed top-0 left-0 w-full px-5 py-4 flex justify-between items-center transition-colors duration-300 z-50"
            style={{ backgroundColor: bgColor }}
        >
            <div className="font-bold">
                <Link to="/">My Application</Link>
            </div>

            <div className="flex items-center space-x-4">
                {isLoggedIn && user && (
                    <span className="text-sm font-medium">
                        환영합니다, {user.nickname || user.name}님!
                    </span>
                )}
                <div className="relative" ref={menuRef}>
                    <HiMenu
                        className="text-2xl cursor-pointer"
                        onClick={() => setMenuOpen(!menuOpen)}
                    />

                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded border border-gray-200 flex flex-col">
                            {isLoggedIn ? (
                                <div className="divide-y flex flex-col">
                                    <div className="divide-none flex flex-col">
                                        <Link
                                            to="/user/profile"
                                            className="px-4 py-2 hover:bg-gray-100 transition"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            프로필
                                        </Link>
                                        <Link
                                            to="/trip/plan/list"
                                            className="px-4 py-2 hover:bg-gray-100 transition"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            내 일정
                                        </Link>
                                    </div>
                                    <button
                                        className="px-4 py-2 text-left hover:bg-gray-100 transition"
                                        onClick={logout}
                                    >
                                        로그아웃
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link
                                        to="/sign/login"
                                        className="px-4 py-2 hover:bg-gray-100 transition"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        로그인
                                    </Link>
                                    <Link
                                        to="/sign/signup"
                                        className="px-4 py-2 hover:bg-gray-100 transition"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        회원가입
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
