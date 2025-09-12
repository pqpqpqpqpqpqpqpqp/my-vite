import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TripPlanMap from '../../components/trips/TripPlanMap';
import type { TripDTO, TripPlaceDTO } from '../../types/trip';
import { useAuth } from '../../contexts/AuthContext';
import { PLAN_URL } from '../../config';
import { ClipLoader } from 'react-spinners';
import { FaRegClock, FaRegCommentDots } from "react-icons/fa";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

const ToggleSwitch = ({
    isToggled,
    onToggle,
    disabled
}: {
    isToggled: boolean,
    onToggle: (e: React.MouseEvent) => void,
    disabled: boolean
}) => (
    <button
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
        <span className={`absolute inset-0 rounded-full ${isToggled ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${isToggled ? 'translate-x-6' : 'translate-x-1'}`}></span>
    </button>
);

interface TripPlanSidebarProps {
    trip: TripDTO | null;
    isOwner: boolean;
    selectedDay: number;
    setSelectedDay: (day: number) => void;
    focusedPlace: TripPlaceDTO | undefined;
    setFocusedPlace: (place: TripPlaceDTO | undefined) => void;
    isUpdating: boolean;
    onToggleTripPublic: () => void;
    onToggleDayPublic: (tripDayId: string) => void;
}

function TripPlanSidebar({
    trip,
    isOwner,
    selectedDay,
    setSelectedDay,
    focusedPlace,
    setFocusedPlace,
    isUpdating,
    onToggleTripPublic,
    onToggleDayPublic
}: TripPlanSidebarProps) {
    // 로딩 상태 UI
    if (!trip) {
        return (
            <aside className="w-96 bg-white p-6 h-full overflow-y-auto shadow-lg border-r">
                <div className="flex justify-center items-center h-full">
                    <ClipLoader color={"#3B82F6"} loading={true} size={40} />
                </div>
            </aside>
        );
    }

    const { tripTitle, startDate, endDate, tripDays, isPublic } = trip;

    const displayableTripDays = isOwner ? tripDays : tripDays.filter(day => day.isPublic);

    return (
        <aside className="w-96 bg-white p-4 h-full overflow-y-auto shadow-lg border-r flex flex-col">
            {/* 여행 정보 헤더 */}
            <div className="mb-4 p-4 rounded-xl bg-gray-50 border">
                <h1 className="text-xl font-bold text-gray-800 truncate">{tripTitle ?? '나의 여행'}</h1>
                <p className="text-gray-500 text-sm mt-1">
                    {startDate ?? ''} ~ {endDate ?? ''}
                </p>

                {/* 마스터 토글 */}
                {isOwner && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <span className="font-semibold text-gray-700">전체 일정 공개</span>
                        <ToggleSwitch
                            isToggled={isPublic}
                            onToggle={onToggleTripPublic}
                            disabled={isUpdating}
                        />
                    </div>
                )}
            </div>

            {/* 날짜별 아코디언 메뉴 */}
            <div className="flex-1 space-y-2">
                {/* [수정] 필터링된 displayableTripDays의 길이를 먼저 확인합니다. */}
                {displayableTripDays.length > 0 ? (
                    displayableTripDays.sort((a, b) => a.dayOrder - b.dayOrder).map((dayData) => {
                        const isSelected = selectedDay === dayData.dayOrder;
                        return (
                            <div key={dayData.tripDayId} className="bg-white rounded-lg border transition-all duration-300">
                                {/* 날짜 헤더 (클릭 영역) */}
                                <div
                                    onClick={() => setSelectedDay(isSelected ? 0 : dayData.dayOrder)}
                                    className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${isSelected
                                        ? 'bg-blue-50 rounded-t-lg'
                                        : 'hover:bg-gray-50 rounded-lg'
                                        }`}
                                >
                                    {/* 좌측 정보: N일차, 장소 개수 */}
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-lg text-blue-600">{dayData.dayOrder}일차</span>
                                        <span className="text-sm text-gray-500">{dayData.tripPlaces.length}개 장소</span>
                                    </div>

                                    {/* 우측 아이콘/토글: 소유권(isOwner)에 따라 다르게 렌더링 */}
                                    {isOwner ? (
                                        // 소유자일 경우: 토글 스위치와 화살표 아이콘을 함께 표시
                                        <div className="flex items-center gap-4">
                                            <ToggleSwitch
                                                isToggled={dayData.isPublic}
                                                onToggle={(e) => {
                                                    e.stopPropagation(); // 부모 div의 onClick 이벤트 방지
                                                    onToggleDayPublic(dayData.tripDayId);
                                                }}
                                                disabled={!isPublic || isUpdating}
                                            />
                                            {isSelected ? <FaChevronUp /> : <FaChevronDown />}
                                        </div>
                                    ) : (
                                        // 뷰어일 경우: 화살표 아이콘만 표시
                                        isSelected ? <FaChevronUp className="text-blue-500" /> : <FaChevronDown className="text-gray-400" />
                                    )}
                                </div>

                                {/* 확장되었을 때 보이는 장소 목록 */}
                                {isSelected && (
                                    <div className="border-t p-2 bg-gray-50/50 rounded-b-lg">
                                        {dayData.tripPlaces.length > 0 ? (
                                            dayData.tripPlaces
                                                .sort((a, b) => a.orderInDay - b.orderInDay)
                                                .map((place) => {
                                                    const isFocused = focusedPlace?.tripPlaceId === place.tripPlaceId;
                                                    return (
                                                        <div
                                                            key={place.tripPlaceId}
                                                            className={`p-3 my-1 transition rounded-md cursor-pointer ${isFocused
                                                                ? 'bg-blue-100 ring-2 ring-blue-400 shadow'
                                                                : 'bg-white hover:bg-blue-50 hover:shadow-sm shadow-xs'
                                                                }`}
                                                            onClick={() => setFocusedPlace(place)}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center mt-1">
                                                                    {place.orderInDay}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-semibold text-gray-800">{place.placeName}</p>
                                                                    {place.visitTime && (
                                                                        <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
                                                                            <FaRegClock />
                                                                            <span>{place.visitTime}</span>
                                                                        </div>
                                                                    )}
                                                                    {place.memo && (
                                                                        <div className="mt-1.5 flex items-start gap-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
                                                                            <FaRegCommentDots className="mt-0.5 flex-shrink-0" />
                                                                            <p className="whitespace-pre-wrap break-words">{place.memo}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                        ) : (
                                            <div className="text-center p-4 text-sm text-gray-500">
                                                계획된 장소가 없습니다.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    // 표시할 날짜가 없을 때의 UI
                    <div className="text-center py-10 text-gray-500">
                        {isOwner ? "계획된 일정이 없습니다." : "공개된 일정이 없습니다."}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default function TripPlanView() {
    const { user } = useAuth();
    const { tripId } = useParams<{ tripId: string }>();
    const navi = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [trip, setTrip] = useState<TripDTO | null>(null);
    const [isOwner, setIsOwner] = useState(false);

    const [selectedDay, setSelectedDay] = useState(1);
    const [focusedPlace, setFocusedPlace] = useState<TripPlaceDTO | undefined>(undefined);

    useEffect(() => {
        if (!tripId) {
            navi('/');
            return;
        }

        const fetchTrip = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${PLAN_URL}/trip/plan/${tripId}`, { credentials: 'include' });

                if (response.status === 403) {
                    throw new Error("이 여행을 볼 권한이 없습니다.");
                }
                if (!response.ok) {
                    throw new Error('여행 정보를 불러오는 데 실패했습니다.');
                }
                const data: TripDTO = await response.json();

                // --- [핵심 수정] AuthContext의 user 객체를 사용하여 소유권 확인 ---
                // user 객체가 존재하고, 그 안의 userId가 여행의 ownerId와 일치하는지 확인
                if (user && data.ownerId === user.userId) {
                    setIsOwner(true);
                } else {
                    setIsOwner(false);
                }
                // ----------------------------------------------------------------

                setTrip(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrip();
        // [수정] useEffect의 의존성 배열에 user를 추가합니다.
        // 이렇게 하면 로그인/로그아웃 시 소유권 상태가 다시 계산됩니다.
    }, [tripId, navi, user]);

    useEffect(() => {

        if (!trip) return;

        const selectedDayData = trip.tripDays.find(day => day.dayOrder === selectedDay);
        const placesForSelectedDay = selectedDayData?.tripPlaces;

        if (placesForSelectedDay && placesForSelectedDay.length > 0) {
            setFocusedPlace(placesForSelectedDay[0]);
        } else {
            setFocusedPlace(undefined);
        }
    }, [selectedDay, trip]);

    const updateShareStatus = async (tripDayIds: string[], isPublic: boolean) => {
        if (!trip) return false;

        setIsUpdating(true);
        try {
            const response = await fetch(`${PLAN_URL}/trip/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tripId: trip.tripId, tripDayIds, isPublic }),
                credentials: 'include',
            });
            if (!response.ok) throw new Error('공개 설정 변경에 실패했습니다.');
            return true;
        } catch (err) {
            alert((err as Error).message);
            return false;
        } finally {
            setIsUpdating(false);
        }
    };

    // 2. 여행 전체의 공개 상태를 변경하는 핸들러
    const handleToggleTripPublic = async () => {
        if (!trip || isUpdating) return;

        const originalTrip = trip; // API 실패 시 복원을 위해 원본 저장
        const newIsPublic = !trip.isPublic;

        // 낙관적 UI 업데이트: UI를 먼저 변경
        const newTrip: TripDTO = {
            ...trip,
            isPublic: newIsPublic,
            // 전체 토글 시 모든 날짜의 상태도 함께 변경
            tripDays: trip.tripDays.map(day => ({ ...day, isPublic: newIsPublic })),
        };
        setTrip(newTrip);

        // API 호출
        const allDayIds = trip.tripDays.map(day => day.tripDayId);
        const success = await updateShareStatus(allDayIds, newIsPublic);

        // API 호출 실패 시, 원래 상태로 롤백
        if (!success) {
            setTrip(originalTrip);
        }
    };

    // 3. 특정 날짜의 공개 상태를 변경하는 핸들러
    const handleToggleDayPublic = async (tripDayId: string) => {
        if (!trip || isUpdating) return;

        const originalTrip = trip; // API 실패 시 복원을 위해 원본 저장
        const dayToUpdate = trip.tripDays.find(d => d.tripDayId === tripDayId);
        if (!dayToUpdate) return;

        const newIsPublic = !dayToUpdate.isPublic;

        // 낙관적 UI 업데이트
        const newTrip: TripDTO = {
            ...trip,
            tripDays: trip.tripDays.map(day =>
                day.tripDayId === tripDayId ? { ...day, isPublic: newIsPublic } : day
            ),
        };
        setTrip(newTrip);

        // API 호출
        const success = await updateShareStatus([tripDayId], newIsPublic);

        // API 호출 실패 시, 원래 상태로 롤백
        if (!success) {
            setTrip(originalTrip);
        }
    };

    if (isLoading) {
        return <div className="h-full flex justify-center items-center"><p>여행 정보를 불러오는 중입니다...</p></div>;
    }

    if (error) {
        return <div className="h-full flex justify-center items-center text-red-500"><p>{error}</p></div>;
    }

    return (
        <div className="h-full flex flex-col">
            <main className="flex flex-1 overflow-hidden">
                <TripPlanSidebar
                    trip={trip}
                    isOwner={isOwner} // isOwner 상태를 props로 전달
                    selectedDay={selectedDay}
                    setSelectedDay={setSelectedDay}
                    focusedPlace={focusedPlace}
                    setFocusedPlace={setFocusedPlace}
                    isUpdating={isUpdating}
                    onToggleTripPublic={handleToggleTripPublic}
                    onToggleDayPublic={handleToggleDayPublic}
                />
                <div className='flex-1 overflow-hidden relative'>
                    <TripPlanMap
                        trip={trip}
                        selectedDay={selectedDay}
                        focusedPlace={focusedPlace}
                        setFocusedPlace={setFocusedPlace}
                    />
                </div>
            </main>
        </div>
    );
}