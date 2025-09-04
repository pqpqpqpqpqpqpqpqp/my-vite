import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import type { PlaceSuggestion } from "../../types/trip";
import { FaSearch, FaMapMarkerAlt, FaTimes, FaArrowRight, FaMapMarkedAlt, FaPen } from "react-icons/fa";

const MAX_SELECTED_PLACES = 5;

export default function TripPlanSelect() {
    const [tripTitle, setTripTitle] = useState("");
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [selectedPlaces, setSelectedPlaces] = useState<PlaceSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const placesLib = useMapsLibrary("places");
    const navi = useNavigate();

    useEffect(() => {
        if (!searchText.trim()) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(() => {
            async function fetchSuggestions() {
                if (!placesLib) return;
                setIsLoading(true);

                const request = { input: searchText, language: 'ko' };

                try {
                    const res = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
                    const allowedTypes = ["country", "administrative_area_level_1", "locality"];

                    const filtered = (res?.suggestions || []).filter(s =>
                        (s.placePrediction?.types || []).some(t => allowedTypes.includes(t))
                    );

                    const simplified: PlaceSuggestion[] = filtered.map(s => ({
                        placeId: s.placePrediction?.placeId || "",
                        placeName: s.placePrediction?.mainText?.text || "",
                        placeText: s.placePrediction?.secondaryText?.text || ""
                    }));

                    setSuggestions(simplified);
                } catch (error) {
                    console.error("Autocomplete error:", error);
                    setSuggestions([]);
                } finally {
                    setIsLoading(false);
                }
            }

            fetchSuggestions();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText, placesLib]);

    const handleSelect = (suggestion: PlaceSuggestion) => {
        if (selectedPlaces.some(p => p.placeId === suggestion.placeId)) {
            toast.info(`${suggestion.placeName}은(는) 이미 추가된 장소입니다.`);
            setSearchText("");
            setSuggestions([]);
            return;
        }

        if (selectedPlaces.length >= MAX_SELECTED_PLACES) {
            toast.warning(`여행지는 최대 ${MAX_SELECTED_PLACES}개까지 추가할 수 있습니다.`);
            return;
        }

        setSelectedPlaces(prev => [...prev, suggestion]);
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

    const handleNextClick = () => {
        let finalTripTitle = tripTitle.trim();

        if (!finalTripTitle) {
            if (selectedPlaces.length === 1) {
                finalTripTitle = `${selectedPlaces[0].placeName} 여행`;
            } else if (selectedPlaces.length > 1 && selectedPlaces.length < 4) {
                finalTripTitle = selectedPlaces.map(p => p.placeName).join(', ') + ' 여행';
            } else if (selectedPlaces.length >= 4) {
                finalTripTitle = `${selectedPlaces[0].placeName} 외 ${selectedPlaces.length - 1}곳 여행`;
            } else {
                finalTripTitle = "나의 멋진 여행";
            }
        }

        navi("/trip/plan/schedule", {
            state: {
                selectedPlaces,
                tripTitle: finalTripTitle
            }
        });
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
                <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg space-y-6">

                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-800">어디로 떠나고 싶으신가요?</h1>
                        <p className="text-gray-500 mt-2">여행하고 싶은 도시나 국가를 추가해 보세요.</p>
                    </div>

                    <div className="relative">
                        <label htmlFor="trip-title" className="block text-lg font-semibold text-gray-700 mb-2">여행 제목</label>
                        <div className="relative">
                            <FaPen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                id="trip-title"
                                type="text"
                                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base transition-shadow"
                                placeholder="여행 제목을 입력해주세요"
                                value={tripTitle}
                                onChange={(e) => setTripTitle(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative flex items-center">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-12 pr-10 py-4 border border-gray-300 rounded-xl bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base transition-shadow"
                                placeholder="도시나 국가를 입력하세요..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                {isLoading ? (
                                    <ClipLoader
                                        color="#4A90E2"
                                        loading={isLoading}
                                        size={20}
                                        aria-label="Loading Spinner"
                                    />
                                ) : (
                                    searchText && (
                                        <button
                                            onClick={() => setSearchText("")}
                                            className="text-gray-400 hover:text-gray-600"
                                            aria-label="Clear search"
                                        >
                                            <FaTimes />
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                        {suggestions.length > 0 && (
                            <ul className="absolute z-10 w-full mt-2 rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden">
                                {suggestions.map((s, i) => (
                                    <li
                                        key={s.placeId}
                                        className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${i === activeIndex ? "bg-blue-100" : "hover:bg-gray-50"}`}
                                        onMouseEnter={() => setActiveIndex(i)}
                                        onClick={() => handleSelect(s)}
                                    >
                                        <FaMapMarkerAlt className="text-gray-400" />
                                        <div className="flex flex-col">
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

                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-semibold text-gray-700 text-lg">선택된 여행지</h2>
                            <p className="text-sm text-gray-500">
                                {selectedPlaces.length} / {MAX_SELECTED_PLACES}
                            </p>
                        </div>
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

                    <button
                        disabled={selectedPlaces.length === 0}
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-lg text-lg font-semibold text-white transition-all duration-300 transform hover:scale-105
                            ${selectedPlaces.length === 0
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 shadow-md"
                            }`}
                        onClick={handleNextClick}
                    >
                        일정 정하기 <FaArrowRight />
                    </button>
                </div>
            </div>
        </>
    );
}