import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import type { TripPlace, TripPlaceData } from "../../types/trip";
import { FaSearch, FaMapMarkerAlt, FaTimes, FaArrowRight, FaMapMarkedAlt } from "react-icons/fa";

export default function TripPlanSelect() {
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState<TripPlace[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [selectedPlaces, setSelectedPlaces] = useState<TripPlaceData[]>([]);
    const placesLib = useMapsLibrary("places");
    const navi = useNavigate();

    // 검색어에 따라 장소 자동완성 제안
    useEffect(() => {
        if (!searchText) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(() => {
            async function fetchSuggestions() {
                if (!placesLib) return;

                const request = {
                    input: searchText,
                    language: 'ko',
                };

                try {
                    const res = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

                    const allowedTypes = ["country", "administrative_area_level_1", "locality"];

                    const filtered = (res?.suggestions || []).filter(s =>
                        (s.placePrediction?.types || []).some(t => allowedTypes.includes(t))
                    );

                    const simplified = filtered.map(s => ({
                        placeId: s.placePrediction?.placeId || "",
                        placeName: s.placePrediction?.mainText?.text || "",
                    }));

                    setSuggestions(simplified);
                } catch (error) {
                    console.error("Autocomplete error:", error);
                    setSuggestions([]);
                }
            }

            fetchSuggestions();
        }, 500); // Debounce 시간을 500ms로 조정

        return () => clearTimeout(timer);
    }, [searchText, placesLib]);

    // 제안 목록에서 장소 선택
    const handleSelect = async (suggestion: TripPlace) => {
        if (!placesLib || !suggestion.placeId) return;
        if (selectedPlaces.some(p => p.placeId === suggestion.placeId)) {
            // 이미 선택된 장소는 추가하지 않음
            setSearchText("");
            setSuggestions([]);
            return;
        }

        try {
            const placeDetails = await new placesLib.Place({ id: suggestion.placeId })
                .fetchFields({ fields: ["formattedAddress", "types", "location"] });

            const { place } = placeDetails;
            const matchedType = (place.types || []).find(t =>
                ["country", "administrative_area_level_1", "locality"].includes(t)
            );

            if (place) {
                setSelectedPlaces(prev => [...prev, {
                    placeId: suggestion.placeId,
                    placeName: suggestion.placeName,
                    address: place.formattedAddress || "",
                    placeType: matchedType || "political",
                    placeLat: place.location?.lat() || 0,
                    placeLng: place.location?.lng() || 0,
                }]);
            }
        } catch (err) {
            console.error("Place fetch error:", err);
        }

        setSearchText("");
        setSuggestions([]);
        setActiveIndex(-1);
    };

    // 키보드 방향키 및 엔터키 이벤트 처리
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.nativeEvent.isComposing) return; // 한글 입력 중 이벤트 방지

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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg space-y-6">

                {/* 헤더 */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">어디로 떠나고 싶으신가요?</h1>
                    <p className="text-gray-500 mt-2">여행하고 싶은 도시나 국가를 추가해 보세요.</p>
                </div>

                {/* 검색창 및 자동완성 목록 */}
                <div className="relative">
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base transition-shadow"
                            placeholder="도시나 국가를 입력하세요..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    {suggestions.length > 0 && (
                        <ul className="absolute z-10 w-full mt-2 rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden">
                            {suggestions.map((s, i) => (
                                <li
                                    key={s.placeId}
                                    className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${i === activeIndex ? "bg-blue-50" : "hover:bg-gray-50"}`}
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

                {/* 선택된 장소 목록 */}
                <div>
                    <h2 className="font-semibold mb-3 text-gray-700 text-lg">선택된 여행지</h2>
                    <div className="p-4 bg-gray-50 rounded-xl min-h-[120px] flex flex-wrap items-start gap-3">
                        {selectedPlaces.length > 0 ? (
                            selectedPlaces.map((place) => (
                                <div
                                    key={place.placeId}
                                    className="flex items-center gap-2 bg-blue-100 text-blue-800 rounded-full px-4 py-2 text-sm font-medium animate-fade-in"
                                >
                                    <span>{place.placeName}</span>
                                    <button
                                        onClick={() => setSelectedPlaces(prev => prev.filter(p => p.placeId !== place.placeId))}
                                        className="rounded-full hover:bg-blue-200 p-1"
                                        aria-label={`Remove ${place.placeName}`}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="w-full flex flex-col items-center justify-center text-center text-gray-500 py-6">
                                <FaMapMarkedAlt className="text-4xl mb-2 text-gray-300" />
                                <p>아직 선택된 장소가 없어요.</p>
                                <p className="text-sm">검색창을 이용해 여행지를 추가해주세요.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 다음 단계 버튼 */}
                <button
                    disabled={selectedPlaces.length === 0}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-lg text-lg font-semibold text-white transition-all duration-300 transform hover:scale-105
                        ${selectedPlaces.length === 0
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 shadow-md"
                        }`}
                    onClick={() => navi("/trip/plan/schedule", { state: { selectedPlaces } })}
                >
                    일정 정하기 <FaArrowRight />
                </button>
            </div>
        </div>
    );
}