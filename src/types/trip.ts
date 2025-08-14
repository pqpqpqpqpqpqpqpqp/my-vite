export interface TripData {
    title: string;
    startDate: string;
    endDate: string;
};

export interface TripDetailData {
    placeId: string;
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
    tripDetailDataGroupingDay: Map<number, TripDetailData[]>;
    selectedDay: number;
    setSelectedDay: (day: number) => void;
    setFocusedPlace: (place: TripDetailData) => void;
};

export interface TripPlanMapProps {
    tripDetailDataGroupingDay: Map<number, TripDetailData[]>;
    selectedDay: number;
    focusedPlace?: TripDetailData;
    setFocusedPlace: (place: TripDetailData) => void;
}

export interface TripPlace {
    placeId: string;
    name: string;
    types: string[];
};

export interface TripDaySchedule {
    day: number;
    places: TripDetailData[];
};