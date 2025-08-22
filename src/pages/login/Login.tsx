import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { toast } from 'sonner';

export default function Login() {
    const [userEmail, setUserEmail] = useState('');
    const [userPw, setUserPw] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const isValidEmail = (value: string) =>
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    const isValidPw = (value: string) =>
        /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[\W_]).{8,20}$/.test(value);

    const isFormValid =
        (isValidEmail(userEmail)) &&
        isValidPw(userPw);

    const inputClass = (valid: boolean | null) =>
        `p-3 border rounded-lg focus:outline-none focus:ring-2 ${valid === null
            ? 'border-gray-300 focus:ring-blue-400'
            : valid
                ? 'border-green-500 focus:ring-green-400'
                : 'border-red-500 focus:ring-red-400'
        }`;

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, pw: userPw }),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('로그인 성공');
                login(data);
                navigate('/');
            } else {
                toast.error('로그인 실패');
            }
        } catch (error) {
            if (error instanceof Error) toast.error(`로그인 실패: ${error.message}`);
            else toast.error("로그인 실패: 알 수 없는 오류");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-center">로그인</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input
                    type="text"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="이메일 또는 전화번호"
                    required
                    className={inputClass(
                        userEmail === ''
                            ? null
                            : isValidEmail(userEmail)
                    )}
                />
                <input
                    type="password"
                    value={userPw}
                    onChange={(e) => setUserPw(e.target.value)}
                    placeholder="비밀번호 (영문, 숫자, 특수문자 포함 8~20자)"
                    required
                    className={inputClass(userPw === '' ? null : isValidPw(userPw))}
                />
                <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`p-3 rounded-lg transition-colors ${isFormValid
                        ? 'bg-blue-400 text-white hover:bg-blue-500'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    로그인
                </button>
            </form>
            <p className="mt-4 text-sm text-gray-600 text-center">
                아직 회원이 아니신가요?{' '}
                <Link to="/sign/signup" className="text-blue-600 hover:underline">
                    회원가입
                </Link>
            </p>
        </div>
    );
}
