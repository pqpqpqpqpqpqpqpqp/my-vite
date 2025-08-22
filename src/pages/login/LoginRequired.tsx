import { Link } from 'react-router-dom';

export default function LoginRequired() {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="text-center bg-white p-10 rounded-xl shadow-md font-sans">
                <h2 className="mb-5 text-gray-800 text-2xl font-semibold">
                    로그인이 필요한 서비스입니다
                </h2>
                <p className="mb-3">
                    로그인 하러가기:{' '}
                    <Link to="/sign/login" className="text-blue-600 font-bold hover:underline">
                        로그인
                    </Link>
                </p>
                <p>
                    홈으로 돌아가기:{' '}
                    <Link to="/" className="text-blue-600 hover:underline">
                        홈
                    </Link>
                </p>
            </div>
        </div>
    );
}
