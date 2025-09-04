import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TripPlanMap from '../../components/trips/TripPlanMap';
import type { TripDTO, TripPlaceDTO } from '../../types/trip';
import { PLAN_URL } from '../../config';
import { ClipLoader } from 'react-spinners';

interface TripPlanSidebarProps {
    trip: TripDTO | null;
    selectedDay: number;
    setSelectedDay: (day: number) => void;
    setFocusedPlace: (place: TripPlaceDTO) => void;
};

function TripPlanSidebar({
    trip,
    selectedDay,
    setSelectedDay,
    setFocusedPlace
}: TripPlanSidebarProps) {
    if (!trip) {
        return (
            <aside className="w-80 bg-white p-6 h-full overflow-y-auto shadow-md">
                <div className="flex justify-center items-center h-full">
                    <ClipLoader
                        color={"#3B82F6"}
                        loading={true}
                        size={40}
                        aria-label="Loading Spinner"
                    />
                </div>
            </aside>
        );
    }
    const { tripTitle, startDate, endDate, tripDays } = trip;

    return (
        <aside className="w-80 bg-white p-6 h-full overflow-y-auto shadow-md">
            <div className="mb-6 pb-4 border-b">
                <h1 className="text-2xl font-bold truncate">{tripTitle ?? '나의 여행'}</h1>
                <p className="text-gray-500 text-sm">
                    {startDate ?? ''} ~ {endDate ?? ''}
                </p>
            </div>

            <div className="bg-white rounded-xl overflow-hidden">
                {tripDays.sort((a, b) => a.dayOrder - b.dayOrder).map((dayData) => {
                    const isSelected = selectedDay === dayData.dayOrder;
                    return (
                        <div key={dayData.tripDayId} className="transition-all border-b last:border-none">
                            <div
                                onClick={() => setSelectedDay(dayData.dayOrder)}
                                className={`px-4 py-3 cursor-pointer flex items-center justify-between ${isSelected
                                    ? 'bg-blue-100 text-blue-800 font-semibold'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                <span>{dayData.dayOrder}일차</span>
                                {isSelected && (
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>

                            {isSelected && (
                                <div className="bg-gray-50 p-2 space-y-2">
                                    {dayData.tripPlaces.map((place) => (
                                        <div
                                            key={place.tripPlaceId}
                                            className="p-3 bg-white hover:bg-blue-50 transition rounded-md shadow-sm cursor-pointer"
                                            onClick={() => setFocusedPlace(place)}
                                        >
                                            <div className="font-medium text-gray-800">{place.placeName}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

export default function TripPlanView() {
    const { tripId } = useParams<{ tripId: string }>();
    const navi = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [trip, setTrip] = useState<TripDTO | null>(null);

    const [selectedDay, setSelectedDay] = useState(1);
    const [focusedPlace, setFocusedPlace] = useState<TripPlaceDTO | undefined>(undefined);

    useEffect(() => {
        if (!tripId) {
            navi('/');
            return;
        }

        const fetchTrip = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${PLAN_URL}/trip/plan/${tripId}`, { credentials: 'include' });
                if (!response.ok) {
                    throw new Error('여행 정보를 불러오는 데 실패했습니다.');
                }
                const data: TripDTO = await response.json();

                setTrip(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrip();
    }, [tripId, navi]);

    useEffect(() => {

        if (!trip) return;

        const selectedDayData = trip.tripDays.find(day => day.dayOrder === selectedDay);
        const placesForSelectedDay = selectedDayData?.tripPlaces;

        if (placesForSelectedDay && placesForSelectedDay.length > 0) {
            setFocusedPlace(placesForSelectedDay[0]);
        } else {
            setFocusedPlace(undefined);
        }
    }, [selectedDay, trip]);

    if (isLoading) {
        return <div className="h-full flex justify-center items-center"><p>여행 정보를 불러오는 중입니다...</p></div>;
    }

    if (error) {
        return <div className="h-full flex justify-center items-center text-red-500"><p>{error}</p></div>;
    }

    return (
        <div className="h-full flex flex-col">
            <main className="flex flex-1 overflow-hidden">
                <TripPlanSidebar
                    trip={trip}
                    selectedDay={selectedDay}
                    setSelectedDay={setSelectedDay}
                    setFocusedPlace={setFocusedPlace}
                />
                <div className='flex-1 overflow-hidden relative'>
                    <TripPlanMap
                        trip={trip}
                        selectedDay={selectedDay}
                        focusedPlace={focusedPlace}
                        setFocusedPlace={setFocusedPlace}
                    />
                </div>
            </main>
        </div>
    );
}