import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TripPlanMap from "../../components/trips/TripPlanMap";
import TripPlaceSearchModal from "../../components/trips/TripPlaceSearchModal";
import type { TripDetailData } from "../../types/trip";
import { FaMapMarkedAlt, FaPlus, FaPencilAlt, FaTrash, FaCheckCircle } from "react-icons/fa";

export default function TripPlanDetail() {
    const navi = useNavigate();
    const { state } = useLocation();
    const { selectedPlaces, daysCount, startDate } = state || {};

    // state가 없으면 이전 페이지로 리다이렉트
    useEffect(() => {
        if (!selectedPlaces || !daysCount) {
            navi('/trip/plan/select');
        }
    }, [selectedPlaces, daysCount, navi]);

    const [selectedDay, setSelectedDay] = useState(1);
    const [tripDetailDataGroupingDay, setTripDetailDataGroupingDay] = useState(new Map<number, TripDetailData[]>());
    const [focusedPlace, setFocusedPlace] = useState<TripDetailData | undefined>(undefined);
    const [editingMemo, setEditingMemo] = useState<{ day: number, order: number } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 메모 변경 핸들러
    const handleMemoChange = (day: number, order: number, memo: string) => {
        setTripDetailDataGroupingDay(prevMap => {
            const newMap = new Map(prevMap);
            const dayPlaces = newMap.get(day) || [];
            const updatedPlaces = dayPlaces.map(p => p.orderInDay === order ? { ...p, placeMemo: memo } : p);
            newMap.set(day, updatedPlaces);
            return newMap;
        });
    };

    // 장소 삭제 핸들러
    const handlePlaceDelete = (day: number, order: number) => {
        setTripDetailDataGroupingDay(prevMap => {
            const newMap = new Map(prevMap);
            const dayPlaces = newMap.get(day) || [];
            const updatedPlaces = dayPlaces.filter(p => p.orderInDay !== order)
                // 순서 재정렬
                .map((p, index) => ({ ...p, orderInDay: index + 1 }));
            newMap.set(day, updatedPlaces);
            return newMap;
        });
    };

    // 날짜 계산 함수
    const getFormattedDate = (dayIndex: number) => {
        if (!startDate) return '';
        const date = new Date(startDate);
        date.setDate(date.getDate() + dayIndex);
        const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', weekday: 'long' };
        return new Intl.DateTimeFormat('ko-KR', options).format(date);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 2단 레이아웃: 좌측 지도(고정), 우측 일정(스크롤) */}
            <div className="flex flex-col lg:flex-row max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 gap-8">

                {/* 좌측: 지도 영역 */}
                <div className="lg:w-1/2 w-full">
                    <div className="lg:sticky lg:top-6">
                        <div className="h-200 rounded-2xl overflow-hidden shadow-lg border">
                            <TripPlanMap
                                tripDetailDataGroupingDay={tripDetailDataGroupingDay}
                                selectedDay={selectedDay}
                                focusedPlace={focusedPlace}
                                setFocusedPlace={setFocusedPlace}
                            />
                        </div>
                    </div>
                </div>

                {/* 우측: 일정 계획 영역 */}
                <div className="lg:w-1/2 w-full">
                    {/* 헤더 및 완료 버튼 */}
                    <header className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">나만의 여행 지도 만들기</h1>
                            <p className="text-gray-500">{daysCount}일간의 여정을 계획해보세요.</p>
                        </div>
                        <button
                            className="flex items-center gap-2 px-5 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all shadow-md transform hover:scale-105"
                            onClick={() => navi("/")}
                        >
                            <FaCheckCircle />
                            <span>계획 완료</span>
                        </button>
                    </header>

                    {/* 일자별 계획 리스트 */}
                    <div className="space-y-6">
                        {Array.from({ length: daysCount || 0 }, (_, i) => {
                            const dayNumber = i + 1;
                            const tripDetails = tripDetailDataGroupingDay.get(dayNumber) || [];

                            return (
                                <div key={dayNumber} className="bg-white p-6 rounded-2xl shadow-md border">
                                    {/* Day 헤더 */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                                            {dayNumber}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-800">Day {dayNumber}</h2>
                                            <p className="text-sm text-gray-500">{getFormattedDate(i)}</p>
                                        </div>
                                    </div>

                                    {/* 장소 목록 */}
                                    <div className="space-y-3">
                                        {tripDetails.length > 0 ? (
                                            tripDetails.map((place) => (
                                                <div
                                                    key={place.orderInDay}
                                                    className={`p-4 rounded-lg border transition-all duration-300 ${focusedPlace?.placeId === place.placeId && focusedPlace?.dayOrder === place.dayOrder ? 'bg-blue-50 border-blue-400 shadow-lg' : 'bg-gray-50 border-transparent hover:border-gray-300'}`}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="text-xl font-bold text-blue-500 mt-1">{place.orderInDay}</div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-center">
                                                                <button
                                                                    className="font-semibold text-gray-800 text-left hover:text-blue-600"
                                                                    onClick={() => {
                                                                        setFocusedPlace(place);
                                                                        setSelectedDay(dayNumber);
                                                                    }}
                                                                >
                                                                    {place.placeName}
                                                                </button>
                                                                <button
                                                                    className="text-gray-400 hover:text-red-500"
                                                                    onClick={() => handlePlaceDelete(dayNumber, place.orderInDay)}
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </div>
                                                            {/* 메모 영역 */}
                                                            <div className="mt-2 text-sm">
                                                                {editingMemo?.day === dayNumber && editingMemo?.order === place.orderInDay ? (
                                                                    <input
                                                                        type="text"
                                                                        defaultValue={place.placeMemo || ''}
                                                                        onBlur={(e) => {
                                                                            handleMemoChange(dayNumber, place.orderInDay, e.target.value);
                                                                            setEditingMemo(null);
                                                                        }}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                e.currentTarget.blur();
                                                                            }
                                                                        }}
                                                                        autoFocus
                                                                        className="w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                                                                    />
                                                                ) : (
                                                                    <button
                                                                        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 w-full text-left"
                                                                        onClick={() => setEditingMemo({ day: dayNumber, order: place.orderInDay })}
                                                                    >
                                                                        <FaPencilAlt />
                                                                        <span className={place.placeMemo ? 'text-gray-700' : 'text-gray-400'}>
                                                                            {place.placeMemo || '메모를 추가하세요...'}
                                                                        </span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                                                <FaMapMarkedAlt className="mx-auto text-3xl text-gray-300 mb-2" />
                                                <p>아직 계획된 장소가 없습니다.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* 장소 추가 버튼 */}
                                    <button
                                        className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
                                        onClick={() => {
                                            setSelectedDay(dayNumber);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        <FaPlus /> 장소 추가하기
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 장소 검색 모달 */}
            {isModalOpen && (
                <TripPlaceSearchModal
                    selectedPlaces={selectedPlaces}
                    selectedDay={selectedDay}
                    tripDetailDataGroupingDay={tripDetailDataGroupingDay}
                    setTripDetailDataGroupingDay={setTripDetailDataGroupingDay}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}