import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import type { TripPlace } from "../../types/trip";

export default function TripPlanSelect() {
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState<TripPlace[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [selectedPlaces, setSelectedPlaces] = useState<TripPlace[]>([]);
    const navi = useNavigate();
    const placesLib = useMapsLibrary('places');

    const autocompleteService = useMemo(
        () => placesLib ? new placesLib.AutocompleteService() : null,
        [placesLib]
    );

    useEffect(() => {
        if (!autocompleteService || !searchText) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(() => {
            const request = {
                input: searchText,
                language: "ko",
            };

            autocompleteService.getPlacePredictions(request, (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                    const simplifiedSuggestions = predictions.map((p) => ({
                        placeId: p.place_id,
                        placeName: p.description,
                        types: p.types || [],
                    }));
                    setSuggestions(simplifiedSuggestions);
                } else {
                    setSuggestions([]);
                }
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText, autocompleteService]);

    const handleSelect = async (suggestion: TripPlace) => {
        if (!selectedPlaces.some(p => p.placeId === suggestion.placeId)) {
            setSelectedPlaces(prev => [...prev, suggestion]);
        }

        setSearchText("");
        setSuggestions([]);
        setActiveIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter" && activeIndex >= 0) {
            handleSelect(suggestions[activeIndex]);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">장소 선택</h1>

            <input
                type="text"
                className="w-full p-2 border rounded mb-2 bg-white"
                placeholder="관광지 입력..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onKeyDown={handleKeyDown}
            />

            {suggestions.length > 0 && (
                <ul className="border rounded mb-4">
                    {suggestions.map((s, i) => (
                        <li
                            key={s.placeId}
                            className={`p-2 cursor-pointer ${i === activeIndex ? "bg-gray-200" : ""}`}
                            onMouseEnter={() => setActiveIndex(i)}
                            onClick={() => handleSelect(s)}
                        >
                            {s.placeName}
                        </li>
                    ))}
                </ul>
            )}

            <h2 className="font-semibold mb-2">선택된 장소</h2>
            <ul className="list-none">
                {selectedPlaces.map((place) => (
                    <li
                        key={place.placeId}
                        className="bg-gray-200 px-3 pt-1 pb-2 mb-2 rounded flex items-baseline justify-between"
                    >
                        {place.placeName}
                        <button
                            onClick={() => setSelectedPlaces(prev => prev.filter(p => p.placeId !== place.placeId))}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200 text-2xl font-bold leading-none"
                            aria-label={`Delete ${place.placeName}`}
                        >
                            &times;
                        </button>
                    </li>
                ))}
            </ul>

            <button
                disabled={selectedPlaces.length === 0}
                className={`mt-4 w-full py-2 rounded
                    ${selectedPlaces.length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                onClick={() => navi("/trip/plan/schedule", { state: { selectedPlaces } })}
            >
                일정 정하기
            </button>
        </div>
    );
}