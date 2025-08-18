import { useState, useEffect } from "react";
import { placeApiLoader } from "../../api/PlaceApiLoader";
import type { TripPlace, TripPlaceData, TripDetailData, TripPlaceSearchModalProps } from "../../types/trip";

export default function TripPlanSearchModal({
    onClose,
    selectedDay,
    selectedPlaces,
    setTripDetailDataGroupingDay,
}: TripPlaceSearchModalProps) {
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState<TripPlace[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [newSelectedPlaces, setNewSelectedPlaces] = useState<TripPlaceData[]>([]);

    useEffect(() => {
        if (!searchText) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(() => {
            async function handleSuggestion() {
                const { Place, AutocompleteSuggestion } = await placeApiLoader.importLibrary("places");

                const combineBounds = new google.maps.LatLngBounds();

                selectedPlaces.forEach(async (place) => {
                    const placeBound = await new Place({ id: place.placeId }).fetchFields({ fields: ['viewport'] });
                    if (placeBound && placeBound.place.viewport) {
                        combineBounds.union(placeBound.place.viewport);
                    }
                });

                const AutoComReq = {
                    input: searchText,
                    language: 'ko',
                    locationRestriction: combineBounds
                };

                try {
                    const res = await AutocompleteSuggestion.fetchAutocompleteSuggestions(AutoComReq);

                    console.log(res.suggestions);

                    setSuggestions(res.suggestions.map(s => ({
                        placeId: s.placePrediction?.placeId || "",
                        placeName: s.placePrediction?.text?.text || "",
                    })));
                } catch (error) {
                    console.error(error);
                    setSuggestions([]);
                }
            }

            handleSuggestion();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText, selectedPlaces]);

    const handleSelect = async (suggestion: TripPlace) => {
        const { Place } = await placeApiLoader.importLibrary("places");
        const placeId = suggestion.placeId || "";

        if (placeId && !selectedPlaces.some(place => place.placeId === placeId)) {
            const detailPlace = await new Place({ id: placeId }).fetchFields({ fields: ['displayName', 'formattedAddress', 'primaryType', 'location'] });
            console.log(detailPlace);

            if (detailPlace.place) {
                setNewSelectedPlaces((prev) => [...prev, {
                    placeId: placeId,
                    placeName: suggestion.placeName || "",
                    address: detailPlace.place.formattedAddress || "",
                    placeType: detailPlace.place.primaryType || "",
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
        <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg">
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
                <ul className="border rounded mb-4 bg-gray-50">
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

            <button
                className="mt-4 w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                    const tripDetailDataList: TripDetailData[] = newSelectedPlaces.map((place, index) => ({
                        placeId: place.placeId,
                        dayOrder: selectedDay,
                        placeName: place.placeName,
                        placeLat: place.placeLat,
                        placeLng: place.placeLng,
                        orderInDay: index + 1,
                    }));

                    setTripDetailDataGroupingDay(new Map<number, TripDetailData[]>([[selectedDay, tripDetailDataList]]));
                    setNewSelectedPlaces([]);
                    setSearchText("");
                    onClose();
                }}
            >
                장소 선택 완료
            </button>
        </div>
    );
}
// 수정해야 할 사항: 모달창이 따로 나오지 않음, locationRestriction이 combineBound로는 작동하지 않음