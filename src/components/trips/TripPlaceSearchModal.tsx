import { useState, useEffect } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import type { TripPlace, TripPlaceData, TripDetailData, TripPlaceSearchModalProps } from "../../types/trip";
import { FaSearch, FaMapMarkerAlt, FaTimes, FaPlusCircle, FaTimesCircle, FaRegMap } from "react-icons/fa";

export default function TripPlaceSearchModal({
    onClose,
    selectedDay,
    selectedPlaces,
    tripDetailDataGroupingDay,
    setTripDetailDataGroupingDay,
}: TripPlaceSearchModalProps) {
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState<TripPlace[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [newSelectedPlaces, setNewSelectedPlaces] = useState<TripPlaceData[]>([]);
    const placesLib = useMapsLibrary("places");

    useEffect(() => {
        // 검색어가 없거나, 라이브러리/선택된 장소가 준비되지 않았다면 실행하지 않음
        if (!searchText || !placesLib || !selectedPlaces || selectedPlaces.length === 0) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                // 각 장소별로 검색 작업을 생성
                const searchTasks = selectedPlaces.map(async (p) => {
                    // 개별 작업이 실패해도 전체가 멈추지 않도록 try-catch로 감싸줍니다.
                    try {
                        const place = await new placesLib.Place({ id: p.placeId }).fetchFields({ fields: ['viewport'] });
                        const viewport = place.place?.viewport;

                        // viewport 정보가 없는 경우, 해당 지역에서는 검색 결과를 반환하지 않음
                        if (!viewport) {
                            return [];
                        }

                        const request = { input: searchText, language: 'ko', locationRestriction: viewport };
                        const res = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

                        return res.suggestions.map(s => ({
                            placeId: s.placePrediction?.placeId || "",
                            placeName: s.placePrediction?.mainText?.text || "",
                        }));
                    } catch (innerError) {
                        console.error(`'${p.placeName}' 지역의 장소 검색에 실패했습니다:`, innerError);
                        // 에러가 발생해도 다른 검색에 영향을 주지 않도록 빈 배열을 반환합니다.
                        return [];
                    }
                });

                // 모든 검색 작업을 동시에 실행
                const results = await Promise.all(searchTasks);
                const merged = results.flat(); // 모든 결과를 하나의 배열로 합침
                const unique = Array.from(new Map(merged.map(s => [s.placeId, s])).values()); // 중복 제거
                setSuggestions(unique);

            } catch (error) {
                console.error("장소 자동완성 검색 중 에러 발생:", error);
                setSuggestions([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText, selectedPlaces, placesLib]);

    // 제안 목록에서 장소 선택 시 처리
    const handleSelect = async (suggestion: TripPlace) => {
        if (!placesLib || !suggestion.placeId) return;
        // 이미 추가된 장소는 다시 추가하지 않음
        if (newSelectedPlaces.some(p => p.placeId === suggestion.placeId)) {
            setSearchText("");
            setSuggestions([]);
            return;
        }

        try {
            const placeDetails = await new placesLib.Place({ id: suggestion.placeId }).fetchFields({ fields: ['formattedAddress', 'primaryType', 'location'] });
            if (placeDetails.place) {
                setNewSelectedPlaces(prev => [...prev, {
                    placeId: suggestion.placeId,
                    placeName: suggestion.placeName,
                    address: placeDetails.place.formattedAddress || "",
                    placeType: placeDetails.place.primaryType || "locality",
                    placeLat: placeDetails.place.location?.lat() || 0,
                    placeLng: placeDetails.place.location?.lng() || 0,
                }]);
            }
        } catch (err) {
            console.error("Place fetch error:", err);
        }

        setSearchText("");
        setSuggestions([]);
        setActiveIndex(-1);
    };

    // 키보드 이벤트 핸들러
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.nativeEvent.isComposing) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            handleSelect(suggestions[activeIndex]);
        }
    };

    // 최종 장소 추가 로직
    const handleAddPlaces = () => {
        const existingPlaces = tripDetailDataGroupingDay.get(selectedDay) || [];
        const lastOrder = existingPlaces.length > 0 ? Math.max(...existingPlaces.map(p => p.orderInDay)) : 0;

        const newTripDetails: TripDetailData[] = newSelectedPlaces.map((place, index) => ({
            placeId: place.placeId,
            dayOrder: selectedDay,
            placeName: place.placeName,
            placeLat: place.placeLat,
            placeLng: place.placeLng,
            orderInDay: lastOrder + index + 1,
            placeMemo: '', // 초기 메모는 비워둠
        }));

        const newMap = new Map(tripDetailDataGroupingDay);
        newMap.set(selectedDay, [...existingPlaces, ...newTripDetails]);
        setTripDetailDataGroupingDay(newMap);
        onClose(); // 모달 닫기
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