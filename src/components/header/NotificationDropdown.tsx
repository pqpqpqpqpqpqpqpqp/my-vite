import { useAuth } from '../../contexts/AuthContext';
import { PLAN_URL } from '../../config';
import { toast } from 'sonner';
import type { Invitation } from '../Header';

interface NotificationDropdownProps {
    invitations: Invitation[];
    setInvitations: React.Dispatch<React.SetStateAction<Invitation[]>>; // 부모의 상태를 변경하는 함수
}

export default function NotificationDropdown({ invitations, setInvitations }: NotificationDropdownProps) {
    const { user } = useAuth();

    const handleResponse = async (action: 'accept' | 'reject', inv: Invitation) => {
        if (!user) return;
        try {
            const response = await fetch(`${PLAN_URL}/trip/member/${inv.tripId}/${user.userId}/${action}/${inv.inviterId}`, {
                method: 'POST',
                credentials: 'include'
            });
            if (!response.ok) throw new Error(`초대 ${action === 'accept' ? '수락' : '거절'}에 실패했습니다.`);

            toast.success(`초대를 ${action === 'accept' ? '수락' : '거절'}했습니다.`);
            // [수정] 부모 컴포넌트의 상태를 직접 업데이트
            setInvitations(prev => prev.filter(i => i.tripId !== inv.tripId));
        } catch (error) {
            toast.error((error as Error).message);
        }
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border p-4">
            <h4 className="font-bold text-lg mb-2">알림</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
                {invitations.length > 0 ? invitations.map(inv => (
                    <div key={inv.tripId} className="p-2 border-b last:border-b-0">
                        <p className="text-sm">
                            <span className="font-semibold">{inv.inviterNickname}</span>님이
                            <span className="font-semibold"> '{inv.tripTitle}'</span> 여행에 초대했습니다.
                        </p>
                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => handleResponse('reject', inv)} className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded">거절</button>
                            <button onClick={() => handleResponse('accept', inv)} className="px-3 py-1 text-xs text-white bg-blue-500 hover:bg-blue-600 rounded">수락</button>
                        </div>
                    </div>
                )) : <p className="text-sm text-gray-500">새로운 알림이 없습니다.</p>}
            </div>
        </div>
    );
}