export type DomainType = 'MATE' | 'TRIP';

export interface UserDTO {
    userId : string;
    nickname : string;
    profileImg : string;
}

export interface MessageDTO {
    messageId : number;
    senderId : string;
    senderNickname : string;
    senderProfileImg : string;
    content : string;
    sentAt : string;
    unreadUsers : UserDTO[];
}


// =======================================================
// 목록 DTO 매핑
export interface BaseRoomListItem {
    chatId : string;
    createdAt : string;
    lastMsg : string;
    lastMsgSentAt : string | null;
    unreadCount : number;
    memberCount : number;
    nicknames : string[];
}

export interface MateRoomListItem extends BaseRoomListItem {
    domain : 'MATE';
    postId : string;
    postTitle : string;
}

export interface TripRoomListItem extends BaseRoomListItem {
    domain : 'TRIP';
    tripId : string;
    tripTitle : string;
}

export type RoomListItem = MateRoomListItem | TripRoomListItem;


// =======================================================
// 상세 DTO 매핑
export interface MateRoomDetail {
    domain: 'MATE';
    chatId : string;
    postId : string;
    postTitle : string;
    participantCount: number;
    participantNicknames : string[];
    messages : MessageDTO[];
}

export interface TripRoomDetail {
    domain: 'TRIP';
    chatId : string;
    tripId : string;
    tripTitle : string;
    participantCount: number;
    participantNicknames : string[];
    messages : MessageDTO[];
}

export type RoomDetail = MateRoomDetail | TripRoomDetail;


// =======================================================
// 요청 DTO 매핑
export interface MarkRoomReadReq {
    chatId : string;
}

export interface SendMessageReq {
    chatId : string;
    content : string;
}


// export interface MateChatDetailDTO {
//     chatId : string;
//     postId : string;
//     postTitle : string;
//     members : UserDTO[];
//     messages : MessageDTO[];
// }

// export interface MateChatListDTO {
//     chatId : string;
//     postId : string;
//     createdAt : string;
//     postTitle : string;
//     memberCount : number;
//     nicknames : string[];
//     lastMsg : string;
//     lastMsgSentAt : string | null;
//     unreadCount : number;

// }