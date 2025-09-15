// import { BASE_URL } from "../../config";
// import type {
//     DomainType,
//     RoomListItem,
//     MateRoomListItem,
//     TripRoomListItem,
//     RoomDetail,
//     MateRoomDetail,
//     TripRoomDetail,
//     MarkRoomReadReq,
//     SendMessageReq,
//     MesssageDTO,
// } from "../types/Chat";



// // 공통: fetch 옵션
// const OPTS: RequestInit = { credentials: 'include'};


// // 날짜 -> ISO 문자열로 정규화
// const toISO = (v: any) => (v ? new Date(v).toISOString() : null);


// // =======================================================
// // 채팅방 목록 조회
// export async function fetchRoomList(domain: DomainType) : Promise<RoomListItem[]> {
//     const url =
//         domain === 'MATE' 
//             ? `${BASE_URL}/api/mate/chat/list`
//             : `${BASE_URL}/trip/chat/list`;

//     const res = await fetch(url, OPTS);
//     if(!res.ok) throw new Error('채팅방 목록을 불러오지 못했습니다.');

//     const data = await res.json();

//     // 서버 DTO -> 클라이언트 DTO 변환
//     if (domain === 'MATE') {

//         // MateChatListDTO
//         return (data as any[]).map((d) : MateRoomListItem => ({
//             domain: 'MATE',
//             chatId: d.chatId,
//             postId: d.postId,
//             postTitle: d.postTitle,
//             createdAt: toISO(d.createdAt) ?? new Date().toISOString(),
//             lastMsg: d.lastMsg ?? null,
//             lastMsgSentAt: toISO(d.lastMsgSentAt),
//             lastMsgSentAt: toISO(d.lastMsgSentAt),
//             unreadCount: Number(d.unreadCount ?? 0),
//             memberCount: Number(d.membercount ?? d.nicknames?.length ?? 0),
//             nicknames: d.nicknames ?? [],
//         }));
//     } else {
//          // ChatListDTO[]
//         return (data as any[]).map((d): TripRoomListItem => ({
//             domain: 'TRIP',
//             chatId: d.chatId,
//             tripId: d.tripId,
//             tripTitle: d.tripTitle,
//             createdAt: toISO(d.createdAt) ?? new Date().toISOString(),
//             lastMsg: d.lastMsg ?? null,
//             lastMsgSentAt: toISO(d.lastMsgSentAt),
//             unreadCount: Number(d.unreadCount ?? 0),
//             memberCount: Number(d.memberCount ?? d.nicknames?.length ?? 0),
//             nicknames: d.nicknames ?? [],
//     }));
//     }

//         )
//     }