import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TripPlanMap from '../../components/trips/TripPlanMap';
import type { TripDTO, TripPlaceDTO } from '../../types/trip';
import { useAuth } from '../../contexts/AuthContext';
import { PLAN_URL } from '../../config';
import TripPlanSidebar from '../../components/trips/TripPlanSidebar';
import TripPlanCopyModal from '../../components/trips/TripPlanCopyModal';
import TripPlanMemberModal from '../../components/trips/TripPlanMemberModal';
import { FaDownload, FaUser } from 'react-icons/fa';

export default function TripPlanView() {
    const { user } = useAuth();
    const { tripId } = useParams<{ tripId: string }>();
    const navi = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [trip, setTrip] = useState<TripDTO | null>(null);
    const [isOwner, setIsOwner] = useState(false);

    const [selectedDay, setSelectedDay] = useState(1);
    const [focusedPlace, setFocusedPlace] = useState<TripPlaceDTO | undefined>(undefined);
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

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

                if (response.status === 403) {
                    throw new Error("이 여행을 볼 권한이 없습니다.");
                }
                if (!response.ok) {
                    throw new Error('여행 정보를 불러오는 데 실패했습니다.');
                }
                const data: TripDTO = await response.json();

                if (user && data.ownerId === user.userId) {
                    setIsOwner(true);
                } else {
                    setIsOwner(false);
                }

                setTrip(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrip();
    }, [tripId, navi, user]);

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

    const updateShareStatus = async (tripDayIds: string[], isPublic: boolean) => {
        if (!trip) return false;

        setIsUpdating(true);
        try {
            const response = await fetch(`${PLAN_URL}/trip/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tripId: trip.tripId, tripDayIds, isPublic }),
                credentials: 'include',
            });
            if (!response.ok) throw new Error('공개 설정 변경에 실패했습니다.');
            return true;
        } catch (err) {
            alert((err as Error).message);
            return false;
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggleTripPublic = async () => {
        if (!trip || isUpdating) return;

        const originalTrip = trip;
        const newIsPublic = !trip.isPublic;

        const newTrip: TripDTO = {
            ...trip,
            isPublic: newIsPublic,
            tripDays: trip.tripDays.map(day => ({ ...day, isPublic: newIsPublic })),
        };
        setTrip(newTrip);

        const allDayIds = trip.tripDays.map(day => day.tripDayId);
        const success = await updateShareStatus(allDayIds, newIsPublic);

        if (!success) {
            setTrip(originalTrip);
        }
    };

    const handleToggleDayPublic = async (tripDayId: string) => {
        if (!trip || isUpdating) return;

        const originalTrip = trip;
        const dayToUpdate = trip.tripDays.find(d => d.tripDayId === tripDayId);
        if (!dayToUpdate) return;

        const newIsPublic = !dayToUpdate.isPublic;

        const newTrip: TripDTO = {
            ...trip,
            tripDays: trip.tripDays.map(day =>
                day.tripDayId === tripDayId ? { ...day, isPublic: newIsPublic } : day
            ),
        };
        setTrip(newTrip);

        const success = await updateShareStatus([tripDayId], newIsPublic);

        if (!success) {
            setTrip(originalTrip);
        }
    };

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
                    isOwner={isOwner}
                    selectedDay={selectedDay}
                    setSelectedDay={setSelectedDay}
                    focusedPlace={focusedPlace}
                    setFocusedPlace={setFocusedPlace}
                    isUpdating={isUpdating}
                    onToggleTripPublic={handleToggleTripPublic}
                    onToggleDayPublic={handleToggleDayPublic}
                />
                <div className='flex-1 overflow-hidden relative'>
                    <TripPlanMap
                        trip={trip}
                        selectedDay={selectedDay}
                        focusedPlace={focusedPlace}
                        setFocusedPlace={setFocusedPlace}
                    />

                    {isOwner && trip && (
                        <button
                            onClick={() => setIsMembersModalOpen(true)}
                            className="absolute top-4 right-4 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-md hover:bg-gray-50 flex items-center gap-2 z-10"
                        >
                            <FaUser />
                            <span>멤버 관리</span>
                        </button>
                    )}

                    {!isOwner && trip && (
                        <button
                            onClick={() => setIsCopyModalOpen(true)}
                            className="absolute bottom-6 right-6 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-blue-700 flex items-center gap-2 z-10"
                        >
                            <FaDownload />
                            <span className="font-semibold">내 일정으로 가져오기</span>
                        </button>
                    )}
                </div>
            </main>

            {trip && (
                <>
                    <TripPlanCopyModal
                        isOpen={isCopyModalOpen}
                        onClose={() => setIsCopyModalOpen(false)}
                        tripToCopy={trip}
                    />
                    <TripPlanMemberModal
                        isOpen={isMembersModalOpen}
                        onClose={() => setIsMembersModalOpen(false)}
                        currentTrip={trip}
                    />
                </>
            )}
        </div>
    );
}