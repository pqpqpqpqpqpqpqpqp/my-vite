import { Link, useNavigate } from 'react-router-dom';
import type { TripDTO, TripPlaceDTO } from '../../types/trip';
import { ClipLoader } from 'react-spinners';
import { FaRegClock, FaRegCommentDots, FaChevronDown, FaChevronUp, FaUser, FaUserCog, FaDownload, FaListUl } from "react-icons/fa";

const ToggleSwitch = ({
    isToggled,
    onToggle,
    disabled
}: {
    isToggled: boolean,
    onToggle: (e: React.MouseEvent) => void,
    disabled: boolean
}) => (
    <button
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
        <span className={`absolute inset-0 rounded-full ${isToggled ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${isToggled ? 'translate-x-6' : 'translate-x-1'}`}></span>
    </button>
);

interface TripPlanSidebarProps {
    trip: TripDTO | null;
    isOwner: boolean;
    selectedDay: number;
    setSelectedDay: (day: number) => void;
    focusedPlace: TripPlaceDTO | undefined;
    setFocusedPlace: (place: TripPlaceDTO | undefined) => void;
    isUpdating: boolean;
    onToggleTripPublic: () => void;
    onToggleDayPublic: (tripDayId: string) => void;
    onCopyClick: () => void;
    onMembersClick: () => void;
}

export default function TripPlanSidebar({
    trip,
    isOwner,
    selectedDay,
    setSelectedDay,
    focusedPlace,
    setFocusedPlace,
    isUpdating,
    onToggleTripPublic,
    onToggleDayPublic,
    onCopyClick,
    onMembersClick
}: TripPlanSidebarProps) {
    if (!trip) {
        return (
            <aside className="w-96 bg-white p-6 h-full overflow-y-auto shadow-lg border-r">
                <div className="flex justify-center items-center h-full">
                    <ClipLoader color={"#3B82F6"} loading={true} size={40} />
                </div>
            </aside>
        );
    }

    const navigate = useNavigate();

    const { tripTitle, startDate, endDate, tripDays, isPublic } = trip;

    const displayableTripDays = isOwner ? tripDays : tripDays.filter(day => day.isPublic);

    return (
        <aside className="w-96 bg-white p-4 h-full overflow-y-auto shadow-lg border-r flex flex-col">
            {/* 여행 정보 헤더 */}
            <div className="mb-4 p-4 rounded-xl bg-gray-50 border">
                <h1 className="text-xl font-bold text-gray-800 truncate">{tripTitle ?? '나의 여행'}</h1>
                <p className="text-gray-500 text-sm mt-1">
                    {startDate ?? ''} ~ {endDate ?? ''}
                </p>

                <div className="mt-4 pt-4 border-t space-y-3">
                    {isOwner && (
                        // 소유자 전용 기능들
                        <>
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-700">전체 일정 공개</span>
                                <ToggleSwitch
                                    isToggled={trip?.isPublic ?? false}
                                    onToggle={onToggleTripPublic}
                                    disabled={isUpdating}
                                />
                            </div>
                            <button
                                onClick={onMembersClick}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-lg shadow-sm border hover:bg-gray-100 transition"
                            >
                                <FaUser />
                                <span>멤버 관리</span>
                            </button>
                            <Link
                                to="/mate/post/new"
                                state={{ sourceTripId: trip?.tripId }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition"
                            >
                                <FaUserCog />
                                <span>동행 구하기</span>
                            </Link>
                        </>
                    )}

                    {!isOwner && (
                        // 뷰어 전용 기능
                        <button
                            onClick={onCopyClick}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 transition"
                        >
                            <FaDownload />
                            <span>내 일정으로 가져오기</span>
                        </button>
                    )}

                    <button
                        onClick={() => navigate(-1)} // 나의 일정 목록 페이지로 이동
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition"
                    >
                        <FaListUl />
                        <span>목록으로 돌아가기</span>
                    </button>
                </div>
            </div>

            {/* 날짜별 아코디언 메뉴 */}
            <div className="flex-1 space-y-2">
                {/* [수정] 필터링된 displayableTripDays의 길이를 먼저 확인합니다. */}
                {displayableTripDays.length > 0 ? (
                    displayableTripDays.sort((a, b) => a.dayOrder - b.dayOrder).map((dayData) => {
                        const isSelected = selectedDay === dayData.dayOrder;
                        return (
                            <div key={dayData.tripDayId} className="bg-white rounded-lg border transition-all duration-300">
                                {/* 날짜 헤더 (클릭 영역) */}
                                <div
                                    onClick={() => setSelectedDay(isSelected ? 0 : dayData.dayOrder)}
                                    className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${isSelected
                                        ? 'bg-blue-50 rounded-t-lg'
                                        : 'hover:bg-gray-50 rounded-lg'
                                        }`}
                                >
                                    {/* 좌측 정보: N일차, 장소 개수 */}
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-lg text-blue-600">{dayData.dayOrder}일차</span>
                                        <span className="text-sm text-gray-500">{dayData.tripPlaces.length}개 장소</span>
                                    </div>

                                    {/* 우측 아이콘/토글: 소유권(isOwner)에 따라 다르게 렌더링 */}
                                    {isOwner ? (
                                        // 소유자일 경우: 토글 스위치와 화살표 아이콘을 함께 표시
                                        <div className="flex items-center gap-4">
                                            <ToggleSwitch
                                                isToggled={dayData.isPublic}
                                                onToggle={(e) => {
                                                    e.stopPropagation(); // 부모 div의 onClick 이벤트 방지
                                                    onToggleDayPublic(dayData.tripDayId);
                                                }}
                                                disabled={!isPublic || isUpdating}
                                            />
                                            {isSelected ? <FaChevronUp /> : <FaChevronDown />}
                                        </div>
                                    ) : (
                                        // 뷰어일 경우: 화살표 아이콘만 표시
                                        isSelected ? <FaChevronUp className="text-blue-500" /> : <FaChevronDown className="text-gray-400" />
                                    )}
                                </div>

                                {/* 확장되었을 때 보이는 장소 목록 */}
                                {isSelected && (
                                    <div className="border-t p-2 bg-gray-50/50 rounded-b-lg">
                                        {dayData.tripPlaces.length > 0 ? (
                                            dayData.tripPlaces
                                                .sort((a, b) => a.orderInDay - b.orderInDay)
                                                .map((place) => {
                                                    const isFocused = focusedPlace?.tripPlaceId === place.tripPlaceId;
                                                    return (
                                                        <div
                                                            key={place.tripPlaceId}
                                                            className={`p-3 my-1 transition rounded-md cursor-pointer ${isFocused
                                                                ? 'bg-blue-100 ring-2 ring-blue-400 shadow'
                                                                : 'bg-white hover:bg-blue-50 hover:shadow-sm shadow-xs'
                                                                }`}
                                                            onClick={() => setFocusedPlace(place)}
                                                        >
                                                            <div className="flex items-baseline gap-3">
                                                                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center mt-1">
                                                                    {place.orderInDay}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-semibold text-gray-800">{place.placeName}</p>
                                                                    {place.visitTime && (
                                                                        <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
                                                                            <FaRegClock />
                                                                            <span>{place.visitTime}</span>
                                                                        </div>
                                                                    )}
                                                                    {place.memo && (
                                                                        <div className="mt-1.5 flex items-start gap-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
                                                                            <FaRegCommentDots className="mt-0.5 flex-shrink-0" />
                                                                            <p className="whitespace-pre-wrap break-words">{place.memo}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                        ) : (
                                            <div className="text-center p-4 text-sm text-gray-500">
                                                계획된 장소가 없습니다.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    // 표시할 날짜가 없을 때의 UI
                    <div className="text-center py-10 text-gray-500">
                        {isOwner ? "계획된 일정이 없습니다." : "공개된 일정이 없습니다."}
                    </div>
                )}
            </div>
        </aside>
    );
};
