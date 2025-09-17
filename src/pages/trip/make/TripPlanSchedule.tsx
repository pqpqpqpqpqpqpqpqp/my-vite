import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DayPicker, type DateRange } from "react-day-picker";
import { differenceInCalendarDays, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "sonner";
import type { PlaceSuggestion } from "../../../types/trip";
import { PLAN_URL } from "../../../config";

import "react-day-picker/dist/style.css";
import "../../../css/calender.css";

interface LocationState {
    selectedPlaces: PlaceSuggestion[];
    tripTitle: string;
}

interface CreateTripRequestDTO {
    ownerId: string;
    tripTitle: string;
    startDate: Date;
    endDate: Date;
    mainPlaceIds: string[];
}

interface CreateTripResponseDTO {
    tripId: string;
    ownerId: string;
    tripTitle: string;
    startDate: string;
    endDate: string;
    isPublic: boolean;
    delYn: boolean;
}

export default function TripPlanSchedule() {
    const navi = useNavigate();
    const location = useLocation();
    const { state } = location as { state: LocationState };
    const { user } = useAuth();

    const [selectedDays, setSelectedDays] = useState<DateRange | undefined>(undefined);
    const [isCreating, setIsCreating] = useState(false);

    const selectedPlaces = useMemo(() => state?.selectedPlaces || [], [state?.selectedPlaces]);
    const tripTitle = useMemo(() => state?.tripTitle || "나의 멋진 여행", [state?.tripTitle]);

    useEffect(() => {
        if (!selectedPlaces.length || !user?.userId) {
            toast.error("잘못된 접근입니다. 여행지 선택부터 다시 시작해주세요.");
            navi("/trip/plan/select");
        }
    }, [selectedPlaces, user?.userId, navi]);

    const getDaysCount = (from?: Date, to?: Date) => {
        if (!from || !to) return 0;
        return differenceInCalendarDays(to, from) + 1;
    };

    const daysCount = getDaysCount(selectedDays?.from, selectedDays?.to);

    let footerText = "여행 시작일과 종료일을 선택해주세요.";
    if (selectedDays?.from) {
        if (!selectedDays.to) {
            footerText = `${format(selectedDays.from, 'PPP', { locale: ko })} 부터`;
        } else if (selectedDays.to) {
            footerText = `${format(selectedDays.from, 'PPP', { locale: ko })} - ${format(selectedDays.to, 'PPP', { locale: ko })}`;
        }
    }

    const handleCreateTrip = async () => {
        if (!selectedDays?.from || !selectedDays?.to || !user?.userId) {
            toast.info("여행 기간을 선택하고 로그인 상태를 확인해주세요.");
            return;
        }

        setIsCreating(true);

        const tripData: CreateTripRequestDTO = {
            ownerId: user.userId,
            tripTitle: tripTitle,
            startDate: selectedDays.from,
            endDate: selectedDays.to,
            mainPlaceIds: selectedPlaces.map((p) => p.placeId),
        };

        try {
            const response = await fetch(`${PLAN_URL}/trip/plan/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(tripData),
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("여행 계획 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
            }

            const createdTrip: CreateTripResponseDTO = await response.json();

            toast.success("여행 계획이 저장되었습니다!");
            navi(`/trip/plan/make/detail/${createdTrip.tripId}`);

        } catch (error) {
            console.error(error);
            toast.error((error as Error).message || "알 수 없는 오류가 발생했습니다.");
        } finally {
            setIsCreating(false);
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 truncate">{tripTitle}</h2>
                    <p className="text-sm text-gray-400 mt-1 truncate">
                        {selectedPlaces.map((p: { placeName: string }) => p.placeName).join(', ')}
                    </p>
                    <h1 className="text-3xl font-bold text-gray-800 mt-4">언제 떠나시나요?</h1>
                    <p className="text-gray-500 mt-2">여행 일정을 선택하여 계획을 완성하세요.</p>
                </div>

                <div className="flex justify-center">
                    <DayPicker
                        mode="range"
                        selected={selectedDays}
                        onSelect={setSelectedDays}
                        disabled={{ before: new Date() }}
                        locale={ko}
                        numberOfMonths={1}
                        pagedNavigation
                    />
                </div>

                <div className="mt-8">
                    <div className="text-center bg-gray-100 p-4 rounded-lg mb-6">
                        <p className="font-semibold text-gray-700">선택된 기간</p>
                        <p className="text-blue-600 font-bold text-lg min-h-[28px]">
                            {footerText}
                        </p>
                        {daysCount > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                                총 <strong>{daysCount}</strong>일간의 여정
                            </p>
                        )}
                    </div>

                    <button
                        className={`w-full py-3 rounded-lg text-lg font-semibold text-white transition-all duration-300 transform hover:scale-105
                            ${daysCount > 0 && !isCreating
                                ? "bg-blue-600 hover:bg-blue-700 shadow-md"
                                : "bg-gray-300 cursor-not-allowed"
                            }`}
                        disabled={!daysCount || isCreating}
                        onClick={handleCreateTrip}
                    >
                        {isCreating ? "저장하는 중..." : "저장하고 다음 단계로"}
                    </button>
                </div>
            </div>
        </div>
    );
}