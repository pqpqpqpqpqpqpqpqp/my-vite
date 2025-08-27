import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

import "react-day-picker/dist/style.css";

// DayPicker에 적용할 Tailwind CSS 클래스
const css = `
  .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
    background-color: #2563eb; /* blue-600 */
    color: white;
    font-weight: bold;
    opacity: 1;
  }
  .rdp-day_range_start, .rdp-day_range_end {
    background-color: #2563eb !important;
    color: white !important;
  }
  .rdp-day_range_middle {
    background-color: #dbeafe; /* blue-100 */
    color: #1e3a8a; /* blue-800 */
    border-radius: 0;
  }
  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
    background-color: #eff6ff; /* blue-50 */
  }
  .rdp-caption_label {
    font-weight: 600;
  }
`;

export default function TripPlanSchedule() {
    const navi = useNavigate();
    const { state } = useLocation();

    const [selectedDays, setSelectedDays] = useState<DateRange | undefined>(undefined);
    const selectedPlaces = useMemo(() => state?.selectedPlaces || [], [state?.selectedPlaces]);

    useEffect(() => {
        if (!selectedPlaces.length) {
            // 선택된 장소가 없으면 이전 페이지로 돌려보냅니다.
            navi("/trip/plan/select");
        }
    }, [selectedPlaces, navi]);

    // 날짜 차이를 계산하는 함수
    function getDaysCount(from?: Date, to?: Date) {
        if (!from || !to) return 0;
        const diffTime = to.getTime() - from.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    const daysCount = getDaysCount(selectedDays?.from, selectedDays?.to);

    // 선택된 기간을 표시하는 텍스트
    let footerText = "여행 시작일과 종료일을 선택해주세요.";
    if (selectedDays?.from) {
        if (!selectedDays.to) {
            footerText = `${format(selectedDays.from, 'PPP', { locale: ko })} 부터`;
        } else if (selectedDays.to) {
            footerText = `${format(selectedDays.from, 'PPP', { locale: ko })} - ${format(selectedDays.to, 'PPP', { locale: ko })}`;
        }
    }

    return (
        // 전체 화면을 차지하고 콘텐츠를 중앙에 배치
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <style>{css}</style>
            {/* 카드 형태의 UI 컨테이너 */}
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">언제 떠나시나요?</h1>
                    <p className="text-gray-500 mt-2">여행 일정을 선택하여 계획을 완성하세요.</p>
                </div>

                {/* DayPicker를 중앙에 배치 */}
                <div className="flex justify-center">
                    <DayPicker
                        mode="range"
                        selected={selectedDays}
                        onSelect={setSelectedDays}
                        disabled={{ before: new Date() }}
                        locale={ko} // 달력을 한글로 표시
                        numberOfMonths={1} // 한 번에 하나의 달력만 표시
                        pagedNavigation // 월 이동 버튼으로 여러 달을 빠르게 이동
                    />
                </div>
                
                {/* 선택 정보 및 다음 버튼 영역 */}
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
                            ${daysCount > 0
                                ? "bg-blue-600 hover:bg-blue-700 shadow-md"
                                : "bg-gray-300 cursor-not-allowed"
                            }`}
                        disabled={!daysCount}
                        onClick={() => {
                            if (selectedDays?.from && selectedDays?.to) {
                                navi("/trip/plan/detail", {
                                    state: {
                                        selectedPlaces,
                                        daysCount: getDaysCount(selectedDays.from, selectedDays.to),
                                        // 날짜 정보도 함께 전달하면 상세 페이지에서 유용하게 사용할 수 있습니다.
                                        startDate: selectedDays.from.toISOString(),
                                        endDate: selectedDays.to.toISOString(),
                                    }
                                });
                            }
                        }}
                    >
                        다음 단계로
                    </button>
                </div>
            </div>
        </div>
    );
}