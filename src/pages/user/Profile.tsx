import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { User } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FaPencilAlt } from 'react-icons/fa';
import { BASE_URL } from '../../config';

interface PublicUser {
    userId: string;
    nickname: string | null;
    profileImg: string | "/default_profile.png";
}

interface ProfileCardProps {
    user: User;
    isOwnProfile: boolean;
}

function ProfileCard({ user, isOwnProfile }: ProfileCardProps) {
    return (
        <div className="w-full max-w-lg p-8 mx-auto mt-10 bg-white rounded-2xl shadow-lg">
            <div className="flex flex-col items-center space-y-6">
                <div className="w-full flex justify-between items-start">
                    <div className="w-10"></div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">프로필 정보</h1>

                    {isOwnProfile ? (
                        <Link to="/user/profile/edit" className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                            <FaPencilAlt size={20} />
                        </Link>
                    ) : (
                        <div className="w-10"></div>
                    )}
                </div>

                {/* 프로필 이미지 */}
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500">
                    <img
                        src={user.profileImg || '/default_profile.png'}
                        alt={`${user.nickname || user.name}의 프로필 이미지`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = '/default_profile.png'; }}
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

                    {/* 내 프로필일 때만 이메일, 생년월일, 성별 표시 */}
                    {isOwnProfile && (
                        <>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function UserProfilePage() {
    const { userId: paramUserId } = useParams<{ userId: string }>();
    const { user: loggedInUser, isLoggedIn } = useAuth();

    const [profileData, setProfileData] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isOwnProfile = !paramUserId || (loggedInUser?.userId === paramUserId);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            setError(null);

            try {
                if (isOwnProfile) {
                    if (!isLoggedIn) throw new Error("로그인이 필요합니다.");
                    setProfileData(loggedInUser);
                } else {
                    const response = await fetch(`${BASE_URL}/api/users/${paramUserId}`);
                    if (!response.ok) {
                        throw new Error("사용자를 찾을 수 없습니다.");
                    }
                    const data: PublicUser = await response.json();

                    const transformedData: User = {
                        ...data,
                        name: data.nickname || '여행가',
                        email: '',
                        birth: '',
                        gender: '',
                    };
                    setProfileData(transformedData);
                }
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [paramUserId, loggedInUser, isOwnProfile, isLoggedIn]);

    if (isLoading) {
        return <div>프로필 정보를 불러오는 중...</div>;
    }

    if (error || !profileData) {
        return <div className="text-center mt-10 text-red-500">{error || "프로필을 표시할 수 없습니다."}</div>;
    }

    return (
        <ProfileCard user={profileData} isOwnProfile={isOwnProfile} />
    );
}