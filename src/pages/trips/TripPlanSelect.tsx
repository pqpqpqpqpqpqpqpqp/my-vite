import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import type { TripPlace, TripPlaceData } from "../../types/trip";

export default function TripPlanSelect() {
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState<TripPlace[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [selectedPlaces, setSelectedPlaces] = useState<TripPlaceData[]>([]);
    const placesLib = useMapsLibrary("places");

    const navi = useNavigate();

    useEffect(() => {
        if (!searchText) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(() => {
            async function handleSuggestion() {

                const AutoComReq = {
                    input: searchText,
                    language: 'ko',
                };

                try {
                    const res = await placesLib?.AutocompleteSuggestion.fetchAutocompleteSuggestions(AutoComReq);

                    const allowedTypes = [
                        "country",
                        "administrative_area_level_1",
                        "locality"
                    ];

                    const filtered = (res?.suggestions || []).filter(s => {
                        const types = s.placePrediction?.types || [];
                        return types.some(t => allowedTypes.includes(t));
                    });

                    const simplifiedSuggestions = filtered.map(s => ({
                        placeId: s.placePrediction?.placeId || "",
                        placeName: s.placePrediction?.mainText?.text || "",
                    }));

                    setSuggestions(simplifiedSuggestions);
                } catch (error) {
                    console.error(error);
                    setSuggestions([]);
                }
            }

            handleSuggestion();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText, placesLib]);

    const handleSelect = async (suggestion: TripPlace) => {
        if (!placesLib) return;
        const placeId = suggestion.placeId || "";

        if (placeId && !selectedPlaces.some(place => place.placeId === placeId)) {
            try {
                const detailPlace = await new placesLib.Place({ id: placeId })
                    .fetchFields({ fields: ["formattedAddress", "types", "location"] });
                const types = detailPlace.place.types || [];
                const matchedType = types.find(t => [
                    "country",
                    "administrative_area_level_1",
                    "locality"
                ].includes(t));

                if (detailPlace.place) {
                    setSelectedPlaces((prev) => [...prev, {
                        placeId: placeId,
                        placeName: suggestion.placeName || "",
                        address: detailPlace.place.formattedAddress || "",
                        placeType: matchedType || "political",
                        placeLat: detailPlace.place.location?.lat() || 0,
                        placeLng: detailPlace.place.location?.lng() || 0,
                    }]);
                }
            } catch (err) {
                console.error("Place fetch error:", err);
            }

            setSearchText("");
            setSuggestions([]);
            setActiveIndex(-1);
        };
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter" && activeIndex >= 0) {
            handleSelect(suggestions[activeIndex]);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-md">
            <h1 className="text-2xl font-semibold mb-6 text-center text-gray-900">
                장소 선택
            </h1>

            <input
                type="text"
                className="w-full p-4 border border-gray-300 rounded-xl mb-4 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                placeholder="도시나 국가 입력..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleKeyDown}
            />

            {suggestions.length > 0 && (
                <ul className="border border-gray-200 rounded-xl overflow-hidden mb-6 bg-white text-base">
                    {suggestions.map((s, i) => (
                        <li
                            key={s.placeId}
                            className={`p-3 cursor-pointer hover:bg-gray-100 transition-colors ${i === activeIndex ? "bg-gray-100" : ""
                                }`}
                            onMouseEnter={() => setActiveIndex(i)}
                            onClick={() => handleSelect(s)}
                        >
                            {s.placeName}
                        </li>
                    ))}
                </ul>
            )}

            <h2 className="font-medium mb-3 text-gray-800 text-lg">선택된 장소</h2>
            <ul className="space-y-3">
                {selectedPlaces.map((place) => (
                    <li
                        key={place.placeId}
                        className="flex justify-between items-center bg-gray-50 rounded-xl p-3 shadow-sm"
                    >
                        <span>{place.placeName}</span>
                        <button
                            onClick={() => {
                                setSelectedPlaces((prev) =>
                                    prev.filter((p) => p.placeId !== place.placeId)
                                );
                            }}
                            className="text-red-500 hover:text-red-700 text-xl font-semibold"
                            aria-label={`Delete ${place.placeName}`}
                        >
                            &times;
                        </button>
                    </li>
                ))}
            </ul>

            <button
                disabled={selectedPlaces.length === 0}
                className={`mt-5 w-full py-3 rounded-xl text-base font-medium transition-colors
            ${selectedPlaces.length === 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                onClick={() => {
                    navi("/trip/plan/schedule", { state: { selectedPlaces } });
                }}
            >
                일정 정하기
            </button>
        </div>
    );
}