import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TripPlanMap from "../../components/trips/TripPlanMap";
import TripPlaceSearchModal from "../../components/trips/TripPlaceSearchModal";
import TripPlaceEditModal from "../../components/trips/TripPlaceEditModal";
import type { GetTripDetailResponseDTO, TripDayDTO, PlaceDTO, TripPlace } from "../../types/trip";
import { FaMapMarkedAlt, FaPlus, FaPencilAlt, FaTrash, FaCheckCircle, FaClock } from "react-icons/fa";
import { PLAN_URL } from "../../config";
import { toast } from "sonner";

const calculateDaysCount = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
};

const mapBackendToFrontend = (tripDays: TripDayDTO[]): Map<number, TripPlace[]> => {
    const newMap = new Map<number, TripPlace[]>();

    tripDays.forEach(dayDto => {
        const dayNumber = dayDto.dayOrder;
        // [수정] 서버 DTO(TripPlaceInDayDTO)를 클라이언트 모델(TripPlace)로 변환합니다.
        const mappedPlaces: TripPlace[] = dayDto.tripPlaces.map(placeDto => ({
            tripPlaceId: placeDto.tripPlaceId,
            dayOrder: dayNumber,
            orderInDay: placeDto.orderInDay,
            placeId: placeDto.place.placeId,
            placeName: placeDto.place.placeName,
            placeLat: placeDto.place.placeLat,
            placeLng: placeDto.place.placeLng,
            placeMemo: placeDto.memo, // DTO의 memo -> 클라이언트 모델의 placeMemo
            visitTime: placeDto.visitTime,
        }));
        newMap.set(dayNumber, mappedPlaces);
    });

    return newMap;
};

export default function TripPlanDetail() {
    const navi = useNavigate();
    const { tripId } = useParams<{ tripId: string }>();

    // --- State Definitions ---
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tripTitle, setTripTitle] = useState("");
    const [startDate, setStartDate] = useState<string | null>(null);
    const [daysCount, setDaysCount] = useState(0);
    // [수정] 상태의 타입을 새로운 공용 타입으로 변경합니다.
    const [mainPlaces, setMainPlaces] = useState<PlaceDTO[]>([]);
    const [selectedDay, setSelectedDay] = useState(1);
    const [tripDetailDataGroupingDay, setTripDetailDataGroupingDay] = useState(new Map<number, TripPlace[]>());
    const [focusedPlace, setFocusedPlace] = useState<TripPlace | undefined>(undefined);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [editingPlace, setEditingPlace] = useState<TripPlace | null>(null);

    useEffect(() => {
        if (!tripId) {
            navi('/trip/plan/select');
            return;
        }

        const fetchTripDetail = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${PLAN_URL}/trip/plan/${tripId}`, {
                    method: "GET",
                    credentials: "include"
                });

                if (!response.ok) {
                    throw new Error("여행 상세 정보를 불러오는데 실패했습니다.");
                }

                // [수정] API 응답 타입을 새로운 DTO로 지정합니다.
                const data: GetTripDetailResponseDTO = await response.json();

                setTripTitle(data.tripTitle);
                setStartDate(data.startDate);
                setDaysCount(calculateDaysCount(data.startDate, data.endDate));
                setMainPlaces(data.mainPlaces);

                // [수정] 최신화된 변환 함수를 사용합니다.
                const mappedData = mapBackendToFrontend(data.tripDays);
                setTripDetailDataGroupingDay(mappedData);

            } catch (err) {
                console.error("Fetch Error:", err);
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTripDetail();
    }, [tripId, navi]);

    const handlePlaceDelete = async (day: number, order: number, tripPlaceId: string) => {
        if (!window.confirm("정말로 이 장소를 삭제하시겠습니까?")) return;

        try {
            const response = await fetch(`${PLAN_URL}/trip/place/del/${tripPlaceId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) throw new Error("장소 삭제에 실패했습니다.");

            setTripDetailDataGroupingDay(prevMap => {
                const newMap = new Map(prevMap);
                const dayPlaces = newMap.get(day) || [];
                const updatedPlaces = dayPlaces.filter(p => p.orderInDay !== order)
                    .map((p, index) => ({ ...p, orderInDay: index + 1 }));
                newMap.set(day, updatedPlaces);
                return newMap;
            });
            toast.success("장소가 삭제되었습니다.");

        } catch (err) {
            toast.error((err as Error).message);
        }
    };

    const getFormattedDate = (dayIndex: number) => {
        if (!startDate) return '';
        const date = new Date(startDate);
        date.setDate(date.getDate() + dayIndex);
        const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', weekday: 'long' };
        return new Intl.DateTimeFormat('ko-KR', options).format(date);
    };

    const handleSavePlaceDetails = async (tripPlaceId: string, newMemo: string, newTime: string) => {
        if (!editingPlace) return;

        const originalPlace = editingPlace;
        const day = originalPlace.dayOrder;
        const order = originalPlace.orderInDay;

        // Optimistic UI Update
        setTripDetailDataGroupingDay(prevMap => {
            const newMap = new Map(prevMap);
            const dayPlaces = newMap.get(day) || [];
            const updatedPlaces = dayPlaces.map(p =>
                p.orderInDay === order ? { ...p, placeMemo: newMemo, visitTime: newTime } : p
            );
            newMap.set(day, updatedPlaces);
            return newMap;
        });

        // API 호출 (메모와 시간이 변경되었을 경우에만)
        try {
            if (newMemo !== (originalPlace.placeMemo || '')) {
                await fetch(`${PLAN_URL}/trip/place/${tripPlaceId}/memo`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ memo: newMemo }),
                    credentials: 'include'
                });
            }
            if (newTime !== (originalPlace.visitTime || '')) {
                await fetch(`${PLAN_URL}/trip/place/${tripPlaceId}/time`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ visitTime: newTime }),
                    credentials: 'include'
                });
            }
            toast.success("변경사항이 저장되었습니다.");
        } catch (error) {
            console.error("상세 정보 업데이트 실패:", error);
            toast.error("저장에 실패했습니다. 다시 시도해주세요.");
            // TODO: 실패 시 UI 롤백
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-gray-600">여행 계획을 불러오는 중입니다...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
                <p className="text-gray-700">{error}</p>
                <button
                    onClick={() => navi('/trip/plan/lists')}
                    className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    목록으로 돌아가기
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
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
                            <h1 className="text-3xl font-bold text-gray-800">{tripTitle}</h1>
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
                        {Array.from({ length: daysCount }, (_, i) => {
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
                                                    key={place.tripPlaceId} // [수정] key를 고유 ID로 변경
                                                    className={`p-4 rounded-lg border transition-all duration-300 ${focusedPlace?.tripPlaceId === place.tripPlaceId ? 'bg-blue-50 border-blue-400 shadow-lg' : 'bg-gray-50 border-transparent hover:border-gray-300'}`}
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
                                                                <div className="flex items-center gap-3">
                                                                    <button
                                                                        className="text-gray-400 hover:text-blue-500"
                                                                        onClick={() => setEditingPlace(place)} // 수정 모달 열기
                                                                    >
                                                                        <FaPencilAlt />
                                                                    </button>
                                                                    <button
                                                                        className="text-gray-400 hover:text-red-500"
                                                                        onClick={() => {
                                                                            if (!place.tripPlaceId) return;
                                                                            handlePlaceDelete(dayNumber, place.orderInDay, place.tripPlaceId)
                                                                        }} // 수정된 삭제 함수 호출
                                                                    >
                                                                        <FaTrash />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* 시간과 메모를 텍스트로 표시 */}
                                                            <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                                                                <FaClock className="text-gray-400" />
                                                                <span>{place.visitTime || '시간 미정'}</span>
                                                            </div>
                                                            <div className="mt-1 text-sm text-gray-600 flex items-start gap-2">
                                                                <FaPencilAlt className="text-gray-400 mt-1 flex-shrink-0" />
                                                                <p className="whitespace-pre-wrap">{place.placeMemo || '메모 없음'}</p>
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
                                            setIsSearchModalOpen(true);
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
            {isSearchModalOpen && (
                <TripPlaceSearchModal
                    selectedPlaces={mainPlaces}
                    selectedDay={selectedDay}
                    tripDetailDataGroupingDay={tripDetailDataGroupingDay}
                    setTripDetailDataGroupingDay={setTripDetailDataGroupingDay}
                    onClose={() => setIsSearchModalOpen(false)}
                />
            )}

            {/* [신규] 장소 수정 모달 */}
            {editingPlace && (
                <TripPlaceEditModal
                    place={editingPlace}
                    onClose={() => setEditingPlace(null)}
                    onSave={handleSavePlaceDetails}
                />
            )}
        </div>
    );
}