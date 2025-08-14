import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";

import "react-day-picker/dist/style.css";

export default function TripPlanSchedule() {
    const navi = useNavigate();
    const { state } = useLocation();

    const [selectedDays, setSelectedDays] = useState<DateRange | undefined>(undefined);
    const selectedPlaces = useMemo(() => state?.selectedPlaces || [], [state?.selectedPlaces]);

    useEffect(() => {
        if (!selectedPlaces.length) {
            navi("/trip/plan/select");
        }
    }, [selectedPlaces, navi]);

    function getDaysCount(from?: Date, to?: Date) {
        if (!from || !to) return 0;
        const diffTime = to.getTime() - from.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    return (
        <div className="w-fit mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">일정 선택</h1>
            <DayPicker
                mode="range"
                selected={selectedDays}
                onSelect={setSelectedDays}
                disabled={{ before: new Date() }}
            />
            <p className="text-center text-gray-600 mb-2">
                여행 시작일과 종료일을 선택해주세요
            </p>

            <p className="mt-4 text-center text-gray-700">
                여행 기간:{" "}
                {selectedDays?.from && selectedDays?.to && (
                    <strong>
                        {getDaysCount(selectedDays.from, selectedDays.to)}일
                    </strong>
                )}
            </p>
            
            <button
                className={`mt-4 w-full py-2 rounded ${selectedDays?.from && selectedDays?.to
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-400 cursor-not-allowed text-gray-200"
                    }`}
                disabled={!(selectedDays?.from && selectedDays?.to)}
                onClick={() => {
                    if (selectedDays?.from && selectedDays?.to) {
                        navi("/trip/plan/detail", {
                            state: {
                                selectedPlaces,
                                daysCount: getDaysCount(selectedDays.from, selectedDays.to)
                            }
                        });
                    }
                }}
            >
                다음 단계로
            </button>
        </div>
    );
}
