// =================================================================
// 1. 서버 API 명세와 1:1로 매칭되는 타입 (DTO: Data Transfer Object)
// - 이름에 'DTO'를 붙여 서버에서 온 데이터임을 명확히 합니다.
// - 이 타입들은 절대 직접 수정하지 않고, 서버 명세가 바뀔 때만 변경합니다.
// =================================================================

export interface PlaceDTO {
    placeId: string;
    placeName: string;
    placeType: string;
    address: string;
    placeLat: number;
    placeLng: number;
}

export interface TripPlaceDTO {
    tripPlaceId: string;
    tripDayId: string;
    orderInDay: number;
    visitTime: string | null;
    memo: string | null;
    place: PlaceDTO;
}

export interface TripDayDTO {
    tripDayId: string;
    tripDate: string;
    dayOrder: number;
    tripPlaces: TripPlaceDTO[];
}

export interface GetTripDetailResponseDTO {
    tripId: string;
    tripTitle: string;
    startDate: string;
    endDate: string;
    tripDays: TripDayDTO[];
    mainPlaces: PlaceDTO[];
}

export interface TripEntity {
    tripId: string;
    ownerId: string;
    tripTitle: string;
    startDate: string;
    endDate: string;
    isPublic: boolean;
    delYn: boolean;
    tripDays?: any[]; 
}

export interface CreateTripRequestDTO {
    ownerId: string;
    tripTitle: string;
    startDate: Date;
    endDate: Date;
    mainPlaceIds: string[];
}

// =================================================================
// 2. 클라이언트(프론트엔드)에서 사용하는 도메인 모델
// - 서버 DTO를 가공하여 UI와 상태 관리에 최적화된 형태입니다.
// - 컴포넌트는 DTO가 아닌 이 모델을 바라보는 것이 좋습니다.
// =================================================================
export interface TripPlace {
    tripPlaceId: string;
    dayOrder: number;
    orderInDay: number;
    placeId: string;
    placeName: string;
    placeLat: number;
    placeLng: number;
    visitTime: string | null;
    placeMemo: string | null;
}

export interface PlaceSuggestion {
    placeId: string;
    placeName: string;
}

export interface SelectedPlace extends PlaceSuggestion {
    address: string;
    placeType: string;
    placeLat: number;
    placeLng: number;
}