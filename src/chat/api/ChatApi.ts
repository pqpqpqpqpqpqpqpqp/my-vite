import type {
    DomainType,
    RoomListItem,
    MateRoomListItem,
    TripRoomListItem,
    RoomDetail,
    MateRoomDetail,
    TripRoomDetail,
    MessageDTO,
    MarkRoomReadReq,
    SendMessageReq,
    UserDTO,
} from "../types/Chat";

const BASE_COMMON = (import.meta.env.VITE_API_BASE_URL as string) ?? '';
const BASE_TRIP   = (import.meta.env.VITE_API_PLAN_URL as string) ?? '';
const BASE_MATE   = (import.meta.env.VITE_API_MATE_URL as string) ?? '';


// 공통: fetch 옵션
const OPTS: RequestInit = { credentials: 'include'};

function apiBaseByDomain(domain: DomainType) {
    return domain === 'MATE' ? BASE_MATE : BASE_TRIP;
}

// 날짜 -> ISO 문자열로 정규화
const toISO = (v: any) => (v ? new Date(v).toISOString() : null);


// =======================================================
// 채팅방 목록 조회
export async function fetchRoomList(domain: DomainType) : Promise<RoomListItem[]> {
    const url =
        domain === 'MATE' 
            ? `${BASE_MATE}/api/mate/chat/list`
            : `${BASE_TRIP}/trip/chat/list`;

    const res = await fetch(url, OPTS);
    if(!res.ok) throw new Error('채팅방 목록을 불러오지 못했습니다.');

    const data = await res.json();

    // 서버 DTO -> 클라이언트 DTO 변환
    if (domain === 'MATE') {

        // MateChatListDTO
        return (data as any[]).map((d) : MateRoomListItem => ({
            domain: 'MATE',
            chatId: String(d.chatId),
            postId: String(d.postId),
            postTitle: String(d.postTitle),
            createdAt: toISO(d.createdAt) ?? new Date().toISOString(),
            lastMsg: d.lastMsg ?? null,
            lastMsgSentAt: toISO(d.lastMsgSentAt),
            unreadCount: Number(d.unreadCount ?? 0),
            memberCount: Number(d.memberCount ?? d.nicknames?.length ?? 0),
            nicknames: Array.isArray(d.nicknames) ? d.nicknames.map(String) : [],
        }));
    } else {
         // ChatListDTO[]
        return (data as any[]).map((d): TripRoomListItem => ({
            domain: 'TRIP',
            chatId: String(d.chatId),
            tripId: String(d.tripId),
            tripTitle: String(d.tripTitle),
            createdAt: toISO(d.createdAt) ?? new Date().toISOString(),
            lastMsg: d.lastMsg ?? null,
            lastMsgSentAt: toISO(d.lastMsgSentAt),
            unreadCount: Number(d.unreadCount ?? 0),
            memberCount: Number(d.memberCount ?? d.nicknames?.length ?? 0),
            nicknames: Array.isArray(d.nicknames) ? d.nicknames.map(String) : [],
        }));
    }

}   

// =======================================================
// 상세 조회

export async function fetchRoomDetail(
    domain: DomainType,
    chatId: string
) : Promise<RoomDetail> {
    const url =
        domain === 'MATE'
            ? `${BASE_MATE}/api/mate/chat/${encodeURIComponent(chatId)}`
            : `${BASE_TRIP}/trip/chat/${encodeURIComponent(chatId)}`;

    const res = await fetch(url, OPTS);
    if(!res.ok) throw new Error('채팅방 정보를 불러오지 못했습니다.');

    const data = await res.json();

    // 서버 DTO -> 클라이언트 DTO 변환
    const mapUser = (u : any) : UserDTO => ({
        userId: String(u.userId ?? ''),
        nickname: typeof u.nickname === 'string' ? u.nickname : null,
        profileImg: String(u.profileImg ?? ''),
    });

    const mapMsg = (m: any): MessageDTO => ({
        messageId: Number(m.messageId ?? 0),
        senderId: String(m.senderId ?? ''),
        senderNickname: String(m.senderNickname ?? ''),
        senderProfileImg: String(m.senderProfileImg ?? '/default_profile.png'),
        content: String(m.content ?? ''),
        sentAt: toISO(m.sentAt) ?? new Date().toISOString(),
        unreadUsers: Array.isArray(m.unreadUsers) ? m.unreadUsers.map(mapUser) : [],
    });

    if (domain === 'MATE') {
        const detail: MateRoomDetail = {
            domain: 'MATE',
            chatId: String(data.chatId),
            postId: String(data.postId),
            postTitle: String(data.postTitle),
            participantCount: Number(data.participantCount ?? data.participantNicknames?.length ?? 0),
            participantNicknames: Array.isArray(data.participantNicknames)
                                    ? data.participantNicknames.map(String) : [],
            messages: Array.isArray(data.messages) ? data.messages.map(mapMsg) : [],
        };
        return detail;
    } else {
        const detail: TripRoomDetail = {
            domain: 'TRIP',
            chatId: String(data.chatId),
            tripId: String(data.tripId),
            tripTitle: String(data.tripTitle),
            participantCount: Number(data.participantCount ?? data.participantNicknames?.length ?? 0),  
            participantNicknames: Array.isArray(data.participantNicknames)
                                    ? data.participantNicknames.map(String) : [],
            messages: Array.isArray(data.messages) ? data.messages.map(mapMsg) : [],
        };
        return detail;
    }
}

// =======================================================
// 읽음 처리

export async function markRoomAsRead(domain: DomainType, payload: MarkRoomReadReq) {
    const url =
        domain === 'MATE'
            ? `${BASE_MATE}/api/mate/chat/${encodeURIComponent(payload.chatId)}/read`
            : `${BASE_TRIP}/trip/chat/${encodeURIComponent(payload.chatId)}/read`;

    const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });
    if(!res.ok) throw new Error('채팅방 읽음 처리에 실패했습니다.');
}


// =======================================================
// 메세지 전송
export async function sendMessage(req: SendMessageReq): Promise<MessageDTO> {
  const res = await fetch(`${BASE_COMMON}/api/common/chat/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error('메시지 전송 실패');

  const m = await res.json();

  // 서버 DTO -> 클라이언트 DTO 변환
  const mapUser = (u : any) : UserDTO => ({ 
        userId: String(u.userId ?? ''),
        nickname: typeof u.nickname === 'string' ? u.nickname : null,
        profileImg: String(u.profileImg ?? ''),
  });

  const newMsg: MessageDTO = {
    messageId: Number(m.messageId ?? 0),
    senderId: String(m.senderId ?? ''),
    senderNickname: String(m.senderNickname ?? ''),
    senderProfileImg: String(m.senderProfileImg ?? '/default_profile.png'),
    content: String(m.content ?? ''),
    sentAt: toISO(m.sentAt) ?? new Date().toISOString(),
    unreadUsers: Array.isArray(m.unreadUsers) ? m.unreadUsers.map(mapUser) : [],
  };

  return newMsg;

}

