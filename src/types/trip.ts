export interface TripDTO {
    tripId: string;
    tripTitle: string;
    startDate: string;
    endDate: string;
    isPublic: boolean;
    tripDays: TripDayDTO[];
    mainPlaceIds: string[];
}

export interface TripDayDTO {
    tripDayId: string;
    tripDate: string;
    dayOrder: number;
    isPublic: boolean;
    tripPlaces: TripPlaceDTO[];
}

export interface TripPlaceDTO {
    tripPlaceId: string;
    tripDayId: string;
    orderInDay: number;
    visitTime: string | null;
    memo: string | null;
    placeId: string;
    placeName: string;
}

export interface PlaceSuggestion {
    placeId: string;
    placeName: string;
    placeText: string;
}