import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { toast } from "sonner";
import type { PlaceSuggestion, PlaceDTO, TripPlace } from "../../types/trip";
import { FaSearch, FaMapMarkerAlt, FaTimes, FaPlusCircle, FaTimesCircle, FaRegMap } from "react-icons/fa";
import { PLAN_URL } from "../../config";


interface TripPlaceSearchModalProps {
    mainPlaces: PlaceDTO[];
    selectedDay: number;
    tripDetailDataGroupingDay: Map<number, TripPlace[]>;
    setTripDetailDataGroupingDay: (dayData: Map<number, TripPlace[]>) => void;
    onClose: () => void;
}

export default function TripPlaceSearchModal({
    onClose,
    selectedDay,
    mainPlaces,
    tripDetailDataGroupingDay,
    setTripDetailDataGroupingDay,
}: TripPlaceSearchModalProps) {
    const { tripId } = useParams<{ tripId: string }>();
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [newSelectedPlaces, setNewSelectedPlaces] = useState<PlaceDTO[]>([]);
    const placesLib = useMapsLibrary("places");

    useEffect(() => {
        if (!searchText || !placesLib || !mainPlaces || mainPlaces.length === 0) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                // 각 장소별로 검색 작업을 생성
                const searchTasks = newSelectedPlaces.map(async (p) => {
                    try {
                        const place = await new placesLib.Place({ id: p.placeId }).fetchFields({ fields: ['viewport'] });
                        const viewport = place.place?.viewport;

                        if (!viewport) {
                            return [];
                        }

                        const request = { input: searchText, language: 'ko', locationRestriction: viewport };
                        const res = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
                        const placeSuggestions: PlaceSuggestion[] = res.suggestions.map(s => ({
                            placeId: s.placePrediction?.placeId || "",
                            placeName: s.placePrediction?.mainText?.text || "",
                        }));
                        return placeSuggestions;
                    } catch (innerError) { /* ... */ return []; }
                });
                // ... (Promise.all 로직은 이전과 동일)
            } catch (error) { /* ... */ }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText, mainPlaces, placesLib]);

    // [수정] 매개변수 타입을 PlaceSuggestion으로 변경
    const handleSelect = async (suggestion: PlaceSuggestion) => {
        if (!placesLib || !suggestion.placeId) return;
        if (newSelectedPlaces.some(p => p.placeId === suggestion.placeId)) { /* ... */ return; }

        try {
            const placeDetails = await new placesLib.Place({ id: suggestion.placeId }).fetchFields({ fields: ['formattedAddress', 'primaryType', 'location'] });
            if (placeDetails.place) {
                // [수정] 새로 생성하는 객체가 PlaceDTO 타입임을 명확히 함
                const newPlace: PlaceDTO = {
                    placeId: suggestion.placeId,
                    placeName: suggestion.placeName,
                    address: placeDetails.place.formattedAddress || "",
                    placeType: placeDetails.place.primaryType || "locality",
                    placeLat: placeDetails.place.location?.lat() || 0,
                    placeLng: placeDetails.place.location?.lng() || 0,
                };
                setNewSelectedPlaces(prev => [...prev, newPlace]);
            }
        } catch (err) { /* ... */ }

        setSearchText("");
        setSuggestions([]);
        setActiveIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { /* ... 이전과 동일 ... */ };

    /**
     * [수정] 최종 장소 추가 로직 (API 연동)
     */
    const handleAddPlaces = async () => {
        if (newSelectedPlaces.length === 0 || !tripId) return;

        // 백엔드 API가 PlaceDTO[] 형태를 받는다고 가정
        const placesToAdd = newSelectedPlaces;

        try {
            // [신규] 백엔드에 장소 추가 API 호출
            const response = await fetch(`${PLAN_URL}/trip/place/add/${tripId}/${selectedDay}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(placesToAdd),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error("장소 추가에 실패했습니다.");
            }

            // [신규] API 응답으로 받은, tripPlaceId가 포함된 완전한 장소 목록
            const savedTripDetails: TripPlace[] = await response.json();

            // [신규] 이 결과값으로 부모의 상태를 업데이트
            const existingPlaces = tripDetailDataGroupingDay.get(selectedDay) || [];
            const newMap = new Map(tripDetailDataGroupingDay);
            newMap.set(selectedDay, [...existingPlaces, ...savedTripDetails]);
            setTripDetailDataGroupingDay(newMap);

            toast.success(`${savedTripDetails.length}개의 장소가 추가되었습니다.`);
            onClose(); // 성공 시 모달 닫기

        } catch (error) {
            console.error("장소 추가 실패:", error);
            toast.error((error as Error).message);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* 배경 오버레이 */}
            <div className="absolute inset-0 bg-black/60 animate-fade-in-fast" onClick={onClose} />

            {/* 모달 컨텐츠 */}
            <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 animate-slide-up">
                {/* 헤더 및 닫기 버튼 */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Day {selectedDay}에 장소 추가하기</h1>
                        <p className="text-gray-500">여행지에 방문할 장소를 검색해 보세요.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimesCircle className="w-6 h-6" />
                    </button>
                </div>

                {/* 검색창 */}
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="레스토랑, 명소, 호텔 등..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    {suggestions.length > 0 && (
                        <ul className="absolute z-20 w-full mt-2 rounded-xl bg-white shadow-lg border max-h-60 overflow-y-auto">
                            {suggestions.map((s, i) => (
                                <li key={s.placeId}
                                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${i === activeIndex ? "bg-blue-50" : "hover:bg-gray-50"}`}
                                    onMouseEnter={() => setActiveIndex(i)}
                                    onClick={() => handleSelect(s)}
                                >
                                    <FaMapMarkerAlt className="text-gray-400" />
                                    <span className="text-gray-700">{s.placeName}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* 추가할 장소 목록 (Staging Area) */}
                <div>
                    <h2 className="font-semibold mb-2 text-gray-700">추가할 장소 목록</h2>
                    <div className="p-4 bg-gray-50 rounded-xl min-h-[100px] flex flex-wrap items-start gap-3">
                        {newSelectedPlaces.length > 0 ? (
                            newSelectedPlaces.map((place) => (
                                <div key={place.placeId} className="flex items-center gap-2 bg-blue-100 text-blue-800 rounded-full px-4 py-2 text-sm font-medium animate-fade-in">
                                    <span>{place.placeName}</span>
                                    <button
                                        onClick={() => setNewSelectedPlaces(prev => prev.filter(p => p.placeId !== place.placeId))}
                                        className="rounded-full hover:bg-blue-200 p-1"
                                        aria-label={`Remove ${place.placeName}`}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="w-full flex items-center justify-center text-center text-gray-400 py-4">
                                <FaRegMap className="text-2xl mr-2" />
                                <p>검색 후 장소를 선택해주세요.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 하단 버튼 영역 */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        className="px-6 py-3 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors"
                        onClick={onClose}
                    >
                        취소
                    </button>
                    <button
                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all
                            ${newSelectedPlaces.length === 0
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 shadow-md"
                            }`}
                        onClick={handleAddPlaces}
                        disabled={newSelectedPlaces.length === 0}
                    >
                        <FaPlusCircle />
                        <span>{newSelectedPlaces.length}개 장소 추가</span>
                    </button>
                </div>
            </div>
        </div>
    );
}