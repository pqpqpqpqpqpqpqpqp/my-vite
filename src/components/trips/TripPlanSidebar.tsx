import type { TripPlanSidebarProps } from "../../types/trip";

const TripPlanSidebar = ({ 
    tripData,
    tripGroupByOrder,
    selectedDay,
    setSelectedDay,
    setFocusedPlace }: TripPlanSidebarProps) => {
    return (
        <aside className="min-w-80 bg-gray-100 p-6 h-full">
            <div className="mb-6 border-b">
                <h1 className="text-2xl font-bold">{tripData.title}</h1>
                <p className="text-gray-500 text-sm">
                    {tripData.startDate} ~ {tripData.endDate}
                </p>
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {[...tripGroupByOrder.keys()].map((day) => {
                    const isSelected = selectedDay === day;
                    return (
                        <div key={day} className="transition-all border-b last:border-none">
                            <div
                                onClick={() => setSelectedDay(day)}
                                className={`px-6 py-4 cursor-pointer flex items-center justify-between ${isSelected
                                    ? 'bg-blue-100 text-blue-800 font-semibold'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                <span>{day}일차</span>
                                {isSelected && (
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            {isSelected && (
                                <div className="bg-gray-50">
                                    {tripGroupByOrder.get(day)?.map((place) => (
                                        <div
                                            key={place.orderInDay}
                                            className="flex justify-between items-center p-4 bg-white hover:bg-gray-100 transition rounded-md shadow-sm m-2"
                                            onClick={() => setFocusedPlace(place)}
                                        >
                                            <div className="font-medium text-gray-800">{place.placeName}</div>
                                            <div className="text-sm text-gray-500">{place.visitTime}</div>
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

export default TripPlanSidebar;
