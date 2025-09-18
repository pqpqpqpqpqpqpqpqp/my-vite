import type { RoomListItem } from "../types/Chat";


type Props = {
    rooms: RoomListItem[];
    activeChatId: string | null;
    loading: boolean;
    error?: string | null;
    onOpen: (chatId: string) => void;
};



export default function ChatList({ rooms, activeChatId, loading, error, onOpen }: Props) {
  return (
    <div className="chat-list">
        {loading && <div className="pad">목록 불러오는 중…</div>}
        {error && <div className="pad text-danger">{error}</div>}

        {!loading && !error && rooms.map((room) => {
            const active = room.chatId === activeChatId;
            const title = room.domain === 'TRIP'
            ? (room as any).tripTitle
            : (room as any).postTitle;

            return (
            <div
                key={room.chatId}
                className={`chat-list-item ${active ? 'active' : ''}`}
                onClick={() => onOpen(room.chatId)}
            >
                <div>
                <div className="title">{title}</div>
                <div className="sub muted">
                    {room.lastMsg || '대화를 시작해보세요'}
                </div>
                </div>
                {room.unreadCount > 0 && (
                <div className="badge-wrap">
                    <span className="badge-danger">{room.unreadCount}</span>
                </div>
                )}
            </div>
            );
        })}
    </div>
  );
}

