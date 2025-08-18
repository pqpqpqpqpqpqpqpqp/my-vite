import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { placeApiLoader } from "../../api/PlaceApiLoader";
import type { TripPlace, TripPlaceData } from "../../types/trip";

export default function TripPlanSelect() {
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState<TripPlace[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [selectedPlaces, setSelectedPlaces] = useState<TripPlaceData[]>([]);

    const navi = useNavigate();

    useEffect(() => {
        if (!searchText) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(() => {
            async function handleSuggestion() {
                const { AutocompleteSuggestion } = await placeApiLoader.importLibrary("places");

                const AutoComReq = {
                    input: searchText,
                    language: 'ko',
                };

                try {
                    const res = await AutocompleteSuggestion.fetchAutocompleteSuggestions(AutoComReq);

                    const allowedTypes = [
                        "country",
                        "administrative_area_level_1",
                        "locality"
                    ];

                    const filtered = (res.suggestions || []).filter(s => {
                        const types = s.placePrediction?.types || [];
                        return types.some(t => allowedTypes.includes(t));
                    });

                    const simplifiedSuggestions = filtered.map(s => ({
                        placeId: s.placePrediction?.placeId || "",
                        placeName: s.placePrediction?.text?.text || "",
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
    }, [searchText]);

    const handleSelect = async (suggestion: TripPlace) => {
        const { Place } = await placeApiLoader.importLibrary("places");
        const placeId = suggestion.placeId || "";

        if (placeId && !selectedPlaces.some(place => place.placeId === placeId)) {
            const detailPlace = await new Place({ id: placeId }).fetchFields({ fields: ['formattedAddress', 'types', 'location'] });
            const types = detailPlace.place.types || [];
            const matchedType = types.find(t => [
                "country",
                "administrative_area_level_1",
                "locality"
            ].includes(t));

            console.log(detailPlace);

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
        }

        setSearchText("");
        setSuggestions([]);
        setActiveIndex(-1);
    };

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
        <div className="max-w-xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">장소 선택</h1>

            <input
                type="text"
                className="w-full p-2 border rounded mb-2 bg-white"
                placeholder="도시나 국가 입력..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
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
                            onClick={() => {
                                setSelectedPlaces((prev) =>
                                    prev.filter((p) => p.placeId !== place.placeId)
                                );
                            }}
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
                onClick={() => {
                    navi("/trip/plan/schedule", {
                        state: { selectedPlaces }
                    });
                }}
            >
                일정 정하기
            </button>
        </div>
    );
}