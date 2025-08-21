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

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="w-fit mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
            <div className="w-96 h-96">
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
                                    className="p-4 bg-white rounded-md shadow-sm mb-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => setFocusedPlace(place)}
                                >
                                    <div className="font-medium text-gray-800">{place.placeName}</div>
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
