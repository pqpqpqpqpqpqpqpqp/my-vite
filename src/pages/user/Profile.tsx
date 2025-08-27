import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Profile() {
    const { user, isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        return <Navigate to="/sign/login" replace />;
    }

    if (!user) {
        // 사용자 정보가 아직 로드되지 않았을 경우
        return <div>사용자 정보를 불러오는 중...</div>;
    }

    return (
        <div className="w-full max-w-lg p-8 mx-auto mt-10 bg-white rounded-2xl shadow-lg">
            <div className="flex flex-col items-center space-y-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">프로필 정보</h1>

                {/* 프로필 이미지 */}
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500">
                    <img
                        src={user.profileImg || '/default_profile.jpg'}
                        alt={`${user.nickname || user.name}의 프로필 이미지`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // 이미지를 불러오지 못했을 경우 기본 이미지로 대체
                            e.currentTarget.src = '/default_profile.jpg';
                        }}
                    />
                </div>

                {/* 사용자 정보 */}
                <div className="w-full text-left space-y-4">
                    <div className="pb-2 border-b">
                        <label className="block text-sm font-medium text-gray-500">이름</label>
                        <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                    </div>
                    <div className="pb-2 border-b">
                        <label className="block text-sm font-medium text-gray-500">닉네임</label>
                        <p className="text-lg font-semibold text-gray-900">{user.nickname || '닉네임이 설정되지 않았습니다.'}</p>
                    </div>
                    <div className="pb-2 border-b">
                        <label className="block text-sm font-medium text-gray-500">이메일</label>
                        <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                    </div>
                    <div className="pb-2 border-b">
                        <label className="block text-sm font-medium text-gray-500">생년월일</label>
                        <p className="text-lg font-semibold text-gray-900">{user.birth}</p>
                    </div>
                    <div className="pb-2">
                        <label className="block text-sm font-medium text-gray-500">성별</label>
                        <p className="text-lg font-semibold text-gray-900">{user.gender === 'MALE' ? '남성' : '여성'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}