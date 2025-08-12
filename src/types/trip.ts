export interface TripData {
    title: string;
    startDate: string;
    endDate: string;
};

export interface TripDetail {
    dayOrder: number;
    placeName: string;
    placeLat: number;
    placeLng: number;
    orderInDay: number;
    visitTime: string;
    placeMemo: string;
}

export interface TripPlanSidebarProps {
    tripData: TripData;
    tripGroupByOrder: Map<number, TripDetail[]>;
    selectedDay: number;
    setSelectedDay: (day: number) => void;
    setFocusedPlace: (place: TripDetail) => void;
};

export interface TripPlanMapProps {
    selectedDayTrips: TripDetail[];
    focusedPlace: TripDetail;
    setFocusedPlace: (place: TripDetail) => void;
}

export interface Suggestion {
    placeId: string;
    name: string;
    types: string[];
};