import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
    const [userEmail, setUserEmail] = useState('');
    const [userPw, setUserPw] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const isValidEmail = (value: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    const isValidPw = (value: string) => /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[\W_]).{8,20}$/.test(value);
    const isFormValid = isValidEmail(userEmail) && isValidPw(userPw);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isFormValid || isLoading) return;

        setIsLoading(true);
        try {
            await login({ email: userEmail, pw: userPw });
            navigate('/');
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
            else toast.error("로그인 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-center text-gray-900">
                        My Trip App
                    </h1>
                    <p className="mt-2 text-sm text-center text-gray-600">
                        로그인하고 여행 계획을 시작하세요
                    </p>
                </div>
                <form onSubmit={handleLogin} className="mt-8 space-y-6">
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="userEmail" className="sr-only">이메일 주소</label>
                            <input
                                id="userEmail"
                                type="email"
                                autoComplete="email"
                                required
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="이메일 주소"
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="userPw" className="sr-only">비밀번호</label>
                            <input
                                id="userPw"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={userPw}
                                onChange={(e) => setUserPw(e.target.value)}
                                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="비밀번호"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-auto text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={!isFormValid || isLoading}
                            className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '로그인 중...' : '로그인'}
                        </button>
                    </div>
                </form>

                {/* 소셜 로그인 버튼 영역 */}
                <div className="relative mt-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 text-gray-500 bg-white">또는</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                    {/* 실제로는 onClick 핸들러에 각 소셜 로그인 로직을 연결해야 합니다. */}
                    <button className="inline-flex justify-center w-full py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Google</button>
                    <button className="inline-flex justify-center w-full py-2 text-sm font-medium text-gray-700 bg-yellow-300 border border-transparent rounded-md shadow-sm hover:bg-yellow-400">Kakao</button>
                </div>

                <p className="mt-6 text-sm text-center">
                    <Link to="/sign/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                        계정이 없으신가요? 회원가입
                    </Link>
                </p>
            </div>
        </div>
    );
}