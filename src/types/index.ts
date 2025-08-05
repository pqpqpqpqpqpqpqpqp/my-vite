export interface TripDetail {
    dayOrder: number;
    placeName: string;
    placeLat: number;
    placeLng: number;
    orderInDay: number;
    visitTime: string;
    placeMemo: string;
}

export interface MapContainerProps {
    selectedDayTrips: TripDetail[] | undefined;
    focusedPlace: TripDetail;
    defaultCenter: { lat: number; lng: number };
}