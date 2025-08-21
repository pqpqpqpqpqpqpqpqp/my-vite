import { useState, useEffect } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import type { TripPlace, TripPlaceData, TripDetailData, TripPlaceSearchModalProps } from "../../types/trip";

export default function TripPlanSearchModal({
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
        if (!searchText) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(() => {
            async function handleSuggestion() {
                if (!placesLib) return;
                try {
                    const results = await Promise.all(
                        selectedPlaces.map(async (p) => {
                            const place = await new placesLib.Place({ id: p.placeId }).fetchFields({ fields: ['viewport'] });
                            const viewport = place.place?.viewport;
                            if (!viewport) return [];

                            const AutoComReq = {
                                input: searchText,
                                language: 'ko',
                                locationRestriction: viewport
                            };

                            const res = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(AutoComReq);
                            return res.suggestions.map(s => ({
                                placeId: s.placePrediction?.placeId || "",
                                placeName: s.placePrediction?.mainText?.text || "",
                            }));
                        })
                    );

                    const merged = results.flat();

                    const unique = Array.from(
                        new Map(merged.map(s => [s.placeId, s])).values()
                    );

                    setSuggestions(unique);
                } catch (error) {
                    console.error(error);
                    setSuggestions([]);
                }
            }

            handleSuggestion();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText, selectedPlaces, placesLib]);

    const handleSelect = async (suggestion: TripPlace) => {
        if (!placesLib) return;
        const placeId = suggestion.placeId || "";

        if (placeId && !selectedPlaces.some(place => place.placeId === placeId)) {
            const detailPlace = await new placesLib.Place({ id: placeId }).fetchFields({ fields: ['formattedAddress', 'primaryType', 'location'] });

            if (detailPlace.place) {
                setNewSelectedPlaces((prev) => [...prev, {
                    placeId: placeId,
                    placeName: suggestion.placeName || "",
                    address: detailPlace.place.formattedAddress || "",
                    placeType: detailPlace.place.primaryType || "locality",
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
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
                <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">
                    장소 검색 및 추가
                </h1>

                <input
                    type="text"
                    className="w-full p-2 border rounded mb-2"
                    placeholder="도시나 장소 입력..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={handleKeyDown}
                />

                {suggestions.length > 0 && (
                    <ul className="border rounded mb-4 bg-gray-50 max-h-40 overflow-y-auto">
                        {suggestions.map((s, i) => (
                            <li
                                key={s.placeId}
                                className={`p-2 cursor-pointer hover:bg-gray-200 ${i === activeIndex ? "bg-gray-200" : ""
                                    }`}
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
                    {newSelectedPlaces.map((place) => (
                        <li
                            key={place.placeId}
                            className="bg-gray-100 px-3 py-2 mb-2 rounded flex items-center justify-between"
                        >
                            {place.placeName}
                            <button
                                onClick={() =>
                                    setNewSelectedPlaces((prev) =>
                                        prev.filter((p) => p.placeId !== place.placeId)
                                    )
                                }
                                className="text-red-600 hover:text-red-800 font-bold"
                            >
                                &times;
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="flex gap-2 mt-4">
                    <button
                        className="flex-1 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                        onClick={onClose}
                    >
                        취소
                    </button>
                    <button
                        className="flex-1 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => {
                            const existing1 = tripDetailDataGroupingDay.get(selectedDay) || [];
                            const lastOrder = existing1.length > 0
                                ? Math.max(...existing1.map(p => p.orderInDay))
                                : 0;

                            const tripDetailDataList: TripDetailData[] = newSelectedPlaces.map((place, index) => ({
                                placeId: place.placeId,
                                dayOrder: selectedDay,
                                placeName: place.placeName,
                                placeLat: place.placeLat,
                                placeLng: place.placeLng,
                                orderInDay: lastOrder + index + 1,
                            }));

                            const newMap = new Map(tripDetailDataGroupingDay);
                            const existing = newMap.get(selectedDay) || [];
                            newMap.set(selectedDay, [...existing, ...tripDetailDataList]);

                            setTripDetailDataGroupingDay(newMap);
                            setNewSelectedPlaces([]);
                            setSearchText("");
                            onClose();
                        }}
                    >
                        장소 선택 완료
                    </button>
                </div>
            </div>
        </div>
    );
}