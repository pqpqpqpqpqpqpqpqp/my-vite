import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TripPlanMap from "../../components/trips/TripPlanMap";
import { placeApiLoader } from "../../api/PlaceApiLoader";
import type { TripPlace } from "../../types/trip";

export default function TripPlanDetail() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { selectedPlaces, daysCount } = state || {};

    // 일차별 관리
    const [selectedDay, setSelectedDay] = useState(1);

    // tripDetailDataGroupingDay: Map<number, TripPlace[]>
    const [tripDetailDataGroupingDay, setTripDetailDataGroupingDay] = useState(
        () => {
            const map = new Map<number, TripPlace[]>();
            for (let i = 1; i <= daysCount; i++) {
                map.set(i, []);
            }
            return map;
        }
    );

    const [focusedPlace, setFocusedPlace] = useState<TripPlace | null>(null);

    // 모달 상태
    const [modalOpen, setModalOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState<TripPlace[]>([]);

    const handleSearch = async (input: string) => {
        if (!selectedPlaces.length) return;

        // 임의로 첫 선택 장소를 중심으로 5km 반경 검색
        const center = {
            lat: selectedPlaces[0].placeLat,
            lng: selectedPlaces[0].placeLng
        };

        try {
            const { SearchNearbyRankPreference, SearchBox } = await placeApiLoader.importLibrary("places");

            const res = await NearbySearch.fetchNearbyPlaces({
                location: center,
                radius: 5000,
                keyword: input
            });

            const simplifiedResults = (res.results || []).map(place => ({
                placeId: place.placeId,
                name: place.name,
                placeLat: place.geometry.location.lat,
                placeLng: place.geometry.location.lng,
                types: place.types,
            }));

            setSearchResults(simplifiedResults);
        } catch (error) {
            console.error(error);
            setSearchResults([]);
        }
    };

    const addPlaceToDay = (place: TripPlace) => {
        setTripDetailDataGroupingDay(prev => {
            const newMap = new Map(prev);
            const currentDayPlaces = newMap.get(selectedDay) || [];
            newMap.set(selectedDay, [...currentDayPlaces, place]);
            return newMap;
        });
        setModalOpen(false);
        setSearchText("");
        setSearchResults([]);
    };

    if (!selectedPlaces || !daysCount) {
        navigate("/trip/plan/select");
        return null;
    }

    return (
        <div className="max-w-5xl mx-auto p-4">
            {/* 일차 선택 */}
            <div className="flex space-x-2 mb-4 overflow-x-auto">
                {Array.from({ length: daysCount }, (_, i) => i + 1).map(day => (
                    <button
                        key={day}
                        className={`px-4 py-2 rounded ${selectedDay === day
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-800"
                            }`}
                        onClick={() => setSelectedDay(day)}
                    >
                        {day}일차
                    </button>
                ))}
            </div>

            {/* 지도 */}
            <div className="w-full h-[400px] mb-4 rounded-lg overflow-hidden">
                <TripPlanMap
                    tripDetailDataGroupingDay={tripDetailDataGroupingDay}
                    selectedDay={selectedDay}
                    focusedPlace={focusedPlace || undefined}
                    setFocusedPlace={(place) => setFocusedPlace(place)}
                />
            </div>

            {/* 일차별 장소 목록 */}
            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">선택된 장소</h2>
                <ul className="space-y-2">
                    {(tripDetailDataGroupingDay.get(selectedDay) || []).map(place => (
                        <li
                            key={place.placeId}
                            className="bg-gray-200 px-3 py-2 rounded flex justify-between items-center"
                        >
                            {place.name}
                            <button
                                className="text-red-600 hover:text-red-800 font-bold text-xl"
                                onClick={() => {
                                    setTripDetailDataGroupingDay(prev => {
                                        const newMap = new Map(prev);
                                        newMap.set(
                                            selectedDay,
                                            (newMap.get(selectedDay) || []).filter(
                                                p => p.placeId !== place.placeId
                                            )
                                        );
                                        return newMap;
                                    });
                                }}
                            >
                                &times;
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 장소 추가 버튼 */}
            <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={() => setModalOpen(true)}
            >
                장소 추가
            </button>

            {/* 모달 */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-50">
                    <div className="bg-white rounded-lg w-96 p-4">
                        <h3 className="text-lg font-semibold mb-2">장소 검색</h3>
                        <input
                            type="text"
                            className="w-full p-2 border rounded mb-2"
                            placeholder="장소 이름 입력"
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                handleSearch(e.target.value);
                            }}
                        />
                        <ul className="max-h-60 overflow-y-auto space-y-1">
                            {searchResults.map(place => (
                                <li
                                    key={place.placeId}
                                    className="p-2 border-b cursor-pointer hover:bg-gray-100"
                                    onClick={() => addPlaceToDay(place)}
                                >
                                    {place.name}
                                </li>
                            ))}
                            {searchResults.length === 0 && searchText && (
                                <li className="text-gray-500 p-2">검색 결과 없음</li>
                            )}
                        </ul>
                        <button
                            className="mt-2 text-gray-500 hover:text-gray-800"
                            onClick={() => setModalOpen(false)}
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
