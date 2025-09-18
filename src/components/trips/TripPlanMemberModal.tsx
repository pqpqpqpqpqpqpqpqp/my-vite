import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { TripDTO } from '../../types/trip';
import { PLAN_URL, BASE_URL } from '../../config';
import { toast } from 'sonner';
import { FaTimes, FaCrown } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

interface TripMember {
    userId: string;
    nickname: string | null;
    profileImg: string | "/default_profile.png";
    role: "OWNER" | "MEMBER" | string;
}

interface TripPlanMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTrip: TripDTO;
}

export default function TripPlanMemberModal({ isOpen, onClose, currentTrip }: TripPlanMemberModalProps) {
    const { user: currentUser } = useAuth();
    const [members, setMembers] = useState<TripMember[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<TripMember[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isInviting, setIsInviting] = useState<string | null>(null);

    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/users/search?nickname=${searchQuery}`);
                if (!response.ok) throw new Error("검색 실패");
                const data: TripMember[] = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchMembers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${PLAN_URL}/trip/member/${currentTrip.tripId}/list`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('멤버 목록을 불러오는 데 실패했습니다.');
            }

            const data: TripMember[] = await response.json();
            setMembers(data);

        } catch (error) {
            console.error(error);
            toast.error((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [currentTrip.tripId]);

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
        }
    }, [isOpen, fetchMembers]);

    const handleInvite = async (targetUserId: string) => {
        if (!currentUser) {
            toast.error("사용자 정보가 없어 초대할 수 없습니다.");
            return;
        }

        setIsInviting(targetUserId);
        try {
            const response = await fetch(`${PLAN_URL}/trip/member/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },

                body: JSON.stringify({
                    tripId: currentTrip.tripId,
                    userId: targetUserId,

                    role: "MEMBER",
                    status: "INVITED",
                    inviterId: currentUser.userId
                }),

                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || "초대에 실패했습니다.");
            }

            toast.success("성공적으로 초대했습니다.");

        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsInviting(null);
        }
    };

    const handleLeave = async () => {
        if (!currentUser) return;
        if (window.confirm("정말로 이 여행에서 나가시겠습니까?")) {
            try {
                const response = await fetch(`${PLAN_URL}/trip/member/${currentTrip.tripId}/${currentUser.userId}/left`, {
                    method: 'POST', credentials: 'include'
                });
                if (!response.ok) throw new Error("나가기에 실패했습니다.");
                toast.info("여행에서 나갔습니다.");
                onClose(); // 모달 닫기
            } catch (error) {
                toast.error((error as Error).message);
            }
        }
    };

    const isAlreadyMember = (userId: string) => members.some(m => m.userId === userId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6" onClick={e => e.stopPropagation()}>
                {/* 헤더 */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-900">멤버 관리</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100"><FaTimes /></button>
                </div>

                {/* 멤버 목록 */}
                <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">현재 멤버 ({members.length}명)</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {isLoading ? <div className="text-center"><ClipLoader size={20} /></div> : members.map(member => (
                            <div key={member.userId} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                <img src={member.profileImg || '/default_profile.png'} className="w-8 h-8 rounded-full object-cover" />
                                <span className="font-medium">{member.nickname}</span>
                                {member.role === 'OWNER' && <FaCrown className="text-yellow-500" title="소유자" />}
                                {member.userId === currentUser?.userId && <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">나</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 멤버 초대 (소유자에게만 보임) */}
                {currentUser?.userId === currentTrip.ownerId && (
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">멤버 초대하기</h4>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="초대할 사용자의 닉네임을 입력하세요 (2자 이상)"
                            className="w-full px-3 py-2 border rounded-md"
                        />
                        <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                            {isSearching && <div className="text-center p-2"><ClipLoader size={20} /></div>}
                            {!isSearching && searchResults.map(result => (
                                <div key={result.userId} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <img src={result.profileImg || '/default_profile.png'} className="w-8 h-8 rounded-full" />
                                        <span className="font-medium">{result.nickname}</span>
                                    </div>
                                    <button
                                        onClick={() => handleInvite(result.userId)}
                                        disabled={isAlreadyMember(result.userId) || isInviting === result.userId}
                                        className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                                    >
                                        {isInviting === result.userId ? <ClipLoader size={16} color="white" /> : (isAlreadyMember(result.userId) ? '참여중' : '초대')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 여행 떠나기 버튼 (소유자가 아닌 멤버에게만 보임) */}
                {currentUser && isAlreadyMember(currentUser.userId) && currentUser.userId !== currentTrip.ownerId && (
                    <div className="mt-6 border-t pt-4">
                        <button
                            onClick={handleLeave}
                            className="w-full text-left text-sm text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50"
                        >
                            이 여행에서 나가기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}