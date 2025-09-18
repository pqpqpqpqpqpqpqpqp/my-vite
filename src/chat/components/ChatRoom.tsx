import { useEffect, useMemo, useState } from "react";
import type { DomainType, MessageDTO, RoomDetail } from "../types/Chat";
import { useChatSocket } from "../hooks/UseWebSocket";
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

type Props = {
    domain: DomainType;
    detail: RoomDetail | null;
    loading?: boolean;
    error?: string | null;
    onAppendMessage: (m: MessageDTO) => void;
    userId: string;
    messageEndRef: React.RefObject<HTMLDivElement | null>;
    isLoggedIn: boolean;
}

function getReadCount(msg: MessageDTO, participantTotal: number) {
    const unread = msg.unreadUsers?.length ?? 0;
    return Math.max(0, participantTotal - unread);
}

export default function ChatRoom({
    domain,
    detail,
    loading,
    error,
    onAppendMessage,
    userId,
    messageEndRef,
    isLoggedIn,
}: Props) {

    const [text, setText] = useState('');
    const chatId = detail?.chatId ?? '';

    const { connected, sendMessage } = useChatSocket({
        domain,
        chatId,
        enabled: isLoggedIn && !!chatId,
        onReceive: (m) => {
            onAppendMessage(m);
            setTimeout(() => messageEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        },
    });

    useEffect(() => {
        setText('');
        setTimeout(() => messageEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    }, [chatId, messageEndRef]);

    const participantTotal = useMemo(
        () => (detail ? detail.participantCount : 0),
        [detail]
    );

    const onSend = async () => {
        if (!text.trim() || !chatId) return;
        await sendMessage(text.trim());
        setText('');
        setTimeout(() => messageEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    return (
        <div className="chat-room">
            {/* 메시지 영역 */}
            <div className="chat-messages">
                {loading && <div>대화 불러오는 중…</div>}
                {error && <div className="text-danger">{error}</div>}

                {detail?.messages.map((m) => {
                    const isMine = !!(m.senderId && userId && m.senderId === userId);
                    const readCount = getReadCount(m, participantTotal);
                    const formattedTime = m.sentAt ? format(new Date(m.sentAt), 'p', { locale: ko }) : '';

                    return (
                        <div key={m.messageId} className={`bubble-row ${isMine ? 'mine' : 'other'}`}>
                            {/* 상대방 닉네임 표시 */}
                            {!isMine && <div className="sender-nickname">{m.senderNickname || '상대방'}</div>}

                            {/* ========================[핵심 수정: JSX 구조 변경]======================== */}
                            <div className="bubble-container">
                                {/* 1. 말풍선 본문을 먼저 렌더링합니다. */}
                                <div className={`bubble ${isMine ? 'mine' : 'other'}`}>
                                    {m.content}
                                </div>
                                
                                {/* 2. 메타데이터(시간, 읽음)를 나중에 렌더링합니다. */}
                                <div className="meta">
                                    {isMine && <span>읽음 {readCount}/{participantTotal}</span>}
                                    <span className="timestamp">{formattedTime}</span>
                                </div>
                            </div>
                            {/* ======================================================================= */}
                        </div>
                    );
                })}
                <div ref={messageEndRef} />
            </div>

            {/* 입력 바 */}
            <div className="chat-input">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) onSend(); }}
                    placeholder="메시지를 입력하세요"
                    disabled={!isLoggedIn || !chatId}
                />
                <button
                    onClick={onSend}
                    disabled={!isLoggedIn || !chatId || !text.trim()}
                >
                    보내기
                </button>
            </div>
        </div>
    );
}