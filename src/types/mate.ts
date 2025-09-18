export interface MatePostListItem {
    postId: string;
    ownerId: string;
    postTitle: string;
    startDate: string;
    endDate: string;
    maxMate: number;
    nowMate: number;
    status: 'OPEN' | 'CLOSED';
    // ... 기타 목록에 필요한 필드 ...
}

// 동행 신청자 정보 (MatePostDetailRes 내부에 포함될 정보)
export interface MateApplicant {
    applicantId: string;
    nickname: string;
    profileImg: string;
    status: 'APPLIED' | 'ACCEPTED' | 'REJECTED';
}

// CreateMatePostReq
export interface MatePostCreatePayload {
    // postId는 백엔드에서 생성되므로 제외
    placeId?: string; // 장소 ID (선택 사항)
    placeName?: string; // 장소 이름 (선택 사항)
    postTitle: string;
    content: string;
    startDate: string;
    endDate: string;
    minMate: number;
    maxMate: number;
    deadline: string; // 모집 마감일
    genders: string[]; // 성별 필터
    ages: number[]; // 나이대 필터
    tripId?: string; // 원본 여행 계획 ID
}

export interface MatePostUpdatePayload {
    placeId?: string;
    placeName?: string;
    postTitle: string;
    content: string;
    startDate: string;   
    endDate: string;
    minMate: number;
    maxMate: number;
    deadline: string;
    status?: 'OPEN' | 'CLOSED'; // 상태도 수정 가능할 수 있음
    genders: string[]; // 'ANY'는 빈 배열로 변환
    ages: number[];
}

// OwnerSumary
export interface OwnerSummary {
    ownerId: string;
    nickname: string;
    gender: string;
}

// PlaceSummary
export interface PlaceSummary {
    placeId: string;
    placeName: string;
}

// MatePostDetailRes
export interface MatePostDetail {
    postId: string;
    postTitle: string;
    content: string;
    status: 'OPEN' | 'CLOSED';
    startDate: string;   
    endDate: string;
    minMate: number;
    maxMate: number;
    nowMate: number;
    deadline: string;
    createdAt: string;
    genders: string[];
    ages: number[];
    owner: OwnerSummary; // [핵심 수정] 중첩된 객체로 변경
    place: PlaceSummary; // [핵심 수정] 중첩된 객체로 변경
    applicants: MateApplicant[]; // applicants 필드는 별도로 있다고 가정
}