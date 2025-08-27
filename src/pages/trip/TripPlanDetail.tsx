import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TripPlanMap from "../../components/trips/TripPlanMap";
import TripPlaceSearchModal from "../../components/trips/TripPlaceSearchModal";
import type { TripDetailData } from "../../types/trip";

export default function TripPlanDetail() {
    const navi = useNavigate();
    const { state } = useLocation();

    const { selectedPlaces, daysCount } = state || {};

    const [selectedDay, setSelectedDay] = useState(1);
    const [tripDetailDataGroupingDay, setTripDetailDataGroupingDay] = useState(new Map<number, TripDetailData[]>());
    const [focusedPlace, setFocusedPlace] = useState<TripDetailData | undefined>(undefined);
    const [editingMemo, setEditingMemo] = useState<{ day: number, order: number } | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleMemoChange = (dayNumber: number, orderInDay: number, newMemo: string) => {
        const newTripDetails = new Map(tripDetailDataGroupingDay);
        const dayPlaces = newTripDetails.get(dayNumber) || [];
        const updatedPlaces = dayPlaces.map(place =>
            place.orderInDay === orderInDay ? { ...place, memo: newMemo } : place
        );
        newTripDetails.set(dayNumber, updatedPlaces);
        setTripDetailDataGroupingDay(newTripDetails);
    };

    return (
        <div className="w-2xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
            <div className="w-full h-96 mb-3">
                <TripPlanMap
                    tripDetailDataGroupingDay={tripDetailDataGroupingDay}
                    selectedDay={selectedDay}
                    focusedPlace={focusedPlace}
                    setFocusedPlace={setFocusedPlace}
                />
            </div>

            {Array.from({ length: daysCount }, (_, i) => {
                const dayNumber = i + 1;
                const tripDetails = tripDetailDataGroupingDay.get(dayNumber) || [];
                return (
                    <div key={dayNumber} className="mb-4">
                        <h2 className="text-xl font-semibold mb-2">Day {dayNumber}</h2>
                        {tripDetails.length > 0 ? (
                            tripDetails.map((place) => (
                                <div
                                    key={place.orderInDay}
                                    className="p-4 bg-white rounded-md shadow-sm mb-2"
                                >
                                    <div
                                        className="font-medium text-gray-800 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setFocusedPlace(place)
                                            setSelectedDay(dayNumber);
                                        }}
                                    >
                                        {place.placeName}
                                    </div>
                                    {/* 메모 영역 추가 */}
                                    <div className="mt-2 text-sm text-gray-600">
                                        {editingMemo?.day === dayNumber && editingMemo?.order === place.orderInDay ? (
                                            <input
                                                type="text"
                                                defaultValue={place.placeMemo || ''}
                                                onBlur={(e) => {
                                                    handleMemoChange(dayNumber, place.orderInDay, e.target.value);
                                                    setEditingMemo(null);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleMemoChange(dayNumber, place.orderInDay, e.currentTarget.value);
                                                        setEditingMemo(null);
                                                    }
                                                }}
                                                autoFocus
                                                className="w-full p-1 border rounded"
                                            />
                                        ) : (
                                            <div onClick={() => setEditingMemo({ day: dayNumber, order: place.orderInDay })}>
                                                {place.placeMemo || '메모를 추가하세요...'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No places planned for this day.</p>
                        )}
                        <button
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={() => {
                                setSelectedDay(dayNumber);
                                setIsModalOpen(true);
                            }}
                        >
                            장소 추가
                        </button>
                    </div>
                );
            })}

            {isModalOpen && (
                <TripPlaceSearchModal
                    selectedPlaces={selectedPlaces}
                    selectedDay={selectedDay}
                    tripDetailDataGroupingDay={tripDetailDataGroupingDay}
                    setTripDetailDataGroupingDay={setTripDetailDataGroupingDay}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            <button
                className="mt-6 w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => {
                    navi("/");
                }}
            >
                일정 만들기 완료
            </button>
        </div>
    );
}
