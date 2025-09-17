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

// MatePostDetailRes
export interface MatePostDetail {
    postId: string;
    ownerId: string;
    postTitle: string;
    content: string;
    startDate: string;
    endDate: string;
    maxMate: number;
    nowMate: number;
    status: 'OPEN' | 'CLOSED';
    applicants: MateApplicant[];
    // ... 기타 상세 정보 ...
}

// CreateMatePostReq
export interface MatePostCreatePayload {
    title: string;
    content: string;
    startDate: string;
    endDate: string;
    maxMate: number;
    tripId?: string; // 원본 여행 계획 ID
}

// UpdateMatePostReq
export interface MatePostUpdatePayload {
    postTitle: string;
    content: string;
    startDate: string;   
    endDate: string;
    maxMate: number;
    // ... 기타 수정 가능한 필드 ...
}