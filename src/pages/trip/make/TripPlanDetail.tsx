import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TripPlanMap from "../../../components/trips/TripPlanMap";
import TripPlaceSearchModal from "../../../components/trips/TripPlaceSearchModal";
import TripPlaceEditModal from "../../../components/trips/TripPlaceEditModal";
import type { TripDTO, TripPlaceDTO } from "../../../types/trip";
import { FaMapMarkedAlt, FaPlus, FaPencilAlt, FaTrash, FaClock } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { PLAN_URL } from "../../../config";
import { toast } from "sonner";

interface TripPlaceOrderDTO {
    tripPlaceId: string;
    tripDayId: string;
    orderInDay: number;
}

export default function TripPlanDetail() {
    const navi = useNavigate();
    const { tripId } = useParams<{ tripId: string }>();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [trip, setTrip] = useState<TripDTO | null>(null);

    const [selectedDay, setSelectedDay] = useState(1);
    const [focusedPlace, setFocusedPlace] = useState<TripPlaceDTO | undefined>(undefined);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [editingPlace, setEditingPlace] = useState<TripPlaceDTO | null>(null);

    const fetchTripDetail = useCallback(async () => {
        if (!tripId) {
            toast.warning('여행 정보가 없습니다');
            navi('/trip/plan/select');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${PLAN_URL}/trip/plan/${tripId}`, {
                method: "GET",
                credentials: "include"
            });
            if (!response.ok) throw new Error("여행 상세 정보를 불러오는데 실패했습니다.");
            const data: TripDTO = await response.json();

            setTrip(data);
        } catch (err) {
            console.error("Fetch Error:", err);
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [tripId, navi]);

    useEffect(() => {
        fetchTripDetail();
    }, [fetchTripDetail]);

    const handleDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination || !trip) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const newTripDays = Array.from(trip.tripDays);
        const sourceDayOrder = parseInt(source.droppableId.split('-')[1]);
        const destinationDayOrder = parseInt(destination.droppableId.split('-')[1]);
        const sourceDayIndex = newTripDays.findIndex(day => day.dayOrder === sourceDayOrder);
        const destinationDayIndex = newTripDays.findIndex(day => day.dayOrder === destinationDayOrder);
        const sourceDay = newTripDays[sourceDayIndex];
        const destinationDay = newTripDays[destinationDayIndex];
        const draggedPlace = sourceDay.tripPlaces.find(p => p.tripPlaceId === draggableId);
        if (!draggedPlace) return;

        let serverOrderList: TripPlaceOrderDTO[] = [];

        if (source.droppableId === destination.droppableId) {
            const newPlaces = Array.from(sourceDay.tripPlaces);
            const [reorderedItem] = newPlaces.splice(source.index, 1);
            newPlaces.splice(destination.index, 0, reorderedItem);
            const updatedPlaces = newPlaces.map((place, idx) => ({ ...place, orderInDay: idx + 1 }));
            sourceDay.tripPlaces = updatedPlaces;
            serverOrderList = updatedPlaces.map(p => ({
                tripPlaceId: p.tripPlaceId,
                tripDayId: sourceDay.tripDayId,
                orderInDay: p.orderInDay
            }));
        }

        else {
            const newSourcePlaces = Array.from(sourceDay.tripPlaces);
            newSourcePlaces.splice(source.index, 1);
            const updatedSourcePlaces = newSourcePlaces.map((p, idx) => ({ ...p, orderInDay: idx + 1 }));
            sourceDay.tripPlaces = updatedSourcePlaces;

            const newDestinationPlaces = Array.from(destinationDay.tripPlaces);
            newDestinationPlaces.splice(destination.index, 0, draggedPlace);
            const updatedDestinationPlaces = newDestinationPlaces.map((p, idx) => ({ ...p, orderInDay: idx + 1 }));
            destinationDay.tripPlaces = updatedDestinationPlaces;

            serverOrderList = [
                ...updatedSourcePlaces.map(p => ({
                    tripPlaceId: p.tripPlaceId,
                    tripDayId: sourceDay.tripDayId,
                    orderInDay: p.orderInDay
                })),
                ...updatedDestinationPlaces.map(p => ({
                    tripPlaceId: p.tripPlaceId,
                    tripDayId: destinationDay.tripDayId,
                    orderInDay: p.orderInDay
                }))
            ];
        }

        setTrip({ ...trip, tripDays: newTripDays });

        fetch(`${PLAN_URL}/trip/place/order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(serverOrderList),
        })
            .then(response => {
                if (!response.ok) throw new Error("순서 저장에 실패했습니다.");
            })
            .catch(error => {
                console.error("순서 저장 실패:", error);
                toast.error("순서 저장에 실패했습니다. 새로고침이 필요할 수 있습니다.");
            });
    };


    const handlePlaceDelete = async (dayNumber: number, tripPlaceId: string) => {
        if (!window.confirm("정말로 이 장소를 삭제하시겠습니까?") || !trip) return;

        try {
            const response = await fetch(`${PLAN_URL}/trip/place/del/${tripPlaceId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) throw new Error("장소 삭제에 실패했습니다.");

            const updatedTripDays = trip.tripDays.map(day => {
                if (day.dayOrder === dayNumber) {
                    const updatedPlaces = day.tripPlaces.filter(p => p.tripPlaceId !== tripPlaceId);
                    return { ...day, tripPlaces: updatedPlaces };
                }
                return day;
            });
            setTrip({ ...trip, tripDays: updatedTripDays });

            toast.success("장소가 삭제되었습니다.");

        } catch (err) {
            toast.error((err as Error).message);
        }
    };

    const handleSavePlaceDetails = (updatedPlace: TripPlaceDTO) => {
        if (!trip) return;
        const updatedTripDays = trip.tripDays.map(day => ({
            ...day,
            tripPlaces: day.tripPlaces.map(p =>
                p.tripPlaceId === updatedPlace.tripPlaceId ? updatedPlace : p
            )
        }));
        setTrip({ ...trip, tripDays: updatedTripDays });
        setEditingPlace(null);
        toast.success("장소 정보가 수정되었습니다.");
    };

    const getFormattedDate = (dayIndex: number) => {
        if (!trip?.startDate) return '';
        const date = new Date(trip.startDate);
        date.setDate(date.getDate() + dayIndex);
        const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', weekday: 'long' };
        return new Intl.DateTimeFormat('ko-KR', options).format(date);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-gray-600">여행 계획을 불러오는 중입니다...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
                <p className="text-gray-700">{error}</p>
                <button
                    onClick={() => navi('/trip/plan/lists')}
                    className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    목록으로 돌아가기
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex flex-col lg:flex-row max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 gap-8">
                {/* 좌측: 지도 영역 */}
                <div className="lg:w-1/2 w-full">
                    <div className="lg:sticky lg:top-6">
                        <div className="h-200 rounded-2xl overflow-hidden shadow-lg border">
                            <TripPlanMap
                                trip={trip}
                                selectedDay={selectedDay}
                                focusedPlace={focusedPlace}
                                setFocusedPlace={setFocusedPlace}
                            />
                        </div>
                    </div>
                </div>

                {/* 우측: 일정 계획 영역 */}
                <div className="lg:w-1/2 w-full">
                    {/* ... 헤더 및 완료 버튼 ... */}

                    <DragDropContext onDragEnd={handleDragEnd}>
                        <div className="space-y-6">
                            {(trip?.tripDays ?? []).map((day, i) => (
                                <div key={day.tripDayId} className="bg-white p-6 rounded-2xl shadow-md border">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">{day.dayOrder}</div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-800">Day {day.dayOrder}</h2>
                                            <p className="text-sm text-gray-500">{getFormattedDate(i)}</p>
                                        </div>
                                    </div>

                                    <Droppable droppableId={`day-${day.dayOrder}`}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="space-y-3"
                                            >
                                                {day.tripPlaces.length > 0 ? (
                                                    day.tripPlaces.map((place, index) => (
                                                        <Draggable key={place.tripPlaceId} draggableId={place.tripPlaceId} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={`p-4 rounded-lg border transition-all duration-300 
                                                                        ${focusedPlace?.tripPlaceId === place.tripPlaceId ? 'bg-blue-50 border-blue-400 shadow-lg' : 'bg-gray-50 border-transparent hover:border-gray-300'}
                                                                        ${snapshot.isDragging ? 'bg-blue-100 shadow-xl' : ''}`
                                                                    }
                                                                >
                                                                    <div className="flex items-start gap-4">
                                                                        <div className="text-xl font-bold text-blue-500 mt-1">{place.orderInDay}</div>
                                                                        <div className="flex-1">
                                                                            <div className="flex justify-between items-center">
                                                                                <button className="font-semibold text-gray-800 text-left hover:text-blue-600" onClick={() => { setFocusedPlace(place); setSelectedDay(day.dayOrder); }}>{place.placeName}</button>
                                                                                <div className="flex items-center gap-3">
                                                                                    <button className="text-gray-400 hover:text-blue-500" onClick={() => setEditingPlace(place)}><FaPencilAlt /></button>
                                                                                    <button className="text-gray-400 hover:text-red-500" onClick={() => handlePlaceDelete(day.dayOrder, place.tripPlaceId)}><FaTrash /></button>
                                                                                </div>
                                                                            </div>
                                                                            <div className="mt-2 text-sm text-gray-600 flex items-center gap-2"><FaClock className="text-gray-400" /><span>{place.visitTime || '시간 미정'}</span></div>
                                                                            <div className="mt-1 text-sm text-gray-600 flex items-start gap-2"><FaPencilAlt className="text-gray-400 mt-1 flex-shrink-0" /><p className="whitespace-pre-wrap">{place.memo || '메모 없음'}</p></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg"><FaMapMarkedAlt className="mx-auto text-3xl text-gray-300 mb-2" /><p>아직 계획된 장소가 없습니다.</p></div>
                                                )}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>

                                    <button className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition-colors" onClick={() => { setSelectedDay(day.dayOrder); setIsSearchModalOpen(true); }}><FaPlus /> 장소 추가하기</button>
                                </div>
                            ))}
                        </div>
                    </DragDropContext>
                </div>
            </div>

            {
                isSearchModalOpen && (
                    <TripPlaceSearchModal
                        selectedDay={selectedDay}
                        trip={trip}
                        setTrip={setTrip}
                        onClose={() => setIsSearchModalOpen(false)}
                    />
                )
            }

            {
                editingPlace && (
                    <TripPlaceEditModal
                        place={editingPlace}
                        onClose={() => setEditingPlace(null)}
                        onSave={handleSavePlaceDetails}
                    />
                )
            }
        </div >
    );
}