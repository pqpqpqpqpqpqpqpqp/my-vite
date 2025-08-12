import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";

import "react-day-picker/dist/style.css";

export default function TripPlanSchedule() {
    const navi = useNavigate();
    const { state } = useLocation();

    const selectedPlaces = state?.selectedPlaces || [];
    const [selectedDate, setSelectedDate] = useState<DateRange | undefined>(undefined);

    function getDaysCount(from: Date, to: Date) {
        const diffTime = to.getTime() - from.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    return (
        <div className="w-fit mx-auto p-6 bg-white rounded-lg shadow-md">
            <DayPicker
                mode="range"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={{ before: new Date() }}
            />

            {selectedDate?.from && selectedDate?.to && (
                <>
                    <p className="mt-4 text-center text-gray-700">
                        여행 기간:{" "}
                        <strong>
                            {getDaysCount(selectedDate.from, selectedDate.to)}일
                        </strong>
                    </p>
                    <button
                        className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
                        onClick={() => {
                            navi("/trip/plan/detail", {
                                state: {
                                    selectedPlaces,
                                    daysCount: getDaysCount(selectedDate.from!, selectedDate.to!)
                                }
                            });
                        }}
                    >
                        다음 단계로
                    </button>
                </>
            )}
        </div>
    );
}
