import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TripDTO } from '../../types/trip';
import { PLAN_URL } from '../../config';
import { toast } from 'sonner';
import { FaTimes } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

interface CopyPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    tripToCopy: TripDTO;
}

interface MyTrip {
    tripId: string;
    tripTitle: string;
}

export default function CopyPlanModal({ isOpen, onClose, tripToCopy }: CopyPlanModalProps) {
    const navigate = useNavigate();
    const [copyMode, setCopyMode] = useState<'all' | 'days'>('all');
    const [newTripTitle, setNewTripTitle] = useState(`${tripToCopy.tripTitle} (복사본)`);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [daysCopyTarget, setDaysCopyTarget] = useState<'new' | 'my'>('new');
    const [myTrips, setMyTrips] = useState<MyTrip[]>([]);
    const [selectedMyTripId, setSelectedMyTripId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // 모달이 열릴 때 데이터를 불러옵니다.
            const fetchMyTrips = async () => {
                try {
                    const response = await fetch(`${PLAN_URL}/trip/plan/lists`, { credentials: 'include' });
                    const data: MyTrip[] = await response.json();
                    setMyTrips(data);
                    if (data.length > 0) {
                        setSelectedMyTripId(data[0].tripId);
                    }
                } catch (error) {
                    console.error("나의 여행 목록을 불러오는데 실패했습니다.", error);
                }
            };
            fetchMyTrips();
        } else {
            // 모달이 닫힐 때 모든 상태를 초기화합니다.
            setCopyMode('all');
            setNewTripTitle(`${tripToCopy.tripTitle} (복사본)`);
            setSelectedDays([]);
            setDaysCopyTarget('new');
        }
    }, [isOpen, tripToCopy.tripTitle]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);


    const handleDayCheckboxChange = (tripDayId: string) => {
        setSelectedDays(prev =>
            prev.includes(tripDayId) ? prev.filter(id => id !== tripDayId) : [...prev, tripDayId]
        );
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            let response;
            let body;

            if (copyMode === 'all') {
                // API 1: 전체 복사
                response = await fetch(`${PLAN_URL}/trip/copy/all/${tripToCopy.tripId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tripDTO: { tripTitle: newTripTitle }, startDayOrder: 1 }),
                    credentials: 'include'
                });
            } else { // 'days' 모드
                if (selectedDays.length === 0) {
                    toast.error("하나 이상의 날짜를 선택해주세요.");
                    return;
                }
                if (daysCopyTarget === 'new') {
                    // API 2: 일부 날짜 -> 새 여행
                    body = { fromTripId: tripToCopy.tripId, tripDayIds: selectedDays, tripTitle: newTripTitle };
                    response = await fetch(`${PLAN_URL}/trip/copy/days/new`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body),
                        credentials: 'include'
                    });
                } else {
                    // API 3: 일부 날짜 -> 내 여행
                    body = { fromTripId: tripToCopy.tripId, toTripId: selectedMyTripId, tripDayIds: selectedDays };
                    response = await fetch(`${PLAN_URL}/trip/copy/days/my`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body),
                        credentials: 'include'
                    });
                }
            }

            if (!response.ok) throw new Error("가져오기에 실패했습니다.");

            toast.success("일정을 성공적으로 가져왔습니다!");
            // 새 여행이 생성된 경우, 해당 여행의 편집 페이지로 이동하는 것이 좋음
            if (copyMode === 'all' || (copyMode === 'days' && daysCopyTarget === 'new')) {
                const newTrip = await response.json();
                navigate(`/trip/plan/detail/${newTrip.tripId}`);
            } else {
                onClose(); // 기존 여행에 추가한 경우 모달만 닫음
            }

        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getSubmitButtonText = () => {
        if (copyMode === 'all' || (copyMode === 'days' && daysCopyTarget === 'new')) {
            return "새로운 여행으로 가져오기";
        }
        return "선택한 여행에 추가하기";
    };

    if (!isOpen) {
        return null;
    }

    return (
        // 1. 모달 배경 (Backdrop)
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={onClose} // 배경 클릭 시 모달 닫기
        >
            {/* 2. 모달 컨텐츠 패널 */}
            <div
                className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl flex flex-col"
                onClick={(e) => e.stopPropagation()} // 컨텐츠 내부 클릭 시 닫히는 것을 방지
            >
                {/* 모달 헤더 */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold leading-6 text-gray-900">
                        여행 일정 가져오기
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* 옵션 1: 복사 방식 선택 */}
                <div className="space-y-2">
                    <label className="font-semibold text-gray-700">가져오기 방식</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setCopyMode('all')} className={`p-3 rounded-lg text-center font-medium transition ${copyMode === 'all' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>전체 일정 가져오기</button>
                        <button onClick={() => setCopyMode('days')} className={`p-3 rounded-lg text-center font-medium transition ${copyMode === 'days' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>일부 날짜만 선택</button>
                    </div>
                </div>

                {/* 옵션 2: 세부 설정 (조건부 렌더링) */}
                <div className="mt-4 space-y-4">
                    {copyMode === 'all' && (
                        <div>
                            <label htmlFor="newTripTitleAll" className="block text-sm font-medium text-gray-700 mb-1">새로운 여행 제목</label>
                            <input type="text" id="newTripTitleAll" value={newTripTitle} onChange={e => setNewTripTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    )}

                    {copyMode === 'days' && (
                        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                            <div>
                                <label className="font-semibold text-gray-700 mb-2 block">가져올 날짜 선택 ({selectedDays.length}개 선택)</label>
                                <div className="max-h-32 overflow-y-auto space-y-2 pr-2 border-t pt-2">
                                    {tripToCopy.tripDays.map(day => (
                                        <label key={day.tripDayId} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 cursor-pointer">
                                            <input type="checkbox" checked={selectedDays.includes(day.tripDayId)} onChange={() => handleDayCheckboxChange(day.tripDayId)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            <span>{day.dayOrder}일차</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="font-semibold text-gray-700">선택한 날짜를</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setDaysCopyTarget('new')} className={`p-3 rounded-lg text-center font-medium transition ${daysCopyTarget === 'new' ? 'bg-blue-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>새로운 여행으로 만들기</button>
                                    <button onClick={() => setDaysCopyTarget('my')} className={`p-3 rounded-lg text-center font-medium transition ${daysCopyTarget === 'my' ? 'bg-blue-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>기존 여행에 추가</button>
                                </div>
                            </div>

                            {daysCopyTarget === 'new' && (
                                <div>
                                    <label htmlFor="newTripTitleDays" className="block text-sm font-medium text-gray-700 mb-1">새로운 여행 제목</label>
                                    <input type="text" id="newTripTitleDays" value={newTripTitle} onChange={e => setNewTripTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            )}

                            {daysCopyTarget === 'my' && (
                                <div>
                                    <label htmlFor="myTripSelect" className="block text-sm font-medium text-gray-700 mb-1">추가할 여행 선택</label>
                                    {myTrips.length > 0 ? (
                                        <select id="myTripSelect" value={selectedMyTripId} onChange={e => setSelectedMyTripId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                            {myTrips.map(trip => <option key={trip.tripId} value={trip.tripId}>{trip.tripTitle}</option>)}
                                        </select>
                                    ) : <p className="text-sm text-gray-500">추가할 수 있는 여행이 없습니다.</p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 모달 푸터: 액션 버튼 */}
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                        onClick={onClose}
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        className="inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-blue-300"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <ClipLoader color="#FFFFFF" size={16} />}
                        {getSubmitButtonText()}
                    </button>
                </div>
            </div>
        </div>
    );
}