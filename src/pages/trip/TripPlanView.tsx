import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TripPlanMap from '../../components/trips/TripPlanMap';
import type { TripDTO, TripPlaceDTO } from '../../types/trip';
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

    return (
        <aside className="w-96 bg-white p-4 h-full overflow-y-auto shadow-lg border-r flex flex-col">
            {/* 여행 정보 헤더 */}
            <div className="mb-4 p-4 rounded-xl bg-gray-50 border">
                <h1 className="text-xl font-bold text-gray-800 truncate">{tripTitle ?? '나의 여행'}</h1>
                <p className="text-gray-500 text-sm mt-1">
                    {startDate ?? ''} ~ {endDate ?? ''}
                </p>

                {/* 마스터 토글 */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="font-semibold text-gray-700">전체 일정 공개</span>
                    <ToggleSwitch
                        isToggled={isPublic}
                        onToggle={onToggleTripPublic}
                        disabled={isUpdating}
                    />
                </div>
            </div>

            {/* 날짜별 아코디언 메뉴 */}
            <div className="flex-1 space-y-2">
                {tripDays.sort((a, b) => a.dayOrder - b.dayOrder).map((dayData) => {
                    const isSelected = selectedDay === dayData.dayOrder;
                    return (
                        <div key={dayData.tripDayId} className="bg-white rounded-lg border transition-all duration-300">
                            {/* 날짜 헤더 (클릭 영역) */}
                            <div
                                onClick={() => setSelectedDay(isSelected ? 0 : dayData.dayOrder)} // 다시 누르면 닫히도록
                                className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${isSelected
                                    ? 'bg-blue-50 rounded-t-lg'
                                    : 'hover:bg-gray-50 rounded-lg'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-lg text-blue-600">{dayData.dayOrder}일차</span>
                                    <span className="text-sm text-gray-500">{dayData.tripPlaces.length}개 장소</span>
                                </div>
                                {isSelected ? <FaChevronUp className="text-blue-500" /> : <FaChevronDown className="text-gray-400" />}

                                <div className="flex items-center gap-4">
                                    {/* 개별 날짜 토글 */}
                                    <ToggleSwitch
                                        isToggled={dayData.isPublic}
                                        onToggle={(e) => {
                                            e.stopPropagation(); // 부모 div의 onClick 이벤트 방지
                                            onToggleDayPublic(dayData.tripDayId);
                                        }}
                                        // 전체가 비공개이거나, API 통신 중일 때 비활성화
                                        disabled={!isPublic || isUpdating}
                                    />
                                    {dayData.dayOrder === selectedDay ? <FaChevronUp /> : <FaChevronDown />}
                                </div>
                            </div>

                            {/* 확장되었을 때 보이는 장소 목록 */}
                            {isSelected && (
                                <div className="border-t p-2 bg-gray-50/50 rounded-b-lg">
                                    {dayData.tripPlaces.length > 0 ? (
                                        // orderInDay 순서대로 정렬하여 표시
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
                                                            {/* 순서 번호 배지 */}
                                                            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center mt-1">
                                                                {place.orderInDay}
                                                            </div>
                                                            <div className="flex-1">
                                                                {/* 장소 이름 */}
                                                                <p className="font-semibold text-gray-800">{place.placeName}</p>
                                                                {/* 방문 시간 */}
                                                                {place.visitTime && (
                                                                    <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
                                                                        <FaRegClock />
                                                                        <span>{place.visitTime}</span>
                                                                    </div>
                                                                )}
                                                                {/* 메모 */}
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
                                        // 장소가 없을 때 UI
                                        <div className="text-center p-4 text-sm text-gray-500">
                                            계획된 장소가 없습니다.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

export default function TripPlanView() {
    const { tripId } = useParams<{ tripId: string }>();
    const navi = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [trip, setTrip] = useState<TripDTO | null>(null);

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
                if (!response.ok) {
                    throw new Error('여행 정보를 불러오는 데 실패했습니다.');
                }
                const data: TripDTO = await response.json();

                setTrip(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrip();
    }, [tripId, navi]);

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
                    selectedDay={selectedDay}
                    setSelectedDay={setSelectedDay}
                    focusedPlace={focusedPlace}
                    setFocusedPlace={setFocusedPlace}
                    // 상태 객체와 핸들러 함수를 props로 전달
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