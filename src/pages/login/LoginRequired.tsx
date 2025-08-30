import { Link, useLocation } from 'react-router-dom';
import { FaLock } from 'react-icons/fa'; // 아이콘 추가

export default function LoginRequired() {
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    return (
        <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-2xl shadow-lg">
            <div className="flex justify-center">
                <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full">
                    <FaLock className="w-8 h-8 text-indigo-600" />
                </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900">
                로그인이 필요합니다
            </h2>

            <p className="text-gray-600">
                이 페이지에 접근하려면 먼저 로그인해야 합니다.
                <br />
                계속하려면 아래 버튼을 클릭하여 로그인해주세요.
            </p>

            <div className="flex flex-col w-full gap-4 pt-4">
                <Link
                    to="/sign/login"
                    state={{ from: from }}
                    className="w-full px-4 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    로그인 페이지로 이동
                </Link>
                <Link
                    to="/"
                    className="w-full px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    홈으로 돌아가기
                </Link>
            </div>
        </div>
    );
}