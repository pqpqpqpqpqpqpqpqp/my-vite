import { useEffect, useMemo, useState } from "react";
import type { DomainType, MessageDTO, RoomDetail } from "../types/Chat";
import { useChatSocket } from "../hooks/UseWebSocket";


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
    const unread = Array.isArray(msg.unreadUsers) ? msg.unreadUsers.length : 0;
    return Math.max(0, participantTotal - unread); // -1: 나 자신
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
    const title = detail
        ? (domain === 'TRIP' ? (detail as any).tripTitle : (detail as any).postTitle)
        : '로딩 중…';

//WebSocket 연결: 방이 열려 있고 로그인 상태일 때만 연결
  const { connected, sendMessage } = useChatSocket({
    domain,
    chatId,
    enabled: isLoggedIn && !!chatId,
    onReceive: (m) => {
      // 수신한 MessageDTO를 그대로 상위에 전달하여 상태 갱신
      onAppendMessage(m);
      // 스크롤 바닥
      setTimeout(() => messageEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    },
  });

  // 상세가 바뀌면 입력 초기화 + 스크롤 바닥
  useEffect(() => {
    setText('');
    setTimeout(() => messageEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
  }, [chatId, messageEndRef]);

  const participantTotal = useMemo(
    () => (detail ? detail.participantCount : 0),
    [detail]
  );

  // 전송
  const onSend = async () => {
    if (!text.trim() || !chatId) return;

      // 1) WebSocket 우선
      await sendMessage(text.trim());

      // 2) 낙관적 렌더(서버 echo가 있다면 굳이 필요없지만, 안전하게 즉시 반영)
      const optimistic: MessageDTO = {
        messageId: Date.now(), // 임시 키
        senderId: userId,
        senderNickname: '',
        senderProfileImg:'',
        content: text.trim(),
        sentAt: new Date().toISOString(),
        unreadUsers: [], // 내가 보냈으니 내 기준 읽지 않은 사람 계산은 서버 echo로 덮일 것
      };
      onAppendMessage(optimistic);

      setText('');
      setTimeout(() => messageEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    };

  return (
    <div className="chat-room">
      {/* 메시지 영역 */}
      <div className="chat-messages">
        {loading && <div>대화 불러오는 중…</div>}
        {error && <div className="text-danger">{error}</div>}

        {detail?.messages.map((m, i) => {
          const isMine = !!(m.senderId && userId && m.senderId === userId);
          const readCount = getReadCount(m, participantTotal);

          return (
            <div key={m.messageId ?? `m-${i}`} className={`bubble-row ${isMine ? 'mine' : 'other'}`}>
              <div className={`bubble ${isMine ? 'mine' : 'other'}`}>
                <div>{m.content}</div>
              </div>
              <div className="meta">
                {m.sentAt ? new Date(m.sentAt).toLocaleString() : ''}
                {detail && <> · 읽음 {readCount}/{participantTotal}</>}
              </div>
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
          onKeyDown={(e) => { if (e.key === 'Enter') onSend(); }}
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

      {/* 연결 상태 표시 (선택) */}
      <div className="chat-conn muted">
        {detail ? (connected ? '실시간 연결' : '오프라인') : ''}
      </div>
    </div>
  );
}
