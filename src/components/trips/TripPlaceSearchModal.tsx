import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { toast } from "sonner";
import type { TripDTO, TripPlaceDTO, PlaceSuggestion } from "../../types/trip";
import { FaSearch, FaMapMarkerAlt, FaTimes, FaPlusCircle, FaTimesCircle, FaRegMap } from "react-icons/fa";
import { PLAN_URL } from "../../config";

interface TripPlaceSearchModalProps {
    trip: TripDTO | null;
    setTrip: (trip: TripDTO) => void;
    selectedDay: number;
    onClose: () => void;
}

interface TripPlaceAddRequest {
    tripDayId: string;
    placeId: string;
    placeName: string;
}

export default function TripPlaceSearchModal({
    onClose,
    selectedDay,
    trip,
    setTrip,
}: TripPlaceSearchModalProps) {
    const { tripId } = useParams<{ tripId: string }>();
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);

    const [newSelectedPlaces, setNewSelectedPlaces] = useState<PlaceSuggestion[]>([]);
    const placesLib = useMapsLibrary("places");

    const mainPlaceIds = trip?.mainPlaceIds ?? [];

    useEffect(() => {
        if (!searchText || !placesLib || mainPlaceIds.length === 0) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const searchTasks = mainPlaceIds.map(async (placeId) => {
                    try {
                        const place = await new placesLib.Place({ id: placeId }).fetchFields({ fields: ['viewport'] });
                        const viewport = place.place?.viewport;
                        if (!viewport) return [];

                        const request = { input: searchText, language: 'ko', locationRestriction: viewport };
                        const res = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

                        const forbiddenTypes = ["country", "administrative_area_level_1", "locality"];

                        const filtered = (res.suggestions || []).filter(s =>
                            !(s.placePrediction?.types || []).some(t => forbiddenTypes.includes(t))
                        );

                        return filtered.map(s => ({
                            placeId: s.placePrediction?.placeId || "",
                            placeName: s.placePrediction?.mainText?.text || "",
                            placeText: s.placePrediction?.secondaryText?.text || "",
                        }));

                    } catch (innerError) { return []; }
                });

                const results = await Promise.all(searchTasks);
                const merged = results.flat();
                const unique = Array.from(new Map(merged.map(s => [s.placeId, s])).values());
                setSuggestions(unique);

            } catch (error) { console.error("Autocomplete search error:", error); }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText, mainPlaceIds, placesLib]);

    const handleSelect = (suggestion: PlaceSuggestion) => {
        if (!suggestion.placeId) return;
        if (newSelectedPlaces.some(p => p.placeId === suggestion.placeId)) {
            toast.info("이미 추가할 목록에 있는 장소입니다.");
            return;
        }

        setNewSelectedPlaces(prev => [...prev, suggestion]);

        setSearchText("");
        setSuggestions([]);
        setActiveIndex(-1);
    };

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

    const handleAddPlaces = async () => {
        if (newSelectedPlaces.length === 0 || !tripId || !trip) return;

        const placesToAdd: TripPlaceAddRequest[] = newSelectedPlaces.map(place => ({
            tripDayId: trip.tripDays[selectedDay - 1].tripDayId,
            placeId: place.placeId,
            placeName: place.placeName,
        }));

        try {

            const response = await fetch(`${PLAN_URL}/trip/place/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(placesToAdd),
                credentials: 'include'
            });

            if (!response.ok) throw new Error("장소 추가에 실패했습니다.");

            const savedTripPlaces: TripPlaceDTO[] = await response.json();

            const updatedTripDays = trip.tripDays.map(day => {
                if (day.dayOrder === selectedDay) {
                    return {
                        ...day,
                        tripPlaces: [...day.tripPlaces, ...savedTripPlaces]
                    };
                }
                return day;
            });

            setTrip({ ...trip, tripDays: updatedTripDays });

            toast.success(`${savedTripPlaces.length}개의 장소가 추가되었습니다.`);
            onClose();

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
                                    className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${i === activeIndex ? "bg-blue-100" : "hover:bg-gray-50"}`}
                                    onMouseEnter={() => setActiveIndex(i)}
                                    onClick={() => handleSelect(s)}
                                >
                                    <FaMapMarkerAlt className="text-gray-400 mt-1" /> {/* 아이콘 정렬을 위해 약간의 상단 마진을 추가할 수 있습니다. */}
                                    <div className="flex flex-col"> {/* 텍스트들을 감싸는 div 추가 */}
                                        <span className="font-medium text-gray-800">{s.placeName}</span>
                                        {s.placeText && (
                                            <span className="text-sm text-gray-500">{s.placeText}</span>
                                        )}
                                    </div>
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