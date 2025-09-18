import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { HiMenu } from "react-icons/hi";
import { FaBell } from "react-icons/fa"; // [추가] 알림 아이콘 import
import { useAuth } from "../contexts/AuthContext";
import NotificationDropdown from "./header/NotificationDropdown";
import { PLAN_URL } from "../config"; // [추가] API 호출을 위해 import

// [추가] 초대장 데이터 타입을 정의합니다.
export interface Invitation {
    tripId: string;
    tripTitle: string;
    inviterId: string;
    inviterNickname: string;
}

export default function Header() {
    const [bgColor, setBgColor] = useState("transparent");
    const [menuOpen, setMenuOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false); // [추가] 알림 드롭다운 상태
    const [invitations, setInvitations] = useState<Invitation[]>([]); // [추가] 초대 목록 상태

    const { isLoggedIn, logout, user } = useAuth();
    const menuRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null); // [추가] 알림 영역을 위한 ref

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

    // [수정] 외부 클릭 감지 로직을 확장하여 알림 드롭다운도 닫도록 함
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (menuRef.current && !menuRef.current.contains(target)) {
                setMenuOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(target)) {
                setNotificationOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // [추가] 로그인 상태일 때 초대 목록을 불러오는 로직
    useEffect(() => {
        if (isLoggedIn) {
            const fetchInvitations = async () => {
                try {
                    const response = await fetch(`${PLAN_URL}/trip/member/invitations/me`, { credentials: 'include' });
                    if (!response.ok) return;
                    const data: Invitation[] = await response.json();
                    setInvitations(data);
                } catch (error) {
                    console.error("초대 목록을 불러오지 못했습니다.", error);
                }
            };
            fetchInvitations();
        } else {
            setInvitations([]); // 로그아웃 시 목록 비우기
        }
    }, [isLoggedIn]);

    // [추가] 메뉴와 알림창 중 하나만 열리도록 하는 토글 함수
    const toggleMenu = () => {
        setNotificationOpen(false);
        setMenuOpen(!menuOpen);
    };

    const toggleNotifications = () => {
        setMenuOpen(false);
        setNotificationOpen(!notificationOpen);
    };

    return (
        <header
            className="fixed top-0 left-0 w-full px-5 py-4 flex justify-between items-center transition-colors duration-300 z-50"
            style={{ backgroundColor: bgColor }}
        >
            <div className="font-bold">
                <Link to="/">
                    <img src="/modapi.png" alt="modapi_logo" className="h-10 w-auto"></img>
                </Link>
            </div>

            <div className="flex items-center space-x-4">
                {isLoggedIn && user && (
                    <span className="text-sm font-medium">
                        환영합니다, {user.nickname || user.name}님!
                    </span>
                )}

                {/* --- [핵심 수정] 알림 아이콘 및 드롭다운 추가 --- */}
                {isLoggedIn && (
                    <div className="relative" ref={notificationRef}>
                        <button onClick={toggleNotifications} className="relative">
                            <FaBell className="text-xl" />
                            {/* 새로운 초대가 있을 경우 빨간 점 표시 */}
                            {invitations.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>
                        {notificationOpen && (
                            <NotificationDropdown
                                invitations={invitations}
                                setInvitations={setInvitations}
                            />
                        )}
                    </div>
                )}

                {/* --- 기존 햄버거 메뉴 --- */}
                <div className="relative" ref={menuRef}>
                    <HiMenu
                        className="text-2xl cursor-pointer"
                        onClick={toggleMenu}
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